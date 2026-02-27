# myBidly - Bid-Based Upsell Platform

## IMPORTANT: Deployment Policy

**NEVER deploy to production without explicit user confirmation.**

When asked to deploy or when completing work:
1. Complete all changes and testing
2. Commit changes to git
3. **STOP and ask user for confirmation before pushing to production**
4. Only run `git push origin main` after receiving explicit "yes" or "deploy" confirmation from the user

This ensures the user has final review and approval before any changes go live.

---

## Project Overview

**myBidly** is a post-purchase bid-based accessory upsell platform for e-commerce stores in the EU market. Customers bid on relevant accessories (batteries, helmets, warranties, express shipping) on thank-you pages after completing their primary purchase.

### Key Differentiator
Bid mechanism vs competitors' fixed pricing (AfterSell, Zipify, UpsellWP)

### Business Model
- **You = Merchant of Record** (Dropship model)
- Customer bids €35 → pays YOU via Stripe
- You pay shop owner €30 (wholesale price)
- Shop owner ships the item
- You keep €5 profit (after handling ~2-5% returns)

### Target Market
- **Region**: EU only
- **Currency**: EUR
- **Languages**: German & English (auto-detect based on browser locale)

---

## SLC Framework

This MVP follows the **Simple, Lovable, Complete** framework:

### Simple
- Anyone can register without IT knowledge
- Setup in a few steps: Sign up → Create offer → Copy embed code
- Clear path from registration to first upsell

### Lovable
- Very appealing, clean, easy-to-use interface
- Preview functionality to see widget before going live
- Modern design with myBidly branding
- Smooth, delightful user experience

### Complete
- Functional from day one, not buggy
- Safe payment processing via Stripe
- Real purchases with email confirmations
- Stock tracking and auto-acceptance logic
- Provides immediate value, iterate based on real user feedback

---

## MVP Scope

### ✅ In Scope (Must Have)

#### Shop Owner Features
1. **Registration & Authentication**
   - Email/password signup
   - Shop profile setup (name, contact)
   - Secure authentication

2. **Offer Management**
   - Create static offer (one universal product)
   - Upload product image
   - Set wholesale price, minimum bid, stock quantity
   - System auto-calculates slider range (20% below to 55% above min bid)
   - Stock tracking with auto-decrement on acceptance

3. **Embed Code Generator**
   - Auto-generated HTML snippet with unique shopId
   - Preview mode to test widget
   - Platform-specific installation guides (Shopify, WooCommerce, Custom)

4. **Dashboard Analytics**
   - Total bids received
   - Accepted bids
   - Declined bids
   - Total revenue
   - Conversion rate (accepted/total)

5. **Order Notifications**
   - Email notification when bid accepted
   - Includes: customer name, email, shipping address, product name, SKU, bid amount

#### Customer Features
1. **Bid Widget (Thank-You Page)**
   - Display product offer with image
   - Price slider with bid range
   - "Submit and Pay" CTA
   - Responsive, mobile-optimized
   - myBidly banner (top left)
   - "Powered by Next Commerce" footer (links to www.next-commerce.io)

2. **Payment Flow**
   - Stripe Payment Element (embedded, same-page experience)
   - Collect shipping address during checkout
   - Secure payment processing
   - Support for all major EU payment methods

3. **Email Notifications**
   - Bid confirmation after payment
   - Acceptance email (10-20 min delay to seem human)
   - Decline email if bid rejected
   - German/English based on browser locale

#### System Features
1. **Auto-Acceptance Logic**
   - If bid >= minimum bid threshold → auto-accept
   - If stock = 0 → auto-decline
   - 10-20 minute delay before sending decision email

2. **Stock Management**
   - Track inventory per offer
   - Auto-decrement on accepted bid
   - Auto-hide widget when out of stock

3. **Payment Processing**
   - Stripe integration for payments
   - Automatic refunds for declined bids
   - EU VAT compliance

### ❌ Out of Scope (Post-MVP)

- Freemium limits enforcement (track data but no hard limits)
- Manual bid review interface
- Category/SKU mapping (only static offers in MVP)
- Shopify/WooCommerce API integration
- Automated payouts to shop owners (manual for MVP)
- Advanced analytics (charts, timelines, A/B testing)
- Multiple offers per shop (one static offer only)
- Custom branding removal (note: plan for paid tier, but don't build billing yet)

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Language**: TypeScript
- **UI Components**: Headless UI or shadcn/ui

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase recommended)
- **ORM**: Prisma
- **Authentication**: Clerk or NextAuth

### Integrations
- **Payments**: Stripe (Payment Element)
- **Email**: Resend
- **Image Hosting**: Cloudinary or Vercel Blob
- **Hosting**: Vercel

---

## Database Schema

### Tables

#### `shops`
```prisma
model Shop {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  shopName      String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  offers        Offer[]
  bids          Bid[]
}
```

#### `offers`
```prisma
model Offer {
  id              String   @id @default(cuid())
  shopId          String
  productName     String
  productSku      String?
  imageUrl        String
  wholesalePrice  Decimal  @db.Decimal(10, 2)
  minBid          Decimal  @db.Decimal(10, 2)
  sliderMin       Decimal  @db.Decimal(10, 2)
  sliderMax       Decimal  @db.Decimal(10, 2)
  stockQuantity   Int
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  shop            Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  bids            Bid[]

  @@index([shopId])
}
```

#### `bids`
```prisma
model Bid {
  id                  String   @id @default(cuid())
  shopId              String
  offerId             String
  customerEmail       String
  customerName        String
  shippingAddress     Json     // Stripe address object
  bidAmount           Decimal  @db.Decimal(10, 2)
  status              String   // 'pending', 'accepted', 'declined'
  stripePaymentId     String   @unique
  locale              String   // 'de' or 'en'
  acceptanceEmailSentAt DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  shop                Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  offer               Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)

  @@index([shopId])
  @@index([offerId])
  @@index([status])
  @@index([createdAt])
}
```

### Relationships
- One shop has many offers (1:N)
- One shop has many bids (1:N)
- One offer has many bids (1:N)
- Each bid belongs to one shop and one offer

---

## API Architecture

### Authentication Endpoints

#### `POST /api/auth/register`
Register new shop owner

**Request Body:**
```json
{
  "email": "shop@example.com",
  "password": "securepassword",
  "shopName": "My Shop"
}
```

**Response:**
```json
{
  "success": true,
  "shopId": "clx123abc",
  "message": "Registration successful"
}
```

#### `POST /api/auth/login`
Authenticate shop owner

**Request Body:**
```json
{
  "email": "shop@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "shop": {
    "id": "clx123abc",
    "email": "shop@example.com",
    "shopName": "My Shop"
  }
}
```

### Offer Endpoints

#### `POST /api/offers`
Create new offer (authenticated)

**Request Body:**
```json
{
  "productName": "Premium Bicycle Helmet",
  "productSku": "HELMET-001",
  "imageUrl": "https://cdn.example.com/helmet.jpg",
  "wholesalePrice": 30.00,
  "minBid": 32.00,
  "stockQuantity": 100
}
```

**Response:**
```json
{
  "success": true,
  "offer": {
    "id": "offer_123",
    "productName": "Premium Bicycle Helmet",
    "sliderMin": 25.60,
    "sliderMax": 49.60,
    "stockQuantity": 100
  }
}
```

**Auto-calculation Logic:**
- `sliderMin = minBid * 0.80` (20% below minimum)
- `sliderMax = minBid * 1.55` (55% above minimum)

#### `GET /api/offers`
Get all offers for authenticated shop

**Response:**
```json
{
  "success": true,
  "offers": [
    {
      "id": "offer_123",
      "productName": "Premium Bicycle Helmet",
      "stockQuantity": 95,
      "minBid": 32.00,
      "wholesalePrice": 30.00,
      "isActive": true
    }
  ]
}
```

#### `PATCH /api/offers/:id/stock`
Update stock quantity

**Request Body:**
```json
{
  "stockQuantity": 50
}
```

### Widget Endpoint

#### `GET /api/widget/offer?shopId=xxx`
Get active offer for widget display (public, no auth)

**Query Params:**
- `shopId` (required): Shop identifier

**Response:**
```json
{
  "success": true,
  "offer": {
    "id": "offer_123",
    "productName": "Premium Bicycle Helmet",
    "imageUrl": "https://cdn.example.com/helmet.jpg",
    "sliderMin": 25.60,
    "sliderMax": 49.60,
    "minBid": 32.00,
    "stockQuantity": 95
  }
}
```

**Returns 404 if:**
- No active offer found
- Stock = 0
- Shop doesn't exist

### Bid Endpoints

#### `POST /api/bids`
Create new bid and process payment

**Request Body:**
```json
{
  "shopId": "clx123abc",
  "offerId": "offer_123",
  "bidAmount": 35.00,
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "shippingAddress": {
    "line1": "123 Main St",
    "line2": "Apt 4",
    "city": "Berlin",
    "postalCode": "10115",
    "country": "DE"
  },
  "locale": "de"
}
```

**Response:**
```json
{
  "success": true,
  "bidId": "bid_456",
  "clientSecret": "pi_xxx_secret_yyy",
  "message": "Bid submitted successfully"
}
```

**Process:**
1. Validate stock > 0
2. Create Stripe PaymentIntent
3. Create bid record with status='pending'
4. Return clientSecret for Stripe Payment Element
5. After successful payment, schedule acceptance check (10-20 min delay)

#### `POST /api/bids/:id/process-acceptance`
Auto-process bid acceptance (called by scheduled job)

**Internal endpoint** (called by cron job or delayed queue)

**Logic:**
```
IF bid.bidAmount >= offer.minBid AND offer.stockQuantity > 0:
  - Set status = 'accepted'
  - Decrement offer.stockQuantity by 1
  - Send acceptance email to customer
  - Send order notification to shop owner
ELSE:
  - Set status = 'declined'
  - Trigger Stripe refund
  - Send decline email to customer
```

### Dashboard Endpoints

#### `GET /api/dashboard/stats`
Get analytics for authenticated shop

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBids": 150,
    "acceptedBids": 120,
    "declinedBids": 30,
    "totalRevenue": 4200.00,
    "conversionRate": 80.0
  }
}
```

#### `GET /api/dashboard/bids`
Get bid history for authenticated shop

**Query Params:**
- `status` (optional): Filter by 'pending', 'accepted', 'declined'
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "bids": [
    {
      "id": "bid_456",
      "customerEmail": "customer@example.com",
      "customerName": "John Doe",
      "bidAmount": 35.00,
      "status": "accepted",
      "productName": "Premium Bicycle Helmet",
      "createdAt": "2026-02-25T10:30:00Z"
    }
  ],
  "total": 150
}
```

---

## Stripe Integration

### Payment Element Setup

#### Frontend Integration
```typescript
// In payment page component
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// When user clicks "Submit and Pay"
const { clientSecret } = await fetch('/api/bids', {
  method: 'POST',
  body: JSON.stringify(bidData)
}).then(r => r.json());

// Render Payment Element with clientSecret
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentForm />
</Elements>
```

#### Backend Payment Intent Creation
```typescript
// In /api/bids endpoint
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(bidAmount * 100), // Convert EUR to cents
  currency: 'eur',
  metadata: {
    bidId: bid.id,
    shopId: bid.shopId,
    offerId: bid.offerId
  },
  description: `Bid for ${offer.productName}`
});
```

### Webhooks

#### `POST /api/webhooks/stripe`
Handle Stripe webhook events

**Events to Handle:**

1. **`payment_intent.succeeded`**
   - Update bid status to 'pending' (awaiting acceptance)
   - Schedule acceptance check job (10-20 min delay)

2. **`payment_intent.payment_failed`**
   - Update bid status to 'declined'
   - Send failure email to customer

3. **`charge.refunded`**
   - Log refund for declined bid
   - Update internal records

**Webhook Signature Verification:**
```typescript
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### Refund Process

For declined bids:
```typescript
await stripe.refunds.create({
  payment_intent: bid.stripePaymentId,
  reason: 'requested_by_customer' // or 'fraudulent' based on decline reason
});
```

---

## Email Notification System

### Email Service: Resend

#### Setup
```bash
npm install resend
```

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
```

### Email Templates

All emails support **German (de)** and **English (en)** based on `bid.locale`.

#### 1. Bid Confirmation Email (Immediate)

**To:** Customer
**When:** Immediately after successful payment
**Subject (EN):** "Your bid has been submitted"
**Subject (DE):** "Ihr Gebot wurde eingereicht"

**Content (EN):**
```
Hi [customerName],

Thank you for your bid of €[bidAmount] for [productName].

We're reviewing your bid and will notify you within the next 20 minutes.

Best regards,
The myBidly Team

---
Powered by Next Commerce
www.next-commerce.io
```

**Content (DE):**
```
Hallo [customerName],

vielen Dank für Ihr Gebot von €[bidAmount] für [productName].

Wir prüfen Ihr Gebot und benachrichtigen Sie innerhalb der nächsten 20 Minuten.

Mit freundlichen Grüßen,
Das myBidly-Team

---
Powered by Next Commerce
www.next-commerce.io
```

#### 2. Bid Accepted Email (10-20 min delay)

**To:** Customer
**When:** After bid auto-accepted
**Subject (EN):** "Great news! Your bid was accepted"
**Subject (DE):** "Gute Neuigkeiten! Ihr Gebot wurde angenommen"

**Content (EN):**
```
Hi [customerName],

Congratulations! Your bid of €[bidAmount] for [productName] has been accepted.

Your order will be shipped to:
[shippingAddress]

You'll receive a shipping confirmation once your item is on its way.

Best regards,
The myBidly Team

---
Powered by Next Commerce
www.next-commerce.io
```

**Content (DE):**
```
Hallo [customerName],

Glückwunsch! Ihr Gebot von €[bidAmount] für [productName] wurde angenommen.

Ihre Bestellung wird versendet an:
[shippingAddress]

Sie erhalten eine Versandbestätigung, sobald Ihr Artikel unterwegs ist.

Mit freundlichen Grüßen,
Das myBidly-Team

---
Powered by Next Commerce
www.next-commerce.io
```

#### 3. Bid Declined Email (10-20 min delay)

**To:** Customer
**When:** After bid auto-declined
**Subject (EN):** "Regarding your bid"
**Subject (DE):** "Bezüglich Ihres Gebots"

**Content (EN):**
```
Hi [customerName],

Unfortunately, we cannot accept your bid at this time.

Your payment of €[bidAmount] has been fully refunded and will appear in your account within 5-10 business days.

Thank you for your interest.

Best regards,
The myBidly Team

---
Powered by Next Commerce
www.next-commerce.io
```

**Content (DE):**
```
Hallo [customerName],

Leider können wir Ihr Gebot derzeit nicht annehmen.

Ihre Zahlung von €[bidAmount] wurde vollständig erstattet und wird innerhalb von 5-10 Werktagen auf Ihrem Konto erscheinen.

Vielen Dank für Ihr Interesse.

Mit freundlichen Grüßen,
Das myBidly-Team

---
Powered by Next Commerce
www.next-commerce.io
```

#### 4. Shop Owner Order Notification

**To:** Shop owner email
**When:** After bid accepted
**Subject:** "New Order: [productName] - €[bidAmount]"

**Content:**
```
New myBidly Order

Product: [productName]
SKU: [productSku]
Bid Amount: €[bidAmount]
Your Wholesale Price: €[wholesalePrice]

Customer Details:
Name: [customerName]
Email: [customerEmail]

Shipping Address:
[shippingAddress.line1]
[shippingAddress.line2]
[shippingAddress.postalCode] [shippingAddress.city]
[shippingAddress.country]

Please ship this item as soon as possible.

View in Dashboard: [link to dashboard]

---
myBidly
```

#### 5. Welcome Email (Shop Owner)

**To:** Shop owner
**When:** After successful registration
**Subject:** "Welcome to myBidly!"

**Content:**
```
Welcome to myBidly, [shopName]!

You're ready to start earning incremental revenue with bid-based upsells.

Next Steps:
1. Create your first offer
2. Copy the embed code
3. Add it to your thank-you page
4. Start receiving bids!

Get Started: [link to dashboard]

Need help? Reply to this email anytime.

Best regards,
The myBidly Team

---
Powered by Next Commerce
www.next-commerce.io
```

### Email Implementation

```typescript
// utils/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBidConfirmation(bid: Bid, offer: Offer) {
  const subject = bid.locale === 'de'
    ? 'Ihr Gebot wurde eingereicht'
    : 'Your bid has been submitted';

  const html = bid.locale === 'de'
    ? getBidConfirmationTemplateDE(bid, offer)
    : getBidConfirmationTemplateEN(bid, offer);

  await resend.emails.send({
    from: 'myBidly <noreply@bidly.com>',
    to: bid.customerEmail,
    subject,
    html
  });
}

export async function sendBidAccepted(bid: Bid, offer: Offer) {
  // Similar pattern for accepted email
}

export async function sendBidDeclined(bid: Bid, offer: Offer) {
  // Similar pattern for declined email
}

export async function sendShopOwnerOrderNotification(
  shop: Shop,
  bid: Bid,
  offer: Offer
) {
  await resend.emails.send({
    from: 'myBidly Orders <orders@bidly.com>',
    to: shop.email,
    subject: `New Order: ${offer.productName} - €${bid.bidAmount}`,
    html: getShopOwnerOrderTemplate(shop, bid, offer)
  });
}
```

---

## Widget Architecture

### Embeddable Widget

The widget is embedded via iframe to work on any platform (Shopify, WooCommerce, custom stores).

#### Shop Owner Embed Code

```html
<!-- Generated code for shop owners -->
<script src="https://bidly.com/widget.js"></script>
<script>
  myBidlyWidget.init({
    shopId: 'clx123abc'
  });
</script>
<div id="bidly-widget"></div>
```

#### Widget Loader (`widget.js`)

```javascript
(function() {
  window.myBidlyWidget = {
    init: function(config) {
      const container = document.getElementById('bidly-widget');
      if (!container) {
        console.error('myBidly: Widget container not found');
        return;
      }

      // Detect locale from browser
      const locale = navigator.language.startsWith('de') ? 'de' : 'en';

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = `https://bidly.com/widget?shopId=${config.shopId}&locale=${locale}`;
      iframe.style.width = '100%';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';

      container.appendChild(iframe);

      // Handle responsive height
      window.addEventListener('message', function(e) {
        if (e.origin !== 'https://bidly.com') return;
        if (e.data.type === 'bidly:resize') {
          iframe.style.height = e.data.height + 'px';
        }
      });
    }
  };
})();
```

#### Widget Page (`/widget` route)

Next.js page that displays the bid interface:

```typescript
// app/widget/page.tsx
export default async function WidgetPage({
  searchParams
}: {
  searchParams: { shopId: string; locale: string }
}) {
  const { shopId, locale } = searchParams;

  // Fetch offer from API
  const offer = await fetch(`/api/widget/offer?shopId=${shopId}`);

  if (!offer) {
    return <NoOfferAvailable locale={locale} />;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* myBidly Banner */}
      <div className="mb-4">
        <img
          src="/logo-banner.png"
          alt="myBidly"
          className="h-8"
        />
      </div>

      {/* Bid Interface */}
      <BidWidget offer={offer} locale={locale} shopId={shopId} />

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Powered by{' '}
        <a
          href="https://www.next-commerce.io"
          target="_blank"
          className="text-blue-600 hover:underline"
        >
          Next Commerce
        </a>
      </div>
    </div>
  );
}
```

### Widget Components

#### Bid Widget Component

```typescript
// components/BidWidget.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function BidWidget({
  offer,
  locale,
  shopId
}: {
  offer: Offer;
  locale: string;
  shopId: string;
}) {
  const [bidAmount, setBidAmount] = useState(offer.minBid);
  const router = useRouter();

  const translations = {
    en: {
      title: "Thank You Offer",
      submit: "Submit and Pay",
      vat: "incl. VAT"
    },
    de: {
      title: "Dankeschön-Angebot",
      submit: "Absenden und bezahlen",
      vat: "inkl. MwSt."
    }
  };

  const t = translations[locale as 'en' | 'de'];

  const handleSubmit = () => {
    // Redirect to payment page with bid amount
    const params = new URLSearchParams({
      shopId,
      offerId: offer.id,
      bidAmount: bidAmount.toString(),
      locale
    });
    router.push(`/payment?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{t.title}</h2>

      <div className="mb-6">
        <img
          src={offer.imageUrl}
          alt={offer.productName}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <h3 className="text-xl font-semibold mb-4">{offer.productName}</h3>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Your Bid
        </label>
        <input
          type="range"
          min={offer.sliderMin}
          max={offer.sliderMax}
          step="1"
          value={bidAmount}
          onChange={(e) => setBidAmount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>€{offer.sliderMin}</span>
          <span className="text-lg font-bold text-purple-600">
            €{bidAmount}
          </span>
          <span>€{offer.sliderMax}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{t.vat}</p>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
      >
        {t.submit}
      </button>
    </div>
  );
}
```

#### Payment Page

```typescript
// app/payment/page.tsx
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from '@/components/PaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage({
  searchParams
}: {
  searchParams: {
    shopId: string;
    offerId: string;
    bidAmount: string;
    locale: string;
  }
}) {
  const { shopId, offerId, bidAmount, locale } = searchParams;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <PaymentForm
          shopId={shopId}
          offerId={offerId}
          bidAmount={parseFloat(bidAmount)}
          locale={locale}
        />
      </div>
    </div>
  );
}
```

#### Payment Form Component

```typescript
// components/PaymentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({
  bidAmount,
  locale
}: {
  bidAmount: number;
  locale: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const translations = {
    en: {
      pay: `Pay €${bidAmount}`,
      processing: 'Processing...'
    },
    de: {
      pay: `€${bidAmount} bezahlen`,
      processing: 'Wird verarbeitet...'
    }
  };

  const t = translations[locale as 'en' | 'de'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?locale=${locale}`,
      },
    });

    if (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {isProcessing ? t.processing : t.pay}
      </button>

      <p className="text-xs text-center text-gray-500">
        Powered by Stripe
      </p>
    </form>
  );
}

export function PaymentForm({
  shopId,
  offerId,
  bidAmount,
  locale
}: {
  shopId: string;
  offerId: string;
  bidAmount: number;
  locale: string;
}) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId,
        offerId,
        bidAmount,
        locale
      })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm bidAmount={bidAmount} locale={locale} />
    </Elements>
  );
}
```

### Branding

#### myBidly Banner
- Display in top-left corner of widget
- Clean, modern logo design
- **Future**: Removable in paid tier (not implemented in MVP)

#### "Powered by Next Commerce" Footer
- Bottom of widget, centered
- Small text (12px)
- Links to https://www.next-commerce.io
- Always visible (not removable)

---

## Shop Owner Dashboard

### Pages

#### 1. Dashboard Home (`/dashboard`)

**Components:**
- Stats cards: Total Bids, Accepted, Declined, Revenue, Conversion Rate
- Recent bids table (last 10)
- Quick actions: Create offer, view embed code

#### 2. Offers Page (`/dashboard/offers`)

**Components:**
- List of all offers (should only be 1 in MVP)
- Create new offer button
- Edit/delete offer actions
- Stock quantity display with inline edit

#### 3. Create Offer Page (`/dashboard/offers/new`)

**Form Fields:**
1. Product Name (text input)
2. Product SKU (optional text input)
3. Product Image (file upload → Cloudinary/Vercel Blob)
4. Wholesale Price (EUR, number input)
5. Minimum Acceptable Bid (EUR, number input)
6. Initial Stock Quantity (number input)

**Auto-calculated Display:**
- Slider Min: [calculated]
- Slider Max: [calculated]
- Potential Profit per Sale: [minBid - wholesalePrice]

**Preview:**
- Live preview of widget with entered values

**Actions:**
- Save Offer
- Save & Generate Embed Code

#### 4. Embed Code Page (`/dashboard/embed`)

**Components:**
- Generated HTML snippet (copy-to-clipboard)
- Platform-specific instructions:
  - Shopify: Settings → Checkout → Order status page
  - WooCommerce: functions.php snippet
  - Custom: Add to thank-you page template
- Preview mode toggle (test widget before going live)

#### 5. Bids Page (`/dashboard/bids`)

**Components:**
- Filter tabs: All / Pending / Accepted / Declined
- Table columns:
  - Date/Time
  - Customer Email
  - Product Name
  - Bid Amount
  - Status (badge with color)
  - Actions (view details)
- Pagination
- Export to CSV (future feature)

#### 6. Bid Details Modal

**Components:**
- Customer name, email
- Shipping address
- Bid amount
- Product name, SKU
- Status timeline
- Stripe payment ID
- Created date
- Acceptance/decline date

---

## Auto-Acceptance Logic

### Process Flow

```
1. Customer submits bid → Payment processed via Stripe
2. Bid created with status='pending'
3. Immediate: Send bid confirmation email to customer
4. Schedule job: 10-20 min delay (random for human feel)
5. Job executes:
   a. Check: bid.bidAmount >= offer.minBid
   b. Check: offer.stockQuantity > 0
   c. IF both true:
      - Set bid.status = 'accepted'
      - Decrement offer.stockQuantity by 1
      - Send acceptance email to customer (DE/EN)
      - Send order notification to shop owner
   d. ELSE:
      - Set bid.status = 'declined'
      - Create Stripe refund
      - Send decline email to customer (DE/EN)
```

### Implementation: Scheduled Jobs

**Option 1: Vercel Cron Jobs** (Recommended for MVP)

```typescript
// app/api/cron/process-bids/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Find bids that are pending and created 10-20 min ago
  const now = new Date();
  const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000);
  const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const bidsToProcess = await prisma.bid.findMany({
    where: {
      status: 'pending',
      acceptanceEmailSentAt: null,
      createdAt: {
        gte: twentyMinAgo,
        lte: tenMinAgo
      }
    },
    include: {
      offer: true,
      shop: true
    }
  });

  for (const bid of bidsToProcess) {
    await processAcceptance(bid);
  }

  return Response.json({ processed: bidsToProcess.length });
}
```

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/process-bids",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Option 2: Database Trigger + Background Job** (Future optimization)

Use a queue system like BullMQ or Inngest for more precise timing.

### Acceptance Function

```typescript
// utils/processAcceptance.ts
export async function processAcceptance(bid: Bid & { offer: Offer; shop: Shop }) {
  const { offer, shop } = bid;

  // Check acceptance criteria
  const shouldAccept =
    bid.bidAmount >= offer.minBid &&
    offer.stockQuantity > 0;

  if (shouldAccept) {
    // Accept bid
    await prisma.bid.update({
      where: { id: bid.id },
      data: {
        status: 'accepted',
        acceptanceEmailSentAt: new Date()
      }
    });

    // Decrement stock
    await prisma.offer.update({
      where: { id: offer.id },
      data: {
        stockQuantity: { decrement: 1 }
      }
    });

    // Send emails
    await sendBidAccepted(bid, offer);
    await sendShopOwnerOrderNotification(shop, bid, offer);

  } else {
    // Decline bid
    await prisma.bid.update({
      where: { id: bid.id },
      data: {
        status: 'declined',
        acceptanceEmailSentAt: new Date()
      }
    });

    // Refund payment
    await stripe.refunds.create({
      payment_intent: bid.stripePaymentId
    });

    // Send decline email
    await sendBidDeclined(bid, offer);
  }
}
```

---

## Security & Compliance

### CORS Policy
- Widget endpoint (`/api/widget/offer`) must allow cross-origin requests
- Use `Access-Control-Allow-Origin: *` for widget API only
- All other endpoints require authentication

### Rate Limiting
- Implement rate limiting on bid creation (max 5 bids per IP per hour)
- Prevent spam bids and fraudulent activity

### EU VAT Compliance
- All prices include VAT
- Display "incl. VAT" / "inkl. MwSt." on widget
- Stripe handles VAT calculation based on customer location

### 14-Day Refund Policy (EU Law)
- **MVP**: Not enforced automatically
- **Post-MVP**: Allow customers to request refund within 14 days via email
- You handle refunds manually as merchant of record

### Data Privacy (GDPR)
- Collect minimal customer data: email, name, shipping address
- Privacy policy link in widget footer
- Data retention policy: Keep bid data for 2 years for accounting
- Allow customers to request data deletion

---

## Testing Checklist

### Pre-Feature QA Checklist (Before Starting Development)
- [ ] **Review Requirements**: Ensure all feature requirements are clearly defined
- [ ] **Identify Dependencies**: List all external services, APIs, or integrations needed
- [ ] **Database Changes**: Identify if schema changes are required
- [ ] **API Changes**: Document new or modified API endpoints
- [ ] **Environment Variables**: List any new env vars needed
- [ ] **Third-party Services**: Confirm all necessary accounts/credentials exist

### During Development QA Checklist
- [ ] **Database Migrations**:
  - [ ] Prisma schema updated with new fields/models
  - [ ] Migration created (`npx prisma migrate dev --name <migration_name>`)
  - [ ] Migration applied to database
  - [ ] Prisma client regenerated (`npx prisma generate`)
  - [ ] Test data seeded if needed
  - [ ] Verify no data loss warnings addressed

- [ ] **API Integrations**:
  - [ ] API keys/secrets added to `.env.local`
  - [ ] API endpoints tested with Postman/curl
  - [ ] Error handling implemented for API failures
  - [ ] Rate limiting considered
  - [ ] Webhooks configured if needed (e.g., Stripe)

- [ ] **Type Safety**:
  - [ ] TypeScript interfaces/types defined
  - [ ] No `any` types unless absolutely necessary
  - [ ] Prisma types match component props
  - [ ] JSON fields properly serialized for Client Components

- [ ] **Component Data Flow**:
  - [ ] Server Components don't pass Prisma objects directly to Client Components
  - [ ] JSON.parse(JSON.stringify()) used for JSON fields when needed
  - [ ] Decimal fields converted to numbers for Client Components
  - [ ] Date objects serialized properly

### Post-Feature QA Checklist (Before Marking Complete)
- [ ] **Functionality Testing**:
  - [ ] Feature works in development environment
  - [ ] All CRUD operations tested (Create, Read, Update, Delete)
  - [ ] Edge cases handled (null values, empty states, max limits)
  - [ ] Error messages are user-friendly

- [ ] **Integration Verification**:
  - [ ] All third-party services responding correctly
  - [ ] Webhooks receiving and processing events
  - [ ] Email notifications sent successfully
  - [ ] Payment processing working end-to-end

- [ ] **Database Integrity**:
  - [ ] Run `npx prisma migrate status` to verify migrations
  - [ ] Check database for orphaned records
  - [ ] Verify foreign key constraints working
  - [ ] Test cascade deletes if applicable

- [ ] **Performance**:
  - [ ] Page load time acceptable (<3s)
  - [ ] No N+1 query problems
  - [ ] Images optimized and loading properly
  - [ ] API responses under 500ms for simple queries

- [ ] **Security**:
  - [ ] Authentication required for protected routes
  - [ ] Authorization checks in place (user can only access own data)
  - [ ] No sensitive data exposed in API responses
  - [ ] Environment variables not committed to git

### Unit Tests
- [ ] Bid amount validation
- [ ] Slider range calculation (20% below, 55% above)
- [ ] Stock decrement logic
- [ ] Acceptance criteria logic

### Integration Tests
- [ ] Shop registration flow
- [ ] Offer creation and slider auto-calculation
- [ ] Widget loads correctly with valid shopId
- [ ] Payment intent creation
- [ ] Stripe webhook handling
- [ ] Email sending (all 5 templates)
- [ ] Auto-acceptance cron job

### End-to-End Tests
- [ ] Full customer journey: View widget → Bid → Pay → Receive confirmation
- [ ] Shop owner creates offer → Gets embed code → Sees bid in dashboard
- [ ] Bid acceptance flow: Payment → 10-20 min wait → Customer gets acceptance email → Shop owner gets order notification
- [ ] Bid decline flow: Payment → Auto-decline → Customer gets refund email
- [ ] Stock management: Accept bid → Stock decrements → Widget hides when stock = 0

### Manual Testing
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test widget in iframe on external domain
- [ ] Test German and English translations
- [ ] Test Stripe Payment Element with test cards
- [ ] Test email delivery and rendering in multiple clients (Gmail, Outlook, Apple Mail)
- [ ] Test dashboard on different screen sizes

### Common Issues Checklist (Based on Past Errors)
- [ ] **JSON Field Serialization**: JSON fields from Prisma converted before passing to Client Components
- [ ] **Decimal to Number**: Prisma Decimal fields converted to numbers in API responses
- [ ] **Migration Status**: Always run `npx prisma migrate status` after schema changes
- [ ] **Prisma Client Sync**: Run `npx prisma generate` after any schema changes
- [ ] **Auth Session**: Verify auth session works on all protected pages
- [ ] **CORS Settings**: Widget API allows cross-origin requests
- [ ] **Environment Variables**: All required env vars present in `.env.local` and Vercel
- [ ] **Unique Constraints**: Check for duplicate data before adding unique constraints
- [ ] **Manual Capture**: Stripe payment intents use correct capture method (manual vs automatic)

---

## Deployment Guide

### Prerequisites
1. Domain name (e.g., bidly.com)
2. Vercel account (or alternative hosting)
3. Supabase account (database)
4. Stripe account (EU-enabled)
5. Resend account (email)
6. Cloudinary account (image hosting)

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://bidly.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend
RESEND_API_KEY="re_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Cron Job Security
CRON_SECRET="random-secret-string"

# App Config
NEXT_PUBLIC_APP_URL="https://bidly.com"
```

### Deployment Steps

1. **Database Setup**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

3. **Configure Stripe Webhooks**
   - Add webhook endpoint: `https://bidly.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy webhook secret to env vars

4. **Configure Cron Jobs**
   - Ensure `vercel.json` includes cron configuration
   - Verify cron job runs every 5 minutes

5. **DNS Configuration**
   - Point domain to Vercel
   - Set up SSL certificate (automatic with Vercel)

6. **Test Production**
   - Create test shop owner account
   - Create test offer
   - Embed widget on test page
   - Complete test purchase with Stripe test card
   - Verify emails received
   - Verify bid appears in dashboard

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up Prisma with PostgreSQL
- [ ] Create database schema
- [ ] Implement authentication (Clerk/NextAuth)

### Phase 2: Shop Owner Dashboard (Week 2)
- [ ] Build registration/login pages
- [ ] Create dashboard layout
- [ ] Build offer creation form with image upload
- [ ] Implement auto-calculation for slider range
- [ ] Generate embed code snippet
- [ ] Display stats and bid history

### Phase 3: Widget & Payment (Week 3)
- [ ] Build embeddable widget page
- [ ] Create widget.js loader script
- [ ] Implement bid slider interface
- [ ] Build payment page with Stripe Payment Element
- [ ] Collect shipping address in payment flow
- [ ] Test iframe embedding on external site

### Phase 4: Backend Logic (Week 4)
- [ ] Create API endpoints (offers, bids, widget)
- [ ] Implement Stripe payment intent creation
- [ ] Set up webhook handling
- [ ] Build auto-acceptance cron job
- [ ] Implement stock management logic
- [ ] Add refund processing

### Phase 5: Email System (Week 5)
- [ ] Set up Resend integration
- [ ] Create all 5 email templates (EN/DE)
- [ ] Implement email sending functions
- [ ] Test email delivery and rendering
- [ ] Implement locale detection

### Phase 6: Testing & Polish (Week 6)
- [ ] Comprehensive testing (unit, integration, E2E)
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Deploy to production

### Phase 7: Launch (Week 7)
- [ ] Pilot with 3-5 test shops
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Create landing page
- [ ] Launch publicly

---

## Post-MVP Roadmap

### Feedback Collection
- Add feedback form in dashboard
- Track widget conversion rates
- Monitor bid acceptance rates
- Collect shop owner testimonials

### Feature Priorities (Based on Feedback)

**Tier 1: Essential for Scale**
- [ ] Freemium limits enforcement (5 bids/month or €50 cap)
- [ ] Billing system for paid tier
- [ ] Remove "myBidly" banner for paid users
- [ ] Multiple offers per shop
- [ ] Category-based product matching

**Tier 2: Growth Features**
- [ ] A/B testing for slider ranges
- [ ] Advanced analytics dashboard (charts, timeline)
- [ ] Shopify app integration (automatic order data sync)
- [ ] WooCommerce plugin
- [ ] Automated shop owner payouts (Stripe Connect)

**Tier 3: Optimization**
- [ ] Machine learning for optimal bid ranges
- [ ] Custom branding options for shops
- [ ] White-label solution for larger clients
- [ ] API for programmatic access
- [ ] Zapier/Make.com integration

---

## Success Metrics

### Week 1-2 (Pilot Phase)
- 3-5 shops onboarded
- 20+ bids received
- 60%+ acceptance rate
- No critical bugs

### Month 1
- 20+ active shops
- 100+ bids processed
- €2,000+ in total bid value
- 5+ shop owner testimonials

### Month 3
- 100+ active shops
- 1,000+ bids processed
- €20,000+ in total bid value
- 70%+ acceptance rate
- Organic acquisition via "Powered by Next Commerce" branding

### Month 6
- 500+ active shops
- 10,000+ bids processed
- €200,000+ in total bid value
- Launch freemium limits and paid tier
- 50+ paying customers

---

## Support & Maintenance

### Customer Support Channels
- Email: support@bidly.com
- Dashboard help widget (Intercom/Crisp in future)
- Documentation site (future)

### Monitoring
- Error tracking: Sentry
- Performance monitoring: Vercel Analytics
- Uptime monitoring: Better Uptime or UptimeRobot

### Maintenance Tasks
- Weekly: Review bid acceptance rates, check for anomalies
- Monthly: Database backup verification, security updates
- Quarterly: Review and optimize cron job performance

---

## File Structure

```
bidly/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx (stats overview)
│   │   │   ├── offers/
│   │   │   │   ├── page.tsx (list offers)
│   │   │   │   └── new/page.tsx (create offer)
│   │   │   ├── bids/page.tsx (bid history)
│   │   │   └── embed/page.tsx (embed code)
│   │   └── layout.tsx
│   ├── widget/
│   │   └── page.tsx (embeddable widget)
│   ├── payment/
│   │   └── page.tsx (Stripe payment)
│   ├── success/
│   │   └── page.tsx (post-payment success)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── offers/
│   │   │   ├── route.ts (GET, POST)
│   │   │   └── [id]/
│   │   │       ├── route.ts (PATCH, DELETE)
│   │   │       └── stock/route.ts
│   │   ├── bids/
│   │   │   ├── route.ts (POST - create bid)
│   │   │   └── [id]/route.ts
│   │   ├── dashboard/
│   │   │   ├── stats/route.ts
│   │   │   └── bids/route.ts
│   │   ├── widget/
│   │   │   └── offer/route.ts (public)
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts
│   │   └── cron/
│   │       └── process-bids/route.ts
│   └── layout.tsx
├── components/
│   ├── BidWidget.tsx
│   ├── PaymentForm.tsx
│   ├── OfferForm.tsx
│   ├── StatsCard.tsx
│   ├── BidTable.tsx
│   └── EmbedCodeSnippet.tsx
├── lib/
│   ├── prisma.ts
│   ├── stripe.ts
│   └── auth.ts
├── utils/
│   ├── email.ts
│   ├── processAcceptance.ts
│   └── calculations.ts
├── prisma/
│   └── schema.prisma
├── public/
│   ├── widget.js (embeddable loader)
│   └── logo-banner.png
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json (cron config)
└── package.json
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.14.0",
    "prisma": "^5.14.0",
    "@stripe/stripe-js": "^3.3.0",
    "@stripe/react-stripe-js": "^2.7.0",
    "stripe": "^15.5.0",
    "resend": "^3.2.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8",
    "react-hook-form": "^7.51.5",
    "@headlessui/react": "^2.0.4",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.2",
    "typescript": "^5.4.5",
    "tailwindcss": "^3.4.3",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
```

---

## Critical Notes

### DO NOT Forget
1. **Email locale detection**: Always pass `bid.locale` and use correct template
2. **Stock validation**: Check stock BEFORE accepting bid
3. **Refund on decline**: Always issue Stripe refund for declined bids
4. **10-20 min delay**: Implement random delay for human feel
5. **EUR only**: All prices in EUR, no currency conversion
6. **Shipping address**: Must collect during payment, send to shop owner
7. **Widget CORS**: Enable cross-origin for `/api/widget/offer` endpoint
8. **Branding**: "myBidly" banner + "Powered by Next Commerce" footer

### MVP Philosophy
- **Simple**: 5-step setup, no IT knowledge required
- **Lovable**: Beautiful UI, instant preview, delightful experience
- **Complete**: Real payments, email confirmations, functional from day one
- **Iterate**: Launch with real users, gather feedback, improve rapidly

---

## Questions & Decisions Log

| Question | Decision | Rationale |
|----------|----------|-----------|
| Auto-accept or manual review? | Auto-accept | Simpler, faster, scales better |
| Stock tracking needed? | Yes, from day one | Physical products require it |
| Test mode for widget? | Preview + instructions | Balance between simplicity and safety |
| Dashboard analytics? | Total/accepted/declined bids, revenue, conversion | Minimum viable insights |
| Payment flow? | Stripe Payment Element | Better UX, stays on page |
| Brand name? | myBidly | Confirmed |
| Removable branding? | Paid tier (plan, not build) | Future monetization |
| Email timing? | 10-20 min delay | Human feel |
| Shipping address? | Collect during payment | Independent from original order |
| Decline reason? | Generic message | Simple, no over-explanation needed |
| Language switching? | Auto-detect browser locale | Seamless UX |
| Freemium limits? | Skip for MVP | Launch faster, track for future |

---

## Contact & Collaboration

**Project Owner**: Next Commerce
**Website**: https://www.next-commerce.io
**Email**: hello@next-commerce.io

---

*Last Updated: 2026-02-25*
*Version: 1.0 (MVP Specification)*
