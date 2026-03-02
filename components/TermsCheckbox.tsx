'use client'

import Link from 'next/link'

interface TermsCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  lang?: 'en' | 'de'
}

const translations = {
  en: {
    text: 'I agree to the',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    required: 'You must accept the terms to continue'
  },
  de: {
    text: 'Ich stimme den',
    terms: 'Allgemeinen Geschäftsbedingungen',
    and: 'und der',
    privacy: 'Datenschutzerklärung',
    required: 'Sie müssen den Bedingungen zustimmen, um fortzufahren'
  }
}

export function TermsCheckbox({ checked, onChange, error, lang = 'en' }: TermsCheckboxProps) {
  const t = translations[lang]

  return (
    <div>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={`w-4 h-4 border rounded focus:ring-2 focus:ring-purple-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms-checkbox" className="text-gray-700">
            {t.text}{' '}
            <Link
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline font-medium"
            >
              {t.terms}
            </Link>{' '}
            {t.and}{' '}
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline font-medium"
            >
              {t.privacy}
            </Link>
          </label>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
