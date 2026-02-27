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

    const body = await request.json()
    const { email, shopUrl, role, planTier, isActive } = body

    // Validate inputs
    if (email && typeof email !== 'string') {
      return errorResponse('Invalid email')
    }

    if (shopUrl !== undefined && typeof shopUrl !== 'string') {
      return errorResponse('Invalid shop URL')
    }

    if (role && !['shop_owner', 'admin'].includes(role)) {
      return errorResponse('Invalid role')
    }

    if (planTier && !['free', 'payg', 'premium'].includes(planTier)) {
      return errorResponse('Invalid plan tier')
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return errorResponse('Invalid isActive value')
    }

    const user = await prisma.shop.findUnique({
      where: { id: params.id },
      select: { role: true }
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Build update data
    const updateData: any = {}

    if (email !== undefined) updateData.email = email
    if (shopUrl !== undefined) updateData.shopUrl = shopUrl
    if (role !== undefined) updateData.role = role
    if (planTier !== undefined) updateData.planTier = planTier
    if (isActive !== undefined) {
      updateData.isActive = isActive
      updateData.deactivatedAt = isActive ? null : new Date()
    }

    const updatedUser = await prisma.shop.update({
      where: { id: params.id },
      data: updateData
    })

    return successResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      shopUrl: updatedUser.shopUrl,
      role: updatedUser.role,
      planTier: updatedUser.planTier,
      isActive: updatedUser.isActive
    })
  } catch (error) {
    console.error('Update user error:', error)
    return errorResponse('Failed to update user', 500)
  }
}
