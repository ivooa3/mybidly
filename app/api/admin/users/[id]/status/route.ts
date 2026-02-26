import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'

const successResponse = (data: any) => Response.json({ success: true, data })
const errorResponse = (error: string, status = 400) => Response.json({ success: false, error }, { status })

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { isActive } = await request.json()

    if (typeof isActive !== 'boolean') {
      return errorResponse('isActive must be a boolean')
    }

    const user = await prisma.shop.findUnique({
      where: { id: params.id },
      select: { role: true }
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    if (user.role === 'admin') {
      return errorResponse('Cannot modify admin accounts', 403)
    }

    const updatedUser = await prisma.shop.update({
      where: { id: params.id },
      data: {
        isActive,
        deactivatedAt: isActive ? null : new Date()
      }
    })

    return successResponse({
      id: updatedUser.id,
      isActive: updatedUser.isActive
    })
  } catch (error) {
    console.error('Toggle user status error:', error)
    return errorResponse('Failed to update user status', 500)
  }
}
