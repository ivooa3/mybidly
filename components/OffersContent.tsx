'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { OfferCard } from '@/components/OfferCard'
import { useLanguage } from '@/contexts/LanguageContext'

interface Offer {
  id: string
  productName: string
  productSku: string | null
  scopeOfDelivery: string | null
  imageUrl: string
  minSellingPrice: number
  minPrice: number
  maxPrice: number
  stockQuantity: number
  priority: number
  isActive: boolean
}

interface OffersContentProps {
  offers: Offer[]
}

export function OffersContent({ offers }: OffersContentProps) {
  const { t } = useLanguage()

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.offers.title}</h1>
          <p className="text-gray-600 mt-2">
            {t.offers.title}
          </p>
        </div>
        <Link href="/dashboard/offers/new">
          <Button>{t.offers.createNew}</Button>
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-soft p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t.offers.noOffers}
          </h3>
          <p className="text-gray-600 mb-6">
            {t.offers.createFirst}
          </p>
          <Link href="/dashboard/offers/new">
            <Button>{t.offers.createNew}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}
