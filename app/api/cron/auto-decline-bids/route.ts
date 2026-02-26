import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { sendBidAcceptedEmail, sendBidDeclinedEmail, sendOrderNotificationToShopOwner } from '@/lib/email'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

/**
 * Cron endpoint to process bids after 10-20 minute delay
 * - Auto-accept bids >= minimum selling price
 * - Auto-decline bids < minimum selling price
 * - Send appropriate emails to customers and shop owners
 *
 * This runs every 10 minutes via Vercel Cron (configured in vercel.json)
 *
 * Security: Protect this endpoint with a secret token in production
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended for production)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse('Unauthorized', 401)
    }

    // Find all pending bids that are:
    // 1. Created between 10-20 minutes ago (for human-like delay)
    // 2. Payment already succeeded (status = 'pending')
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

    const pendingBids = await prisma.bid.findMany({
      where: {
        status: 'pending',
        createdAt: {
          gte: twentyMinutesAgo, // Greater than or equal to 20 minutes ago
          lte: tenMinutesAgo // Less than or equal to 10 minutes ago
        }
      },
      include: {
        offer: {
          select: {
            id: true,
            minPrice: true,
            productName: true,
            productSku: true,
            stockQuantity: true,
            shopId: true
          }
        },
        shop: {
          select: {
            id: true,
            email: true,
            shopName: true,
            preferredLanguage: true
          }
        }
      }
    })

    const acceptedBids: string[] = []
    const declinedBids: string[] = []
    const errors: { bidId: string; error: string }[] = []

    // Process each bid
    for (const bid of pendingBids) {
      const bidAmount = Number(bid.bidAmount)
      const minSellingPrice = Number(bid.offer.minPrice)
      const stockAvailable = bid.offer.stockQuantity > 0

      try {
        // Auto-accept if bid >= minimum price AND stock is available
        if (bidAmount >= minSellingPrice && stockAvailable) {
          // Update bid status to accepted
          await prisma.bid.update({
            where: { id: bid.id },
            data: { status: 'accepted' }
          })

          // Decrement stock quantity
          await prisma.offer.update({
            where: { id: bid.offer.id },
            data: {
              stockQuantity: { decrement: 1 }
            }
          })

          acceptedBids.push(bid.id)

          // Send acceptance email to customer
          const locale = bid.preferredLanguage || bid.shop.preferredLanguage || 'en'
          await sendBidAcceptedEmail(
            {
              customerName: bid.customerName,
              customerEmail: bid.customerEmail,
              bidAmount: bidAmount,
              productName: bid.offer.productName,
              productSku: bid.offer.productSku || '',
              shippingAddress: bid.shippingAddress
            },
            locale as 'en' | 'de'
          )

          // Send order notification to shop owner
          await sendOrderNotificationToShopOwner({
            shopOwnerEmail: bid.shop.email,
            shopName: bid.shop.shopName || 'Shop Owner',
            bidAmount: bidAmount,
            productName: bid.offer.productName,
            productSku: bid.offer.productSku || '',
            customerName: bid.customerName,
            customerEmail: bid.customerEmail,
            shippingAddress: bid.shippingAddress
          })

          console.log(`✅ Bid ${bid.id} auto-accepted and emails sent`)
        }
        // Auto-decline if bid < minimum price OR stock unavailable
        else {
          // Refund the payment
          await stripe.refunds.create({
            payment_intent: bid.stripePaymentId,
            reason: 'requested_by_customer'
          })

          // Update bid status to declined
          await prisma.bid.update({
            where: { id: bid.id },
            data: { status: 'declined' }
          })

          declinedBids.push(bid.id)

          // Send decline email to customer
          const locale = bid.preferredLanguage || bid.shop.preferredLanguage || 'en'
          await sendBidDeclinedEmail(
            {
              customerName: bid.customerName,
              customerEmail: bid.customerEmail,
              bidAmount: bidAmount,
              productName: bid.offer.productName,
              productSku: bid.offer.productSku || '',
              shippingAddress: bid.shippingAddress
            },
            locale as 'en' | 'de'
          )

          console.log(`❌ Bid ${bid.id} auto-declined and refund issued`)
        }
      } catch (error: any) {
        console.error(`Failed to process bid ${bid.id}:`, error)
        errors.push({
          bidId: bid.id,
          error: error.message
        })
      }
    }

    return successResponse({
      message: `Bid processing cron completed`,
      processed: pendingBids.length,
      accepted: acceptedBids.length,
      declined: declinedBids.length,
      errors: errors.length,
      acceptedBids,
      declinedBids,
      errorDetails: errors
    })
  } catch (error) {
    console.error('Bid processing cron error:', error)
    return errorResponse('Failed to process bids', 500)
  }
}
