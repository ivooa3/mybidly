'use client'

import { useState, useEffect } from 'react'
import { RegisterForm } from '@/components/RegisterForm'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getTranslation, type Language } from '@/lib/translations'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get('plan')
  const [lang, setLang] = useState<Language>('en')
  const t = getTranslation(lang)

  // Detect language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') as Language | null
    if (savedLang && (savedLang === 'en' || savedLang === 'de')) {
      setLang(savedLang)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            myBidly
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            {t.auth.createAccount}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.auth.registerSubtitle}
          </p>

          {/* Display selected plan */}
          {selectedPlan === 'premium' && (
            <div className="mt-4 inline-block bg-purple-100 border border-purple-300 text-purple-800 px-4 py-2 rounded-lg text-sm font-semibold">
              🎯 {t.auth.selectedPlan} <strong>{t.auth.premiumPlan}</strong>
            </div>
          )}
        </div>

        <RegisterForm selectedPlan={selectedPlan} lang={lang} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t.auth.alreadyHaveAccount}{' '}
            <Link href="/login" className="text-purple-600 hover:underline font-semibold">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
