'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { formatCurrency } from '@/utils/calculations'
import { MissedOpportunityStats } from '@/lib/missed-opportunities'

interface DashboardContentProps {
  shopName: string
  isAdmin: boolean
  stats: {
    totalBids: number
    acceptedBids: number
    totalViews: number
    totalRevenue: number
    conversionRate: number
    viewToBidRate: number
    missedOpportunities: MissedOpportunityStats
    bidLimitStatus: {
      acceptedBids: number
      limit: number
      hasReachedLimit: boolean
      remaining: number
    }
  }
}

export function DashboardContent({ shopName, isAdmin, stats }: DashboardContentProps) {
  const { t } = useLanguage()

  const {
    totalBids,
    acceptedBids,
    totalViews,
    totalRevenue,
    conversionRate,
    viewToBidRate,
    missedOpportunities,
    bidLimitStatus
  } = stats

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

      {/* Upgrade Banner - Show when limit reached */}
      {bidLimitStatus.hasReachedLimit && (
        <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg shadow-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🚨</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-900 mb-2">
                Free Tier Limit Reached
              </h3>
              <p className="text-orange-800 mb-4">
                You've used {bidLimitStatus.acceptedBids}/{bidLimitStatus.limit} free bids this month.
                {missedOpportunities.missedViewsToday > 0 && (
                  <span className="block mt-2 font-semibold">
                    💸 {missedOpportunities.missedViewsToday} customers tried to buy today but couldn't!
                    <span className="text-red-600 ml-2">
                      (~€{missedOpportunities.estimatedLostRevenueToday.toFixed(0)} lost revenue)
                    </span>
                  </span>
                )}
              </p>
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                onClick={() => alert('Upgrade flow coming soon!')}
              >
                Upgrade to Pro (€14/month) →
              </button>
            </div>
          </div>
        </div>
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
        <>
          {/* Top 3 boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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

          {/* Bottom 2 boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Total Revenue Box */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-soft p-12 flex flex-col items-center justify-center min-h-[200px]">
              <p className="text-lg font-medium text-green-800 mb-4">Total Revenue</p>
              <p className="text-5xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-sm text-green-700 mt-3">
                from {acceptedBids} accepted bids
              </p>
            </div>

            {/* Missed Opportunities Box */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg shadow-soft p-12 flex flex-col items-center justify-center min-h-[200px] relative group">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-lg font-medium text-orange-800">Missed Opportunities</p>
                <div className="relative">
                  <span className="text-gray-400 hover:text-gray-600 cursor-help text-xl">ℹ️</span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-64">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-1">What are missed opportunities?</p>
                      <p>Number of customers who viewed your widget but couldn't place bids because you've reached your free tier limit.</p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-8 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-6xl font-bold text-orange-600">
                {missedOpportunities.missedViewsThisMonth}
              </p>
              <p className="text-sm text-orange-700 mt-3">
                ~€{missedOpportunities.estimatedLostRevenueThisMonth.toFixed(0)} potential revenue lost
              </p>
              {missedOpportunities.missedViewsToday > 0 && (
                <p className="text-xs text-red-600 mt-2 font-semibold">
                  {missedOpportunities.missedViewsToday} missed today!
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
