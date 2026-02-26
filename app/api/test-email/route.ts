import { NextRequest } from 'next/server'
import {
  sendBidConfirmationEmail,
  sendBidAcceptedEmail,
  sendBidDeclinedEmail,
  sendOrderNotificationToShopOwner,
  sendWelcomeEmail
} from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/api-response'

/**
 * Test email sending endpoint
 * Usage: POST /api/test-email with body: { type: 'welcome' | 'bid-confirmation' | 'bid-accepted' | 'bid-declined' | 'shop-owner', email: 'test@example.com' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, locale = 'en' } = body

    if (!email) {
      return errorResponse('Email is required', 400)
    }

    // Test data
    const testBidData = {
      customerName: 'John Doe',
      customerEmail: email,
      bidAmount: 35.00,
      productName: 'Premium Bicycle Helmet',
      productSku: 'HELMET-001',
      shippingAddress: {
        line1: '123 Main Street',
        line2: 'Apt 4',
        city: 'Berlin',
        postalCode: '10115',
        country: 'DE'
      }
    }

    const testShopOwnerData = {
      shopOwnerEmail: email,
      shopName: 'Test Shop',
      bidAmount: 35.00,
      productName: 'Premium Bicycle Helmet',
      productSku: 'HELMET-001',
      customerName: 'John Doe',
      customerEmail: 'customer@example.com',
      shippingAddress: {
        line1: '123 Main Street',
        line2: 'Apt 4',
        city: 'Berlin',
        postalCode: '10115',
        country: 'DE'
      }
    }

    let result

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(email, 'Test Shop')
        break

      case 'bid-confirmation':
        result = await sendBidConfirmationEmail(testBidData, locale)
        break

      case 'bid-accepted':
        result = await sendBidAcceptedEmail(testBidData, locale)
        break

      case 'bid-declined':
        result = await sendBidDeclinedEmail(testBidData, locale)
        break

      case 'shop-owner':
        result = await sendOrderNotificationToShopOwner(testShopOwnerData)
        break

      default:
        return errorResponse('Invalid email type. Use: welcome, bid-confirmation, bid-accepted, bid-declined, or shop-owner', 400)
    }

    return successResponse({
      message: `Test email sent successfully to ${email}`,
      type,
      locale,
      result
    })

  } catch (error: any) {
    console.error('Test email error:', error)
    return errorResponse(error.message || 'Failed to send test email', 500)
  }
}
