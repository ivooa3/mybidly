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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const user = await prisma.shop.findUnique({
      where: { id: params.id },
      select: {
        role: true,
        email: true,
        shopName: true,
        stripeAccountId: true,
        _count: {
          select: {
            bids: true,
            offers: true,
            widgetViews: true
          }
        }
      }
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return errorResponse('Cannot delete admin users', 403)
    }

    console.log(`[DELETE USER] Attempting to delete user ${params.id} (${user.shopName || user.email})`)
    console.log(`[DELETE USER] Related records: ${user._count.bids} bids, ${user._count.offers} offers, ${user._count.widgetViews} widget views`)
    console.log(`[DELETE USER] Stripe account: ${user.stripeAccountId || 'none'}`)

    // Optional: Clean up Stripe account if exists
    // Note: We don't delete the Stripe account, just disconnect it
    // The shop owner can still access their Stripe account independently
    if (user.stripeAccountId) {
      console.log(`[DELETE USER] User has Stripe account ${user.stripeAccountId} - this will remain active`)
      // In production, you might want to send a notification to the shop owner
      // or mark the account for manual review
    }

    // Delete the user using a transaction to ensure atomicity
    // The CASCADE constraints will automatically delete:
    // - All bids (and their associated data)
    // - All offers (and their associated data)
    // - All widget views
    await prisma.$transaction(async (tx) => {
      // First, verify the user still exists (race condition protection)
      const userExists = await tx.shop.findUnique({
        where: { id: params.id },
        select: { id: true }
      })

      if (!userExists) {
        throw new Error('User was deleted by another request')
      }

      // Delete the user (cascading deletes will handle related records)
      await tx.shop.delete({
        where: { id: params.id }
      })
    })

    console.log(`[DELETE USER] Successfully deleted user ${params.id}`)

    return successResponse({
      message: `User ${user.shopName || user.email} has been deleted successfully`,
      deletedRecords: {
        bids: user._count.bids,
        offers: user._count.offers,
        widgetViews: user._count.widgetViews
      }
    })
  } catch (error) {
    console.error('[DELETE USER ERROR] Full error:', error)
    console.error('[DELETE USER ERROR] Error name:', (error as Error)?.name)
    console.error('[DELETE USER ERROR] Error message:', (error as Error)?.message)

    // Check for common Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any }
      console.error('[DELETE USER ERROR] Prisma error code:', prismaError.code)
      console.error('[DELETE USER ERROR] Prisma error meta:', prismaError.meta)
    }

    // Provide more specific error message
    const errorMessage = (error as Error)?.message || 'Unknown error occurred'
    return errorResponse(`Failed to delete user: ${errorMessage}`, 500)
  }
}
