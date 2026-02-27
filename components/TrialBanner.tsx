'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

interface TrialBannerProps {
  daysRemaining: number
  endedByFirstOrder: boolean
  isInTrial: boolean
}

export function TrialBanner({ daysRemaining, endedByFirstOrder, isInTrial }: TrialBannerProps) {
  const { t } = useLanguage()

  const translations = {
    en: {
      trialActive: (days: number) => days === 1 ? '1 day left in your trial' : `${days} days left in your trial`,
      trialEnded: endedByFirstOrder ? 'Your trial ended after your first order' : 'Your trial period has ended',
      upgradeCta: 'Upgrade to continue receiving orders',
      upgradeButton: 'Upgrade Now',
      missedOpportunities: 'Missed opportunities are being tracked and sent weekly'
    },
    de: {
      trialActive: (days: number) => days === 1 ? '1 Tag Testphase übrig' : `${days} Tage Testphase übrig`,
      trialEnded: endedByFirstOrder ? 'Ihre Testphase endete nach Ihrer ersten Bestellung' : 'Ihre Testphase ist abgelaufen',
      upgradeCta: 'Upgraden Sie, um weiterhin Bestellungen zu erhalten',
      upgradeButton: 'Jetzt upgraden',
      missedOpportunities: 'Verpasste Gelegenheiten werden verfolgt und wöchentlich gesendet'
    }
  }

  const locale = t.dashboard ? 'en' : 'de'
  const txt = translations[locale]

  if (!isInTrial && !endedByFirstOrder) {
    // Trial expired
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">⚠️ {txt.trialEnded}</h3>
            <p className="text-sm opacity-90">{txt.upgradeCta}</p>
            <p className="text-xs opacity-75 mt-1">{txt.missedOpportunities}</p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
          >
            {txt.upgradeButton}
          </Link>
        </div>
      </div>
    )
  }

  if (!isInTrial && endedByFirstOrder) {
    // Trial ended by first order
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">🎉 {txt.trialEnded}</h3>
            <p className="text-sm opacity-90">{txt.upgradeCta}</p>
            <p className="text-xs opacity-75 mt-1">{txt.missedOpportunities}</p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
          >
            {txt.upgradeButton}
          </Link>
        </div>
      </div>
    )
  }

  // Trial is active
  const isUrgent = daysRemaining <= 2

  return (
    <div className={`${isUrgent ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white px-6 py-4 rounded-lg shadow-lg mb-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1">
            {isUrgent ? '⏰' : '✨'} {txt.trialActive(daysRemaining)}
          </h3>
          <p className="text-sm opacity-90">
            {locale === 'en'
              ? 'Trial ends after 7 days or your first order (whichever comes first)'
              : 'Testphase endet nach 7 Tagen oder Ihrer ersten Bestellung (je nachdem, was zuerst eintritt)'}
          </p>
        </div>
        {isUrgent && (
          <Link
            href="/dashboard/upgrade"
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
          >
            {txt.upgradeButton}
          </Link>
        )}
      </div>
    </div>
  )
}
