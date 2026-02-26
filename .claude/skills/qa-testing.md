# QA Testing - Comprehensive Quality Assurance

## Overview

This skill covers comprehensive QA testing for the Justfouryou application, ensuring all features, user flows, and integrations work correctly. Combines automated testing with manual verification for a complete quality assurance strategy.

---

## Testing Strategy

### Philosophy: Simple, Lovable, Complete

**Simple:**
- Clear, easy-to-follow test procedures
- Automated tests that run with one command
- Quick feedback on what's broken

**Lovable:**
- Tests ensure delightful user experience
- UI/UX verification beyond just "it works"
- Real-world scenario testing

**Complete:**
- Critical path fully covered
- Common error scenarios tested
- Integration points verified
- Nothing ships without passing tests

---

## Test Pyramid

```
      /\
     /  \     E2E Tests (Few)
    /----\    Critical user flows
   /      \
  /--------\  Integration Tests (Some)
 /          \ API endpoints, Stripe, Database
/------------\
 Unit Tests   Component logic, utilities
  (Many)
```

### Test Types

1. **Unit Tests**: Individual functions, utilities (Jest)
2. **Integration Tests**: API endpoints, database operations (Jest + Supertest)
3. **E2E Tests**: Full user flows, browser automation (Playwright)
4. **Manual Tests**: UI/UX, cross-browser, edge cases

---

## Setup

### Installation

```bash
# Testing frameworks
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D jest-environment-jsdom
npm install -D @playwright/test
npm install -D supertest
npm install -D ts-jest @types/jest
```

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom'
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:ci && npm run test:e2e"
  }
}
```

---

## Unit Tests

### Utility Function Tests

```typescript
// __tests__/utils/calculations.test.ts
import { calculateSliderRange, calculateProfitPerSale } from '@/utils/calculations'

describe('Bid Calculations', () => {
  describe('calculateSliderRange', () => {
    it('should calculate correct slider range for minimum bid', () => {
      const minBid = 32.00
      const result = calculateSliderRange(minBid)

      expect(result.sliderMin).toBe(25.60) // 20% below
      expect(result.sliderMax).toBe(49.60) // 55% above
    })

    it('should handle decimal precision correctly', () => {
      const minBid = 33.33
      const result = calculateSliderRange(minBid)

      expect(result.sliderMin).toBeCloseTo(26.66, 2)
      expect(result.sliderMax).toBeCloseTo(51.66, 2)
    })

    it('should throw error for negative minimum bid', () => {
      expect(() => calculateSliderRange(-10)).toThrow('Minimum bid must be positive')
    })
  })

  describe('calculateProfitPerSale', () => {
    it('should calculate profit correctly', () => {
      const wholesalePrice = 30.00
      const minBid = 32.00

      const profit = calculateProfitPerSale(wholesalePrice, minBid)
      expect(profit).toBe(2.00)
    })

    it('should return negative profit if bid is below wholesale', () => {
      const wholesalePrice = 35.00
      const minBid = 30.00

      const profit = calculateProfitPerSale(wholesalePrice, minBid)
      expect(profit).toBe(-5.00)
    })
  })
})
```

### Validation Schema Tests

```typescript
// __tests__/lib/validations.test.ts
import { offerCreateSchema, bidCreateSchema } from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('offerCreateSchema', () => {
    it('should validate correct offer data', () => {
      const validData = {
        productName: 'Premium Helmet',
        imageUrl: 'https://example.com/helmet.jpg',
        wholesalePrice: 30.00,
        minBid: 32.00,
        stockQuantity: 100
      }

      const result = offerCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject offer with minBid below wholesalePrice', () => {
      const invalidData = {
        productName: 'Premium Helmet',
        imageUrl: 'https://example.com/helmet.jpg',
        wholesalePrice: 35.00,
        minBid: 30.00, // Below wholesale
        stockQuantity: 100
      }

      const result = offerCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('greater than or equal to wholesale')
      }
    })

    it('should reject invalid product name', () => {
      const invalidData = {
        productName: 'AB', // Too short
        imageUrl: 'https://example.com/helmet.jpg',
        wholesalePrice: 30.00,
        minBid: 32.00,
        stockQuantity: 100
      }

      const result = offerCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative stock quantity', () => {
      const invalidData = {
        productName: 'Premium Helmet',
        imageUrl: 'https://example.com/helmet.jpg',
        wholesalePrice: 30.00,
        minBid: 32.00,
        stockQuantity: -5
      }

      const result = offerCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('bidCreateSchema', () => {
    it('should validate correct bid data', () => {
      const validData = {
        shopId: 'clx123abc',
        offerId: 'offer_123',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        shippingAddress: {
          line1: '123 Main St',
          city: 'Berlin',
          postalCode: '10115',
          country: 'DE'
        },
        bidAmount: 35.00,
        locale: 'de'
      }

      const result = bidCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        shopId: 'clx123abc',
        offerId: 'offer_123',
        customerEmail: 'not-an-email',
        customerName: 'John Doe',
        shippingAddress: {
          line1: '123 Main St',
          city: 'Berlin',
          postalCode: '10115',
          country: 'DE'
        },
        bidAmount: 35.00,
        locale: 'de'
      }

      const result = bidCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid locale', () => {
      const invalidData = {
        shopId: 'clx123abc',
        offerId: 'offer_123',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        shippingAddress: {
          line1: '123 Main St',
          city: 'Berlin',
          postalCode: '10115',
          country: 'DE'
        },
        bidAmount: 35.00,
        locale: 'fr' // Only 'en' or 'de' allowed
      }

      const result = bidCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
```

---

## Integration Tests (API)

### Test Database Setup

```typescript
// __tests__/setup/test-db.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

export async function resetDatabase() {
  // Delete all data in reverse order of dependencies
  await prisma.bid.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.shop.deleteMany()
}

export async function seedTestData() {
  const bcrypt = require('bcrypt')

  // Create test shop
  const testShop = await prisma.shop.create({
    data: {
      email: 'test@justfouryou.com',
      passwordHash: await bcrypt.hash('Test1234!', 10),
      shopName: 'Test Shop'
    }
  })

  // Create test offer
  const testOffer = await prisma.offer.create({
    data: {
      shopId: testShop.id,
      productName: 'Test Helmet',
      imageUrl: 'https://example.com/helmet.jpg',
      wholesalePrice: 30.00,
      minBid: 32.00,
      sliderMin: 25.60,
      sliderMax: 49.60,
      stockQuantity: 100,
      isActive: true
    }
  })

  return { testShop, testOffer }
}

export { prisma }
```

### API Endpoint Tests

```typescript
// __tests__/api/offers.test.ts
import { createMocks } from 'node-mocks-http'
import { POST, GET } from '@/app/api/offers/route'
import { resetDatabase, seedTestData, prisma } from '../setup/test-db'

describe('Offers API', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /api/offers', () => {
    it('should create a new offer with valid data', async () => {
      const { testShop } = await seedTestData()

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          productName: 'New Helmet',
          imageUrl: 'https://example.com/new-helmet.jpg',
          wholesalePrice: 25.00,
          minBid: 28.00,
          stockQuantity: 50
        }
      })

      // Mock session
      jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
        user: { shopId: testShop.id, email: testShop.email }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.productName).toBe('New Helmet')
      expect(data.data.sliderMin).toBe(22.40) // 28 * 0.80
      expect(data.data.sliderMax).toBe(43.40) // 28 * 1.55
    })

    it('should reject offer without authentication', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productName: 'New Helmet',
          wholesalePrice: 25.00,
          minBid: 28.00,
          stockQuantity: 50
        }
      })

      // Mock no session
      jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue(null)

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('should reject offer with invalid data', async () => {
      const { testShop } = await seedTestData()

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productName: 'AB', // Too short
          wholesalePrice: 25.00,
          minBid: 28.00,
          stockQuantity: 50
        }
      })

      jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
        user: { shopId: testShop.id }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/offers', () => {
    it('should return all offers for authenticated shop', async () => {
      const { testShop, testOffer } = await seedTestData()

      const { req, res } = createMocks({
        method: 'GET'
      })

      jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
        user: { shopId: testShop.id }
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].id).toBe(testOffer.id)
    })

    it('should return empty array for shop with no offers', async () => {
      const bcrypt = require('bcrypt')
      const emptyShop = await prisma.shop.create({
        data: {
          email: 'empty@test.com',
          passwordHash: await bcrypt.hash('Test1234!', 10),
          shopName: 'Empty Shop'
        }
      })

      const { req, res } = createMocks({
        method: 'GET'
      })

      jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
        user: { shopId: emptyShop.id }
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(0)
    })
  })
})
```

### Bid Processing Tests

```typescript
// __tests__/api/bids.test.ts
import { POST } from '@/app/api/bids/route'
import { resetDatabase, seedTestData, prisma } from '../setup/test-db'
import { createMocks } from 'node-mocks-http'

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc'
      })
    }
  }
}))

describe('Bids API', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /api/bids', () => {
    it('should create bid and payment intent with valid data', async () => {
      const { testShop, testOffer } = await seedTestData()

      const { req } = createMocks({
        method: 'POST',
        body: {
          shopId: testShop.id,
          offerId: testOffer.id,
          customerEmail: 'customer@example.com',
          customerName: 'John Doe',
          shippingAddress: {
            line1: '123 Main St',
            city: 'Berlin',
            postalCode: '10115',
            country: 'DE'
          },
          bidAmount: 35.00,
          locale: 'de'
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.clientSecret).toBe('pi_test_123_secret_abc')

      // Verify bid was created
      const bid = await prisma.bid.findFirst({
        where: { offerId: testOffer.id }
      })
      expect(bid).toBeTruthy()
      expect(bid?.bidAmount.toNumber()).toBe(35.00)
      expect(bid?.status).toBe('pending')
    })

    it('should reject bid when offer is out of stock', async () => {
      const { testShop, testOffer } = await seedTestData()

      // Set stock to 0
      await prisma.offer.update({
        where: { id: testOffer.id },
        data: { stockQuantity: 0 }
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          shopId: testShop.id,
          offerId: testOffer.id,
          customerEmail: 'customer@example.com',
          customerName: 'John Doe',
          shippingAddress: {
            line1: '123 Main St',
            city: 'Berlin',
            postalCode: '10115',
            country: 'DE'
          },
          bidAmount: 35.00,
          locale: 'de'
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Out of stock')
    })

    it('should reject bid when offer does not exist', async () => {
      const { testShop } = await seedTestData()

      const { req } = createMocks({
        method: 'POST',
        body: {
          shopId: testShop.id,
          offerId: 'non_existent_offer',
          customerEmail: 'customer@example.com',
          customerName: 'John Doe',
          shippingAddress: {
            line1: '123 Main St',
            city: 'Berlin',
            postalCode: '10115',
            country: 'DE'
          },
          bidAmount: 35.00,
          locale: 'de'
        }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Offer not found')
    })
  })
})
```

### Bid Acceptance Logic Tests

```typescript
// __tests__/utils/processAcceptance.test.ts
import { processAcceptance } from '@/utils/processAcceptance'
import { resetDatabase, seedTestData, prisma } from '../setup/test-db'

// Mock Stripe and Email
jest.mock('@/lib/stripe')
jest.mock('@/lib/email')

describe('Bid Acceptance Processing', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should accept bid when conditions are met', async () => {
    const { testShop, testOffer } = await seedTestData()

    // Create bid above minimum
    const bid = await prisma.bid.create({
      data: {
        shopId: testShop.id,
        offerId: testOffer.id,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        shippingAddress: {
          line1: '123 Main St',
          city: 'Berlin',
          postalCode: '10115',
          country: 'DE'
        },
        bidAmount: 35.00, // Above minBid of 32
        status: 'pending',
        stripePaymentId: 'pi_test_123',
        locale: 'de'
      }
    })

    await processAcceptance(bid.id)

    // Check bid was accepted
    const updatedBid = await prisma.bid.findUnique({
      where: { id: bid.id }
    })
    expect(updatedBid?.status).toBe('accepted')
    expect(updatedBid?.acceptanceEmailSentAt).toBeTruthy()

    // Check stock was decremented
    const updatedOffer = await prisma.offer.findUnique({
      where: { id: testOffer.id }
    })
    expect(updatedOffer?.stockQuantity).toBe(99) // Was 100
  })

  it('should decline bid when below minimum', async () => {
    const { testShop, testOffer } = await seedTestData()

    const bid = await prisma.bid.create({
      data: {
        shopId: testShop.id,
        offerId: testOffer.id,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        shippingAddress: {
          line1: '123 Main St',
          city: 'Berlin',
          postalCode: '10115',
          country: 'DE'
        },
        bidAmount: 25.00, // Below minBid of 32
        status: 'pending',
        stripePaymentId: 'pi_test_123',
        locale: 'de'
      }
    })

    await processAcceptance(bid.id)

    const updatedBid = await prisma.bid.findUnique({
      where: { id: bid.id }
    })
    expect(updatedBid?.status).toBe('declined')

    // Stock should NOT be decremented
    const updatedOffer = await prisma.offer.findUnique({
      where: { id: testOffer.id }
    })
    expect(updatedOffer?.stockQuantity).toBe(100)
  })

  it('should decline bid when stock is 0', async () => {
    const { testShop, testOffer } = await seedTestData()

    // Set stock to 0
    await prisma.offer.update({
      where: { id: testOffer.id },
      data: { stockQuantity: 0 }
    })

    const bid = await prisma.bid.create({
      data: {
        shopId: testShop.id,
        offerId: testOffer.id,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        shippingAddress: {
          line1: '123 Main St',
          city: 'Berlin',
          postalCode: '10115',
          country: 'DE'
        },
        bidAmount: 35.00,
        status: 'pending',
        stripePaymentId: 'pi_test_123',
        locale: 'de'
      }
    })

    await processAcceptance(bid.id)

    const updatedBid = await prisma.bid.findUnique({
      where: { id: bid.id }
    })
    expect(updatedBid?.status).toBe('declined')
  })
})
```

---

## E2E Tests (Playwright)

### Complete User Flows

```typescript
// e2e/shop-owner-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Shop Owner Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database before each test
    await page.goto('/api/test/reset-db')
  })

  test('complete shop owner registration and offer creation', async ({ page }) => {
    // 1. Navigate to registration
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /create your justfouryou account/i })).toBeVisible()

    // 2. Fill registration form
    await page.getByLabel(/email/i).fill('newshop@test.com')
    await page.getByLabel(/shop name/i).fill('New Test Shop')
    await page.getByLabel(/password/i).fill('Test1234!')

    // 3. Submit registration
    await page.getByRole('button', { name: /create account/i }).click()

    // 4. Should redirect to login
    await expect(page).toHaveURL('/login')
    await expect(page.getByText(/registration successful/i)).toBeVisible()

    // 5. Login with new account
    await page.getByLabel(/email/i).fill('newshop@test.com')
    await page.getByLabel(/password/i).fill('Test1234!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // 6. Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText(/welcome.*new test shop/i)).toBeVisible()

    // 7. Navigate to create offer
    await page.getByRole('link', { name: /offers/i }).click()
    await page.getByRole('button', { name: /create new/i }).click()

    // 8. Fill offer form
    await page.getByLabel(/product name/i).fill('Premium Bicycle Helmet')
    await page.getByLabel(/wholesale price/i).fill('30.00')
    await page.getByLabel(/minimum bid/i).fill('32.00')
    await page.getByLabel(/stock quantity/i).fill('100')

    // Note: Image upload would be tested separately
    await page.getByLabel(/image url/i).fill('https://example.com/helmet.jpg')

    // 9. Verify auto-calculated values are displayed
    await expect(page.getByText(/€25.60/)).toBeVisible() // Slider min
    await expect(page.getByText(/€49.60/)).toBeVisible() // Slider max

    // 10. Submit offer
    await page.getByRole('button', { name: /create offer/i }).click()

    // 11. Verify success
    await expect(page.getByText(/offer created successfully/i)).toBeVisible()
    await expect(page.getByText(/premium bicycle helmet/i)).toBeVisible()
  })

  test('shop owner can view embed code', async ({ page }) => {
    // Login as test shop
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('test@justfouryou.com')
    await page.getByLabel(/password/i).fill('Test1234!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Navigate to embed code
    await page.getByRole('link', { name: /embed/i }).click()

    // Verify embed code is displayed
    await expect(page.getByText(/script src="https:\/\/justfouryou.com\/widget.js"/i)).toBeVisible()

    // Test copy to clipboard
    await page.getByRole('button', { name: /copy/i }).click()
    await expect(page.getByText(/copied/i)).toBeVisible()
  })

  test('shop owner can see bid history', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('test@justfouryou.com')
    await page.getByLabel(/password/i).fill('Test1234!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Navigate to bids
    await page.getByRole('link', { name: /bids/i }).click()

    // Create a test bid via API
    await page.request.post('/api/test/create-bid', {
      data: {
        customerEmail: 'customer@test.com',
        bidAmount: 35.00,
        status: 'accepted'
      }
    })

    // Reload page
    await page.reload()

    // Verify bid is displayed
    await expect(page.getByText(/customer@test.com/i)).toBeVisible()
    await expect(page.getByText(/€35.00/)).toBeVisible()
    await expect(page.getByText(/accepted/i)).toBeVisible()
  })
})
```

```typescript
// e2e/customer-bid-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Customer Bid Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/test/reset-db')
    await page.goto('/api/test/seed-db')
  })

  test('customer can view widget and place bid', async ({ page }) => {
    // 1. Navigate to widget
    await page.goto('/widget?shopId=test_shop_id')

    // 2. Verify widget loads
    await expect(page.getByText(/justfouryou/i)).toBeVisible()
    await expect(page.getByText(/test helmet/i)).toBeVisible()

    // 3. Verify Powered by Next Commerce footer
    await expect(page.getByText(/powered by next commerce/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /next commerce/i })).toHaveAttribute(
      'href',
      'https://www.next-commerce.io'
    )

    // 4. Adjust bid slider
    const slider = page.getByRole('slider')
    await slider.fill('35')

    // 5. Verify bid amount updates
    await expect(page.getByText(/€35/)).toBeVisible()

    // 6. Click submit and pay
    await page.getByRole('button', { name: /submit and pay/i }).click()

    // 7. Should redirect to payment page
    await expect(page).toHaveURL(/\/payment/)
    await expect(page.getByText(/€35/)).toBeVisible()
  })

  test('customer can complete payment with Stripe', async ({ page }) => {
    // Navigate to payment page (would normally come from widget)
    await page.goto('/payment?shopId=test_shop_id&offerId=test_offer_id&bidAmount=35&locale=en')

    // Wait for Stripe Payment Element to load
    await page.waitForSelector('[data-testid="payment-element"]', { timeout: 10000 })

    // Fill Stripe test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
    await stripeFrame.getByPlaceholder(/card number/i).fill('4242424242424242')
    await stripeFrame.getByPlaceholder(/mm \/ yy/i).fill('12/25')
    await stripeFrame.getByPlaceholder(/cvc/i).fill('123')
    await stripeFrame.getByPlaceholder(/zip/i).fill('10115')

    // Submit payment
    await page.getByRole('button', { name: /pay €35/i }).click()

    // Wait for success redirect
    await expect(page).toHaveURL(/\/success/, { timeout: 30000 })
    await expect(page.getByText(/thank you/i)).toBeVisible()
  })

  test('widget shows out of stock when no stock', async ({ page }) => {
    // Set stock to 0 via API
    await page.request.post('/api/test/set-stock', {
      data: { offerId: 'test_offer_id', stockQuantity: 0 }
    })

    // Navigate to widget
    await page.goto('/widget?shopId=test_shop_id')

    // Verify out of stock message
    await expect(page.getByText(/out of stock/i)).toBeVisible()

    // Submit button should be disabled
    await expect(page.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  test('widget displays correct language based on locale', async ({ page }) => {
    // German
    await page.goto('/widget?shopId=test_shop_id&locale=de')
    await expect(page.getByText(/dankeschön-angebot/i)).toBeVisible()
    await expect(page.getByText(/inkl\. mwst\./i)).toBeVisible()

    // English
    await page.goto('/widget?shopId=test_shop_id&locale=en')
    await expect(page.getByText(/thank you offer/i)).toBeVisible()
    await expect(page.getByText(/incl\. vat/i)).toBeVisible()
  })
})
```

```typescript
// e2e/mobile-responsive.spec.ts
import { test, expect, devices } from '@playwright/test'

test.describe('Mobile Responsiveness', () => {
  test.use(devices['iPhone 12'])

  test('widget is fully functional on mobile', async ({ page }) => {
    await page.goto('/widget?shopId=test_shop_id')

    // Verify mobile layout
    await expect(page.getByText(/justfouryou/i)).toBeVisible()

    // Slider should work on mobile
    const slider = page.getByRole('slider')
    await slider.fill('40')
    await expect(page.getByText(/€40/)).toBeVisible()

    // Button should be easily tappable (min 44x44px)
    const submitButton = page.getByRole('button', { name: /submit and pay/i })
    const boundingBox = await submitButton.boundingBox()
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44)
  })

  test('dashboard navigation works on mobile', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('test@justfouryou.com')
    await page.getByLabel(/password/i).fill('Test1234!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Open mobile menu
    await page.getByRole('button', { name: /menu/i }).click()

    // Verify navigation links
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /offers/i })).toBeVisible()
  })
})
```

---

## Manual Testing Checklists

### Pre-Release Checklist

```markdown
## Authentication & Authorization

- [ ] Shop owner can register with valid email/password
- [ ] Registration rejects weak passwords
- [ ] Shop owner can login with correct credentials
- [ ] Login fails with incorrect password
- [ ] Shop owner is redirected to dashboard after login
- [ ] Unauthenticated users cannot access dashboard
- [ ] Logout redirects to login page
- [ ] Session persists across page reloads

## Offer Management

- [ ] Shop owner can create new offer with all required fields
- [ ] Image upload works and displays preview
- [ ] Slider range auto-calculates correctly (20% below, 55% above)
- [ ] Form validation shows clear error messages
- [ ] Cannot create offer with minBid < wholesalePrice
- [ ] Created offers appear in offers list
- [ ] Stock quantity can be updated
- [ ] Offer can be deactivated/activated
- [ ] Embed code is generated with correct shopId

## Widget

- [ ] Widget loads on external domain via iframe
- [ ] Product image displays correctly
- [ ] Product name and description are visible
- [ ] Bid slider adjusts smoothly
- [ ] Bid amount updates in real-time
- [ ] "incl. VAT" text is displayed
- [ ] Justfouryou banner is visible (top left)
- [ ] "Powered by Next Commerce" footer is visible and links correctly
- [ ] Widget is responsive on mobile devices
- [ ] Widget shows "Out of Stock" when stockQuantity = 0
- [ ] Widget displays in German when locale=de
- [ ] Widget displays in English when locale=en

## Payment Flow

- [ ] Clicking "Submit and Pay" redirects to payment page
- [ ] Payment page shows correct bid amount
- [ ] Stripe Payment Element loads correctly
- [ ] Can enter test card: 4242 4242 4242 4242
- [ ] Payment processes successfully
- [ ] 3D Secure flow works (card: 4000 0027 6000 3184)
- [ ] Failed payment shows error message
- [ ] Success page shows after successful payment
- [ ] Payment confirmation email is sent to customer

## Bid Processing

- [ ] Bid is created with status='pending' after payment
- [ ] Bid confirmation email sent immediately (DE/EN)
- [ ] After 10-20 min, bid is auto-accepted if >= minBid
- [ ] Bid acceptance email sent to customer (DE/EN)
- [ ] Order notification email sent to shop owner
- [ ] Shop owner email includes all order details (name, email, address, product, bid amount)
- [ ] Stock decrements by 1 when bid accepted
- [ ] Bid is declined if stock = 0
- [ ] Bid is declined if bidAmount < minBid
- [ ] Refund is issued for declined bids
- [ ] Decline email sent to customer (DE/EN)

## Dashboard

- [ ] Stats cards show correct totals (total bids, accepted, declined, revenue)
- [ ] Conversion rate calculates correctly (accepted/total * 100)
- [ ] Bid history shows all bids with correct status badges
- [ ] Can filter bids by status (all/accepted/pending/declined)
- [ ] Bid details modal shows complete information
- [ ] Recent bids appear in correct order (newest first)

## Email Notifications

### Customer Emails
- [ ] Bid confirmation - English version
- [ ] Bid confirmation - German version
- [ ] Bid accepted - English version
- [ ] Bid accepted - German version
- [ ] Bid declined - English version
- [ ] Bid declined - German version
- [ ] All emails render correctly in Gmail
- [ ] All emails render correctly in Outlook
- [ ] All emails render correctly on mobile

### Shop Owner Emails
- [ ] Welcome email after registration
- [ ] Order notification includes all required details
- [ ] Emails have clear subject lines

## Cross-Browser Testing

- [ ] Chrome (desktop) - All features work
- [ ] Firefox (desktop) - All features work
- [ ] Safari (desktop) - All features work
- [ ] Chrome (mobile) - All features work
- [ ] Safari (iOS) - All features work

## Performance

- [ ] Widget loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Payment page loads in < 2 seconds
- [ ] No console errors on any page
- [ ] Images are optimized and load quickly

## Security

- [ ] API routes require authentication where appropriate
- [ ] Cannot access other shop's data
- [ ] Password is hashed in database
- [ ] Stripe webhook signature is verified
- [ ] HTTPS is enforced in production
- [ ] Environment variables are not exposed

## Error Handling

- [ ] 404 page shows for invalid routes
- [ ] API errors return proper status codes
- [ ] User-friendly error messages (not raw errors)
- [ ] Failed Stripe payment shows clear message
- [ ] Network errors are handled gracefully
```

### Feature Testing Template

When testing a new feature or change:

```markdown
## Feature: [Feature Name]

### Test Date: [Date]
### Tester: [Name]
### Environment: [Development/Staging/Production]

### Test Cases

#### Happy Path
- [ ] [Primary user action works as expected]
- [ ] [Expected result is displayed correctly]
- [ ] [Data is saved correctly]
- [ ] [User receives appropriate feedback]

#### Edge Cases
- [ ] [What happens with empty input?]
- [ ] [What happens with invalid input?]
- [ ] [What happens with maximum values?]
- [ ] [What happens with special characters?]

#### Error Scenarios
- [ ] [Network error handling]
- [ ] [Server error handling]
- [ ] [Validation error display]
- [ ] [Timeout handling]

#### Integration Points
- [ ] [External API works correctly]
- [ ] [Database updates correctly]
- [ ] [Email sends correctly]
- [ ] [Webhooks trigger correctly]

#### UI/UX
- [ ] [Layout is correct on desktop]
- [ ] [Layout is correct on mobile]
- [ ] [Loading states are shown]
- [ ] [Success/error messages are clear]
- [ ] [Buttons are easily clickable]
- [ ] [Forms are intuitive]

### Bugs Found
[List any bugs discovered during testing]

### Notes
[Any additional observations or concerns]
```

---

## Test Data Management

### Seed Script for Development

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.bid.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.shop.deleteMany()

  // Create test shops
  const shops = await Promise.all([
    prisma.shop.create({
      data: {
        email: 'test@justfouryou.com',
        passwordHash: await bcrypt.hash('Test1234!', 10),
        shopName: 'Test Shop'
      }
    }),
    prisma.shop.create({
      data: {
        email: 'demo@justfouryou.com',
        passwordHash: await bcrypt.hash('Demo1234!', 10),
        shopName: 'Demo Shop'
      }
    })
  ])

  console.log(`✅ Created ${shops.length} shops`)

  // Create test offers
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        shopId: shops[0].id,
        productName: 'Premium Bicycle Helmet',
        productSku: 'HELMET-001',
        imageUrl: 'https://images.unsplash.com/photo-1557803836-25e7a582caf0',
        wholesalePrice: 30.00,
        minBid: 32.00,
        sliderMin: 25.60,
        sliderMax: 49.60,
        stockQuantity: 100,
        isActive: true
      }
    }),
    prisma.offer.create({
      data: {
        shopId: shops[0].id,
        productName: 'Extended Warranty (2 Years)',
        productSku: 'WARRANTY-2Y',
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
        wholesalePrice: 15.00,
        minBid: 18.00,
        sliderMin: 14.40,
        sliderMax: 27.90,
        stockQuantity: 1000,
        isActive: true
      }
    }),
    prisma.offer.create({
      data: {
        shopId: shops[1].id,
        productName: 'Express Shipping',
        imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55',
        wholesalePrice: 8.00,
        minBid: 10.00,
        sliderMin: 8.00,
        sliderMax: 15.50,
        stockQuantity: 9999,
        isActive: true
      }
    })
  ])

  console.log(`✅ Created ${offers.length} offers`)

  // Create test bids
  const bids = await Promise.all([
    prisma.bid.create({
      data: {
        shopId: shops[0].id,
        offerId: offers[0].id,
        customerEmail: 'customer1@example.com',
        customerName: 'John Doe',
        shippingAddress: {
          line1: '123 Main St',
          city: 'Berlin',
          postalCode: '10115',
          country: 'DE'
        },
        bidAmount: 35.00,
        status: 'accepted',
        stripePaymentId: 'pi_test_accepted_1',
        locale: 'de',
        acceptanceEmailSentAt: new Date()
      }
    }),
    prisma.bid.create({
      data: {
        shopId: shops[0].id,
        offerId: offers[0].id,
        customerEmail: 'customer2@example.com',
        customerName: 'Jane Smith',
        shippingAddress: {
          line1: '456 Oak Ave',
          city: 'Munich',
          postalCode: '80331',
          country: 'DE'
        },
        bidAmount: 28.00,
        status: 'declined',
        stripePaymentId: 'pi_test_declined_1',
        locale: 'de',
        acceptanceEmailSentAt: new Date()
      }
    }),
    prisma.bid.create({
      data: {
        shopId: shops[0].id,
        offerId: offers[1].id,
        customerEmail: 'customer3@example.com',
        customerName: 'Bob Johnson',
        shippingAddress: {
          line1: '789 Pine Rd',
          city: 'Hamburg',
          postalCode: '20095',
          country: 'DE'
        },
        bidAmount: 20.00,
        status: 'pending',
        stripePaymentId: 'pi_test_pending_1',
        locale: 'en'
      }
    })
  ])

  console.log(`✅ Created ${bids.length} bids`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```json
// Add to package.json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Run seed:**
```bash
npx prisma db seed
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: justfouryou_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/justfouryou_test
      NEXTAUTH_SECRET: test-secret-key-minimum-32-characters-long
      NEXTAUTH_URL: http://localhost:3000
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_TEST_PUBLISHABLE_KEY }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx prisma migrate deploy

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run unit & integration tests
        run: npm run test:ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload coverage
        if: always()
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

---

## Performance Testing

### Basic Performance Benchmarks

```typescript
// __tests__/performance/api-benchmarks.test.ts
import { performance } from 'perf_hooks'

describe('API Performance', () => {
  it('GET /api/offers should respond in < 500ms', async () => {
    const start = performance.now()

    const response = await fetch('http://localhost:3000/api/offers', {
      headers: { 'Cookie': 'session=test_session' }
    })

    const end = performance.now()
    const duration = end - start

    expect(response.status).toBe(200)
    expect(duration).toBeLessThan(500)
  })

  it('POST /api/bids should respond in < 1000ms', async () => {
    const start = performance.now()

    const response = await fetch('http://localhost:3000/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId: 'test_shop_id',
        offerId: 'test_offer_id',
        bidAmount: 35.00,
        customerEmail: 'perf@test.com',
        customerName: 'Perf Test',
        shippingAddress: {},
        locale: 'en'
      })
    })

    const end = performance.now()
    const duration = end - start

    expect(duration).toBeLessThan(1000)
  })
})
```

---

## Testing Best Practices

### ✅ DO

1. **Test critical paths thoroughly** - Registration, offer creation, bid flow, payment
2. **Use realistic test data** - Real-looking emails, addresses, product names
3. **Reset database between tests** - Ensure test isolation
4. **Mock external services in unit tests** - Stripe, email services
5. **Use real services in E2E tests** - Stripe test mode, real database
6. **Test both happy and error paths** - Success and failure scenarios
7. **Verify user-facing messages** - Error messages, success notifications
8. **Test mobile responsiveness** - Widget must work perfectly on phones
9. **Run tests before every commit** - Catch issues early
10. **Keep tests fast** - Unit tests < 1s, E2E tests < 30s each

### ❌ DON'T

1. **Don't skip tests** - "It works on my machine" is not enough
2. **Don't test implementation details** - Test behavior, not internals
3. **Don't write flaky tests** - Fix race conditions and timing issues
4. **Don't test external APIs directly** - Mock or use test modes
5. **Don't commit broken tests** - Fix or skip, don't ignore
6. **Don't forget to test error cases** - Errors happen in production
7. **Don't rely only on manual testing** - Automate repetitive tasks

---

## Test Coverage Goals

### Minimum Coverage Requirements

- **Unit Tests**: 80% code coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: All critical user flows covered

### Priority Testing Areas

1. **Critical (Must be 100% covered)**
   - Authentication (login, register, session)
   - Payment processing (Stripe integration)
   - Bid acceptance logic
   - Stock management

2. **High Priority (Should be 90%+ covered)**
   - API endpoints
   - Data validation
   - Email sending
   - Webhook handling

3. **Medium Priority (Should be 70%+ covered)**
   - UI components
   - Form validation
   - Navigation
   - Error handling

---

## Debugging Failed Tests

### Common Issues & Solutions

**Issue: Test times out**
```typescript
// Increase timeout for slow operations
test('slow operation', async () => {
  // ...
}, 30000) // 30 second timeout
```

**Issue: Database state conflicts**
```typescript
// Always reset database before each test
beforeEach(async () => {
  await resetDatabase()
})
```

**Issue: Stripe webhook not received**
```bash
# Use Stripe CLI to forward webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Issue: Playwright can't find element**
```typescript
// Wait for element to appear
await page.waitForSelector('[data-testid="submit-button"]')

// Or use built-in waiting
await expect(page.getByRole('button')).toBeVisible()
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)
