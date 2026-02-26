# Stripe Integration - Best Practices

## Overview

This skill covers Stripe payment integration for the Justfouryou application, including Payment Element, webhooks, refunds, and EU-specific considerations.

---

## Setup

### Installation

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### Environment Variables

```env
# .env.local
STRIPE_SECRET_KEY="sk_test_..." # or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # or pk_live_...
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Stripe Client Setup

```typescript
// lib/stripe.ts
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
```

---

## Payment Flow Overview

```
1. Customer submits bid on widget
2. Redirect to payment page
3. Create PaymentIntent (server-side)
4. Return clientSecret to frontend
5. Render Stripe Payment Element with clientSecret
6. Customer enters payment details
7. Customer clicks "Pay"
8. Stripe processes payment
9. Webhook confirms payment_intent.succeeded
10. Update bid status to 'pending'
11. Schedule acceptance check (10-20 min)
12. Accept or decline bid
13. If declined: Issue refund
```

---

## Payment Intent Creation

### Create Payment Intent API

```typescript
// app/api/bids/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { bidCreateSchema } from '@/lib/validations'
import { validationErrorResponse, serverErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = bidCreateSchema.safeParse(body)

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error)
    }

    const data = validationResult.data

    // Verify offer exists and has stock
    const offer = await prisma.offer.findUnique({
      where: { id: data.offerId },
      include: { shop: true }
    })

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    if (offer.stockQuantity === 0) {
      return NextResponse.json(
        { success: false, error: 'Out of stock' },
        { status: 400 }
      )
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.bidAmount * 100), // Convert EUR to cents
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        shopId: data.shopId,
        offerId: data.offerId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        locale: data.locale,
        bidAmount: data.bidAmount.toString(),
        productName: offer.productName,
      },
      description: `Bid for ${offer.productName}`,
      receipt_email: data.customerEmail,
    })

    // Create bid record (status: pending payment)
    const bid = await prisma.bid.create({
      data: {
        shopId: data.shopId,
        offerId: data.offerId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        shippingAddress: data.shippingAddress,
        bidAmount: data.bidAmount,
        status: 'pending',
        stripePaymentId: paymentIntent.id,
        locale: data.locale,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        bidId: bid.id,
        clientSecret: paymentIntent.client_secret,
      }
    })

  } catch (error) {
    return serverErrorResponse(error)
  }
}
```

---

## Frontend Payment Element

### Payment Page Setup

```typescript
// app/payment/page.tsx
import { PaymentWrapper } from '@/components/PaymentWrapper'

export default function PaymentPage({
  searchParams
}: {
  searchParams: {
    shopId: string
    offerId: string
    bidAmount: string
    locale: string
  }
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <PaymentWrapper
          shopId={searchParams.shopId}
          offerId={searchParams.offerId}
          bidAmount={parseFloat(searchParams.bidAmount)}
          locale={searchParams.locale}
        />
      </div>
    </div>
  )
}
```

### Payment Wrapper Component

```typescript
// components/PaymentWrapper.tsx
'use client'

import { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentForm } from '@/components/PaymentForm'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface PaymentWrapperProps {
  shopId: string
  offerId: string
  bidAmount: number
  locale: string
}

export function PaymentWrapper({
  shopId,
  offerId,
  bidAmount,
  locale
}: PaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create PaymentIntent on mount
    fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId,
        offerId,
        bidAmount,
        locale,
        // These would come from a previous form step
        customerEmail: 'temp@example.com', // TODO: Get from form
        customerName: 'Temp Name', // TODO: Get from form
        shippingAddress: {} // TODO: Get from form
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClientSecret(data.data.clientSecret)
        } else {
          setError(data.error)
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to initialize payment')
        setLoading(false)
      })
  }, [shopId, offerId, bidAmount, locale])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#9333ea', // Purple-600
            borderRadius: '8px',
          }
        },
        locale: locale === 'de' ? 'de' : 'en',
      }}
    >
      <PaymentForm bidAmount={bidAmount} locale={locale} />
    </Elements>
  )
}
```

### Payment Form Component

```typescript
// components/PaymentForm.tsx
'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

interface PaymentFormProps {
  bidAmount: number
  locale: string
}

const translations = {
  en: {
    pay: 'Pay',
    processing: 'Processing...',
    orderSummary: 'Order Summary',
    bidAmount: 'Your Bid',
    vat: 'incl. VAT',
    poweredBy: 'Powered by Stripe',
    paymentFailed: 'Payment failed. Please try again.',
    emailRequired: 'Email address is required'
  },
  de: {
    pay: 'Bezahlen',
    processing: 'Wird verarbeitet...',
    orderSummary: 'Bestellübersicht',
    bidAmount: 'Ihr Gebot',
    vat: 'inkl. MwSt.',
    poweredBy: 'Powered by Stripe',
    paymentFailed: 'Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    emailRequired: 'E-Mail-Adresse ist erforderlich'
  }
}

export function PaymentForm({ bidAmount, locale }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const t = translations[locale as 'en' | 'de']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?locale=${locale}`,
      },
    })

    if (error) {
      setErrorMessage(error.message || t.paymentFailed)
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{t.orderSummary}</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{t.bidAmount}</span>
          <span className="text-2xl font-bold text-purple-600">
            €{bidAmount.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 text-right mt-1">{t.vat}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <PaymentElement />

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? t.processing : `${t.pay} €${bidAmount.toFixed(2)}`}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          {t.poweredBy}
        </p>
      </form>
    </div>
  )
}
```

---

## Webhooks

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)

  // Find bid by payment intent ID
  const bid = await prisma.bid.findUnique({
    where: { stripePaymentId: paymentIntent.id }
  })

  if (!bid) {
    console.error('Bid not found for payment:', paymentIntent.id)
    return
  }

  // Update bid status (still pending acceptance)
  await prisma.bid.update({
    where: { id: bid.id },
    data: { status: 'pending' } // Will be accepted/declined by cron job
  })

  // Send confirmation email
  await sendBidConfirmation(bid)

  console.log('Bid updated after payment:', bid.id)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)

  const bid = await prisma.bid.findUnique({
    where: { stripePaymentId: paymentIntent.id }
  })

  if (bid) {
    await prisma.bid.update({
      where: { id: bid.id },
      data: { status: 'declined' }
    })

    // Optionally send failure email
    console.log('Bid marked as declined due to payment failure:', bid.id)
  }
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('Refund processed:', charge.id)

  // Find bid by payment intent
  const bid = await prisma.bid.findUnique({
    where: { stripePaymentId: charge.payment_intent as string }
  })

  if (bid) {
    // Already should be declined, but ensure it's logged
    console.log('Refund confirmed for bid:', bid.id)
  }
}

// Import from email utils (see email-templates.md)
import { sendBidConfirmation } from '@/lib/email'
```

### Webhook Configuration in Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### Testing Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

---

## Refunds

### Issue Refund

```typescript
// lib/refunds.ts
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function refundBid(bidId: string) {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId }
  })

  if (!bid) {
    throw new Error('Bid not found')
  }

  if (bid.status !== 'declined') {
    throw new Error('Can only refund declined bids')
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: bid.stripePaymentId,
      reason: 'requested_by_customer',
      metadata: {
        bidId: bid.id,
        reason: 'Bid declined - out of stock or below minimum'
      }
    })

    console.log('Refund created:', refund.id)
    return refund

  } catch (error) {
    console.error('Refund failed:', error)
    throw error
  }
}
```

### Call in Bid Decline Process

```typescript
// utils/processAcceptance.ts
import { refundBid } from '@/lib/refunds'
import { sendBidDeclined } from '@/lib/email'

export async function declineBid(bidId: string) {
  // Update bid status
  await prisma.bid.update({
    where: { id: bidId },
    data: {
      status: 'declined',
      acceptanceEmailSentAt: new Date()
    }
  })

  // Issue refund
  await refundBid(bidId)

  // Send decline email
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { offer: true }
  })

  if (bid) {
    await sendBidDeclined(bid, bid.offer)
  }
}
```

---

## EU-Specific Considerations

### VAT Handling

Stripe automatically calculates VAT for EU customers when configured:

```typescript
// Configure in Stripe Dashboard:
// Settings → Tax → Enable automatic tax calculation

// Or manually specify VAT in PaymentIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(bidAmount * 100),
  currency: 'eur',
  automatic_payment_methods: { enabled: true },
  // Tax is automatically calculated if enabled in settings
})
```

### Payment Methods

Enable EU payment methods in Stripe Dashboard:
- Credit/Debit Cards (Visa, Mastercard, Amex)
- SEPA Direct Debit
- Sofort
- iDEAL (Netherlands)
- Bancontact (Belgium)
- Giropay (Germany)

```typescript
// Payment Element automatically shows relevant methods based on:
// 1. Customer's location (IP-based)
// 2. Currency (EUR)
// 3. Enabled payment methods in Stripe Dashboard
```

### Strong Customer Authentication (SCA)

Stripe Payment Element handles 3D Secure automatically for EU customers:

```typescript
// No additional code needed - Payment Element handles SCA
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: { return_url: 'https://...' }
})

// Stripe will redirect to 3D Secure if required
// Then redirect back to return_url
```

---

## Testing

### Test Card Numbers

```typescript
// Success
4242 4242 4242 4242

// Requires 3D Secure
4000 0027 6000 3184

// Declined
4000 0000 0000 0002

// Insufficient funds
4000 0000 0000 9995

// Any future expiry date, any 3-digit CVC
```

### Test in Code

```typescript
// utils/stripe-test.ts
import { stripe } from '@/lib/stripe'

export async function testPaymentIntent() {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 3500, // €35.00
    currency: 'eur',
    payment_method_types: ['card'],
  })

  console.log('Test PaymentIntent created:', paymentIntent.id)
  console.log('Client Secret:', paymentIntent.client_secret)
}
```

---

## Error Handling

### Common Stripe Errors

```typescript
// lib/stripe-errors.ts
import Stripe from 'stripe'

export function handleStripeError(error: unknown): string {
  if (error instanceof Stripe.errors.StripeCardError) {
    // Card was declined
    return `Card declined: ${error.message}`
  } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    // Invalid parameters
    return 'Invalid payment request'
  } else if (error instanceof Stripe.errors.StripeAPIError) {
    // Stripe API error
    return 'Payment processing error. Please try again.'
  } else if (error instanceof Stripe.errors.StripeConnectionError) {
    // Network error
    return 'Network error. Please check your connection.'
  } else if (error instanceof Stripe.errors.StripeAuthenticationError) {
    // Authentication error
    console.error('Stripe auth error - check API keys')
    return 'Payment configuration error'
  } else {
    return 'An unexpected error occurred'
  }
}

// Usage in API route
try {
  const paymentIntent = await stripe.paymentIntents.create({ /* ... */ })
} catch (error) {
  const message = handleStripeError(error)
  return NextResponse.json({ success: false, error: message }, { status: 400 })
}
```

---

## Security Best Practices

### ✅ DO

1. **Verify webhook signatures** - Always verify `stripe-signature` header
2. **Use environment variables** - Never hardcode API keys
3. **Validate amounts** - Check bid amounts match offer prices
4. **Use HTTPS** - Required for webhooks in production
5. **Log webhook events** - For debugging and audit trails
6. **Handle idempotency** - Webhooks may be sent multiple times
7. **Set metadata** - Include bid/shop IDs for tracking
8. **Test with test keys** - Use `sk_test_` and `pk_test_` in development

### ❌ DON'T

1. **Don't trust client-side amounts** - Always create PaymentIntent server-side
2. **Don't expose secret keys** - Only use publishable key in frontend
3. **Don't skip webhook verification** - Attackers could fake webhooks
4. **Don't log sensitive data** - Card numbers, secrets, etc.
5. **Don't process payments without stock check** - Verify stock before creating PaymentIntent
6. **Don't forget to refund declined bids** - Customer paid in good faith

---

## Production Checklist

### Before Launch

- [ ] Switch to live API keys (`sk_live_`, `pk_live_`)
- [ ] Configure live webhook endpoint in Stripe Dashboard
- [ ] Enable automatic tax calculation for EU
- [ ] Enable desired payment methods (cards, SEPA, etc.)
- [ ] Set up email receipts in Stripe settings
- [ ] Test full payment flow with real card (small amount)
- [ ] Verify webhooks are received in production
- [ ] Test refund process
- [ ] Verify 3D Secure flow works
- [ ] Check Stripe Dashboard for test transactions
- [ ] Document customer support process for payment issues

---

## Monitoring

### Stripe Dashboard

Check regularly:
- Payments → View successful payments
- Disputes → Handle chargebacks
- Radar → Fraud detection
- Logs → API requests and webhooks
- Reports → Revenue analytics

### Application Logging

```typescript
// Log payment events
console.log('PaymentIntent created:', {
  id: paymentIntent.id,
  amount: paymentIntent.amount,
  bidId: bid.id,
  shopId: bid.shopId
})

// Log webhook events
console.log('Webhook received:', {
  type: event.type,
  id: event.id,
  created: new Date(event.created * 1000)
})
```

---

## Resources

- [Stripe Docs](https://stripe.com/docs)
- [Payment Element](https://stripe.com/docs/payments/payment-element)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)
- [EU Payments](https://stripe.com/docs/payments/sepa-debit)
- [Stripe + Next.js](https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript)
