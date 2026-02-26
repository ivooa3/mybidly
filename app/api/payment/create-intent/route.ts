import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { successResponse, errorResponse } from '@/lib/api-response'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, locale } = body

    if (!amount || amount <= 0) {
      return errorResponse('Invalid amount', 400)
    }

    // Create a PaymentIntent with manual capture (authorization hold)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      capture_method: 'manual', // Hold funds for manual capture later
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        locale: locale || 'en'
      }
    })

    return successResponse({
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return errorResponse('Failed to create payment intent', 500)
  }
}
