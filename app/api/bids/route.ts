import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { bidCreateSchema } from '@/lib/validations'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

// GET - Fetch bids for authenticated shop
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where: any = {
      shopId: session.user.shopId
    }

    if (status) {
      where.status = status
    }

    const bids = await prisma.bid.findMany({
      where,
      include: {
        offer: {
          select: {
            productName: true,
            imageUrl: true,
            minPrice: true,
            minRange: true,
            maxRange: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Convert Decimal to number and calculate min/max prices for JSON response
    const bidsWithNumbers = bids.map(bid => {
      const minPrice = Number(bid.offer.minPrice)
      const calculatedMinPrice = minPrice * (1 + bid.offer.minRange / 100)
      const calculatedMaxPrice = minPrice * (1 + bid.offer.maxRange / 100)
      return {
        ...bid,
        bidAmount: Number(bid.bidAmount),
        offer: {
          ...bid.offer,
          minPrice: calculatedMinPrice,
          maxPrice: calculatedMaxPrice
        }
      }
    })

    return successResponse({ bids: bidsWithNumbers })
  } catch (error) {
    console.error('Bids fetch error:', error)
    return errorResponse('Failed to fetch bids', 500)
  }
}

// POST - Create a new bid (from widget)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = bidCreateSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400)
    }

    const data = validation.data

    // Fetch the offer to check stock and validate
    const offer = await prisma.offer.findUnique({
      where: { id: data.offerId },
      include: { shop: true }
    })

    if (!offer) {
      return errorResponse('Offer not found', 404)
    }

    if (!offer.isActive) {
      return errorResponse('Offer is no longer active', 400)
    }

    if (offer.stockQuantity <= 0) {
      return errorResponse('Product is out of stock', 400)
    }

    // Check if shop owner has connected Stripe account (SaaS model)
    if (!offer.shop.stripeAccountId || !offer.shop.stripeOnboardingComplete) {
      return errorResponse('Shop owner has not set up payment processing yet', 400)
    }

    // Determine bid status based on fix price and stock
    const fixPrice = Number(offer.fixPrice)
    const minSellingPrice = Number(offer.minPrice) // Minimum selling price (base cost)
    const minRangePrice = Number(offer.minRange) // Minimum acceptable bid price (slider minimum)
    const maxRangePrice = Number(offer.maxRange) // Maximum bid price (slider maximum)
    let bidStatus = 'pending'
    let shouldAutoCapture = false
    const isBelowMinSellingPrice = data.bidAmount < minSellingPrice

    if (data.bidAmount >= fixPrice && offer.stockQuantity > 0) {
      // Auto-accept bid if >= fix price and stock is available
      bidStatus = 'accepted'
      shouldAutoCapture = true // Capture payment immediately for fix price or higher
    } else if (data.bidAmount >= minRangePrice && data.bidAmount < fixPrice) {
      // Bids between min range and fix price are pending for manual review
      bidStatus = 'pending'
    } else if (data.bidAmount < minRangePrice) {
      // Bids below min range are also pending (merchant can still accept if they want)
      // NOTE: Bids below minSellingPrice will auto-decline after 2 hours
      bidStatus = 'pending'
    }

    // Calculate platform fee (SaaS model)
    const platformFeePercentage = Number(offer.shop.platformFeePercentage) / 100
    const platformFeeAmount = Math.round(data.bidAmount * platformFeePercentage * 100) // in cents
    const totalAmount = Math.round(data.bidAmount * 100) // in cents

    // Create payment intent on shop owner's connected account with platform fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      capture_method: shouldAutoCapture ? 'automatic' : 'manual', // Auto-capture for fix price, manual for others
      application_fee_amount: platformFeeAmount,  // Platform fee goes to your account
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        offerId: data.offerId,
        shopId: data.shopId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        locale: data.locale,
        bidStatus: bidStatus,
        isBelowMinSellingPrice: isBelowMinSellingPrice.toString(),
        minSellingPrice: minSellingPrice.toString(),
        platformFeeAmount: (platformFeeAmount / 100).toString(),
        platformFeePercentage: offer.shop.platformFeePercentage.toString()
      }
    }, {
      stripeAccount: offer.shop.stripeAccountId  // CRITICAL: Payment goes to shop owner's account
    })

    // Calculate platform fee and shop owner amount
    const platformFee = platformFeeAmount / 100
    const shopOwnerAmount = data.bidAmount - platformFee

    // Create the bid
    // For mobile wallet payments, shippingAddress will be null initially
    // and will be updated after payment confirmation
    const bid = await prisma.bid.create({
      data: {
        shopId: data.shopId,
        offerId: data.offerId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        shippingAddress: data.shippingAddress || {}, // Empty object for mobile wallets
        bidAmount: data.bidAmount,
        isFixPrice: data.isFixPrice || false,
        status: bidStatus,
        stripePaymentId: paymentIntent.id,
        locale: data.locale,
        // Platform fee tracking (SaaS model)
        platformFeeAmount: platformFee,
        shopOwnerAmount: shopOwnerAmount
      }
    })

    // If auto-accepted, decrement stock
    if (bidStatus === 'accepted') {
      await prisma.offer.update({
        where: { id: data.offerId },
        data: {
          stockQuantity: {
            decrement: 1
          }
        }
      })

      // TODO: Send acceptance email to customer
    }

    return successResponse({
      bidId: bid.id,
      status: bid.status,
      clientSecret: paymentIntent.client_secret
    }, 201)
  } catch (error) {
    console.error('Bid creation error:', error)
    return errorResponse('Failed to create bid', 500)
  }
}
