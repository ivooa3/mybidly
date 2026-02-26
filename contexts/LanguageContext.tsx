'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Language, getTranslation } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  t: ReturnType<typeof getTranslation>
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode
  initialLanguage: Language
}) {
  const t = getTranslation(initialLanguage)

  const setLanguage = async (lang: Language) => {
    try {
      await fetch('/api/profile/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      })
      // Reload page to apply new language
      window.location.reload()
    } catch (error) {
      console.error('Failed to update language:', error)
    }
  }

  return (
    <LanguageContext.Provider value={{ language: initialLanguage, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
