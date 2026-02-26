# TypeScript Patterns - Best Practices

## Overview

This skill covers TypeScript best practices for the Justfouryou application, including type safety, validation with Zod, API types, and common patterns.

---

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Key Settings:**
- `strict: true` - Enable all strict type checking
- `paths` - Use `@/` for absolute imports
- `noEmit: true` - Next.js handles compilation

---

## Type Definitions

### Global Types

```typescript
// types/index.ts

// Database models (inferred from Prisma)
import { Prisma } from '@prisma/client'

export type Shop = Prisma.ShopGetPayload<{}>
export type Offer = Prisma.OfferGetPayload<{}>
export type Bid = Prisma.BidGetPayload<{}>

// Models with relations
export type OfferWithBids = Prisma.OfferGetPayload<{
  include: { bids: true }
}>

export type BidWithOffer = Prisma.BidGetPayload<{
  include: { offer: true }
}>

export type BidWithRelations = Prisma.BidGetPayload<{
  include: {
    offer: true
    shop: true
  }
}>

// Bid status enum
export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined'
}

// Locale enum
export enum Locale {
  EN = 'en',
  DE = 'de'
}

// Shipping address type
export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// Dashboard stats
export interface DashboardStats {
  totalBids: number
  acceptedBids: number
  declinedBids: number
  totalRevenue: number
  conversionRate: number
}

// Widget config
export interface WidgetConfig {
  shopId: string
  locale?: Locale
}

// Offer form data
export interface OfferFormData {
  productName: string
  productSku?: string
  imageUrl: string
  wholesalePrice: number
  minBid: number
  stockQuantity: number
}

// Bid creation data
export interface BidCreateData {
  shopId: string
  offerId: string
  customerEmail: string
  customerName: string
  shippingAddress: ShippingAddress
  bidAmount: number
  locale: Locale
}
```

---

## Zod Validation

### Installation

```bash
npm install zod
```

### Schema Definitions

```typescript
// lib/validations.ts
import { z } from 'zod'

// Shop registration schema
export const shopRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  shopName: z
    .string()
    .min(2, 'Shop name must be at least 2 characters')
    .max(100, 'Shop name must be less than 100 characters')
})

export type ShopRegisterInput = z.infer<typeof shopRegisterSchema>

// Shop login schema
export const shopLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export type ShopLoginInput = z.infer<typeof shopLoginSchema>

// Offer creation schema
export const offerCreateSchema = z.object({
  productName: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name must be less than 200 characters'),
  productSku: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  wholesalePrice: z
    .number()
    .positive('Wholesale price must be positive')
    .multipleOf(0.01, 'Invalid price format'),
  minBid: z
    .number()
    .positive('Minimum bid must be positive')
    .multipleOf(0.01, 'Invalid price format'),
  stockQuantity: z
    .number()
    .int('Stock quantity must be a whole number')
    .nonnegative('Stock quantity cannot be negative')
})
.refine((data) => data.minBid >= data.wholesalePrice, {
  message: 'Minimum bid must be greater than or equal to wholesale price',
  path: ['minBid']
})

export type OfferCreateInput = z.infer<typeof offerCreateSchema>

// Bid creation schema
export const bidCreateSchema = z.object({
  shopId: z.string().cuid('Invalid shop ID'),
  offerId: z.string().cuid('Invalid offer ID'),
  customerEmail: z.string().email('Invalid email address'),
  customerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  shippingAddress: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().length(2, 'Country must be 2-letter code')
  }),
  bidAmount: z
    .number()
    .positive('Bid amount must be positive')
    .multipleOf(0.01, 'Invalid bid format'),
  locale: z.enum(['en', 'de'])
})

export type BidCreateInput = z.infer<typeof bidCreateSchema>

// Stock update schema
export const stockUpdateSchema = z.object({
  stockQuantity: z
    .number()
    .int('Stock quantity must be a whole number')
    .nonnegative('Stock quantity cannot be negative')
})

export type StockUpdateInput = z.infer<typeof stockUpdateSchema>

// Query params schema
export const bidFilterSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined', 'all']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
})

export type BidFilterInput = z.infer<typeof bidFilterSchema>
```

### Using Zod in API Routes

```typescript
// app/api/offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { offerCreateSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate with Zod
    const validationResult = offerCreateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Auto-calculate slider range
    const sliderMin = data.minBid * 0.80
    const sliderMax = data.minBid * 1.55

    const offer = await prisma.offer.create({
      data: {
        shopId: session.user.shopId,
        productName: data.productName,
        productSku: data.productSku,
        imageUrl: data.imageUrl,
        wholesalePrice: data.wholesalePrice,
        minBid: data.minBid,
        sliderMin,
        sliderMax,
        stockQuantity: data.stockQuantity,
        isActive: true
      }
    })

    return NextResponse.json(
      { success: true, data: offer },
      { status: 201 }
    )

  } catch (error) {
    console.error('Offer creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Using Zod in Client Components

```typescript
// components/OfferForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { offerCreateSchema, type OfferCreateInput } from '@/lib/validations'

export function OfferForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<OfferCreateInput>({
    resolver: zodResolver(offerCreateSchema)
  })

  const onSubmit = async (data: OfferCreateInput) => {
    const response = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (response.ok) {
      // Handle success
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Product Name</label>
        <input {...register('productName')} />
        {errors.productName && (
          <p className="text-red-600 text-sm">{errors.productName.message}</p>
        )}
      </div>

      <div>
        <label>Wholesale Price (€)</label>
        <input
          type="number"
          step="0.01"
          {...register('wholesalePrice', { valueAsNumber: true })}
        />
        {errors.wholesalePrice && (
          <p className="text-red-600 text-sm">{errors.wholesalePrice.message}</p>
        )}
      </div>

      <div>
        <label>Minimum Bid (€)</label>
        <input
          type="number"
          step="0.01"
          {...register('minBid', { valueAsNumber: true })}
        />
        {errors.minBid && (
          <p className="text-red-600 text-sm">{errors.minBid.message}</p>
        )}
      </div>

      <div>
        <label>Stock Quantity</label>
        <input
          type="number"
          {...register('stockQuantity', { valueAsNumber: true })}
        />
        {errors.stockQuantity && (
          <p className="text-red-600 text-sm">{errors.stockQuantity.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        {isSubmitting ? 'Creating...' : 'Create Offer'}
      </button>
    </form>
  )
}
```

---

## API Response Helpers

### Utility Functions

```typescript
// lib/api-response.ts
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: error.flatten().fieldErrors
    },
    { status: 400 }
  )
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}

export function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  )
}

export function serverErrorResponse(error: unknown) {
  console.error('Server error:', error)
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Usage in API Routes

```typescript
// app/api/offers/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse
} from '@/lib/api-response'
import { stockUpdateSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validationResult = stockUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error)
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.id }
    })

    if (!offer) {
      return notFoundResponse('Offer not found')
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: params.id },
      data: validationResult.data
    })

    return successResponse(updatedOffer)

  } catch (error) {
    return serverErrorResponse(error)
  }
}
```

---

## Type Guards

### Custom Type Guards

```typescript
// lib/type-guards.ts

export function isValidBidStatus(status: string): status is BidStatus {
  return ['pending', 'accepted', 'declined'].includes(status)
}

export function isValidLocale(locale: string): locale is Locale {
  return ['en', 'de'].includes(locale)
}

export function isShippingAddress(obj: any): obj is ShippingAddress {
  return (
    typeof obj === 'object' &&
    typeof obj.line1 === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.postalCode === 'string' &&
    typeof obj.country === 'string'
  )
}

// Usage
function processBid(bid: Bid) {
  if (isValidBidStatus(bid.status)) {
    // TypeScript knows bid.status is BidStatus
    switch (bid.status) {
      case BidStatus.ACCEPTED:
        // ...
        break
      case BidStatus.DECLINED:
        // ...
        break
    }
  }
}
```

---

## Utility Types

### Common Utility Types

```typescript
// types/utils.ts

// Make all properties optional
export type PartialOffer = Partial<Offer>

// Pick specific properties
export type OfferSummary = Pick<Offer, 'id' | 'productName' | 'minBid'>

// Omit specific properties
export type OfferWithoutDates = Omit<Offer, 'createdAt' | 'updatedAt'>

// Make specific properties required
export type RequiredShopEmail = Required<Pick<Shop, 'email'>>

// Make specific properties readonly
export type ReadonlyOffer = Readonly<Offer>

// Nullable type
export type NullableOffer = Offer | null

// Array type
export type Offers = Offer[]

// Promise type
export type OfferPromise = Promise<Offer>

// Function type
export type CreateOfferFn = (data: OfferCreateInput) => Promise<Offer>

// Extract keys
export type OfferKeys = keyof Offer

// Extract value types
export type OfferValues = Offer[keyof Offer]
```

### Custom Utility Types

```typescript
// types/utils.ts

// API endpoint return type
export type ApiEndpoint<TInput, TOutput> = (
  input: TInput
) => Promise<ApiResponse<TOutput>>

// Form field type
export type FormField<T> = {
  value: T
  error?: string
  touched: boolean
}

// Async state
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

// Usage
const [bidState, setBidState] = useState<AsyncState<Bid>>({ status: 'idle' })

if (bidState.status === 'success') {
  console.log(bidState.data) // TypeScript knows data exists
}
```

---

## Generics

### Generic Functions

```typescript
// lib/utils.ts

// Generic fetch wrapper with type safety
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

// Usage
const offers = await fetchApi<Offer[]>('/api/offers')
const stats = await fetchApi<DashboardStats>('/api/dashboard/stats')

// Generic array filter
export function filterByStatus<T extends { status: string }>(
  items: T[],
  status: string
): T[] {
  return items.filter(item => item.status === status)
}

// Usage
const acceptedBids = filterByStatus(bids, 'accepted')
const activeOffers = filterByStatus(offers, 'active')
```

### Generic Components

```typescript
// components/Table.tsx
interface TableProps<T> {
  data: T[]
  columns: {
    key: keyof T
    label: string
    render?: (value: T[keyof T], row: T) => React.ReactNode
  }[]
}

export function Table<T extends { id: string }>({
  data,
  columns
}: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render
                  ? col.render(row[col.key], row)
                  : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Usage
<Table<Bid>
  data={bids}
  columns={[
    { key: 'customerEmail', label: 'Email' },
    { key: 'bidAmount', label: 'Amount', render: (val) => `€${val}` },
    { key: 'status', label: 'Status' }
  ]}
/>
```

---

## Async/Await Patterns

### Type-Safe Async Functions

```typescript
// lib/bids.ts
import { Bid, BidCreateInput } from '@/types'
import { prisma } from '@/lib/prisma'

export async function createBid(
  data: BidCreateInput
): Promise<Bid> {
  const offer = await prisma.offer.findUnique({
    where: { id: data.offerId }
  })

  if (!offer) {
    throw new Error('Offer not found')
  }

  if (offer.stockQuantity === 0) {
    throw new Error('Out of stock')
  }

  const bid = await prisma.bid.create({
    data: {
      ...data,
      status: 'pending',
      stripePaymentId: 'temp' // Will be updated after payment
    }
  })

  return bid
}

export async function getBidsByShop(
  shopId: string,
  filters?: { status?: string }
): Promise<Bid[]> {
  return await prisma.bid.findMany({
    where: {
      shopId,
      ...(filters?.status && { status: filters.status })
    },
    orderBy: { createdAt: 'desc' }
  })
}
```

### Error Handling with Types

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

// Usage in API route
import { ApiError, NotFoundError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: params.id }
    })

    if (!offer) {
      throw new NotFoundError('Offer not found')
    }

    return successResponse(offer)

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return serverErrorResponse(error)
  }
}
```

---

## Environment Variables

### Type-Safe Environment Variables

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CRON_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

// Validate environment variables at build time
const env = envSchema.parse(process.env)

export default env

// Usage
import env from '@/lib/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)
```

---

## Best Practices

### ✅ DO

1. **Enable strict mode** - Catch more errors at compile time
2. **Use Zod for validation** - Runtime type safety for user input
3. **Define types for all API responses** - Type-safe fetch calls
4. **Use type inference** - Let TypeScript infer types when possible
5. **Create custom error classes** - Better error handling
6. **Use enums or const assertions** - For fixed sets of values
7. **Validate environment variables** - Fail early if config is wrong
8. **Use generics for reusable functions** - Type-safe utilities
9. **Add return types to functions** - Explicit is better
10. **Use type guards** - Safe type narrowing

### ❌ DON'T

1. **Don't use `any`** - Defeats purpose of TypeScript
2. **Don't skip validation** - Always validate user input with Zod
3. **Don't ignore TypeScript errors** - Fix them, don't suppress
4. **Don't use `as` unless necessary** - Type assertions can hide bugs
5. **Don't forget to handle null/undefined** - Use optional chaining
6. **Don't make everything a type** - Use inference when clear
7. **Don't expose internal error details** - Sanitize error messages for users

---

## Common Patterns Summary

```typescript
// 1. Zod validation in API route
const result = schema.safeParse(body)
if (!result.success) return validationErrorResponse(result.error)

// 2. Type-safe Prisma query
const bids: Bid[] = await prisma.bid.findMany({ where: { shopId } })

// 3. Generic fetch
const data = await fetchApi<Offer[]>('/api/offers')

// 4. Custom error handling
if (!offer) throw new NotFoundError('Offer not found')

// 5. Type guard
if (isValidBidStatus(status)) { /* ... */ }

// 6. Form with validation
const { register, handleSubmit, formState: { errors } } = useForm<OfferCreateInput>({
  resolver: zodResolver(offerCreateSchema)
})

// 7. Async state
const [state, setState] = useState<AsyncState<Bid>>({ status: 'idle' })
```

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Documentation](https://zod.dev/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [TypeScript + Next.js](https://nextjs.org/docs/basic-features/typescript)
