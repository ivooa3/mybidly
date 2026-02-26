'use client'

import { UsersList } from '@/components/admin/UsersList'
import { useLanguage } from '@/contexts/LanguageContext'

interface User {
  id: string
  email: string
  shopName: string
  shopUrl: string | null
  firstName: string | null
  lastName: string | null
  role: string
  isActive: boolean
  planTier: string
  stripeOnboardingComplete: boolean
  createdAt: string
  acceptedBids: number
  revenue: number
}

interface AdminUsersContentProps {
  users: User[]
}

export function AdminUsersContent({ users }: AdminUsersContentProps) {
  const { t } = useLanguage()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.admin.title}</h1>
        <p className="text-gray-600 mt-2">
          {t.admin.title}
        </p>
      </div>

      <UsersList users={users} />
    </div>
  )
}
