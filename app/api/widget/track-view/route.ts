import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopId, offerId, productId, visitorId } = body

    if (!shopId) {
      return errorResponse('Shop ID is required', 400)
    }

    // Get visitor info from headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      null
    const userAgent = request.headers.get('user-agent') || null
    const referer = request.headers.get('referer') || null

    // Create view record
    await prisma.widgetView.create({
      data: {
        shopId,
        offerId: offerId || null,
        productId: productId || null,
        visitorId: visitorId || null,
        ipAddress,
        userAgent,
        referer
      }
    })

    return successResponse({ tracked: true })
  } catch (error) {
    console.error('Widget view tracking error:', error)
    // Don't fail the widget if tracking fails
    return successResponse({ tracked: false })
  }
}
