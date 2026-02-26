import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 400)
    }

    if (newPassword.length < 8) {
      return errorResponse('New password must be at least 8 characters', 400)
    }

    // Get current user with password hash
    const shop = await prisma.shop.findUnique({
      where: { id: session.user.shopId },
      select: { passwordHash: true }
    })

    if (!shop) {
      return errorResponse('Shop not found', 404)
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, shop.passwordHash)

    if (!isValidPassword) {
      return errorResponse('Current password is incorrect', 401)
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.shop.update({
      where: { id: session.user.shopId },
      data: { passwordHash: newPasswordHash }
    })

    return successResponse({
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Password change error:', error)
    return errorResponse('Failed to change password', 500)
  }
}
