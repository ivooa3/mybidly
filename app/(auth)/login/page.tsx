'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/components/LoginForm'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getTranslation, type Language } from '@/lib/translations'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
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
            {t.auth.loginTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.auth.loginSubtitle}
          </p>
          {registered && (
            <p className="mt-2 text-sm text-green-600">
              {lang === 'de'
                ? 'Registrierung erfolgreich! Bitte melden Sie sich an.'
                : 'Registration successful! Please sign in.'}
            </p>
          )}
        </div>

        <LoginForm lang={lang} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t.auth.noAccount}{' '}
            <Link href="/register" className="text-purple-600 hover:underline font-semibold">
              {t.auth.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
