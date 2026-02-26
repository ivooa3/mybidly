import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return unauthorizedResponse()
    }

    const shop = await prisma.shop.findUnique({
      where: { id: session.user.shopId }
    })

    if (!shop) {
      return errorResponse('Shop not found', 404)
    }

    // If shop already has a Stripe account, just create a new onboarding link
    if (shop.stripeAccountId) {
      const accountLink = await stripe.accountLinks.create({
        account: shop.stripeAccountId,
        refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/profile`,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard/profile?stripe_connected=true`,
        type: 'account_onboarding'
      })

      return successResponse({
        url: accountLink.url,
        message: 'Redirecting to Stripe onboarding...'
      })
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'standard',  // Shop owner has full control of their account
      country: 'DE',     // EU - Germany
      email: shop.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_profile: {
        name: shop.shopName,
        support_email: shop.orderEmail || shop.email
      }
    })

    // Save Stripe account ID
    await prisma.shop.update({
      where: { id: session.user.shopId },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending'
      }
    })

    // Create account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/profile`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/profile?stripe_connected=true`,
      type: 'account_onboarding'
    })

    return successResponse({
      url: accountLink.url,
      message: 'Stripe Connect account created successfully'
    })
  } catch (error) {
    console.error('Stripe Connect onboarding error:', error)
    return errorResponse('Failed to create Stripe Connect account', 500)
  }
}
