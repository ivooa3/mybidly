import { requireAdmin } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'
import { AdminUsersContent } from '@/components/admin/AdminUsersContent'

export default async function AdminUsersPage() {
  await requireAdmin()

  // Fetch all users with their stats
  const users = await prisma.shop.findMany({
    select: {
      id: true,
      email: true,
      shopName: true,
      shopUrl: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      planTier: true,
      stripeOnboardingComplete: true,
      createdAt: true,
      _count: {
        select: {
          bids: {
            where: { status: 'accepted' }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate revenue for each user
  const usersWithRevenue = await Promise.all(
    users.map(async (user) => {
      const revenue = await prisma.bid.aggregate({
        where: {
          shopId: user.id,
          status: 'accepted'
        },
        _sum: {
          shopOwnerAmount: true
        }
      })

      return {
        ...user,
        acceptedBids: user._count.bids,
        revenue: revenue._sum.shopOwnerAmount ? Number(revenue._sum.shopOwnerAmount) : 0
      }
    })
  )

  // Serialize for client component
  const serializedUsers = usersWithRevenue.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString()
  }))

  return <AdminUsersContent users={serializedUsers} />
}
