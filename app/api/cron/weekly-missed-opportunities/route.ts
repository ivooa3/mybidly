import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { sendMissedOpportunitiesEmail } from '@/lib/email'
import { getTrialStatus } from '@/lib/trial'

export const dynamic = 'force-dynamic'

/**
 * Weekly cron endpoint to send missed opportunities emails to shop owners
 * - Identifies shops whose trial period has ended
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

    // Get all shops with trial info
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        email: true,
        shopName: true,
        preferredLanguage: true,
        createdAt: true,
        trialEndsAt: true,
        trialEndedByFirstOrder: true,
        planTier: true
      }
    })

    const emailsSent: string[] = []
    const skippedShops: string[] = []
    const errors: { shopId: string; error: string }[] = []

    for (const shop of shops) {
      try {
        // Check trial status
        const trialStatus = getTrialStatus(shop)

        // Only send email if trial has ended and shop is still on free plan
        if (trialStatus.isInTrial || shop.planTier !== 'free') {
          skippedShops.push(shop.id)
          continue
        }

        // Calculate date ranges
        const now = new Date()
        const startOfThisWeek = new Date(now)
        startOfThisWeek.setDate(now.getDate() - 7)

        const startOfLastWeek = new Date(now)
        startOfLastWeek.setDate(now.getDate() - 14)
        const endOfLastWeek = new Date(now)
        endOfLastWeek.setDate(now.getDate() - 7)

        // Get missed views this week (views with trial_ended status)
        const missedViewsThisWeek = await prisma.widgetView.count({
          where: {
            shopId: shop.id,
            viewType: 'trial_ended',
            createdAt: {
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
            viewType: 'trial_ended',
            createdAt: {
              gte: startOfLastWeek,
              lt: endOfLastWeek
            }
          }
        })

        // Get accepted bids count for email context
        const acceptedBidsCount = await prisma.bid.count({
          where: {
            shopId: shop.id,
            status: 'accepted'
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
          acceptedBidsThisMonth: acceptedBidsCount,
          freeMonthlyLimit: 1, // Trial ended after 1 accepted order or 7 days
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
