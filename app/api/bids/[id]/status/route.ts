import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        bidAmount: true,
        customerEmail: true,
        createdAt: true
      }
    })

    if (!bid) {
      return errorResponse('Bid not found', 404)
    }

    return successResponse({
      status: bid.status,
      bidAmount: Number(bid.bidAmount),
      createdAt: bid.createdAt
    })
  } catch (error) {
    console.error('Bid status fetch error:', error)
    return errorResponse('Failed to fetch bid status', 500)
  }
}

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
    const { action } = body // 'accept' or 'decline'

    if (!action || !['accept', 'decline'].includes(action)) {
      return errorResponse('Invalid action. Must be "accept" or "decline"', 400)
    }

    // Find the bid and verify it belongs to this shop
    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: {
        offer: {
          select: {
            productName: true,
            stockQuantity: true,
            shop: {
              select: {
                stripeAccountId: true
              }
            }
          }
        }
      }
    })

    if (!bid) {
      return errorResponse('Bid not found', 404)
    }

    if (bid.shopId !== session.user.shopId) {
      return errorResponse('Unauthorized', 403)
    }

    if (bid.status !== 'pending') {
      return errorResponse(`Bid is already ${bid.status}`, 400)
    }

    // Handle the action
    if (action === 'accept') {
      // Capture the payment authorization on shop owner's connected account
      try {
        const paymentIntent = await stripe.paymentIntents.capture(
          bid.stripePaymentId,
          {},
          { stripeAccount: bid.offer.shop.stripeAccountId! } // Capture on connected account
        )

        // Get the transfer ID for reconciliation (if available)
        const transferId = paymentIntent.transfer_data?.destination

        // Update bid status to accepted with transfer tracking
        const updatedBid = await prisma.bid.update({
          where: { id: params.id },
          data: {
            status: 'accepted',
            acceptanceEmailSentAt: new Date(), // Mark as processed
            stripeTransferId: transferId || null
          }
        })

        // TODO: Reduce stock quantity
        // TODO: Send acceptance email to customer

        return successResponse({
          message: 'Bid accepted and payment captured',
          bid: {
            ...updatedBid,
            bidAmount: Number(updatedBid.bidAmount),
            platformFeeAmount: Number(updatedBid.platformFeeAmount),
            shopOwnerAmount: Number(updatedBid.shopOwnerAmount)
          }
        })
      } catch (stripeError: any) {
        console.error('Stripe capture error:', stripeError)
        return errorResponse(`Payment capture failed: ${stripeError.message}`, 500)
      }

    } else {
      // action === 'decline'
      // Cancel the payment authorization on shop owner's connected account
      try {
        await stripe.paymentIntents.cancel(
          bid.stripePaymentId,
          {},
          { stripeAccount: bid.offer.shop.stripeAccountId! } // Cancel on connected account
        )
      } catch (stripeError: any) {
        console.error('Stripe cancel error:', stripeError)
        return errorResponse(`Payment cancellation failed: ${stripeError.message}`, 500)
      }

      // Update bid status to declined
      const updatedBid = await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'declined' }
      })

      // TODO: Send decline email to customer

      return successResponse({
        message: 'Bid declined and payment authorization released',
        bid: {
          ...updatedBid,
          bidAmount: Number(updatedBid.bidAmount)
        }
      })
    }
  } catch (error) {
    console.error('Bid status update error:', error)
    return errorResponse('Failed to update bid status', 500)
  }
}
