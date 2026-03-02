import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendPendingPayoutNotification, sendPayoutCompletedEmail } from '@/lib/email'

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
          const shop = await prisma.shop.findUnique({
            where: { stripeAccountId: account.id }
          })

          if (!shop) {
            console.error(`Shop not found for Stripe account ${account.id}`)
            break
          }

          const updatedShop = await prisma.shop.update({
            where: { stripeAccountId: account.id },
            data: {
              stripeAccountStatus: 'active',
              stripeOnboardingComplete: true
            }
          })
          console.log(`Shop ${updatedShop.shopName} (${updatedShop.id}) is now fully onboarded`)

          // AUTO-PAYOUT: Check if shop has pending payouts from unregistered mode
          const hasPendingPayouts = Number(shop.pendingPayouts) > 0
          if (hasPendingPayouts) {
            console.log(`Shop ${shop.shopName} has pending payouts: €${shop.pendingPayouts}`)

            try {
              // Calculate platform fee based on plan tier
              const pendingAmount = Number(shop.pendingPayouts)
              let platformFee = 0

              if (shop.planTier === 'payg') {
                // PAYG: 8% + €1
                platformFee = (pendingAmount * 0.08) + 1.00
              } else if (shop.planTier === 'premium') {
                // Premium: No platform fee
                platformFee = 0
              }

              // Amount to transfer to seller (after platform fee)
              const transferAmount = pendingAmount - platformFee
              const transferAmountInCents = Math.round(transferAmount * 100)

              console.log(`Transfer breakdown: Pending €${pendingAmount}, Fee €${platformFee.toFixed(2)}, Transfer €${transferAmount.toFixed(2)}`)

              // Create transfer to seller's newly connected account
              const transfer = await stripe.transfers.create({
                amount: transferAmountInCents,
                currency: 'eur',
                destination: account.id,
                description: `Auto-payout of pending funds for ${shop.shopName}`,
                metadata: {
                  shopId: shop.id,
                  shopName: shop.shopName || '',
                  originalAmount: pendingAmount.toString(),
                  platformFee: platformFee.toFixed(2),
                  planTier: shop.planTier || 'payg'
                }
              })

              console.log(`Transfer created: ${transfer.id} for €${transferAmount.toFixed(2)}`)

              // Update shop: reset pending payouts and unregistered mode
              await prisma.shop.update({
                where: { id: shop.id },
                data: {
                  pendingPayouts: 0,
                  unregisteredMode: false,
                  pendingPayoutNotified: false // Reset for future use if needed
                }
              })

              // Send payout completed email
              const locale = shop.locale || 'en'
              await sendPayoutCompletedEmail({
                shopName: shop.shopName || shop.email,
                shopEmail: shop.email,
                amount: transferAmount,
                transferId: transfer.id,
                locale: locale as 'en' | 'de'
              })

              console.log(`Auto-payout completed for shop ${shop.shopName}`)
            } catch (error) {
              console.error(`Auto-payout failed for shop ${shop.id}:`, error)
              // Don't break the webhook - log and continue
            }
          }
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

        // Find bid by payment intent ID (more reliable than metadata bidId)
        const bid = await prisma.bid.findUnique({
          where: { stripePaymentId: paymentIntent.id },
          include: { shop: true }
        })

        if (bid) {
          console.log(`Payment succeeded for bid ${bid.id}`)
          // The bid status is already set to 'accepted' when created with auto-capture
          // We just log this for monitoring purposes

          // Check if this payment is in unregistered mode (seller hasn't connected Stripe yet)
          const isUnregisteredMode = paymentIntent.metadata.unregisteredMode === 'true'

          if (isUnregisteredMode) {
            console.log(`Payment in unregistered mode - tracking pending payout`)

            try {
              const shopOwnerAmount = Number(bid.shopOwnerAmount)
              const shop = bid.shop // Already loaded via include

              // Update shop's pending payouts
              const updatedShop = await prisma.shop.update({
                where: { id: bid.shopId },
                data: {
                  pendingPayouts: {
                    increment: shopOwnerAmount
                  }
                }
              })

              console.log(`Updated pending payouts for shop ${shop.shopName}: €${updatedShop.pendingPayouts}`)

              // Send email notification ONCE (first payment only)
              if (!shop.pendingPayoutNotified) {
                const locale = bid.locale || 'en'
                await sendPendingPayoutNotification({
                  shopName: shop.shopName || shop.email,
                  shopEmail: shop.email,
                  pendingPayouts: Number(updatedShop.pendingPayouts),
                  locale: locale as 'en' | 'de'
                })

                // Mark as notified so we don't send multiple emails
                await prisma.shop.update({
                  where: { id: bid.shopId },
                  data: {
                    pendingPayoutNotified: true
                  }
                })

                console.log(`Sent pending payout notification to ${shop.email}`)
              } else {
                console.log(`Pending payout notification already sent to ${shop.email}`)
              }
            } catch (error) {
              console.error(`Failed to process pending payout for bid ${bidId}:`, error)
              // Don't break webhook - log and continue
            }
          }
        }
        break

      case 'payment_intent.payment_failed':
        // Handle failed payment
        const failedPayment = event.data.object as Stripe.PaymentIntent

        // Find bid by payment intent ID
        const failedBid = await prisma.bid.findUnique({
          where: { stripePaymentId: failedPayment.id }
        })

        if (failedBid) {
          console.error(`Payment failed for bid ${failedBid.id}`)
          // Update bid status to 'declined'
          await prisma.bid.update({
            where: { id: failedBid.id },
            data: { status: 'declined' }
          })
        }
        break

      case 'account.application.authorized':
        // Shop owner authorized the Connect application
        const authorizedAccount = event.data.object as Stripe.Account
        console.log(`Account ${authorizedAccount.id} authorized the application`)
        break

      case 'account.application.deauthorized':
        // Shop owner deauthorized the Connect application
        const deauthorizedAccount = event.data.object as Stripe.Account
        console.log(`Account ${deauthorizedAccount.id} deauthorized the application`)

        // Update shop to reflect disconnection
        await prisma.shop.update({
          where: { stripeAccountId: deauthorizedAccount.id },
          data: {
            stripeAccountStatus: 'disconnected',
            stripeOnboardingComplete: false
          }
        })
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
