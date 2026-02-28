'use client'

import { useState, useEffect } from 'react'
import { BidForm } from '@/components/BidForm'
import { formatCurrency } from '@/utils/calculations'

interface Offer {
  id: string
  productName: string
  productSku: string
  scopeOfDelivery: string | null
  offerHeadline: string | null
  offerSubheadline: string | null
  imageUrl: string
  minSellingPrice: number  // The actual minimum selling price (base price)
  minPrice: number          // The minimum bid price (slider minimum)
  maxPrice: number          // The maximum bid price (slider maximum)
  fixPrice: number
  stockQuantity: number
}

interface BidWidgetProps {
  shopId: string
  locale: 'en' | 'de'
  customTitle?: string
  customSubtitle?: string
}

const translations = {
  en: {
    title: 'Want this product at a special price?',
    subtitle: 'Make your bid and get it delivered to your doorstep!',
    loading: 'Loading offers...',
    noOffers: 'No offers available at the moment.',
    inStock: 'In stock',
    makeYourBid: 'Make Your Bid',
    buyNow: 'Buy It Instantly',
    error: 'Failed to load offers. Please try again.'
  },
  de: {
    title: 'Möchten Sie dieses Produkt zum Sonderpreis?',
    subtitle: 'Geben Sie Ihr Gebot ab und lassen Sie es zu sich nach Hause liefern!',
    loading: 'Angebote werden geladen...',
    noOffers: 'Derzeit keine Angebote verfügbar.',
    inStock: 'Auf Lager',
    makeYourBid: 'Ihr Gebot abgeben',
    buyNow: 'Sofort und sicher kaufen',
    error: 'Angebote konnten nicht geladen werden. Bitte versuchen Sie es erneut.'
  }
}

export function BidWidget({ shopId, locale, customTitle, customSubtitle }: BidWidgetProps) {
  const [offer, setOffer] = useState<Offer | null>(null) // Changed from offers array to single offer
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bidAmount, setBidAmount] = useState<number>(0) // Changed from bidAmounts object to single number

  const t = translations[locale]

  useEffect(() => {
    fetchOffer()
  }, [shopId])

  const fetchOffer = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/widget/offers?shopId=${shopId}`)
      const result = await response.json()

      if (result.success && result.data.offers.length > 0) {
        // API returns highest priority offer with stock
        const highestPriorityOffer = result.data.offers[0]
        setOffer(highestPriorityOffer)
        // Initialize bid amount at minimum selling price
        setBidAmount(highestPriorityOffer.minSellingPrice)
      } else {
        setOffer(null)
      }
    } catch (err) {
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  const handleSliderChange = (value: number) => {
    // Round to nearest 0.20 increment
    const roundedValue = Math.round(value / 0.20) * 0.20
    setBidAmount(roundedValue)
  }

  const handleOfferClick = () => {
    if (!offer) return
    // Set the selected offer with the current bid amount from slider
    setSelectedOffer({ ...offer, minPrice: bidAmount })
  }

  const handleBuyNowClick = () => {
    if (!offer) return
    // Set the selected offer with the fix price
    setSelectedOffer({ ...offer, minPrice: offer.fixPrice })
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">{t.noOffers}</p>
      </div>
    )
  }

  if (selectedOffer) {
    return (
      <BidForm
        offer={selectedOffer}
        shopId={shopId}
        locale={locale}
        onBack={() => setSelectedOffer(null)}
      />
    )
  }

  // Use offer-specific headlines if available, otherwise use custom or default
  const displayTitle = offer.offerHeadline || customTitle || t.title
  const displaySubtitle = offer.offerSubheadline || customSubtitle || t.subtitle

  // Calculate percentage for slider gradient
  const percentage = ((bidAmount - offer.minPrice) / (offer.maxPrice - offer.minPrice)) * 100

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="text-center mb-8 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {displayTitle}
        </h2>
        <p className="text-gray-600">
          {displaySubtitle}
        </p>
      </div>

      <div className="w-full flex justify-center">
        <div className="bg-white rounded-lg shadow-lg overflow-visible hover:shadow-xl transition-shadow w-full max-w-2xl">
          <div className="relative h-56">
            <img
              src={offer.imageUrl}
              alt={offer.productName}
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>

          <div className="p-5">
            <div className="flex items-center justify-center gap-2 mb-3 relative">
              <h3 className="font-bold text-2xl text-gray-900 text-center">
                {offer.productName}
              </h3>
              {offer.scopeOfDelivery && (
                <div className="group relative inline-block">
                  <svg
                    className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 pointer-events-none">
                    <div className="font-semibold mb-1">Scope of Delivery:</div>
                    <div className="text-gray-200">{offer.scopeOfDelivery}</div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-0 border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2 text-center">Your bid</p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-center mb-3">
                {formatCurrency(bidAmount)}
              </p>

              <div className="space-y-2">
                <input
                  type="range"
                  min={offer.minPrice}
                  max={offer.maxPrice}
                  step="0.20"
                  value={bidAmount}
                  onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  style={{
                    background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${percentage}%, rgb(229, 231, 235) ${percentage}%, rgb(229, 231, 235) 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatCurrency(offer.minPrice)}</span>
                  <span>{formatCurrency(offer.maxPrice)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleOfferClick}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 text-base rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                {t.makeYourBid}
              </button>

              <button
                onClick={handleBuyNowClick}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 text-base rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>{t.buyNow}</span>
                <span className="text-lg font-bold">{formatCurrency(offer.fixPrice)}</span>
              </button>
            </div>

            {/* Footer with Terms of Service and Powered by myBidly.io */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center space-y-2">
              <p className="text-xs text-gray-500">
                {locale === 'en'
                  ? 'By using this service, you agree to the '
                  : 'Durch die Nutzung dieses Dienstes stimmen Sie den '}
                <a
                  href="https://next-commerce.io/terms-of-services/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {locale === 'en' ? 'Terms of Service' : 'Nutzungsbedingungen'}
                </a>
                {locale === 'de' ? ' zu' : ''}
              </p>
              <p className="text-xs text-gray-400">
                Powered by{' '}
                <a
                  href="https://mybidly.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline font-semibold"
                >
                  myBidly.io
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
