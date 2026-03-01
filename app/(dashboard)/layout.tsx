import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { isAdmin } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Language } from '@/lib/translations'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Check for impersonation cookies
  const cookieStore = await cookies()
  const impersonatingAs = cookieStore.get('impersonating_as')?.value
  const impersonatingFrom = cookieStore.get('impersonating_from')?.value

  // Determine the actual user ID to use
  const actualUserId = impersonatingAs || session.user.shopId

  // Check if user is active and has completed setup
  const user = await prisma.shop.findUnique({
    where: { id: actualUserId },
    select: { isActive: true, shopName: true, shopUrl: true, preferredLanguage: true, planTier: true }
  })

  if (!user?.isActive && !impersonatingFrom) {
    // Deactivated users cannot access dashboard (unless admin is impersonating)
    redirect('/login?error=account_deactivated')
  }

  // Redirect to setup if user hasn't completed profile (unless admin is impersonating)
  if (!user?.shopName && !impersonatingFrom) {
    redirect('/setup')
  }

  const userIsAdmin = await isAdmin()

  // Build modified session user object
  const displayUser = impersonatingAs ? {
    ...session.user,
    shopId: actualUserId,
    shopName: user.shopName,
    impersonatingFrom: impersonatingFrom
  } : session.user

  const userLanguage = (user?.preferredLanguage || 'en') as Language
  const planTier = (user?.planTier || 'payg') as 'payg' | 'premium'

  return (
    <LanguageProvider initialLanguage={userLanguage}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar user={displayUser} isAdmin={userIsAdmin} planTier={planTier} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </LanguageProvider>
  )
}
