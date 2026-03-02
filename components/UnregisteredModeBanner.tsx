'use client'

import Link from 'next/link'

interface UnregisteredModeBannerProps {
  pendingPayouts: number
  locale?: 'en' | 'de'
}

export function UnregisteredModeBanner({ pendingPayouts, locale = 'en' }: UnregisteredModeBannerProps) {
  // Only show banner if there are pending payouts
  if (pendingPayouts <= 0) {
    return null
  }

  const translations = {
    en: {
      message: 'Complete your Stripe Onboarding. You have pending payouts.',
      amount: 'Pending',
      setupButton: 'Complete Setup'
    },
    de: {
      message: 'Schließen Sie Ihr Stripe-Onboarding ab. Sie haben ausstehende Auszahlungen.',
      amount: 'Ausstehend',
      setupButton: 'Setup abschließen'
    }
  }

  const t = translations[locale]

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            {/* Warning Icon */}
            <div className="flex-shrink-0 mt-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <p className="text-lg font-semibold mb-1">
                {t.message}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-90">{t.amount}:</span>
                <span className="text-2xl font-bold">€{pendingPayouts.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all shadow-md hover:shadow-lg"
          >
            {t.setupButton}
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
