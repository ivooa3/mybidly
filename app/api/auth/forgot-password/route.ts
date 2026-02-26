import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Find shop by email
    const shop = await prisma.shop.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success (don't reveal if email exists for security)
    // But only send email if shop exists
    if (shop) {
      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex')

      // Set expiry to 1 hour from now
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Save token to database
      await prisma.shop.update({
        where: { id: shop.id },
        data: {
          resetToken,
          resetTokenExpiresAt: expiresAt,
        },
      })

      // Send password reset email
      const locale = shop.preferredLanguage === 'de' ? 'de' : 'en'
      await sendPasswordResetEmail(shop.email, resetToken, locale)
    }

    // Always return success response (don't reveal if email exists)
    return NextResponse.json(
      {
        success: true,
        message: 'If an account with that email exists, you will receive a password reset link shortly.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
