import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  email: z.string().email('Invalid email address'),
  shopName: z.string().min(1, 'Shop name is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  shopUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  orderEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  businessAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  vatNumber: z.string().optional()
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Validate input
    const validation = profileUpdateSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400)
    }

    const data = validation.data

    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingShop = await prisma.shop.findUnique({
        where: { email: data.email }
      })

      if (existingShop && existingShop.id !== session.user.shopId) {
        return errorResponse('Email address is already in use', 409)
      }
    }

    // Update shop profile
    const updatedShop = await prisma.shop.update({
      where: { id: session.user.shopId },
      data: {
        email: data.email,
        shopName: data.shopName,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        shopUrl: data.shopUrl || null,
        orderEmail: data.orderEmail || null,
        businessAddress: data.businessAddress || null,
        vatNumber: data.vatNumber || null
      }
    })

    return successResponse({
      message: 'Profile updated successfully',
      shop: {
        id: updatedShop.id,
        email: updatedShop.email,
        shopName: updatedShop.shopName,
        firstName: updatedShop.firstName,
        lastName: updatedShop.lastName,
        shopUrl: updatedShop.shopUrl,
        orderEmail: updatedShop.orderEmail,
        vatNumber: updatedShop.vatNumber
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return errorResponse('Failed to update profile', 500)
  }
}
