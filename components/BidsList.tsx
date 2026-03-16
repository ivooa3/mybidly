'use client'

import { useState } from 'react'
import { formatCurrency } from '@/utils/calculations'
import { format } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'

interface Bid {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: any
  deliveryNotes: string | null
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

interface BidsListProps {
  bids: Bid[]
}

export function BidsList({ bids: initialBids }: BidsListProps) {
  const { t } = useLanguage()
  const [bids, setBids] = useState(initialBids)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all')
  const [processingBidId, setProcessingBidId] = useState<string | null>(null)
  const [expandedShippingIds, setExpandedShippingIds] = useState<Set<string>>(new Set())

  const toggleShippingDetails = (bidId: string) => {
    setExpandedShippingIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bidId)) {
        newSet.delete(bidId)
      } else {
        newSet.add(bidId)
      }
      return newSet
    })
  }

  const filteredBids = filter === 'all'
    ? bids
    : bids.filter(bid => bid.status === filter)

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    }

    const labels = {
      pending: t.bids.pending,
      accepted: t.bids.accepted,
      declined: t.bids.declined
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getStatusCount = (status: string) => {
    return bids.filter(bid => bid.status === status).length
  }

  const getTimeRemaining = (createdAt: Date, bidAmount: number, minSellingPrice: number) => {
    if (bidAmount >= minSellingPrice) return null // Not applicable for bids above min selling price

    const twoHours = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    const bidTime = new Date(createdAt).getTime()
    const now = Date.now()
    const elapsed = now - bidTime
    const remaining = twoHours - elapsed

    if (remaining <= 0) return { expired: true, minutes: 0 }

    const minutes = Math.floor(remaining / (60 * 1000))
    return { expired: false, minutes }
  }

  const handleBidAction = async (bidId: string, action: 'accept' | 'decline') => {
    if (processingBidId) return // Prevent multiple simultaneous actions

    const confirmMessage = action === 'accept'
      ? 'Are you sure you want to accept this bid? Payment will be captured immediately.'
      : 'Are you sure you want to decline this bid? The payment authorization will be released.'

    if (!confirm(confirmMessage)) return

    setProcessingBidId(bidId)

    try {
      const response = await fetch(`/api/bids/${bidId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const result = await response.json()

      if (result.success) {
        // Update the bid in local state
        setBids(prevBids =>
          prevBids.map(bid =>
            bid.id === bidId
              ? { ...bid, status: action === 'accept' ? 'accepted' : 'declined' }
              : bid
          )
        )
        alert(`Bid ${action === 'accept' ? 'accepted' : 'declined'} successfully!`)
      } else {
        alert(`Failed to ${action} bid: ${result.error}`)
      }
    } catch (error) {
      console.error(`Bid ${action} error:`, error)
      alert(`An error occurred while ${action}ing the bid. Please try again.`)
    } finally {
      setProcessingBidId(null)
    }
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-soft mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.bids.allBids} ({bids.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.bids.pendingBids} ({getStatusCount('pending')})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              filter === 'accepted'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.bids.acceptedBids} ({getStatusCount('accepted')})
          </button>
          <button
            onClick={() => setFilter('declined')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              filter === 'declined'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.bids.declinedBids} ({getStatusCount('declined')})
          </button>
        </div>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <p className="text-gray-600">{t.bids.noBids}</p>
          </div>
        ) : (
          filteredBids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <img
                    src={bid.offer.imageUrl}
                    alt={bid.offer.productName}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* Bid Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {bid.offer.productName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1" suppressHydrationWarning>
                          {format(new Date(bid.createdAt), 'PPpp')}
                        </p>
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t.bids.customerName}</p>
                        <p className="font-medium text-gray-900">{bid.customerName}</p>
                        <p className="text-sm text-gray-600">{bid.customerEmail}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">{bid.isFixPrice ? t.bids.fixPrice : t.bids.bidAmount}</p>
                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          {formatCurrency(bid.bidAmount)}
                        </p>
                        {!bid.isFixPrice && (
                          <p className="text-xs text-gray-500 mt-1">
                            {t.offers.minPrice}: {formatCurrency(bid.offer.minSellingPrice)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Details Toggle */}
                    <div className="mt-4">
                      <button
                        onClick={() => toggleShippingDetails(bid.id)}
                        className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedShippingIds.has(bid.id) ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>{expandedShippingIds.has(bid.id) ? 'Hide' : 'View'} Shipping Details</span>
                      </button>

                      {expandedShippingIds.has(bid.id) && (
                        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3">
                            {/* Customer Contact */}
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Customer Contact</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-500">📧</span>
                                  <a href={`mailto:${bid.customerEmail}`} className="text-purple-600 hover:underline">
                                    {bid.customerEmail}
                                  </a>
                                </div>
                                {bid.customerPhone && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-500">📱</span>
                                    <a href={`tel:${bid.customerPhone}`} className="text-purple-600 hover:underline">
                                      {bid.customerPhone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Shipping Address */}
                            {bid.shippingAddress && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">Shipping Address</p>
                                <div className="text-sm text-gray-900">
                                  {bid.shippingAddress.line1}<br />
                                  {bid.shippingAddress.line2 && <>{bid.shippingAddress.line2}<br /></>}
                                  {bid.shippingAddress.postalCode} {bid.shippingAddress.city}<br />
                                  {bid.shippingAddress.country}
                                </div>
                              </div>
                            )}

                            {/* Delivery Notes */}
                            {bid.deliveryNotes && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">Delivery Instructions</p>
                                <div className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                                  📝 {bid.deliveryNotes}
                                </div>
                              </div>
                            )}

                            {/* No Shipping Info Message */}
                            {!bid.shippingAddress && !bid.customerPhone && (
                              <div className="text-sm text-gray-500 italic">
                                Shipping information will be collected from payment wallet
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Platform Fee Breakdown (only for accepted bids) */}
                    {bid.status === 'accepted' && bid.platformFeeAmount !== null && bid.shopOwnerAmount !== null && (
                      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Payment Breakdown</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(bid.bidAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Platform Fee:</span>
                            <span className="font-medium text-gray-900">-{formatCurrency(bid.platformFeeAmount)}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-300 flex justify-between">
                            <span className="font-semibold text-gray-900">You Receive:</span>
                            <span className="font-bold text-green-600">{formatCurrency(bid.shopOwnerAmount)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bid Status Info */}
                    {bid.status === 'accepted' && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          ✓ This bid was accepted and payment has been captured.
                        </p>
                      </div>
                    )}

                    {bid.status === 'declined' && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          ✗ This bid was declined and payment authorization has been released.
                        </p>
                      </div>
                    )}

                    {bid.status === 'pending' && (() => {
                      const timeRemaining = getTimeRemaining(bid.createdAt, bid.bidAmount, bid.offer.minSellingPrice)
                      const isLowBid = timeRemaining !== null

                      return (
                        <div className="mt-4 space-y-3">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              ⏳ This bid is pending review. Payment authorization is on hold.
                            </p>
                          </div>

                          {/* Low Bid Warning */}
                          {isLowBid && timeRemaining && (
                            <div className={`border rounded-lg p-3 ${
                              timeRemaining.expired
                                ? 'bg-red-50 border-red-300'
                                : timeRemaining.minutes < 30
                                ? 'bg-orange-50 border-orange-300'
                                : 'bg-blue-50 border-blue-300'
                            }`}>
                              <div className="flex items-start gap-2">
                                <span className="text-lg">
                                  {timeRemaining.expired ? '⚠️' : timeRemaining.minutes < 30 ? '⏰' : 'ℹ️'}
                                </span>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    timeRemaining.expired
                                      ? 'text-red-900'
                                      : timeRemaining.minutes < 30
                                      ? 'text-orange-900'
                                      : 'text-blue-900'
                                  }`}>
                                    {timeRemaining.expired
                                      ? 'Auto-decline deadline passed - will be declined in next cron run'
                                      : `Low bid: Auto-declines in ${timeRemaining.minutes} minutes`
                                    }
                                  </p>
                                  <p className={`text-xs mt-1 ${
                                    timeRemaining.expired
                                      ? 'text-red-700'
                                      : timeRemaining.minutes < 30
                                      ? 'text-orange-700'
                                      : 'text-blue-700'
                                  }`}>
                                    This bid is below the minimum selling price ({formatCurrency(bid.offer.minSellingPrice)}).
                                    {!timeRemaining.expired && ' Accept now to override auto-decline.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleBidAction(bid.id, 'accept')}
                            disabled={processingBidId === bid.id}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingBidId === bid.id ? 'Processing...' : '✓ Accept Bid'}
                          </button>

                          <button
                            onClick={() => handleBidAction(bid.id, 'decline')}
                            disabled={processingBidId === bid.id}
                            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingBidId === bid.id ? 'Processing...' : '✗ Decline Bid'}
                          </button>
                        </div>
                      </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
