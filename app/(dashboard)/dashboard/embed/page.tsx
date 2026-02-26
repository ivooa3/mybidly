import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator'

export default async function EmbedPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Widget Embed Code</h1>
        <p className="text-gray-600 mt-2">
          Copy and paste this code into your post-purchase page
        </p>
      </div>

      <EmbedCodeGenerator shopId={session.user.shopId} />
    </div>
  )
}
