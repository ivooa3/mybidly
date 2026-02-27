import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { sendMissedOpportunitiesEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Weekly cron endpoint to send missed opportunities emails to shop owners
 * - Identifies shops that have reached their free tier limit
 * - Calculates missed views and estimated lost revenue
 * - Sends weekly summary email to shop owners
 *
 * This runs every Monday at 9am via Vercel Cron (configured in vercel.json)
 *
 * Security: Protect this endpoint with a secret token in production
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse('Unauthorized', 401)
    }

    // Get all shops
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        email: true,
        shopName: true,
        preferredLanguage: true
      }
    })

    const emailsSent: string[] = []
    const skippedShops: string[] = []
    const errors: { shopId: string; error: string }[] = []

    const FREE_TIER_LIMIT = 10

    for (const shop of shops) {
      try {
        // Calculate date ranges
        const now = new Date()
        const startOfThisWeek = new Date(now)
        startOfThisWeek.setDate(now.getDate() - 7)

        const startOfLastWeek = new Date(now)
        startOfLastWeek.setDate(now.getDate() - 14)
        const endOfLastWeek = new Date(now)
        endOfLastWeek.setDate(now.getDate() - 7)

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Check if shop has reached free tier limit this month
        const acceptedBidsThisMonth = await prisma.bid.count({
          where: {
            shopId: shop.id,
            status: 'accepted',
            createdAt: {
              gte: startOfMonth
            }
          }
        })

        // Only send email if shop has reached the limit
        if (acceptedBidsThisMonth < FREE_TIER_LIMIT) {
          skippedShops.push(shop.id)
          continue
        }

        // Get missed views this week (views with limit_reached status)
        const missedViewsThisWeek = await prisma.widgetView.count({
          where: {
            shopId: shop.id,
            viewType: 'limit_reached',
            viewedAt: {
              gte: startOfThisWeek
            }
          }
        })

        // Only send email if there were missed opportunities
        if (missedViewsThisWeek === 0) {
          skippedShops.push(shop.id)
          continue
        }

        // Get missed views last week for comparison
        const missedViewsLastWeek = await prisma.widgetView.count({
          where: {
            shopId: shop.id,
            viewType: 'limit_reached',
            viewedAt: {
              gte: startOfLastWeek,
              lt: endOfLastWeek
            }
          }
        })

        // Calculate average bid amount from accepted bids
        const acceptedBids = await prisma.bid.findMany({
          where: {
            shopId: shop.id,
            status: 'accepted'
          },
          select: {
            bidAmount: true
          }
        })

        const averageBidAmount = acceptedBids.length > 0
          ? acceptedBids.reduce((sum, bid) => sum + Number(bid.bidAmount), 0) / acceptedBids.length
          : 35 // Default fallback

        // Estimate lost revenue (missed views * average bid * 20% conversion rate)
        const estimatedLostRevenue = missedViewsThisWeek * averageBidAmount * 0.2

        // Send email
        const locale = (shop.preferredLanguage as 'en' | 'de') || 'en'
        await sendMissedOpportunitiesEmail({
          shopName: shop.shopName || 'Shop Owner',
          shopOwnerEmail: shop.email,
          missedViewsThisWeek,
          missedViewsLastWeek,
          estimatedLostRevenue,
          averageBidAmount,
          acceptedBidsThisMonth,
          freeMonthlyLimit: FREE_TIER_LIMIT,
          locale
        })

        emailsSent.push(shop.id)
        console.log(`✅ Missed opportunities email sent to shop ${shop.id} (${shop.email})`)
      } catch (error: any) {
        console.error(`Failed to send email to shop ${shop.id}:`, error)
        errors.push({
          shopId: shop.id,
          error: error.message
        })
      }
    }

    return successResponse({
      message: `Weekly missed opportunities cron completed`,
      totalShops: shops.length,
      emailsSent: emailsSent.length,
      skipped: skippedShops.length,
      errors: errors.length,
      sentToShops: emailsSent,
      skippedShops,
      errorDetails: errors
    })
  } catch (error) {
    console.error('Weekly missed opportunities cron error:', error)
    return errorResponse('Failed to send missed opportunities emails', 500)
  }
}
