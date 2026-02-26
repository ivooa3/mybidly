'use client'

import { ProfileForm } from '@/components/ProfileForm'
import { useLanguage } from '@/contexts/LanguageContext'

interface BusinessAddress {
  street?: string
  city?: string
  postalCode?: string
  country?: string
}

interface Shop {
  id: string
  email: string
  shopName: string | null
  firstName: string | null
  lastName: string | null
  shopUrl: string | null
  orderEmail: string | null
  businessAddress: BusinessAddress | null
  vatNumber: string | null
  stripeAccountId: string | null
  stripeOnboardingComplete: boolean
  platformFeePercentage: number
}

interface ProfileContentProps {
  shop: Shop
}

export function ProfileContent({ shop }: ProfileContentProps) {
  const { t } = useLanguage()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.profile.title}</h1>
        <p className="text-gray-600 mt-2">
          {t.profile.subtitle}
        </p>
      </div>

      <ProfileForm shop={shop} />
    </div>
  )
}
