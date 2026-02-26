'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const translations = {
  en: {
    success: 'Bid Submitted Successfully!',
    message: 'Thank you for your bid. We will review it and notify you via email.',
    accepted: 'Your bid was automatically accepted!',
    acceptedMessage: 'We will process your order and send you a confirmation email shortly.',
    declined: 'Bid Below Minimum',
    declinedMessage: 'Unfortunately, your bid was below the minimum threshold and could not be accepted.',
    processing: 'Processing your bid...',
    error: 'Something went wrong. Please contact support.'
  },
  de: {
    success: 'Gebot erfolgreich abgegeben!',
    message: 'Vielen Dank für Ihr Gebot. Wir werden es prüfen und Sie per E-Mail benachrichtigen.',
    accepted: 'Ihr Gebot wurde automatisch angenommen!',
    acceptedMessage: 'Wir werden Ihre Bestellung bearbeiten und Ihnen in Kürze eine Bestätigungs-E-Mail senden.',
    declined: 'Gebot unter Minimum',
    declinedMessage: 'Leider lag Ihr Gebot unter dem Mindestschwellenwert und konnte nicht akzeptiert werden.',
    processing: 'Ihr Gebot wird verarbeitet...',
    error: 'Etwas ist schief gelaufen. Bitte kontaktieren Sie den Support.'
  }
}

export default function WidgetSuccessPage() {
  const searchParams = useSearchParams()
  const bidId = searchParams.get('bidId')
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'de'
  const [bidStatus, setBidStatus] = useState<'pending' | 'accepted' | 'declined' | null>(null)
  const [loading, setLoading] = useState(true)

  const t = translations[locale]

  useEffect(() => {
    if (bidId) {
      fetchBidStatus()
    }
  }, [bidId])

  const fetchBidStatus = async () => {
    try {
      const response = await fetch(`/api/bids/${bidId}/status`)
      const result = await response.json()

      if (result.success) {
        setBidStatus(result.data.status)
      }
    } catch (error) {
      console.error('Failed to fetch bid status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.processing}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {bidStatus === 'accepted' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.accepted}</h2>
            <p className="text-gray-600">{t.acceptedMessage}</p>
          </>
        )}

        {bidStatus === 'pending' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h2>
            <p className="text-gray-600">{t.message}</p>
          </>
        )}

        {bidStatus === 'declined' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.declined}</h2>
            <p className="text-gray-600">{t.declinedMessage}</p>
          </>
        )}

        {!bidStatus && (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.error}</h2>
          </>
        )}
      </div>
    </div>
  )
}
