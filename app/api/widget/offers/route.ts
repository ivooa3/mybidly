import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const shopId = searchParams.get('shopId')
    const productId = searchParams.get('productId') // Optional product ID for future targeting

    if (!shopId) {
      return errorResponse('Shop ID is required', 400)
    }

    // Domain validation - check if referer matches shop's URL
    const referer = request.headers.get('referer')
    const origin = request.headers.get('origin')

    // Fetch shop to validate domain
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { shopUrl: true, isActive: true, preferredLanguage: true }
    })

    if (!shop || !shop.isActive) {
      return errorResponse('Shop not found or inactive', 404)
    }

    // Check if shop has reached free tier limit (10 accepted bids/month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const acceptedBidsThisMonth = await prisma.bid.count({
      where: {
        shopId: shopId,
        status: 'accepted',
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    const FREE_TIER_LIMIT = 10
    const hasReachedLimit = acceptedBidsThisMonth >= FREE_TIER_LIMIT

    // Domain validation: Check if request is from authorized domain
    if (shop.shopUrl && referer) {
      try {
        const shopDomain = new URL(shop.shopUrl).hostname
        const refererDomain = new URL(referer).hostname

        // Allow localhost for testing
        const isLocalhost = refererDomain.includes('localhost') || refererDomain.includes('127.0.0.1')

        if (!isLocalhost && shopDomain !== refererDomain) {
          console.warn(`Domain mismatch: ${refererDomain} !== ${shopDomain}`)
          return errorResponse('Widget not authorized for this domain', 403)
        }
      } catch (err) {
        // If URL parsing fails, allow the request (shopUrl might not be set yet)
        console.warn('URL parsing error in domain validation:', err)
      }
    }

    // Fetch the highest priority active offer with stock
    const offer = await prisma.offer.findFirst({
      where: {
        shopId: shopId,
        isActive: true,
        stockQuantity: { gt: 0 } // Only show offers with stock
      },
      select: {
        id: true,
        productName: true,
        productSku: true,
        scopeOfDelivery: true,
        offerHeadline: true,
        offerSubheadline: true,
        imageUrl: true,
        minPrice: true,
        fixPrice: true,
        minRange: true,
        maxRange: true,
        stockQuantity: true,
        priority: true
      },
      orderBy: { priority: 'asc' } // Lower priority number = higher priority
    })

    // Track widget view with appropriate viewType
    let viewType = 'shown'

    if (hasReachedLimit) {
      viewType = 'limit_reached'
    } else if (!offer) {
      viewType = 'no_offers'
    } else if (offer.stockQuantity === 0) {
      viewType = 'out_of_stock'
    }

    // Always track the view (even when widget won't be shown)
    try {
      const visitorId = request.headers.get('x-visitor-id') || request.headers.get('x-forwarded-for') || 'unknown'
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      const userAgent = request.headers.get('user-agent')

      await prisma.widgetView.create({
        data: {
          shopId: shopId,
          offerId: offer?.id || null,
          productId: productId,
          visitorId: visitorId,
          ipAddress: ipAddress,
          userAgent: userAgent,
          referer: referer,
          viewType: viewType,
          didBid: false
        }
      })
    } catch (trackingError) {
      // Don't fail the request if tracking fails
      console.error('Widget view tracking error:', trackingError)
    }

    // If limit reached, return special response
    if (hasReachedLimit) {
      return successResponse({
        offers: [],
        limitReached: true,
        message: 'Free tier limit reached'
      })
    }

    // If no offer found, return empty array for backwards compatibility
    if (!offer) {
      return successResponse({ offers: [] })
    }

    // Convert Decimal to number for JSON response
    const minSellingPrice = Number(offer.minPrice)  // The actual minimum selling price (base price)
    const minBidPrice = Number(offer.minRange)      // minRange contains the minimum bid price
    const maxBidPrice = Number(offer.maxRange)      // maxRange contains the maximum bid price
    const fixPrice = Number(offer.fixPrice)

    const offerWithNumbers = {
      ...offer,
      minSellingPrice: minSellingPrice,  // Add as separate field
      minPrice: minBidPrice,             // For slider minimum
      maxPrice: maxBidPrice,             // For slider maximum
      fixPrice: fixPrice
    }

    // Return as array with single offer for widget compatibility
    // Include product ID and language preference in metadata
    return successResponse({
      offers: [offerWithNumbers],
      metadata: {
        productId: productId || null, // For future targeting features
        language: shop.preferredLanguage || 'en', // Use shop owner's preferred language
        shopId: shopId
      }
    })
  } catch (error) {
    console.error('Widget offers fetch error:', error)
    return errorResponse('Failed to fetch offers', 500)
  }
}
