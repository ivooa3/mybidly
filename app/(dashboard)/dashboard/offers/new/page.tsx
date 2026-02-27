'use client'

import { OfferForm } from '@/components/OfferForm'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewOfferPage() {
  const { t } = useLanguage()

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.offers.createNew}</h1>
          <p className="text-gray-600 mt-2">
            {t.offers.createNewSubtitle}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <OfferForm />
        </div>
      </div>
    </div>
  )
}
