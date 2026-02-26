import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { language } = body

    if (!language || !['en', 'de'].includes(language)) {
      return Response.json({ success: false, error: 'Invalid language' }, { status: 400 })
    }

    await prisma.shop.update({
      where: { id: session.user.shopId },
      data: { preferredLanguage: language },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Update language error:', error)
    return Response.json({ success: false, error: 'Failed to update language' }, { status: 500 })
  }
}
