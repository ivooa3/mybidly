import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { offerCreateSchema } from '@/lib/validations'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse
} from '@/lib/api-response'

// GET /api/offers/:id - Get single offer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    const offer = await prisma.offer.findUnique({
      where: {
        id: params.id,
        shopId: session.user.shopId // Ensure user owns this offer
      }
    })

    if (!offer) {
      return notFoundResponse('Offer not found')
    }

    return successResponse(offer)
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// PATCH /api/offers/:id - Update offer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Check if this is just a toggle (isActive only)
    if (Object.keys(body).length === 1 && 'isActive' in body) {
      // Simple toggle - no validation needed
      const offer = await prisma.offer.update({
        where: {
          id: params.id,
          shopId: session.user.shopId
        },
        data: {
          isActive: body.isActive
        }
      })

      return successResponse(offer)
    }

    // Full update - validate all fields
    const validation = offerCreateSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const data = validation.data

    // Use a transaction to adjust priorities and update the offer
    const offer = await prisma.$transaction(async (tx) => {
      // Get the current offer to check if priority changed
      const currentOffer = await tx.offer.findUnique({
        where: {
          id: params.id,
          shopId: session.user.shopId
        }
      })

      if (!currentOffer) {
        throw new Error('Offer not found')
      }

      // If priority changed, adjust other offers
      if (currentOffer.priority !== data.priority) {
        const tempPriority = 999999 // Temporary high priority to avoid conflicts

        // Step 1: Move current offer to temporary priority to free up its slot
        await tx.offer.update({
          where: { id: params.id },
          data: { priority: tempPriority }
        })

        // Step 2: Adjust other offers based on direction of move
        if (data.priority < currentOffer.priority) {
          // Moving to higher priority (lower number): shift offers down
          await tx.offer.updateMany({
            where: {
              shopId: session.user.shopId,
              priority: {
                gte: data.priority,
                lt: currentOffer.priority
              }
            },
            data: {
              priority: {
                increment: 1
              }
            }
          })
        } else {
          // Moving to lower priority (higher number): shift offers up
          await tx.offer.updateMany({
            where: {
              shopId: session.user.shopId,
              priority: {
                gt: currentOffer.priority,
                lte: data.priority
              }
            },
            data: {
              priority: {
                decrement: 1
              }
            }
          })
        }
      }

      // Update the offer with new data
      return await tx.offer.update({
        where: {
          id: params.id,
          shopId: session.user.shopId
        },
        data: {
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
          priority: data.priority
        }
      })
    })

    return successResponse(offer)
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// DELETE /api/offers/:id - Delete offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    await prisma.offer.delete({
      where: {
        id: params.id,
        shopId: session.user.shopId
      }
    })

    return successResponse({ message: 'Offer deleted successfully' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
