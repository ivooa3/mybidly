import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'

const errorResponse = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status })

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if current user is admin
    const adminUser = await prisma.shop.findUnique({
      where: { id: session.user.shopId },
      select: { role: true, isActive: true }
    })

    if (!adminUser || adminUser.role !== 'admin') {
      return errorResponse('Forbidden - Admin access required', 403)
    }

    // Find the user to impersonate
    const targetUser = await prisma.shop.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        shopName: true,
        email: true,
        role: true,
        isActive: true
      }
    })

    if (!targetUser) {
      return errorResponse('User not found', 404)
    }

    if (targetUser.role === 'admin') {
      return errorResponse('Cannot impersonate admin users', 403)
    }

    if (!targetUser.isActive) {
      return errorResponse('Cannot impersonate inactive users', 403)
    }

    // Store impersonation in cookies
    const cookieStore = await cookies()

    // Store the original admin user ID
    cookieStore.set('impersonating_as', targetUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    cookieStore.set('impersonating_from', session.user.shopId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUser.id,
        userName: targetUser.shopName
      }
    })
  } catch (error) {
    console.error('Impersonation error:', error)
    return errorResponse('Failed to impersonate user', 500)
  }
}
