import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-middleware'
import { AdminAnalytics } from '@/components/admin/AdminAnalytics'
import Link from 'next/link'

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
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to User Management</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Overview of all shop performance metrics
        </p>
      </div>

      <AdminAnalytics />
    </div>
  )
}
