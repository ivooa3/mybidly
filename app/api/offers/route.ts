import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { offerCreateSchema } from '@/lib/validations'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  serverErrorResponse
} from '@/lib/api-response'

// GET /api/offers - Get all offers for authenticated shop
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    const offers = await prisma.offer.findMany({
      where: { shopId: session.user.shopId },
      orderBy: { priority: 'asc' }
    })

    return successResponse(offers)
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// POST /api/offers - Create new offer
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Validate input
    const validation = offerCreateSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const data = validation.data

    // Use a transaction to adjust priorities and create the new offer
    const offer = await prisma.$transaction(async (tx) => {
      // Get all offers that need to be shifted, ordered by priority descending
      const offersToShift = await tx.offer.findMany({
        where: {
          shopId: session.user.shopId,
          priority: {
            gte: data.priority
          }
        },
        orderBy: { priority: 'desc' }
      })

      // Shift them one by one from highest to lowest to avoid conflicts
      for (const offer of offersToShift) {
        await tx.offer.update({
          where: { id: offer.id },
          data: { priority: offer.priority + 1 }
        })
      }

      // Create the new offer with the requested priority
      return await tx.offer.create({
        data: {
          shopId: session.user.shopId,
          productName: data.productName,
          productSku: data.productSku,
          scopeOfDelivery: data.scopeOfDelivery,
          offerHeadline: data.offerHeadline,
          offerSubheadline: data.offerSubheadline,
          imageUrl: data.imageUrl,
          minPrice: data.minPrice,
          fixPrice: data.fixPrice,
          minRange: data.minRange,
          maxRange: data.maxRange,
          stockQuantity: data.stockQuantity,
          priority: data.priority,
          isActive: true
        }
      })
    })

    return successResponse(offer, 201)
  } catch (error) {
    return serverErrorResponse(error)
  }
}
