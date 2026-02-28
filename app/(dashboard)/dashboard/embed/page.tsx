import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator'
import Link from 'next/link'

export default async function EmbedPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Fetch shop data to check if shopUrl exists
  const shop = await prisma.shop.findUnique({
    where: { id: session.user.shopId },
    select: {
      shopUrl: true
    }
  })

  const hasShopUrl = shop?.shopUrl && shop.shopUrl.trim() !== ''

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Widget Embed Code</h1>
        <p className="text-gray-600 mt-2">
          Copy and paste this code into your post-purchase page
        </p>
      </div>

      {!hasShopUrl ? (
        <div className="max-w-2xl">
          {/* Warning Banner */}
          <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-900 mb-2">
                  Shop URL Required
                </h3>
                <p className="text-orange-800 mb-4">
                  Before you can generate your unique embed code, you need to add your shop URL in your profile settings.
                  This ensures your widget is properly configured for your store.
                </p>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Go to Profile Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3">What you need to do:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Go to your Profile Settings</li>
              <li>Fill in the "Shop URL" field (e.g., myshop.com or https://myshop.com)</li>
              <li>Save your profile</li>
              <li>Return to this page to get your embed code</li>
            </ol>
          </div>
        </div>
      ) : (
        <EmbedCodeGenerator shopId={session.user.shopId} />
      )}
    </div>
  )
}
