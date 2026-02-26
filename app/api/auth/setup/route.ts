import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { shopSetupSchema } from '@/lib/validations'
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
  serverErrorResponse
} from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.shopId) {
      return errorResponse('Not authenticated', 401)
    }

    const body = await request.json()

    // Validate input
    const validation = shopSetupSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { shopName, shopUrl } = validation.data

    // Normalize shop URL - add https:// if not present
    const normalizedUrl = shopUrl.startsWith('http://') || shopUrl.startsWith('https://')
      ? shopUrl
      : `https://${shopUrl}`

    // Update shop with setup data
    const shop = await prisma.shop.update({
      where: { id: session.user.shopId },
      data: {
        shopName,
        shopUrl: normalizedUrl,
      },
      select: {
        id: true,
        email: true,
        shopName: true,
        shopUrl: true,
      }
    })

    return successResponse({
      message: 'Setup completed successfully',
      shop
    })

  } catch (error) {
    return serverErrorResponse(error)
  }
}
