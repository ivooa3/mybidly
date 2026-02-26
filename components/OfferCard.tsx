'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/calculations'
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

interface OfferCardProps {
  offer: Offer
}

export function OfferCard({ offer: initialOffer }: OfferCardProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [offer, setOffer] = useState(initialOffer)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async (newValue: boolean) => {
    setIsToggling(true)

    try {
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newValue })
      })

      if (response.ok) {
        setOffer({ ...offer, isActive: newValue })
        router.refresh()
      } else {
        alert('Failed to update offer status')
      }
    } catch (error) {
      alert('Failed to update offer status')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-soft overflow-visible">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={offer.imageUrl}
          alt={offer.productName}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <div className="bg-white rounded-full px-3 py-1 shadow-md flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700">
              {offer.isActive ? t.common.active : t.common.inactive}
            </span>
            <Toggle
              enabled={offer.isActive}
              onChange={handleToggle}
              disabled={isToggling}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg text-gray-900">
            {offer.productName}
          </h3>
          {offer.scopeOfDelivery && (
            <div className="group relative inline-block">
              <svg
                className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-50 pointer-events-none">
                <div className="font-semibold mb-1">{t.offers.scopeOfDelivery}:</div>
                <div className="text-gray-200">{offer.scopeOfDelivery}</div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-0 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          )}
        </div>

        {offer.productSku && (
          <p className="text-sm text-gray-500 mb-2">
            {t.offers.productSku}: {offer.productSku}
          </p>
        )}

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <p>
            <span className="font-medium">{t.offers.minPrice}:</span>{' '}
            {formatCurrency(offer.minSellingPrice)}
          </p>
          <p>
            <span className="font-medium">{t.common.stock}:</span> {offer.stockQuantity}
          </p>
          <p>
            <span className="font-medium">{t.common.priority}:</span> {offer.priority}
          </p>
        </div>

        <Link href={`/dashboard/offers/${offer.id}/edit`}>
          <Button variant="secondary" size="sm" className="w-full">
            {t.offers.editOffer}
          </Button>
        </Link>
      </div>
    </div>
  )
}
