import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return new Response('Missing signature', { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'account.updated':
        // Handle Stripe Connect account updates
        const account = event.data.object as Stripe.Account

        console.log(`Account updated: ${account.id}`)
        console.log(`Charges enabled: ${account.charges_enabled}`)
        console.log(`Payouts enabled: ${account.payouts_enabled}`)

        // Update shop when account is fully onboarded
        if (account.charges_enabled && account.payouts_enabled) {
          const updatedShop = await prisma.shop.update({
            where: { stripeAccountId: account.id },
            data: {
              stripeAccountStatus: 'active',
              stripeOnboardingComplete: true
            }
          })
          console.log(`Shop ${updatedShop.shopName} (${updatedShop.id}) is now fully onboarded`)
        } else {
          // Account exists but not fully onboarded yet
          await prisma.shop.update({
            where: { stripeAccountId: account.id },
            data: {
              stripeAccountStatus: 'pending',
              stripeOnboardingComplete: false
            }
          })
          console.log(`Account ${account.id} is pending (charges: ${account.charges_enabled}, payouts: ${account.payouts_enabled})`)
        }
        break

      case 'payment_intent.succeeded':
        // Handle successful payment (for bid with auto-capture)
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bidId = paymentIntent.metadata.bidId

        if (bidId) {
          console.log(`Payment succeeded for bid ${bidId}`)
          // The bid status is already set to 'accepted' when created with auto-capture
          // We just log this for monitoring purposes
        }
        break

      case 'payment_intent.payment_failed':
        // Handle failed payment
        const failedPayment = event.data.object as Stripe.PaymentIntent
        const failedBidId = failedPayment.metadata.bidId

        if (failedBidId) {
          console.error(`Payment failed for bid ${failedBidId}`)
          // Optionally update bid status to 'payment_failed'
          await prisma.bid.update({
            where: { id: failedBidId },
            data: { status: 'declined' }
          })
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
}
