'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BidWidget } from '@/components/BidWidget'

export const dynamic = 'force-dynamic'

export default function WidgetPage() {
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const productId = searchParams.get('productId')
  const locale = searchParams.get('locale') || 'en'
  const customTitle = searchParams.get('title') || undefined
  const customSubtitle = searchParams.get('subtitle') || undefined
  const [viewTracked, setViewTracked] = useState(false)

  // Track widget view when component mounts
  useEffect(() => {
    if (!shopId || viewTracked) return

    // Generate or retrieve visitor ID (simple session-based)
    let visitorId = sessionStorage.getItem('bidly_visitor_id')
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('bidly_visitor_id', visitorId)
    }

    // Track the view
    fetch('/api/widget/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId,
        productId: productId || null,
        visitorId,
        offerId: null // Will be set later when offer is fetched
      })
    }).catch(err => {
      // Silent fail - don't break the widget if tracking fails
      console.warn('Widget view tracking failed:', err)
    })

    setViewTracked(true)
  }, [shopId, productId, viewTracked])

  if (!shopId) {
    return (
      <div className="p-4 text-center text-red-600">
        Error: Shop ID is required
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      <BidWidget
        shopId={shopId}
        locale={locale as 'en' | 'de'}
        customTitle={customTitle}
        customSubtitle={customSubtitle}
      />
    </div>
  )
}
