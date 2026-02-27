import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-middleware'
import { DashboardContent } from '@/components/DashboardContent'
import { getMissedOpportunities, getBidLimitStatus } from '@/lib/missed-opportunities'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    return null // Layout handles redirect
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin()

  // Get stats
  const [acceptedBids, totalBids, totalViews, revenueData, missedOpportunities, bidLimitStatus] = await Promise.all([
    prisma.bid.count({ where: { shopId: session.user.shopId, status: 'accepted' } }),
    prisma.bid.count({ where: { shopId: session.user.shopId } }),
    // Only count views for admins
    userIsAdmin ? prisma.widgetView.count({ where: { shopId: session.user.shopId } }) : Promise.resolve(0),
    prisma.bid.aggregate({
      where: { shopId: session.user.shopId, status: 'accepted' },
      _sum: {
        bidAmount: true,
        platformFeeAmount: true,
        shopOwnerAmount: true
      }
    }),
    getMissedOpportunities(session.user.shopId),
    getBidLimitStatus(session.user.shopId)
  ])

  // Calculate conversion rates
  const conversionRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0
  const viewToBidRate = totalViews > 0 ? (totalBids / totalViews) * 100 : 0

  // Calculate total revenue from accepted bids
  const totalRevenue = revenueData._sum.bidAmount ? Number(revenueData._sum.bidAmount) : 0

  return (
    <DashboardContent
      shopName={session.user.shopName}
      isAdmin={userIsAdmin}
      stats={{
        totalBids,
        acceptedBids,
        totalViews,
        totalRevenue,
        conversionRate,
        viewToBidRate,
        missedOpportunities,
        bidLimitStatus
      }}
    />
  )
}
