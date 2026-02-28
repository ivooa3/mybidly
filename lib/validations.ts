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
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service' })
  })
})

// Shop setup schema (first-time login)
export const shopSetupSchema = z.object({
  shopName: z
    .string()
    .min(2, 'Shop name must be at least 2 characters')
    .max(100, 'Shop name must be less than 100 characters'),
  shopUrl: z
    .string()
    .min(3, 'Shop URL is required')
    .refine(
      (value) => {
        // Allow URLs with or without protocol
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
        return urlPattern.test(value)
      },
      'Must be a valid URL (e.g., myshop.com or https://myshop.com)'
    )
})

export type ShopRegisterInput = z.infer<typeof shopRegisterSchema>
export type ShopSetupInput = z.infer<typeof shopSetupSchema>

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
  productSku: z
    .string()
    .min(1, 'Product SKU is required')
    .max(100, 'Product SKU must be less than 100 characters'),
  scopeOfDelivery: z
    .string()
    .max(500, 'Scope of delivery must be less than 500 characters')
    .optional(),
  offerHeadline: z
    .string()
    .min(1, 'Offer headline is required')
    .max(200, 'Offer headline must be less than 200 characters'),
  offerSubheadline: z
    .string()
    .max(300, 'Offer subheadline must be less than 300 characters')
    .optional(),
  imageUrl: z
    .string()
    .min(1, 'Image is required')
    .refine(
      (value) => value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/'),
      'Must be a valid URL or uploaded image'
    ),
  minPrice: z
    .number()
    .positive('Minimum price must be positive')
    .multipleOf(0.01, 'Invalid price format'),
  fixPrice: z
    .number()
    .positive('Fix price must be positive')
    .multipleOf(0.01, 'Invalid price format')
    .default(24.60),
  minRange: z
    .number()
    .positive('Minimum range must be positive')
    .multipleOf(0.01, 'Invalid price format')
    .default(27),
  maxRange: z
    .number()
    .positive('Maximum range must be positive')
    .multipleOf(0.01, 'Invalid price format')
    .default(37.5),
  stockQuantity: z
    .number()
    .int('Stock quantity must be a whole number')
    .nonnegative('Stock quantity cannot be negative'),
  priority: z
    .number()
    .int('Priority must be a whole number')
    .positive('Priority must be positive')
    .default(999)
})
.refine((data) => data.maxRange > data.minRange, {
  message: 'Maximum range value must be greater than minimum range value',
  path: ['maxRange']
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
  }).optional().nullable(), // Allow null/undefined for mobile wallet payments
  bidAmount: z
    .number()
    .positive('Bid amount must be positive')
    .multipleOf(0.01, 'Invalid bid format'),
  locale: z.enum(['en', 'de']),
  isMobileWallet: z.boolean().optional() // Flag to indicate mobile wallet payment
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
