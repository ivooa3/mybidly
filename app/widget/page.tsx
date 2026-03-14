'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BidWidget } from '@/components/BidWidget'

export const dynamic = 'force-dynamic'

export default function WidgetPage() {
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const productId = searchParams.get('productId')
  const customTitle = searchParams.get('title') || undefined
  const customSubtitle = searchParams.get('subtitle') || undefined
  const [viewTracked, setViewTracked] = useState(false)

  // Auto-detect locale from browser or use URL parameter
  const [locale, setLocale] = useState<string>('en')
  const [shopPreferredLanguage, setShopPreferredLanguage] = useState<string | null>(null)

  // Fetch shop's preferred language from API
  useEffect(() => {
    if (!shopId) return

    const fetchShopLanguage = async () => {
      try {
        const response = await fetch(`/api/widget/offers?shopId=${shopId}`)
        const result = await response.json()

        if (result.success && result.data.metadata?.language) {
          setShopPreferredLanguage(result.data.metadata.language)
        }
      } catch (err) {
        // Silent fail - don't break widget if language fetch fails
        console.warn('Failed to fetch shop language preference:', err)
      }
    }

    fetchShopLanguage()
  }, [shopId])

  useEffect(() => {
    // Priority order for language selection:
    // 1. URL parameter (highest priority - manual override)
    const urlLocale = searchParams.get('locale')
    if (urlLocale && (urlLocale === 'en' || urlLocale === 'de')) {
      setLocale(urlLocale)
      return
    }

    // 2. LocalStorage (customer's manual preference from language switcher)
    const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('bidly_locale') : null
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'de')) {
      setLocale(savedLocale)
      return
    }

    // 3. Shop owner's preferred language (from their account settings)
    if (shopPreferredLanguage) {
      setLocale(shopPreferredLanguage)
      return
    }

    // 4. Browser auto-detection (fallback)
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('de')) {
      setLocale('de')
    } else {
      setLocale('en')
    }
  }, [searchParams, shopPreferredLanguage])

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

  // Handle language change from customer's manual selection
  const handleLocaleChange = (newLocale: 'en' | 'de') => {
    setLocale(newLocale)
    // Save to localStorage so it persists across sessions
    localStorage.setItem('bidly_locale', newLocale)
  }

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
        onLocaleChange={handleLocaleChange}
      />
    </div>
  )
}
