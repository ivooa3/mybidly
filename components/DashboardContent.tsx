'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { formatCurrency } from '@/utils/calculations'
import { TrialBanner } from './TrialBanner'
import { PlanBanner } from './PlanBanner'

interface TrialStatus {
  isInTrial: boolean
  daysRemaining: number
  endedByFirstOrder: boolean
  trialEndsAt: Date | null
}

interface DashboardContentProps {
  shopName: string
  isAdmin: boolean
  trialStatus?: TrialStatus
  planTier: 'payg' | 'premium'
  stats: {
    totalBids: number
    acceptedBids: number
    totalViews: number
    totalRevenue: number
    conversionRate: number
    viewToBidRate: number
  }
}

export function DashboardContent({ shopName, isAdmin, trialStatus, planTier, stats }: DashboardContentProps) {
  const { t } = useLanguage()

  const { totalBids, acceptedBids, totalViews, totalRevenue, conversionRate, viewToBidRate } = stats

  // Format conversion rate: show decimal only if it's not .0
  const formatConversionRate = (rate: number) => {
    if (rate === 0) return '0%'
    const rounded = Math.round(rate * 10) / 10 // Round to 1 decimal
    return rounded % 1 === 0 ? `${Math.round(rounded)}%` : `${rounded}%`
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t.dashboard.welcome}, {shopName}!
        </h1>
        <p className="text-gray-600 mt-2">
          {t.dashboard.title}
        </p>
      </div>

      {/* Plan Banner - Only show for non-admin users */}
      {!isAdmin && <PlanBanner planTier={planTier} />}

      {/* Trial Banner - Only show for non-admin users */}
      {!isAdmin && trialStatus && (
        <TrialBanner
          daysRemaining={trialStatus.daysRemaining}
          endedByFirstOrder={trialStatus.endedByFirstOrder}
          isInTrial={trialStatus.isInTrial}
        />
      )}

      {/* Stats Grid - Admin sees widget views, regular users see 3-column grid */}
      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-soft p-8 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-600 mb-3">{t.dashboard.widgetViews}</p>
            <p className="text-5xl font-bold text-blue-600">{totalViews}</p>
            <p className="text-xs text-gray-500 mt-2">{t.dashboard.totalImpressions}</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-8 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-600 mb-3">{t.dashboard.totalBids}</p>
            <p className="text-5xl font-bold text-gray-900">{totalBids}</p>
            <p className="text-xs text-gray-500 mt-2">{formatConversionRate(viewToBidRate)} {t.dashboard.viewToBid}</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-8 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-600 mb-3">{t.dashboard.acceptedBids}</p>
            <p className="text-5xl font-bold text-green-600">{acceptedBids}</p>
            <p className="text-xs text-gray-500 mt-2">{formatConversionRate(conversionRate)} {t.dashboard.acceptanceRate}</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-8 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-600 mb-3">{t.dashboard.conversion}</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {totalViews > 0 ? formatConversionRate((acceptedBids / totalViews) * 100) : '0%'}
            </p>
            <p className="text-xs text-gray-500 mt-2">{t.dashboard.viewToSaleRate}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-soft p-12 flex flex-col items-center justify-center min-h-[250px]">
            <p className="text-lg font-medium text-gray-600 mb-4">{t.dashboard.acceptedBids}</p>
            <p className="text-6xl font-bold text-gray-900">{acceptedBids}</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-12 flex flex-col items-center justify-center min-h-[250px]">
            <p className="text-lg font-medium text-gray-600 mb-4">{t.dashboard.totalBids}</p>
            <p className="text-6xl font-bold text-gray-900">{totalBids}</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-12 flex flex-col items-center justify-center min-h-[250px]">
            <p className="text-lg font-medium text-gray-600 mb-4">{t.dashboard.revenue}</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-gray-500 mt-3">
              {formatConversionRate(conversionRate)} conversion rate
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
