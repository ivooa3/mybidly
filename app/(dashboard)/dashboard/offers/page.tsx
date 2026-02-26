import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OffersContent } from '@/components/OffersContent'

export default async function OffersPage() {
  const session = await auth()

  if (!session) {
    return null
  }

  const offers = await prisma.offer.findMany({
    where: { shopId: session.user.shopId },
    orderBy: { priority: 'asc' } // Sort by priority (lower number = higher priority)
  })

  // Convert Decimal to number and calculate min/max prices for client component
  const offersWithNumbers = offers.map(offer => {
    const minSellingPrice = Number(offer.minPrice)
    const calculatedMinPrice = minSellingPrice * (1 + offer.minRange / 100)
    const calculatedMaxPrice = minSellingPrice * (1 + offer.maxRange / 100)
    return {
      ...offer,
      minSellingPrice: minSellingPrice,
      minPrice: calculatedMinPrice,
      maxPrice: calculatedMaxPrice,
      priority: offer.priority
    }
  })

  return <OffersContent offers={offersWithNumbers} />
}
