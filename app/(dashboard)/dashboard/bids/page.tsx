import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BidsContent } from '@/components/BidsContent'

export default async function BidsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const bids = await prisma.bid.findMany({
    where: { shopId: session.user.shopId },
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

  // Convert Decimal to number for client component
  const bidsWithNumbers = bids.map(bid => {
    const minSellingPrice = Number(bid.offer.minPrice)
    return {
      ...bid,
      bidAmount: Number(bid.bidAmount),
      platformFeeAmount: bid.platformFeeAmount ? Number(bid.platformFeeAmount) : null,
      shopOwnerAmount: bid.shopOwnerAmount ? Number(bid.shopOwnerAmount) : null,
      offer: {
        ...bid.offer,
        minSellingPrice: minSellingPrice
      }
    }
  })

  return <BidsContent bids={bidsWithNumbers} />
}
