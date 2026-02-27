import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-middleware'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userIsAdmin = await isAdmin()

  if (!userIsAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const shopId = searchParams.get('shopId')

  try {
    if (shopId) {
      // Get analytics for specific shop
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
        select: {
          id: true,
          shopName: true,
          email: true,
          planTier: true,
          createdAt: true
        }
      })

      if (!shop) {
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
      }

      // Get widget views
      const totalViews = await prisma.widgetView.count({
        where: {
          shopId,
          viewType: 'shown'
        }
      })

      // Get total bids
      const totalBids = await prisma.bid.count({
        where: { shopId }
      })

      // Get accepted bids
      const acceptedBids = await prisma.bid.count({
        where: {
          shopId,
          status: 'accepted'
        }
      })

      // Get declined bids
      const declinedBids = await prisma.bid.count({
        where: {
          shopId,
          status: 'declined'
        }
      })

      // Get total revenue
      const revenueData = await prisma.bid.aggregate({
        where: {
          shopId,
          status: 'accepted'
        },
        _sum: {
          bidAmount: true
        }
      })

      const totalRevenue = Number(revenueData._sum.bidAmount || 0)

      // Calculate conversion rate
      const conversionRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0

      return NextResponse.json({
        shop,
        metrics: {
          totalViews,
          totalBids,
          acceptedBids,
          declinedBids,
          totalRevenue,
          conversionRate
        }
      })
    } else {
      // Get all shops with their analytics
      const shops = await prisma.shop.findMany({
        where: {
          role: { not: 'admin' }
        },
        select: {
          id: true,
          shopName: true,
          email: true,
          planTier: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Get totals across all shops
      const totalViews = await prisma.widgetView.count({
        where: {
          viewType: 'shown'
        }
      })

      const totalBids = await prisma.bid.count()

      const acceptedBids = await prisma.bid.count({
        where: { status: 'accepted' }
      })

      const revenueData = await prisma.bid.aggregate({
        where: { status: 'accepted' },
        _sum: {
          bidAmount: true
        }
      })

      const totalRevenue = Number(revenueData._sum.bidAmount || 0)
      const averageConversionRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0

      return NextResponse.json({
        shops,
        totals: {
          totalViews,
          totalBids,
          acceptedBids,
          totalRevenue,
          averageConversionRate,
          totalShops: shops.length
        }
      })
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
