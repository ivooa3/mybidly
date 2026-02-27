'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface PlanBannerProps {
  planTier: 'payg' | 'premium'
}

export function PlanBanner({ planTier }: PlanBannerProps) {
  const { t } = useLanguage()

  const isPremium = planTier === 'premium'

  return (
    <div className={`${isPremium ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'} text-white px-6 py-4 rounded-lg shadow-lg mb-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium mb-1 opacity-90">{t.dashboard.currentPlan}</h3>
          <p className="text-2xl font-bold mb-1">
            {isPremium ? t.dashboard.premium : t.dashboard.payAsYouGo}
          </p>
          <p className="text-sm opacity-90">
            {isPremium ? t.dashboard.planPremium : t.dashboard.planPayg}
          </p>
        </div>

        {!isPremium && (
          <Link
            href="mailto:hello@next-commerce.io?subject=Upgrade to Premium Plan"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
          >
            {t.dashboard.upgradeButton}
          </Link>
        )}
      </div>
    </div>
  )
}
