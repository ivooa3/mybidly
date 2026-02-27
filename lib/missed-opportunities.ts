import { prisma } from '@/lib/prisma'

export interface MissedOpportunityStats {
  missedViewsToday: number
  missedViewsThisMonth: number
  estimatedLostRevenueToday: number
  estimatedLostRevenueThisMonth: number
  averageBidAmount: number
}

/**
 * Calculate missed opportunities for a shop
 * Counts widget views where viewType = 'limit_reached'
 */
export async function getMissedOpportunities(
  shopId: string
): Promise<MissedOpportunityStats> {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Count missed views (when limit was reached)
  const [missedToday, missedMonth] = await Promise.all([
    prisma.widgetView.count({
      where: {
        shopId,
        viewType: 'limit_reached',
        createdAt: { gte: startOfToday }
      }
    }),
    prisma.widgetView.count({
      where: {
        shopId,
        viewType: 'limit_reached',
        createdAt: { gte: startOfMonth }
      }
    })
  ])

  // Calculate average accepted bid amount for this shop
  const avgBidResult = await prisma.bid.aggregate({
    where: {
      shopId,
      status: 'accepted'
    },
    _avg: {
      bidAmount: true
    }
  })

  const averageBidAmount = Number(avgBidResult._avg.bidAmount || 35) // Default to €35 if no bids

  // Estimate conversion rate (typical: 20-30% of widget views convert)
  // Being conservative with 20%
  const ESTIMATED_CONVERSION_RATE = 0.20

  const estimatedLostRevenueToday = missedToday * averageBidAmount * ESTIMATED_CONVERSION_RATE
  const estimatedLostRevenueThisMonth = missedMonth * averageBidAmount * ESTIMATED_CONVERSION_RATE

  return {
    missedViewsToday: missedToday,
    missedViewsThisMonth: missedMonth,
    estimatedLostRevenueToday: Math.round(estimatedLostRevenueToday * 100) / 100,
    estimatedLostRevenueThisMonth: Math.round(estimatedLostRevenueThisMonth * 100) / 100,
    averageBidAmount: Math.round(averageBidAmount * 100) / 100
  }
}

/**
 * Get current bid count vs free tier limit
 */
export async function getBidLimitStatus(shopId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const acceptedBidsThisMonth = await prisma.bid.count({
    where: {
      shopId,
      status: 'accepted',
      createdAt: { gte: startOfMonth }
    }
  })

  const FREE_TIER_LIMIT = 10

  return {
    acceptedBids: acceptedBidsThisMonth,
    limit: FREE_TIER_LIMIT,
    hasReachedLimit: acceptedBidsThisMonth >= FREE_TIER_LIMIT,
    remaining: Math.max(0, FREE_TIER_LIMIT - acceptedBidsThisMonth)
  }
}
