'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { clsx } from 'clsx'
import { useLanguage } from '@/contexts/LanguageContext'

interface SidebarProps {
  user: {
    shopName: string
    email: string
    impersonatingFrom?: string
  }
  isAdmin: boolean
  planTier: 'free' | 'payg' | 'premium'
}

export function Sidebar({ user, isAdmin, planTier }: SidebarProps) {
  const pathname = usePathname()
  const { language, t, setLanguage } = useLanguage()

  const navItems = [
    { label: t.sidebar.dashboard, href: '/dashboard' },
    { label: t.sidebar.offers, href: '/dashboard/offers' },
    { label: t.sidebar.bids, href: '/dashboard/bids' },
    { label: t.sidebar.embedCode, href: '/dashboard/embed' },
    { label: t.sidebar.profile, href: '/dashboard/profile' },
  ]

  const adminNavItems = [
    { label: t.sidebar.adminUsers, href: '/admin/users' },
    { label: t.sidebar.adminAnalytics, href: '/admin/analytics' },
  ]

  const handleExitImpersonation = async () => {
    // Call API to clear impersonation cookies
    await fetch('/api/admin/exit-impersonation', { method: 'POST' })
    window.location.href = '/admin/users'
  }

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          myBidly
        </h1>
      </div>

      {/* Impersonation Banner */}
      {user.impersonatingFrom && (
        <div className="bg-orange-500 text-white p-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{t.sidebar.impersonating}</p>
              <p className="text-xs opacity-90">{user.shopName}</p>
            </div>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="mt-2 w-full bg-white text-orange-600 px-3 py-1 rounded text-xs font-medium hover:bg-orange-50 transition-colors"
          >
            {t.sidebar.exitImpersonation}
          </button>
        </div>
      )}

      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <p className="font-semibold text-gray-900">{user.shopName}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block px-4 py-2 rounded-lg font-medium transition-colors',
                isActive
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {item.label}
            </Link>
          )
        })}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">
                {t.sidebar.admin}
              </p>
            </div>
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'block px-4 py-2 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Plan Tier, Language Switcher & Logout */}
      <div className="p-4 border-t border-gray-200">
        {/* Plan Tier Display - Only show for non-admin users */}
        {!isAdmin && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
              {t.dashboard.currentPlan}
            </p>
            <div className={clsx(
              'px-3 py-2 rounded-lg text-sm font-medium text-center',
              planTier === 'premium'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : planTier === 'payg'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'bg-gradient-to-r from-gray-600 to-gray-500 text-white'
            )}>
              {planTier === 'premium' ? t.dashboard.premium : planTier === 'payg' ? t.dashboard.payAsYouGo : 'Free'}
              <p className="text-xs opacity-90 mt-1">
                {planTier === 'premium' ? t.dashboard.planPremium : planTier === 'payg' ? t.dashboard.planPayg : 'Limited features'}
              </p>
              {planTier !== 'premium' && (
                <a
                  href="https://buy.stripe.com/test_fZu14g7055PaaRZ0Pl7EQ00"
                  onClick={(e) => {
                    // Check environment on click
                    const isProduction = window.location.hostname === 'mybidly.io'
                    if (isProduction) {
                      e.preventDefault()
                      window.location.href = 'mailto:support@next-commerce.io?subject=Upgrade to Premium'
                    }
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-xs underline hover:opacity-80 transition-opacity"
                >
                  {t.dashboard.upgradeToPremium}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Language Switcher */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
            Language / Sprache
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={clsx(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                language === 'en'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('de')}
              className={clsx(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                language === 'de'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              DE
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {t.sidebar.signOut}
        </button>

        {/* Powered by Next Commerce */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {t.sidebar.poweredBy}{' '}
            <a
              href="https://www.next-commerce.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Next Commerce
            </a>
          </p>
        </div>
      </div>
    </aside>
  )
}
