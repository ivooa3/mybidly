'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
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
  const [language, setLanguageState] = useState<Language>(initialLanguage)
  const t = getTranslation(language)

  const setLanguage = async (lang: Language) => {
    try {
      await fetch('/api/profile/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      })
      // Update state immediately for better UX
      setLanguageState(lang)
      // Reload page to ensure all server components are re-rendered
      window.location.reload()
    } catch (error) {
      console.error('Failed to update language:', error)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
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
