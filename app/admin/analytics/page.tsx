import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-middleware'
import { AdminAnalytics } from '@/components/admin/AdminAnalytics'

export default async function AdminAnalyticsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const userIsAdmin = await isAdmin()

  if (!userIsAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Overview of all shop performance metrics
        </p>
      </div>

      <AdminAnalytics />
    </div>
  )
}
