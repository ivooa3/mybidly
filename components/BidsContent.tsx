'use client'

import { BidsList } from '@/components/BidsList'
import { useLanguage } from '@/contexts/LanguageContext'

interface Bid {
  id: string
  customerName: string
  customerEmail: string
  bidAmount: number
  isFixPrice: boolean
  status: string
  createdAt: Date
  platformFeeAmount: number | null
  shopOwnerAmount: number | null
  offer: {
    productName: string
    imageUrl: string
    minSellingPrice: number
  }
}

interface BidsContentProps {
  bids: Bid[]
}

export function BidsContent({ bids }: BidsContentProps) {
  const { t } = useLanguage()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.bids.title}</h1>
        <p className="text-gray-600 mt-2">
          {t.bids.waitingForBids}
        </p>
      </div>

      {bids.length === 0 ? (
        <div className="bg-white rounded-lg shadow-soft p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t.bids.noBids}
          </h3>
          <p className="text-gray-600">
            {t.bids.waitingForBids}
          </p>
        </div>
      ) : (
        <BidsList bids={bids} />
      )}
    </div>
  )
}
