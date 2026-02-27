'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/utils/calculations'

interface Shop {
  id: string
  shopName: string | null
  email: string
  planTier: string
  createdAt: string
}

interface ShopMetrics {
  totalViews: number
  totalBids: number
  acceptedBids: number
  declinedBids: number
  totalRevenue: number
  conversionRate: number
}

interface Totals {
  totalViews: number
  totalBids: number
  acceptedBids: number
  totalRevenue: number
  averageConversionRate: number
  totalShops: number
}

export function AdminAnalytics() {
  const [shops, setShops] = useState<Shop[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [selectedShopId, setSelectedShopId] = useState<string>('all')
  const [shopMetrics, setShopMetrics] = useState<ShopMetrics | null>(null)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch all shops and totals on mount
  useEffect(() => {
    fetchAllShops()
  }, [])

  // Fetch specific shop metrics when selection changes
  useEffect(() => {
    if (selectedShopId && selectedShopId !== 'all') {
      fetchShopMetrics(selectedShopId)
    } else {
      setShopMetrics(null)
      setSelectedShop(null)
    }
  }, [selectedShopId])

  const fetchAllShops = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()

      if (response.ok) {
        setShops(data.shops)
        setTotals(data.totals)
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchShopMetrics = async (shopId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?shopId=${shopId}`)
      const data = await response.json()

      if (response.ok) {
        setShopMetrics(data.metrics)
        setSelectedShop(data.shop)
      }
    } catch (error) {
      console.error('Error fetching shop metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatConversionRate = (rate: number) => {
    if (rate === 0) return '0%'
    const rounded = Math.round(rate * 10) / 10
    return rounded % 1 === 0 ? `${Math.round(rounded)}%` : `${rounded}%`
  }

  const getPlanBadgeColor = (planTier: string) => {
    return planTier === 'premium'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800'
  }

  const getPlanLabel = (planTier: string) => {
    return planTier === 'premium' ? 'Premium' : 'Pay-As-You-Go'
  }

  if (loading && !totals) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Shop Selector */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <label htmlFor="shop-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Shop
        </label>
        <select
          id="shop-select"
          value={selectedShopId}
          onChange={(e) => setSelectedShopId(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Shops (Overview)</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.shopName || shop.email} - {getPlanLabel(shop.planTier)}
            </option>
          ))}
        </select>
      </div>

      {/* Total Metrics Section (when "All Shops" selected) */}
      {selectedShopId === 'all' && totals && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Totals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {/* Total Shops */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-soft p-6 text-white">
              <p className="text-sm font-medium mb-2 opacity-90">Total Shops</p>
              <p className="text-4xl font-bold">{totals.totalShops}</p>
            </div>

            {/* Total Views */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-soft p-6 text-white">
              <p className="text-sm font-medium mb-2 opacity-90">Total Views</p>
              <p className="text-4xl font-bold">{totals.totalViews.toLocaleString()}</p>
            </div>

            {/* Total Bids */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-soft p-6 text-white">
              <p className="text-sm font-medium mb-2 opacity-90">Total Bids</p>
              <p className="text-4xl font-bold">{totals.totalBids.toLocaleString()}</p>
            </div>

            {/* Accepted Bids */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-soft p-6 text-white">
              <p className="text-sm font-medium mb-2 opacity-90">Accepted Bids</p>
              <p className="text-4xl font-bold">{totals.acceptedBids.toLocaleString()}</p>
            </div>

            {/* Average Conversion Rate */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-soft p-6 text-white">
              <p className="text-sm font-medium mb-2 opacity-90">Avg Conversion</p>
              <p className="text-4xl font-bold">{formatConversionRate(totals.averageConversionRate)}</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-soft p-6 text-white">
              <p className="text-sm font-medium mb-2 opacity-90">Total Revenue</p>
              <p className="text-4xl font-bold">{formatCurrency(totals.totalRevenue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Shop Metrics */}
      {selectedShopId !== 'all' && shopMetrics && selectedShop && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedShop.shopName || selectedShop.email}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadgeColor(selectedShop.planTier)}`}>
              {getPlanLabel(selectedShop.planTier)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Widget Views */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Widget Views</p>
              <p className="text-4xl font-bold text-blue-600">{shopMetrics.totalViews.toLocaleString()}</p>
            </div>

            {/* Total Bids */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Bids</p>
              <p className="text-4xl font-bold text-gray-900">{shopMetrics.totalBids.toLocaleString()}</p>
            </div>

            {/* Accepted Bids */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Accepted Bids</p>
              <p className="text-4xl font-bold text-green-600">{shopMetrics.acceptedBids.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatConversionRate(shopMetrics.conversionRate)} conversion rate
              </p>
            </div>

            {/* Declined Bids */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Declined Bids</p>
              <p className="text-4xl font-bold text-red-600">{shopMetrics.declinedBids.toLocaleString()}</p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</p>
              <p className="text-4xl font-bold text-purple-600">
                {formatConversionRate(shopMetrics.conversionRate)}
              </p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
              <p className="text-4xl font-bold text-emerald-600">
                {formatCurrency(shopMetrics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
