# Next.js 14+ App Router - Best Practices

## Overview

This skill covers Next.js 14+ App Router patterns, Server vs Client Components, API routes, and best practices for building the Justfouryou application.

---

## Project Setup

### Initialize Next.js Project

```bash
npx create-next-app@latest justfouryou --typescript --tailwind --app --no-src-dir
cd justfouryou
```

### Recommended Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // For Cloudinary images
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

### Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## File Structure

```
app/
├── (auth)/                    # Route group (no URL segment)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx             # Auth-specific layout
├── (dashboard)/               # Route group for authenticated pages
│   ├── dashboard/
│   │   ├── page.tsx           # /dashboard
│   │   ├── offers/
│   │   │   ├── page.tsx       # /dashboard/offers
│   │   │   └── new/
│   │   │       └── page.tsx   # /dashboard/offers/new
│   │   ├── bids/
│   │   │   └── page.tsx       # /dashboard/bids
│   │   └── embed/
│   │       └── page.tsx       # /dashboard/embed
│   └── layout.tsx             # Dashboard layout (sidebar, nav)
├── widget/
│   └── page.tsx               # Public widget page
├── payment/
│   └── page.tsx               # Payment page
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts       # NextAuth API routes
│   ├── offers/
│   │   └── route.ts           # GET, POST /api/offers
│   └── bids/
│       └── route.ts           # POST /api/bids
├── layout.tsx                 # Root layout
├── loading.tsx                # Root loading UI
├── error.tsx                  # Root error UI
└── not-found.tsx              # 404 page
```

---

## Server vs Client Components

### Default: Server Components

**All components are Server Components by default** unless you add `'use client'`.

**Benefits:**
- Zero JavaScript shipped to browser
- Direct database access
- Better SEO
- Faster initial load

**Use for:**
- Layouts
- Static pages
- Data fetching
- Dashboard pages showing data

**Example:**
```typescript
// app/dashboard/page.tsx (Server Component - no 'use client')
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { StatsCard } from '@/components/StatsCard'

export default async function DashboardPage() {
  const session = await getServerSession()

  // Direct database query in Server Component
  const stats = await prisma.bid.groupBy({
    by: ['status'],
    where: { shopId: session.user.shopId },
    _count: true,
    _sum: { bidAmount: true }
  })

  return (
    <div>
      <h1>Dashboard</h1>
      <StatsCard stats={stats} />
    </div>
  )
}
```

### Client Components

Add `'use client'` at the top when you need:
- useState, useEffect, useContext
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Third-party libraries that use hooks

**Example:**
```typescript
// components/BidWidget.tsx (Client Component)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BidWidget({ offer }: { offer: Offer }) {
  const [bidAmount, setBidAmount] = useState(offer.minBid)
  const router = useRouter()

  const handleSubmit = () => {
    router.push(`/payment?amount=${bidAmount}`)
  }

  return (
    <div>
      <input
        type="range"
        value={bidAmount}
        onChange={(e) => setBidAmount(Number(e.target.value))}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )
}
```

### Composition Pattern (Best Practice)

Keep most of the component tree as Server Components, only make interactive parts Client Components.

```typescript
// app/dashboard/offers/page.tsx (Server Component)
import { prisma } from '@/lib/prisma'
import { OfferForm } from '@/components/OfferForm' // Client Component

export default async function OffersPage() {
  const offers = await prisma.offer.findMany() // Server-side data fetch

  return (
    <div>
      <h1>Offers</h1>
      {/* Server Component rendering */}
      <ul>
        {offers.map(offer => (
          <li key={offer.id}>{offer.productName}</li>
        ))}
      </ul>

      {/* Client Component for interactivity */}
      <OfferForm />
    </div>
  )
}
```

---

## Data Fetching

### Async Server Components (Recommended)

```typescript
// app/dashboard/bids/page.tsx
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function BidsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const bids = await prisma.bid.findMany({
    where: { shopId: session.user.shopId },
    include: { offer: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <h1>Bids</h1>
      {bids.map(bid => (
        <div key={bid.id}>
          {bid.customerEmail} - €{bid.bidAmount}
        </div>
      ))}
    </div>
  )
}
```

### Parallel Data Fetching

```typescript
// Fetch multiple data sources in parallel
export default async function DashboardPage() {
  const [stats, recentBids, offers] = await Promise.all([
    prisma.bid.groupBy({ /* ... */ }),
    prisma.bid.findMany({ take: 10 }),
    prisma.offer.findMany()
  ])

  return <div>{/* Use all data */}</div>
}
```

### Client-Side Fetching (when needed)

```typescript
// components/BidList.tsx
'use client'

import { useEffect, useState } from 'react'

export function BidList() {
  const [bids, setBids] = useState([])

  useEffect(() => {
    fetch('/api/bids')
      .then(r => r.json())
      .then(data => setBids(data.bids))
  }, [])

  return (
    <ul>
      {bids.map(bid => <li key={bid.id}>{bid.customerEmail}</li>)}
    </ul>
  )
}
```

---

## API Routes

### Basic Route Handler

```typescript
// app/api/offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// GET /api/offers
export async function GET(request: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const offers = await prisma.offer.findMany({
    where: { shopId: session.user.shopId }
  })

  return NextResponse.json({ success: true, offers })
}

// POST /api/offers
export async function POST(request: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Validate with Zod (see typescript-patterns.md)
  const { productName, wholesalePrice, minBid, stockQuantity } = body

  // Auto-calculate slider range
  const sliderMin = minBid * 0.80
  const sliderMax = minBid * 1.55

  const offer = await prisma.offer.create({
    data: {
      shopId: session.user.shopId,
      productName,
      wholesalePrice,
      minBid,
      sliderMin,
      sliderMax,
      stockQuantity,
      imageUrl: body.imageUrl
    }
  })

  return NextResponse.json({ success: true, offer }, { status: 201 })
}
```

### Dynamic Route Handler

```typescript
// app/api/offers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/offers/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await request.json()

  const offer = await prisma.offer.update({
    where: { id },
    data: body
  })

  return NextResponse.json({ success: true, offer })
}

// DELETE /api/offers/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.offer.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
```

### Error Handling

```typescript
// app/api/bids/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate
    if (!body.bidAmount || body.bidAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid bid amount' },
        { status: 400 }
      )
    }

    // Process bid...
    const bid = await prisma.bid.create({ data: body })

    return NextResponse.json({ success: true, bid })

  } catch (error) {
    console.error('Bid creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### CORS for Widget Endpoint

```typescript
// app/api/widget/offer/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const shopId = request.nextUrl.searchParams.get('shopId')

  const offer = await prisma.offer.findFirst({
    where: { shopId, isActive: true, stockQuantity: { gt: 0 } }
  })

  if (!offer) {
    return NextResponse.json({ error: 'No offer found' }, { status: 404 })
  }

  // Enable CORS for embeddable widget
  const response = NextResponse.json({ success: true, offer })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')

  return response
}

// Handle preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

---

## Layouts

### Root Layout (Required)

```typescript
// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Justfouryou - Bid-Based Upsells',
  description: 'Post-purchase upsell platform for e-commerce',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### Dashboard Layout

```typescript
// app/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
```

---

## Loading & Error States

### Loading UI

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  )
}
```

### Error UI

```typescript
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Try again
      </button>
    </div>
  )
}
```

### Not Found

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-gray-600 mb-4">Page not found</p>
      <Link href="/" className="text-purple-600 hover:underline">
        Go home
      </Link>
    </div>
  )
}
```

---

## Navigation

### Link Component

```typescript
import Link from 'next/link'

export function Sidebar() {
  return (
    <nav>
      <Link
        href="/dashboard"
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Dashboard
      </Link>
      <Link
        href="/dashboard/offers"
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Offers
      </Link>
      <Link
        href="/dashboard/bids"
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Bids
      </Link>
    </nav>
  )
}
```

### Programmatic Navigation

```typescript
'use client'

import { useRouter } from 'next/navigation'

export function OfferForm() {
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Save offer...
    router.push('/dashboard/offers')
    router.refresh() // Refresh server components
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## Search Params

### Server Component

```typescript
// app/dashboard/bids/page.tsx
export default async function BidsPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const status = searchParams.status || 'all'

  const bids = await prisma.bid.findMany({
    where: status !== 'all' ? { status } : undefined
  })

  return <div>{/* ... */}</div>
}
```

### Client Component

```typescript
'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export function BidFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const currentStatus = searchParams.get('status') || 'all'

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('status', status)
    router.push(`?${params.toString()}`)
  }

  return (
    <div>
      <button onClick={() => handleFilterChange('all')}>All</button>
      <button onClick={() => handleFilterChange('accepted')}>Accepted</button>
      <button onClick={() => handleFilterChange('declined')}>Declined</button>
    </div>
  )
}
```

---

## Metadata

### Static Metadata

```typescript
// app/dashboard/offers/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offers | Justfouryou',
  description: 'Manage your product offers',
}

export default function OffersPage() {
  return <div>...</div>
}
```

### Dynamic Metadata

```typescript
// app/dashboard/offers/[id]/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const offer = await prisma.offer.findUnique({
    where: { id: params.id }
  })

  return {
    title: `${offer?.productName} | Justfouryou`,
    description: `Edit ${offer?.productName}`,
  }
}

export default function OfferEditPage({ params }: { params: { id: string } }) {
  return <div>...</div>
}
```

---

## Revalidation & Caching

### Static Generation (Default)

```typescript
// Cached indefinitely by default
export default async function OffersPage() {
  const offers = await prisma.offer.findMany()
  return <div>...</div>
}
```

### Revalidate After Time

```typescript
// Revalidate every 60 seconds
export const revalidate = 60

export default async function DashboardPage() {
  const stats = await prisma.bid.groupBy({ /* ... */ })
  return <div>...</div>
}
```

### Dynamic Rendering (No Cache)

```typescript
// Force dynamic rendering (useful for real-time data)
export const dynamic = 'force-dynamic'

export default async function BidsPage() {
  const bids = await prisma.bid.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return <div>...</div>
}
```

### Manual Revalidation

```typescript
// app/api/offers/route.ts
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const offer = await prisma.offer.create({ /* ... */ })

  // Revalidate the offers page
  revalidatePath('/dashboard/offers')

  return NextResponse.json({ success: true, offer })
}
```

---

## Route Groups

Use `(folder)` to organize routes without affecting URL:

```
app/
├── (auth)/
│   ├── login/page.tsx          → /login
│   ├── register/page.tsx       → /register
│   └── layout.tsx              → Layout for auth pages only
└── (dashboard)/
    ├── dashboard/page.tsx      → /dashboard
    └── layout.tsx              → Layout for dashboard pages only
```

---

## Best Practices

### ✅ DO

1. **Use Server Components by default** - Only add `'use client'` when necessary
2. **Fetch data in Server Components** - Direct database access, better performance
3. **Compose Client Components inside Server Components** - Keep interactivity minimal
4. **Use route groups** - Organize code without affecting URLs
5. **Implement loading.tsx and error.tsx** - Better UX
6. **Validate API inputs** - Use Zod schemas (see typescript-patterns.md)
7. **Handle errors gracefully** - Try-catch in API routes
8. **Use revalidatePath()** - After mutations to refresh data

### ❌ DON'T

1. **Don't make everything a Client Component** - Bloats bundle size
2. **Don't fetch data in Client Components** - Use Server Components instead
3. **Don't import Server Components into Client Components** - Won't work
4. **Don't forget authentication checks** - Validate session in API routes
5. **Don't hardcode URLs** - Use environment variables
6. **Don't skip error boundaries** - Handle errors at appropriate levels

---

## Common Patterns

### Protected Page

```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  // Rest of page...
}
```

### Form Submission (Server Action)

```typescript
// app/dashboard/offers/new/page.tsx
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function createOffer(formData: FormData) {
  'use server'

  const productName = formData.get('productName') as string
  const wholesalePrice = parseFloat(formData.get('wholesalePrice') as string)

  await prisma.offer.create({
    data: {
      productName,
      wholesalePrice,
      // ...
    }
  })

  redirect('/dashboard/offers')
}

export default function NewOfferPage() {
  return (
    <form action={createOffer}>
      <input name="productName" required />
      <input name="wholesalePrice" type="number" required />
      <button type="submit">Create Offer</button>
    </form>
  )
}
```

### Streaming UI

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

async function Stats() {
  const stats = await prisma.bid.groupBy({ /* ... */ })
  return <div>{/* Stats cards */}</div>
}

async function RecentBids() {
  const bids = await prisma.bid.findMany({ take: 10 })
  return <div>{/* Bid list */}</div>
}

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />
      </Suspense>

      <Suspense fallback={<div>Loading bids...</div>}>
        <RecentBids />
      </Suspense>
    </div>
  )
}
```

---

## Deployment (Vercel)

### vercel.json

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

### Environment Variables

Set in Vercel Dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- etc.

---

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
