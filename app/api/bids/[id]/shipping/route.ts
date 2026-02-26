import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

// PATCH - Update bid shipping address from mobile wallet
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { shipping } = body

    if (!shipping || !shipping.address) {
      return errorResponse('Shipping information is required', 400)
    }

    // Find the bid
    const bid = await prisma.bid.findUnique({
      where: { id: params.id }
    })

    if (!bid) {
      return notFoundResponse('Bid not found')
    }

    // Update with shipping address from wallet
    const updatedBid = await prisma.bid.update({
      where: { id: params.id },
      data: {
        customerName: shipping.name || bid.customerName,
        shippingAddress: {
          line1: shipping.address.line1 || '',
          line2: shipping.address.line2 || '',
          city: shipping.address.city || '',
          postalCode: shipping.address.postal_code || '',
          country: shipping.address.country || 'DE'
        }
      }
    })

    return successResponse({
      bidId: updatedBid.id,
      message: 'Shipping address updated successfully'
    })
  } catch (error) {
    console.error('Bid shipping update error:', error)
    return errorResponse('Failed to update shipping address', 500)
  }
}
