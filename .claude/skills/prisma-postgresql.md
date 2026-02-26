# Prisma + PostgreSQL - Best Practices

## Overview

This skill covers Prisma ORM with PostgreSQL for the Justfouryou application, including schema design, migrations, queries, relations, and optimization.

---

## Setup

### Installation

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Database connection string

### Configure Database

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/justfouryou?schema=public"
```

**For Supabase:**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

## Schema Design

### Complete Justfouryou Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Shop {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  shopName     String   @map("shop_name")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  offers Offer[]
  bids   Bid[]

  @@map("shops")
}

model Offer {
  id             String   @id @default(cuid())
  shopId         String   @map("shop_id")
  productName    String   @map("product_name")
  productSku     String?  @map("product_sku")
  imageUrl       String   @map("image_url")
  wholesalePrice Decimal  @db.Decimal(10, 2) @map("wholesale_price")
  minBid         Decimal  @db.Decimal(10, 2) @map("min_bid")
  sliderMin      Decimal  @db.Decimal(10, 2) @map("slider_min")
  sliderMax      Decimal  @db.Decimal(10, 2) @map("slider_max")
  stockQuantity  Int      @map("stock_quantity")
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  shop Shop @relation(fields: [shopId], references: [id], onDelete: Cascade)
  bids Bid[]

  @@index([shopId])
  @@map("offers")
}

model Bid {
  id                    String    @id @default(cuid())
  shopId                String    @map("shop_id")
  offerId               String    @map("offer_id")
  customerEmail         String    @map("customer_email")
  customerName          String    @map("customer_name")
  shippingAddress       Json      @map("shipping_address")
  bidAmount             Decimal   @db.Decimal(10, 2) @map("bid_amount")
  status                String    // 'pending', 'accepted', 'declined'
  stripePaymentId       String    @unique @map("stripe_payment_id")
  locale                String    // 'de' or 'en'
  acceptanceEmailSentAt DateTime? @map("acceptance_email_sent_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  shop  Shop  @relation(fields: [shopId], references: [id], onDelete: Cascade)
  offer Offer @relation(fields: [offerId], references: [id], onDelete: Cascade)

  @@index([shopId])
  @@index([offerId])
  @@index([status])
  @@index([createdAt])
  @@map("bids")
}
```

### Key Schema Patterns

#### 1. **Field Naming**
- Use camelCase in Prisma schema: `shopName`
- Map to snake_case in database: `@map("shop_name")`
- Map table names: `@@map("shops")`

#### 2. **Primary Keys**
- Use `@id @default(cuid())` for unique, URL-safe IDs
- Alternative: `@id @default(uuid())` for UUID

#### 3. **Timestamps**
- Always include `createdAt` and `updatedAt`
- `@default(now())` for creation time
- `@updatedAt` auto-updates on modification

#### 4. **Relations**
- Define both sides of relation
- Use `onDelete: Cascade` to auto-delete related records
- Add `@index` on foreign keys for performance

#### 5. **Decimal Types**
- Use `Decimal @db.Decimal(10, 2)` for money (not Float!)
- 10 digits total, 2 after decimal point
- Prevents floating-point rounding errors

#### 6. **JSON Fields**
- Use `Json` type for flexible data (e.g., shipping address)
- Good for nested objects that don't need querying

#### 7. **Indexes**
- Add `@@index([fieldName])` for fields used in WHERE clauses
- Improves query performance

---

## Migrations

### Create Migration

```bash
npx prisma migrate dev --name init
```

This:
1. Creates SQL migration file in `prisma/migrations/`
2. Applies migration to database
3. Regenerates Prisma Client

### Migration Workflow

```bash
# 1. Update schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name add_sku_field

# 3. Commit migration files to git
git add prisma/migrations
git commit -m "Add SKU field to offers"
```

### Production Deployment

```bash
# Apply migrations in production (no prompts)
npx prisma migrate deploy
```

### Reset Database (Development Only)

```bash
# WARNING: Deletes all data!
npx prisma migrate reset
```

### Generate Client After Schema Changes

```bash
npx prisma generate
```

---

## Prisma Client Setup

### Create Client Instance

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Why this pattern?**
- Prevents multiple Prisma Client instances in development (Next.js hot reload)
- Logs queries in development for debugging
- Only logs errors in production

### Usage in Code

```typescript
import { prisma } from '@/lib/prisma'

const offers = await prisma.offer.findMany()
```

---

## CRUD Operations

### Create

```typescript
// Create single record
const offer = await prisma.offer.create({
  data: {
    shopId: 'shop_123',
    productName: 'Premium Helmet',
    wholesalePrice: 30.00,
    minBid: 32.00,
    sliderMin: 25.60,
    sliderMax: 49.60,
    stockQuantity: 100,
    imageUrl: 'https://...'
  }
})

// Create with nested relation
const shop = await prisma.shop.create({
  data: {
    email: 'shop@example.com',
    passwordHash: 'hashed...',
    shopName: 'My Shop',
    offers: {
      create: [
        {
          productName: 'Helmet',
          wholesalePrice: 30,
          // ...
        }
      ]
    }
  }
})

// Create many
const bids = await prisma.bid.createMany({
  data: [
    { shopId: 'shop_123', offerId: 'offer_456', /* ... */ },
    { shopId: 'shop_123', offerId: 'offer_789', /* ... */ }
  ],
  skipDuplicates: true // Skip records that violate unique constraints
})
```

### Read

```typescript
// Find unique (by unique field or ID)
const shop = await prisma.shop.findUnique({
  where: { id: 'shop_123' }
})

const shopByEmail = await prisma.shop.findUnique({
  where: { email: 'shop@example.com' }
})

// Find first matching record
const activeOffer = await prisma.offer.findFirst({
  where: {
    shopId: 'shop_123',
    isActive: true,
    stockQuantity: { gt: 0 }
  }
})

// Find many
const bids = await prisma.bid.findMany({
  where: {
    shopId: 'shop_123',
    status: 'accepted'
  },
  orderBy: { createdAt: 'desc' },
  take: 10, // Limit
  skip: 0   // Offset (for pagination)
})

// Find with relations
const offer = await prisma.offer.findUnique({
  where: { id: 'offer_123' },
  include: {
    shop: true,  // Include related shop
    bids: {      // Include related bids with filter
      where: { status: 'accepted' }
    }
  }
})

// Count
const totalBids = await prisma.bid.count({
  where: { shopId: 'shop_123' }
})
```

### Update

```typescript
// Update single record
const offer = await prisma.offer.update({
  where: { id: 'offer_123' },
  data: {
    stockQuantity: 50,
    isActive: true
  }
})

// Atomic increment/decrement
const offer = await prisma.offer.update({
  where: { id: 'offer_123' },
  data: {
    stockQuantity: { decrement: 1 }
  }
})

// Update many
const result = await prisma.bid.updateMany({
  where: { status: 'pending' },
  data: { status: 'declined' }
})

// Upsert (update if exists, create if not)
const shop = await prisma.shop.upsert({
  where: { email: 'shop@example.com' },
  update: { shopName: 'Updated Name' },
  create: {
    email: 'shop@example.com',
    passwordHash: 'hashed...',
    shopName: 'New Shop'
  }
})
```

### Delete

```typescript
// Delete single record
const deletedOffer = await prisma.offer.delete({
  where: { id: 'offer_123' }
})

// Delete many
const result = await prisma.bid.deleteMany({
  where: {
    status: 'declined',
    createdAt: { lt: new Date('2026-01-01') }
  }
})
```

---

## Filtering & Querying

### Common Filters

```typescript
// Equals
const bids = await prisma.bid.findMany({
  where: { status: 'accepted' }
})

// Multiple conditions (AND)
const bids = await prisma.bid.findMany({
  where: {
    status: 'accepted',
    bidAmount: { gte: 30 } // >= 30
  }
})

// OR conditions
const bids = await prisma.bid.findMany({
  where: {
    OR: [
      { status: 'accepted' },
      { status: 'pending' }
    ]
  }
})

// NOT
const offers = await prisma.offer.findMany({
  where: {
    NOT: { stockQuantity: 0 }
  }
})

// Greater than, less than
const highBids = await prisma.bid.findMany({
  where: {
    bidAmount: {
      gte: 50, // >= 50
      lte: 100 // <= 100
    }
  }
})

// String contains (case-insensitive)
const offers = await prisma.offer.findMany({
  where: {
    productName: {
      contains: 'helmet',
      mode: 'insensitive'
    }
  }
})

// In array
const bids = await prisma.bid.findMany({
  where: {
    status: { in: ['accepted', 'pending'] }
  }
})

// Date range
const recentBids = await prisma.bid.findMany({
  where: {
    createdAt: {
      gte: new Date('2026-02-01'),
      lte: new Date('2026-02-28')
    }
  }
})
```

### Relation Filters

```typescript
// Filter by related record
const offers = await prisma.offer.findMany({
  where: {
    shop: {
      email: 'shop@example.com'
    }
  }
})

// Filter where relation exists
const shopsWithBids = await prisma.shop.findMany({
  where: {
    bids: {
      some: { status: 'accepted' } // Has at least one accepted bid
    }
  }
})

// Filter where relation doesn't exist
const shopsWithoutOffers = await prisma.shop.findMany({
  where: {
    offers: {
      none: {} // No offers at all
    }
  }
})

// Filter where all related records match
const offersWithAllAccepted = await prisma.offer.findMany({
  where: {
    bids: {
      every: { status: 'accepted' } // All bids are accepted
    }
  }
})
```

---

## Sorting & Pagination

### Sorting

```typescript
// Single field
const bids = await prisma.bid.findMany({
  orderBy: { createdAt: 'desc' }
})

// Multiple fields
const bids = await prisma.bid.findMany({
  orderBy: [
    { status: 'asc' },
    { bidAmount: 'desc' }
  ]
})

// Sort by relation
const offers = await prisma.offer.findMany({
  orderBy: {
    shop: { shopName: 'asc' }
  }
})
```

### Pagination

```typescript
// Offset-based pagination
const page = 2
const pageSize = 20

const bids = await prisma.bid.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})

// Cursor-based pagination (more efficient for large datasets)
const bids = await prisma.bid.findMany({
  take: 20,
  skip: 1, // Skip the cursor itself
  cursor: { id: 'last_bid_id_from_previous_page' },
  orderBy: { createdAt: 'desc' }
})
```

---

## Aggregations

### Basic Aggregations

```typescript
// Count
const acceptedCount = await prisma.bid.count({
  where: { status: 'accepted' }
})

// Aggregate
const stats = await prisma.bid.aggregate({
  where: { shopId: 'shop_123' },
  _count: { id: true },
  _sum: { bidAmount: true },
  _avg: { bidAmount: true },
  _max: { bidAmount: true },
  _min: { bidAmount: true }
})

console.log(stats)
// {
//   _count: { id: 150 },
//   _sum: { bidAmount: 4200.50 },
//   _avg: { bidAmount: 28.00 },
//   _max: { bidAmount: 55.00 },
//   _min: { bidAmount: 20.00 }
// }
```

### Group By

```typescript
// Group by status
const bidsByStatus = await prisma.bid.groupBy({
  by: ['status'],
  where: { shopId: 'shop_123' },
  _count: { id: true },
  _sum: { bidAmount: true }
})

console.log(bidsByStatus)
// [
//   { status: 'accepted', _count: { id: 120 }, _sum: { bidAmount: 3600 } },
//   { status: 'declined', _count: { id: 30 }, _sum: { bidAmount: 600.50 } }
// ]

// Group by multiple fields
const stats = await prisma.bid.groupBy({
  by: ['shopId', 'status'],
  _count: true,
  _sum: { bidAmount: true },
  having: {
    bidAmount: { _sum: { gt: 1000 } } // Only groups with total > 1000
  }
})
```

---

## Transactions

### Sequential Transactions

```typescript
// All operations succeed or all fail
const result = await prisma.$transaction(async (tx) => {
  // 1. Create bid
  const bid = await tx.bid.create({
    data: { /* ... */ }
  })

  // 2. Decrement stock
  const offer = await tx.offer.update({
    where: { id: bid.offerId },
    data: { stockQuantity: { decrement: 1 } }
  })

  // 3. If stock goes negative, throw error (rollback)
  if (offer.stockQuantity < 0) {
    throw new Error('Out of stock')
  }

  return { bid, offer }
})
```

### Parallel Transactions

```typescript
// Execute multiple operations atomically
const [updatedBid, decrementedStock] = await prisma.$transaction([
  prisma.bid.update({
    where: { id: 'bid_123' },
    data: { status: 'accepted' }
  }),
  prisma.offer.update({
    where: { id: 'offer_456' },
    data: { stockQuantity: { decrement: 1 } }
  })
])
```

---

## Working with JSON Fields

### Store JSON Data

```typescript
const bid = await prisma.bid.create({
  data: {
    shopId: 'shop_123',
    offerId: 'offer_456',
    customerEmail: 'customer@example.com',
    customerName: 'John Doe',
    shippingAddress: {
      line1: '123 Main St',
      line2: 'Apt 4',
      city: 'Berlin',
      postalCode: '10115',
      country: 'DE'
    },
    bidAmount: 35.00,
    status: 'pending',
    stripePaymentId: 'pi_xxx',
    locale: 'de'
  }
})
```

### Read JSON Data

```typescript
const bid = await prisma.bid.findUnique({
  where: { id: 'bid_123' }
})

// Access nested JSON
const address = bid.shippingAddress as {
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
}

console.log(address.city) // "Berlin"
```

### Filter by JSON Field (PostgreSQL)

```typescript
// Filter by JSON field path
const berlinBids = await prisma.bid.findMany({
  where: {
    shippingAddress: {
      path: ['city'],
      equals: 'Berlin'
    }
  }
})
```

---

## Prisma Client Utilities

### Raw SQL Queries

```typescript
// When you need complex SQL that Prisma doesn't support
const result = await prisma.$queryRaw`
  SELECT
    DATE(created_at) as date,
    COUNT(*) as bid_count,
    SUM(bid_amount) as total_revenue
  FROM bids
  WHERE shop_id = ${shopId}
    AND status = 'accepted'
  GROUP BY DATE(created_at)
  ORDER BY date DESC
  LIMIT 30
`
```

### Execute Raw SQL

```typescript
// For INSERT, UPDATE, DELETE
const result = await prisma.$executeRaw`
  UPDATE offers
  SET stock_quantity = stock_quantity - 1
  WHERE id = ${offerId}
  AND stock_quantity > 0
`
```

### Disconnect

```typescript
// Close database connection (useful in serverless)
await prisma.$disconnect()
```

---

## Type Safety

### Infer Types from Prisma

```typescript
import { Prisma } from '@prisma/client'

// Type for create input
type OfferCreateInput = Prisma.OfferCreateInput

// Type for model
type Offer = Prisma.OfferGetPayload<{}>

// Type with relations included
type OfferWithBids = Prisma.OfferGetPayload<{
  include: { bids: true }
}>

// Type for select
type OfferNameAndPrice = Prisma.OfferGetPayload<{
  select: { productName: true; minBid: true }
}>
```

### Use in Functions

```typescript
async function createOffer(
  data: Prisma.OfferCreateInput
): Promise<Offer> {
  return await prisma.offer.create({ data })
}

async function getBidsWithOffer(
  shopId: string
): Promise<Prisma.BidGetPayload<{ include: { offer: true } }>[]> {
  return await prisma.bid.findMany({
    where: { shopId },
    include: { offer: true }
  })
}
```

---

## Performance Optimization

### 1. Use Select to Limit Fields

```typescript
// Bad: Fetches all fields
const offers = await prisma.offer.findMany()

// Good: Only fetch needed fields
const offers = await prisma.offer.findMany({
  select: {
    id: true,
    productName: true,
    minBid: true
  }
})
```

### 2. Add Indexes

```prisma
model Bid {
  // ...

  @@index([shopId])       // For: where: { shopId }
  @@index([status])       // For: where: { status }
  @@index([createdAt])    // For: orderBy: { createdAt }
  @@index([shopId, status]) // For combined queries
}
```

### 3. Use Pagination

```typescript
// Don't fetch all records at once
const bids = await prisma.bid.findMany({
  take: 20,
  skip: page * 20
})
```

### 4. Batch Queries

```typescript
// Bad: N+1 query problem
const offers = await prisma.offer.findMany()
for (const offer of offers) {
  const bids = await prisma.bid.findMany({
    where: { offerId: offer.id }
  })
}

// Good: Include relations
const offers = await prisma.offer.findMany({
  include: { bids: true }
})
```

### 5. Connection Pooling

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pool settings
  // connection_limit = 10
}
```

For serverless (Vercel), use Prisma Data Proxy or connection pooling:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # Direct connection for migrations
```

---

## Common Queries for Justfouryou

### Dashboard Stats

```typescript
export async function getDashboardStats(shopId: string) {
  const [totalBids, acceptedBids, declinedBids, revenueData] = await Promise.all([
    prisma.bid.count({ where: { shopId } }),
    prisma.bid.count({ where: { shopId, status: 'accepted' } }),
    prisma.bid.count({ where: { shopId, status: 'declined' } }),
    prisma.bid.aggregate({
      where: { shopId, status: 'accepted' },
      _sum: { bidAmount: true }
    })
  ])

  const totalRevenue = revenueData._sum.bidAmount?.toNumber() ?? 0
  const conversionRate = totalBids > 0
    ? (acceptedBids / totalBids) * 100
    : 0

  return {
    totalBids,
    acceptedBids,
    declinedBids,
    totalRevenue,
    conversionRate
  }
}
```

### Get Active Offer for Widget

```typescript
export async function getActiveOffer(shopId: string) {
  return await prisma.offer.findFirst({
    where: {
      shopId,
      isActive: true,
      stockQuantity: { gt: 0 }
    }
  })
}
```

### Process Bid Acceptance

```typescript
export async function processAcceptance(bidId: string) {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { offer: true }
  })

  if (!bid) throw new Error('Bid not found')

  const shouldAccept =
    bid.bidAmount >= bid.offer.minBid &&
    bid.offer.stockQuantity > 0

  if (shouldAccept) {
    // Use transaction to ensure atomicity
    return await prisma.$transaction([
      prisma.bid.update({
        where: { id: bidId },
        data: {
          status: 'accepted',
          acceptanceEmailSentAt: new Date()
        }
      }),
      prisma.offer.update({
        where: { id: bid.offerId },
        data: { stockQuantity: { decrement: 1 } }
      })
    ])
  } else {
    return await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: 'declined',
        acceptanceEmailSentAt: new Date()
      }
    })
  }
}
```

### Get Bids for Processing (Cron Job)

```typescript
export async function getBidsForProcessing() {
  const now = new Date()
  const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000)
  const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000)

  return await prisma.bid.findMany({
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
  })
}
```

---

## Best Practices

### ✅ DO

1. **Use transactions for multi-step operations** - Ensure data consistency
2. **Add indexes on foreign keys and frequently queried fields** - Better performance
3. **Use Decimal for money** - Avoid floating-point errors
4. **Include timestamps** - Always have `createdAt` and `updatedAt`
5. **Use onDelete: Cascade** - Auto-cleanup related records
6. **Map field names** - camelCase in code, snake_case in DB
7. **Use select to limit fields** - Fetch only what you need
8. **Validate data before inserting** - Use Zod schemas
9. **Handle null/undefined** - Check before accessing optional fields
10. **Use connection pooling** - Especially in serverless

### ❌ DON'T

1. **Don't use Float for money** - Use Decimal
2. **Don't forget indexes** - Queries will be slow
3. **Don't skip migrations** - Schema and DB will be out of sync
4. **Don't commit .env** - Keep secrets safe
5. **Don't create multiple Prisma Client instances** - Use singleton pattern
6. **Don't fetch all records without pagination** - Memory issues
7. **Don't forget to disconnect in serverless** - Connection leaks
8. **Don't expose Prisma errors directly** - Sanitize error messages

---

## Troubleshooting

### "Can't reach database server"
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### "Unknown field" error
```bash
# Regenerate Prisma Client after schema changes
npx prisma generate
```

### Migration conflicts
```bash
# Reset database (DEV ONLY - deletes all data!)
npx prisma migrate reset

# Or manually fix migration files in prisma/migrations/
```

### Slow queries
```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query']
})

// Check which queries are slow, then add indexes
```

---

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma + Next.js Guide](https://www.prisma.io/nextjs)
