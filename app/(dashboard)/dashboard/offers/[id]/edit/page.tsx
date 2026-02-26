import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { OfferEditForm } from '@/components/OfferEditForm'

interface EditOfferPageProps {
  params: {
    id: string
  }
}

export default async function EditOfferPage({ params }: EditOfferPageProps) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const offer = await prisma.offer.findUnique({
    where: {
      id: params.id,
      shopId: session.user.shopId // Ensure user owns this offer
    }
  })

  if (!offer) {
    notFound()
  }

  // Convert Decimal to number for client component
  const offerWithNumbers = {
    ...offer,
    minPrice: Number(offer.minPrice),
    minRange: offer.minRange,
    maxRange: offer.maxRange,
    stockQuantity: offer.stockQuantity,
    priority: offer.priority
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Offer</h1>
        <p className="text-gray-600 mt-2">
          Update your product offer details
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-soft p-6">
        <OfferEditForm offer={offerWithNumbers} />
      </div>
    </div>
  )
}
