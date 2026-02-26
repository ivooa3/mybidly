import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    // Delete shop (cascade will delete all related offers and bids)
    await prisma.shop.delete({
      where: { id: session.user.shopId }
    })

    return successResponse({
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return errorResponse('Failed to delete account', 500)
  }
}
