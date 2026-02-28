import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { shopRegisterSchema } from '@/lib/validations'
import bcrypt from 'bcrypt'
import { sendWelcomeEmail } from '@/lib/email'
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
  serverErrorResponse
} from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = shopRegisterSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { email, password } = validation.data
    const selectedPlan = body.selectedPlan // Get selected plan from request body

    // Check if email already exists
    const existingShop = await prisma.shop.findUnique({
      where: { email }
    })

    if (existingShop) {
      return errorResponse('Email already registered', 409)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Set plan tier based on registration source
    const planTier = selectedPlan === 'premium' ? 'premium' : 'payg'

    // Create shop without shopName (will be set during first-time setup)
    const shop = await prisma.shop.create({
      data: {
        email,
        passwordHash,
        trialEndsAt,
        registrationSource: selectedPlan || null, // Save registration source
        planTier, // Set plan tier based on registration source
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        registrationSource: true,
        planTier: true,
      }
    })

    // Send welcome email (don't wait for it, send asynchronously)
    sendWelcomeEmail(shop.email, 'New Shop Owner').catch((error) => {
      console.error('Failed to send welcome email:', error)
    })

    return successResponse(
      {
        message: 'Registration successful',
        shop: {
          id: shop.id,
          email: shop.email,
        }
      },
      201
    )

  } catch (error) {
    return serverErrorResponse(error)
  }
}
