import { Resend } from 'resend'

// Gracefully handle missing API key - don't crash on import
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Email sender configuration
// For development: use onboarding@resend.dev
// For production: use your verified domain (e.g., orders@mybidly.io)
const FROM_EMAIL = process.env.NODE_ENV === 'production'
  ? 'myBidly <orders@mybidly.io>'
  : 'myBidly <onboarding@resend.dev>'

// BCC all emails to support for monitoring
const BCC_EMAIL = 'support@next-commerce.io'

interface BidEmailData {
  customerName: string
  customerEmail: string
  bidAmount: number
  productName: string
  productSku: string
  shippingAddress: any
}

interface ShopOwnerEmailData {
  shopOwnerEmail: string
  shopName: string
  bidAmount: number
  productName: string
  productSku: string
  customerName: string
  customerEmail: string
  shippingAddress: any
}

/**
 * Send bid confirmation email to customer (immediately after payment)
 */
export async function sendBidConfirmationEmail(
  data: BidEmailData,
  locale: 'en' | 'de'
) {
  const subject = locale === 'de'
    ? 'Ihr Gebot wurde eingereicht'
    : 'Your bid has been submitted'

  const html = locale === 'de'
    ? getBidConfirmationTemplateDE(data)
    : getBidConfirmationTemplateEN(data)

  if (!resend) {
    console.warn('Resend not configured - skipping bid confirmation email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Bid confirmation email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send bid confirmation email:', error)
    throw error
  }
}

/**
 * Send bid accepted email to customer (order confirmation)
 */
export async function sendBidAcceptedEmail(
  data: BidEmailData,
  locale: 'en' | 'de'
) {
  const subject = locale === 'de'
    ? 'Gute Neuigkeiten! Ihr Gebot wurde angenommen'
    : 'Great news! Your bid was accepted'

  const html = locale === 'de'
    ? getBidAcceptedTemplateDE(data)
    : getBidAcceptedTemplateEN(data)

  if (!resend) {
    console.warn('Resend not configured - skipping bid accepted email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Bid accepted email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send bid accepted email:', error)
    throw error
  }
}

/**
 * Send bid declined email to customer
 */
export async function sendBidDeclinedEmail(
  data: BidEmailData,
  locale: 'en' | 'de'
) {
  const subject = locale === 'de'
    ? 'Bezüglich Ihres Gebots'
    : 'Regarding your bid'

  const html = locale === 'de'
    ? getBidDeclinedTemplateDE(data)
    : getBidDeclinedTemplateEN(data)

  if (!resend) {
    console.warn('Resend not configured - skipping bid declined email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Bid declined email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send bid declined email:', error)
    throw error
  }
}

/**
 * Send new order notification to shop owner
 */
export async function sendOrderNotificationToShopOwner(data: ShopOwnerEmailData) {
  const subject = `New Order: ${data.productName} - €${data.bidAmount.toFixed(2)}`

  const html = getShopOwnerOrderTemplate(data)

  if (!resend) {
    console.warn('Resend not configured - skipping shop owner notification email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.shopOwnerEmail,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Shop owner order notification sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send shop owner notification:', error)
    throw error
  }
}

/**
 * Send welcome email to new shop owner
 */
export async function sendWelcomeEmail(
  email: string,
  shopName: string,
  locale: 'en' | 'de' = 'en'
) {
  const subject = locale === 'de'
    ? 'Willkommen bei myBidly!'
    : 'Welcome to myBidly!'

  const html = locale === 'de'
    ? getWelcomeTemplateDE(shopName)
    : getWelcomeTemplateEN(shopName)

  if (!resend) {
    console.warn('Resend not configured - skipping welcome email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Welcome email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    // Don't throw - welcome email is not critical
    return null
  }
}

/**
 * Send Premium tier welcome email to shop owner
 */
export async function sendPremiumWelcomeEmail(
  email: string,
  shopName: string,
  locale: 'en' | 'de' = 'en'
) {
  const subject = locale === 'de'
    ? '🎉 Willkommen bei myBidly Premium!'
    : '🎉 Welcome to myBidly Premium!'

  const html = locale === 'de'
    ? getPremiumWelcomeTemplateDE(shopName)
    : getPremiumWelcomeTemplateEN(shopName)

  if (!resend) {
    console.warn('Resend not configured - skipping premium welcome email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Premium welcome email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send premium welcome email:', error)
    // Don't throw - welcome email is not critical
    return null
  }
}

/**
 * Send password reset email to shop owner
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  locale: 'en' | 'de'
) {
  const subject = locale === 'de'
    ? 'Passwort zurücksetzen - myBidly'
    : 'Reset Your Password - myBidly'

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  const html = locale === 'de'
    ? getPasswordResetTemplateDE(email, resetUrl)
    : getPasswordResetTemplateEN(email, resetUrl)

  if (!resend) {
    console.warn('Resend not configured - skipping password reset email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Password reset email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw error
  }
}

interface MissedOpportunitiesEmailData {
  shopName: string
  shopOwnerEmail: string
  missedViewsThisWeek: number
  missedViewsLastWeek: number
  estimatedLostRevenue: number
  averageBidAmount: number
  acceptedBidsThisMonth: number
  freeMonthlyLimit: number
  locale: 'en' | 'de'
}

/**
 * Send weekly missed opportunities email to shop owner
 *
 * ⚠️ DEACTIVATED - Not needed with current pricing model (Pay-as-you-go)
 * This function is kept for reference but should not be called.
 *
 * To re-enable: Remove this comment block and uncomment the function below
 */
export async function sendMissedOpportunitiesEmail(data: MissedOpportunitiesEmailData) {
  console.warn('⚠️ Missed opportunities email is deactivated - not sending')
  return null

  /*
  // DEACTIVATED CODE - Uncomment to re-enable
  const subject = data.locale === 'de'
    ? `💰 Sie haben diese Woche ${data.missedViewsThisWeek} potenzielle Verkäufe verpasst`
    : `💰 You missed ${data.missedViewsThisWeek} potential sales this week`

  const html = data.locale === 'de'
    ? getMissedOpportunitiesTemplateDE(data)
    : getMissedOpportunitiesTemplateEN(data)

  if (!resend) {
    console.warn('Resend not configured - skipping missed opportunities email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.shopOwnerEmail,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Missed opportunities email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send missed opportunities email:', error)
    throw error
  }
  */
}

// Email Templates

function getPasswordResetTemplateEN(email: string, resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔐 myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
    </div>

    <div class="content">
      <h2>Reset Your Password</h2>

      <p>Hi there,</p>

      <p>We received a request to reset the password for your myBidly account (${email}).</p>

      <div class="box">
        <p style="margin: 0;"><strong>Click the button below to reset your password:</strong></p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #9333ea; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">⏰ Important</h3>
        <p>This link will expire in <strong>1 hour</strong> for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      </div>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getPasswordResetTemplateDE(email: string, resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔐 myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Passwort zurücksetzen</p>
    </div>

    <div class="content">
      <h2>Passwort zurücksetzen</h2>

      <p>Hallo,</p>

      <p>Wir haben eine Anfrage zum Zurücksetzen des Passworts für Ihr myBidly-Konto (${email}) erhalten.</p>

      <div class="box">
        <p style="margin: 0;"><strong>Klicken Sie auf die Schaltfläche unten, um Ihr Passwort zurückzusetzen:</strong></p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Passwort zurücksetzen</a>
        </div>
        <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
          Oder kopieren Sie diesen Link in Ihren Browser:<br>
          <a href="${resetUrl}" style="color: #9333ea; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">⏰ Wichtig</h3>
        <p>Dieser Link läuft aus Sicherheitsgründen in <strong>1 Stunde</strong> ab.</p>
        <p>Wenn Sie diese Passwortzurücksetzung nicht angefordert haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.</p>
      </div>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">Dies ist eine automatische E-Mail. Bitte antworten Sie nicht darauf.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}


function getBidConfirmationTemplateEN(data: BidEmailData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #9333ea; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Bid Confirmation</p>
    </div>

    <div class="content">
      <h2>Hi ${data.customerName},</h2>

      <p>Thank you for your bid! We've received your payment and are reviewing your offer.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Bid Details</h3>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Your Bid:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
        <p style="font-size: 12px; color: #6b7280;">Including VAT</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">What's Next?</h3>
        <p>We're reviewing your bid and will notify you within the next <strong>20 minutes</strong>.</p>
        <p>You'll receive an email with the decision.</p>
      </div>

      <p>Thank you for choosing myBidly!</p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidConfirmationTemplateDE(data: BidEmailData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #9333ea; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Gebotsbestätigung</p>
    </div>

    <div class="content">
      <h2>Hallo ${data.customerName},</h2>

      <p>Vielen Dank für Ihr Gebot! Wir haben Ihre Zahlung erhalten und prüfen Ihr Angebot.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Gebotsdetails</h3>
        <p><strong>Produkt:</strong> ${data.productName}</p>
        <p><strong>Ihr Gebot:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
        <p style="font-size: 12px; color: #6b7280;">Inkl. MwSt.</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Wie geht es weiter?</h3>
        <p>Wir prüfen Ihr Gebot und benachrichtigen Sie innerhalb der nächsten <strong>20 Minuten</strong>.</p>
        <p>Sie erhalten eine E-Mail mit der Entscheidung.</p>
      </div>

      <p>Vielen Dank, dass Sie sich für myBidly entschieden haben!</p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">Dies ist eine automatische E-Mail. Bitte nicht antworten.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidAcceptedTemplateEN(data: BidEmailData) {
  const address = data.shippingAddress
  const addressText = `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.postalCode} ${address.city}, ${address.country}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .success { background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center; color: #065f46; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Confirmation</p>
    </div>

    <div class="content">
      <div class="success">
        ✓ Congratulations! Your bid was accepted!
      </div>

      <h2>Hi ${data.customerName},</h2>

      <p>Great news! Your bid has been accepted and your order is confirmed.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>SKU:</strong> ${data.productSku}</p>
        <p><strong>Amount Paid:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Shipping Address</h3>
        <p>${addressText}</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Next Steps</h3>
        <p>Your order will be shipped soon. You'll receive a shipping confirmation once your item is on its way.</p>
        <p>Expected delivery: 3-5 business days</p>
      </div>

      <p>Thank you for your purchase!</p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #10b981; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #10b981; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidAcceptedTemplateDE(data: BidEmailData) {
  const address = data.shippingAddress
  const addressText = `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.postalCode} ${address.city}, ${address.country}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .success { background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center; color: #065f46; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Bestellbestätigung</p>
    </div>

    <div class="content">
      <div class="success">
        ✓ Glückwunsch! Ihr Gebot wurde angenommen!
      </div>

      <h2>Hallo ${data.customerName},</h2>

      <p>Gute Neuigkeiten! Ihr Gebot wurde angenommen und Ihre Bestellung ist bestätigt.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Bestelldetails</h3>
        <p><strong>Produkt:</strong> ${data.productName}</p>
        <p><strong>Artikelnummer:</strong> ${data.productSku}</p>
        <p><strong>Bezahlter Betrag:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Lieferadresse</h3>
        <p>${addressText}</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Nächste Schritte</h3>
        <p>Ihre Bestellung wird bald versendet. Sie erhalten eine Versandbestätigung, sobald Ihr Artikel unterwegs ist.</p>
        <p>Voraussichtliche Lieferzeit: 3-5 Werktage</p>
      </div>

      <p>Vielen Dank für Ihren Kauf!</p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #10b981; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #10b981; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">Dies ist eine automatische E-Mail. Bitte nicht antworten.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidDeclinedTemplateEN(data: BidEmailData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Regarding Your Bid</p>
    </div>

    <div class="content">
      <h2>Hi ${data.customerName},</h2>

      <p>Thank you for your interest in <strong>${data.productName}</strong>.</p>

      <p>Unfortunately, we are unable to accept your bid at this time.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Refund Information</h3>
        <p><strong>Amount:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
        <p>Your payment has been <strong>fully refunded</strong> and will appear in your account within 5-10 business days.</p>
      </div>

      <p>Thank you for your understanding.</p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #6b7280; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #6b7280; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidDeclinedTemplateDE(data: BidEmailData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Bezüglich Ihres Gebots</p>
    </div>

    <div class="content">
      <h2>Hallo ${data.customerName},</h2>

      <p>Vielen Dank für Ihr Interesse an <strong>${data.productName}</strong>.</p>

      <p>Leider können wir Ihr Gebot derzeit nicht annehmen.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Erstattungsinformationen</h3>
        <p><strong>Betrag:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
        <p>Ihre Zahlung wurde <strong>vollständig erstattet</strong> und wird innerhalb von 5-10 Werktagen auf Ihrem Konto erscheinen.</p>
      </div>

      <p>Vielen Dank für Ihr Verständnis.</p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #6b7280; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #6b7280; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">Dies ist eine automatische E-Mail. Bitte nicht antworten.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getShopOwnerOrderTemplateEN(data: ShopOwnerEmailData) {
  const address = data.shippingAddress
  const addressHTML = `
    ${address.line1}<br>
    ${address.line2 ? address.line2 + '<br>' : ''}
    ${address.postalCode} ${address.city}<br>
    ${address.country}
  `

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .alert { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #9333ea; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
    td.label { font-weight: bold; width: 150px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 New Order Received!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">myBidly Order Notification</p>
    </div>

    <div class="content">
      <div class="alert">
        <strong>⚡ Action Required:</strong> Please prepare and ship this order as soon as possible.
      </div>

      <h2>Hello ${data.shopName},</h2>

      <p>You've received a new order through myBidly!</p>

      <div class="box">
        <h3 style="margin-top: 0;">Order Summary</h3>
        <table>
          <tr>
            <td class="label">Product:</td>
            <td>${data.productName}</td>
          </tr>
          <tr>
            <td class="label">SKU:</td>
            <td>${data.productSku}</td>
          </tr>
          <tr>
            <td class="label">Order Amount:</td>
            <td><span class="amount">€${data.bidAmount.toFixed(2)}</span></td>
          </tr>
        </table>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Customer Information</h3>
        <table>
          <tr>
            <td class="label">Name:</td>
            <td>${data.customerName}</td>
          </tr>
          <tr>
            <td class="label">Email:</td>
            <td><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td>
          </tr>
        </table>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Shipping Address</h3>
        <p>${addressHTML}</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Next Steps</h3>
        <ol>
          <li>Prepare the item for shipment</li>
          <li>Pack it securely</li>
          <li>Ship to the address above</li>
          <li>Customer expects delivery within 3-5 business days</li>
        </ol>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bids"
           style="background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          View in Dashboard
        </a>
      </p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">This is an automated notification.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getShopOwnerOrderTemplateDE(data: ShopOwnerEmailData) {
  const address = data.shippingAddress
  const addressHTML = `
    ${address.line1}<br>
    ${address.line2 ? address.line2 + '<br>' : ''}
    ${address.postalCode} ${address.city}<br>
    ${address.country}
  `

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .alert { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #9333ea; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
    td.label { font-weight: bold; width: 150px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Neue Bestellung erhalten!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">myBidly Bestellbenachrichtigung</p>
    </div>

    <div class="content">
      <div class="alert">
        <strong>⚡ Aktion erforderlich:</strong> Bitte bereiten Sie diese Bestellung vor und versenden Sie sie so schnell wie möglich.
      </div>

      <h2>Hallo ${data.shopName},</h2>

      <p>Sie haben eine neue Bestellung über myBidly erhalten!</p>

      <div class="box">
        <h3 style="margin-top: 0;">Bestellübersicht</h3>
        <table>
          <tr>
            <td class="label">Produkt:</td>
            <td>${data.productName}</td>
          </tr>
          <tr>
            <td class="label">Artikelnummer:</td>
            <td>${data.productSku}</td>
          </tr>
          <tr>
            <td class="label">Bestellbetrag:</td>
            <td><span class="amount">€${data.bidAmount.toFixed(2)}</span></td>
          </tr>
        </table>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Kundeninformationen</h3>
        <table>
          <tr>
            <td class="label">Name:</td>
            <td>${data.customerName}</td>
          </tr>
          <tr>
            <td class="label">E-Mail:</td>
            <td><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td>
          </tr>
        </table>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Lieferadresse</h3>
        <p>${addressHTML}</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Nächste Schritte</h3>
        <ol>
          <li>Bereiten Sie den Artikel für den Versand vor</li>
          <li>Verpacken Sie ihn sicher</li>
          <li>Versenden Sie an die oben angegebene Adresse</li>
          <li>Der Kunde erwartet die Lieferung innerhalb von 3-5 Werktagen</li>
        </ol>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bids"
           style="background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Im Dashboard anzeigen
        </a>
      </p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">Dies ist eine automatische Benachrichtigung.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Wrapper function for backwards compatibility
function getShopOwnerOrderTemplate(data: ShopOwnerEmailData) {
  return getShopOwnerOrderTemplateEN(data)
}

function getWelcomeTemplateEN(shopName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Welcome to myBidly!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Let's get you started</p>
    </div>

    <div class="content">
      <h2>Welcome, ${shopName}!</h2>

      <p>Thank you for joining myBidly. You're now ready to start earning incremental revenue with bid-based upsells.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Quick Start Guide</h3>
        <ol>
          <li><strong>Complete your profile</strong> - Add your shop details</li>
          <li><strong>Create your first offer</strong> - Add a product to upsell</li>
          <li><strong>Copy the embed code</strong> - Install it on your thank-you page</li>
          <li><strong>Start receiving bids!</strong> - Earn from every post-purchase offer</li>
        </ol>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
           style="background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>

      <p>Need help? Contact us at <a href="mailto:support@mybidly.io" style="color: #9333ea;">support@mybidly.io</a></p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getWelcomeTemplateDE(shopName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Willkommen bei myBidly!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Lassen Sie uns beginnen</p>
    </div>

    <div class="content">
      <h2>Willkommen, ${shopName}!</h2>

      <p>Vielen Dank, dass Sie myBidly beigetreten sind. Sie sind jetzt bereit, zusätzliche Einnahmen mit gebotsbasierten Upsells zu erzielen.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Schnellstart-Anleitung</h3>
        <ol>
          <li><strong>Vervollständigen Sie Ihr Profil</strong> - Fügen Sie Ihre Shop-Details hinzu</li>
          <li><strong>Erstellen Sie Ihr erstes Angebot</strong> - Fügen Sie ein Produkt zum Upselling hinzu</li>
          <li><strong>Kopieren Sie den Einbettungscode</strong> - Installieren Sie ihn auf Ihrer Dankeseite</li>
          <li><strong>Beginnen Sie Gebote zu erhalten!</strong> - Verdienen Sie mit jedem Post-Purchase-Angebot</li>
        </ol>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
           style="background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Zum Dashboard
        </a>
      </p>

      <p>Brauchen Sie Hilfe? Kontaktieren Sie uns unter <a href="mailto:support@mybidly.io" style="color: #9333ea;">support@mybidly.io</a></p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getMissedOpportunitiesTemplateEN(data: MissedOpportunitiesEmailData) {
  const percentChange = data.missedViewsLastWeek > 0
    ? Math.round(((data.missedViewsThisWeek - data.missedViewsLastWeek) / data.missedViewsLastWeek) * 100)
    : 0
  const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'same'
  const trendEmoji = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .alert { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; padding: 15px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #dc2626; }
    .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
    .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 18px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 28px; font-weight: bold; color: #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">💰 Your Weekly Report</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Missed Sales Opportunities</p>
    </div>

    <div class="content">
      <div class="alert">
        <h2 style="margin: 0 0 10px 0;">⚠️ ${data.shopName}, you're leaving money on the table!</h2>
        <p style="margin: 0; font-size: 16px;">You've reached your free tier limit (${data.acceptedBidsThisMonth}/${data.freeMonthlyLimit} bids). Here's what you missed this week:</p>
      </div>

      <div class="box">
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${data.missedViewsThisWeek}</div>
            <div class="stat-label">Missed Customers</div>
          </div>
          <div class="stat">
            <div class="stat-value">€${Math.round(data.estimatedLostRevenue)}</div>
            <div class="stat-label">Lost Revenue</div>
          </div>
        </div>
        ${percentChange !== 0 ? `
        <p style="text-align: center; margin: 15px 0; color: #6b7280;">
          ${trendEmoji} ${Math.abs(percentChange)}% ${trend === 'up' ? 'more' : 'fewer'} than last week
        </p>
        ` : ''}
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">📊 The Numbers Don't Lie</h3>
        <ul style="line-height: 2;">
          <li><strong>${data.missedViewsThisWeek} customers</strong> visited your widget this week</li>
          <li>They were ready to bid <strong>~€${data.averageBidAmount.toFixed(2)} on average</strong></li>
          <li>You could have earned an extra <strong class="amount">€${Math.round(data.estimatedLostRevenue)}</strong></li>
          <li>But they couldn't because you hit the free tier limit</li>
        </ul>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">💡 Simple Math</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px;">Lost revenue this week:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">€${Math.round(data.estimatedLostRevenue)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px;">Pro plan cost per week:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">€3.50</td>
          </tr>
          <tr style="background: #dcfce7;">
            <td style="padding: 10px; font-weight: bold;">Your profit by upgrading:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #16a34a;">€${Math.round(data.estimatedLostRevenue - 3.5)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <h3>Stop Losing Money</h3>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/upgrade" class="button">
          Upgrade to Pro - €14/month
        </a>
        <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
          ✓ Unlimited bids &nbsp; ✓ No limits &nbsp; ✓ Cancel anytime
        </p>
      </div>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">This is your weekly missed opportunities report. Unsubscribe in dashboard settings.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getPremiumWelcomeTemplateEN(shopName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
    .highlight { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); padding: 20px; border-radius: 8px; border: 2px solid #7c3aed; margin: 20px 0; }
    .feature { display: flex; align-items: start; margin: 15px 0; }
    .feature-icon { font-size: 24px; margin-right: 15px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 36px;">👑 Welcome to Premium!</h1>
      <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">You've unlocked unlimited potential</p>
    </div>

    <div class="content">
      <h2>Congratulations, ${shopName}!</h2>

      <p>You've just upgraded to <strong>myBidly Premium</strong>. Thank you for choosing to grow your business with us!</p>

      <div class="highlight">
        <h3 style="margin-top: 0; color: #7c3aed;">🚀 What You Get with Premium</h3>

        <div class="feature">
          <div class="feature-icon">✅</div>
          <div>
            <strong>Unlimited Bids</strong><br>
            <span style="color: #6b7280; font-size: 14px;">No more limits - accept as many bids as you want</span>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">💎</div>
          <div>
            <strong>Priority Support</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Get faster responses from our support team</span>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">📊</div>
          <div>
            <strong>Advanced Analytics</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Track your performance with detailed insights</span>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">🎨</div>
          <div>
            <strong>Custom Branding (Coming Soon)</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Remove myBidly branding from your widget</span>
          </div>
        </div>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">💡 Pro Tip</h3>
        <p>You're now free to scale without limits! The more bids you accept, the more revenue you generate. We recommend:</p>
        <ul>
          <li>Create multiple offers to test different products</li>
          <li>Monitor your analytics dashboard daily</li>
          <li>Adjust your pricing strategy based on bid patterns</li>
        </ul>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">📞 Need Help?</h3>
        <p>As a Premium member, you get priority support. Reach out anytime:</p>
        <p>Email: <a href="mailto:support@mybidly.io" style="color: #7c3aed;">support@mybidly.io</a></p>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
           style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Go to Dashboard
        </a>
      </p>

      <p style="text-align: center; color: #6b7280;">
        Thank you for being a valued Premium member! 🎉
      </p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #7c3aed; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #7c3aed; text-decoration: none;">support@mybidly.io</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getPremiumWelcomeTemplateDE(shopName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
    .highlight { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); padding: 20px; border-radius: 8px; border: 2px solid #7c3aed; margin: 20px 0; }
    .feature { display: flex; align-items: start; margin: 15px 0; }
    .feature-icon { font-size: 24px; margin-right: 15px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 36px;">👑 Willkommen bei Premium!</h1>
      <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">Sie haben unbegrenztes Potenzial freigeschaltet</p>
    </div>

    <div class="content">
      <h2>Glückwunsch, ${shopName}!</h2>

      <p>Sie haben gerade auf <strong>myBidly Premium</strong> aufgerüstet. Vielen Dank, dass Sie sich entschieden haben, Ihr Geschäft mit uns auszubauen!</p>

      <div class="highlight">
        <h3 style="margin-top: 0; color: #7c3aed;">🚀 Was Sie mit Premium erhalten</h3>

        <div class="feature">
          <div class="feature-icon">✅</div>
          <div>
            <strong>Unbegrenzte Gebote</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Keine Limits mehr - akzeptieren Sie so viele Gebote wie Sie möchten</span>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">💎</div>
          <div>
            <strong>Priority Support</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Schnellere Antworten von unserem Support-Team</span>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">📊</div>
          <div>
            <strong>Erweiterte Analysen</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Verfolgen Sie Ihre Leistung mit detaillierten Einblicken</span>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">🎨</div>
          <div>
            <strong>Custom Branding (Demnächst)</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Entfernen Sie myBidly-Branding aus Ihrem Widget</span>
          </div>
        </div>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">💡 Pro-Tipp</h3>
        <p>Sie können jetzt unbegrenzt skalieren! Je mehr Gebote Sie akzeptieren, desto mehr Umsatz generieren Sie. Wir empfehlen:</p>
        <ul>
          <li>Erstellen Sie mehrere Angebote, um verschiedene Produkte zu testen</li>
          <li>Überprüfen Sie Ihr Analyse-Dashboard täglich</li>
          <li>Passen Sie Ihre Preisstrategie basierend auf Gebotsmustern an</li>
        </ul>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">📞 Brauchen Sie Hilfe?</h3>
        <p>Als Premium-Mitglied erhalten Sie Priority Support. Kontaktieren Sie uns jederzeit:</p>
        <p>E-Mail: <a href="mailto:support@mybidly.io" style="color: #7c3aed;">support@mybidly.io</a></p>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
           style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Zum Dashboard
        </a>
      </p>

      <p style="text-align: center; color: #6b7280;">
        Vielen Dank, dass Sie ein geschätztes Premium-Mitglied sind! 🎉
      </p>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #7c3aed; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #7c3aed; text-decoration: none;">support@mybidly.io</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getMissedOpportunitiesTemplateDE(data: MissedOpportunitiesEmailData) {
  const percentChange = data.missedViewsLastWeek > 0
    ? Math.round(((data.missedViewsThisWeek - data.missedViewsLastWeek) / data.missedViewsLastWeek) * 100)
    : 0
  const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'same'
  const trendEmoji = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .alert { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; padding: 15px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #dc2626; }
    .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
    .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 18px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 28px; font-weight: bold; color: #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">💰 Ihr Wochenbericht</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Verpasste Verkaufschancen</p>
    </div>

    <div class="content">
      <div class="alert">
        <h2 style="margin: 0 0 10px 0;">⚠️ ${data.shopName}, Sie lassen Geld auf dem Tisch liegen!</h2>
        <p style="margin: 0; font-size: 16px;">Sie haben Ihr Gratislimit erreicht (${data.acceptedBidsThisMonth}/${data.freeMonthlyLimit} Gebote). Das haben Sie diese Woche verpasst:</p>
      </div>

      <div class="box">
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${data.missedViewsThisWeek}</div>
            <div class="stat-label">Verpasste Kunden</div>
          </div>
          <div class="stat">
            <div class="stat-value">€${Math.round(data.estimatedLostRevenue)}</div>
            <div class="stat-label">Entgangener Umsatz</div>
          </div>
        </div>
        ${percentChange !== 0 ? `
        <p style="text-align: center; margin: 15px 0; color: #6b7280;">
          ${trendEmoji} ${Math.abs(percentChange)}% ${trend === 'up' ? 'mehr' : 'weniger'} als letzte Woche
        </p>
        ` : ''}
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">📊 Die Zahlen lügen nicht</h3>
        <ul style="line-height: 2;">
          <li><strong>${data.missedViewsThisWeek} Kunden</strong> haben Ihr Widget diese Woche besucht</li>
          <li>Sie waren bereit, durchschnittlich <strong>~€${data.averageBidAmount.toFixed(2)}</strong> zu bieten</li>
          <li>Sie hätten zusätzlich <strong class="amount">€${Math.round(data.estimatedLostRevenue)}</strong> verdienen können</li>
          <li>Aber sie konnten nicht, weil Sie das Gratislimit erreicht haben</li>
        </ul>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">💡 Einfache Rechnung</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px;">Entgangener Umsatz diese Woche:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">€${Math.round(data.estimatedLostRevenue)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px;">Pro-Plan Kosten pro Woche:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">€3,50</td>
          </tr>
          <tr style="background: #dcfce7;">
            <td style="padding: 10px; font-weight: bold;">Ihr Gewinn durch Upgrade:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #16a34a;">€${Math.round(data.estimatedLostRevenue - 3.5)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <h3>Hören Sie auf, Geld zu verlieren</h3>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/upgrade" class="button">
          Auf Pro upgraden - €14/Monat
        </a>
        <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
          ✓ Unbegrenzte Gebote &nbsp; ✓ Keine Limits &nbsp; ✓ Jederzeit kündbar
        </p>
      </div>

      <div class="footer">
        <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
        <p style="font-size: 12px; margin-top: 10px;">Dies ist Ihr wöchentlicher Bericht über verpasste Chancen. Abmelden in den Dashboard-Einstellungen.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// ============================================================================
// PENDING PAYOUT NOTIFICATION (Unregistered Mode)
// ============================================================================

interface PendingPayoutEmailData {
  shopName: string
  shopEmail: string
  pendingPayouts: number
  locale: 'en' | 'de'
}

/**
 * Send pending payout notification to shop owner (after first sale in unregistered mode)
 * Subject: "myBidly: You have pending payouts"
 */
export async function sendPendingPayoutNotification(data: PendingPayoutEmailData) {
  const subject = 'myBidly: You have pending payouts'
  
  const html = data.locale === 'de'
    ? getPendingPayoutTemplateDE(data)
    : getPendingPayoutTemplateEN(data)

  if (!resend) {
    console.warn('Resend not configured - skipping pending payout notification')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.shopEmail,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Pending payout notification sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send pending payout notification:', error)
    throw error
  }
}

function getPendingPayoutTemplateEN(data: PendingPayoutEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #a8469a 0%, #ae40a5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .amount { font-size: 36px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #a8469a 0%, #ae40a5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Great News!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">You have pending payouts</p>
    </div>
    
    <div class="content">
      <p>Hi ${data.shopName || 'there'},</p>
      
      <p><strong>Congratulations! A customer just purchased from your offer.</strong></p>
      
      <div class="amount">€${data.pendingPayouts.toFixed(2)}</div>
      <p style="text-align: center; color: #6b7280;">in pending payouts</p>
      
      <p>To receive your money, please complete your Stripe onboarding:</p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/profile" class="button">
          Complete Stripe Setup
        </a>
      </div>
      
      <p style="margin-top: 30px;"><strong>What happens next?</strong></p>
      <ul>
        <li>Complete your Stripe onboarding (takes 2-3 minutes)</li>
        <li>We'll automatically transfer your pending funds</li>
        <li>All future sales will be paid directly to your Stripe account</li>
      </ul>
      
      <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <strong>⚠️ Important:</strong> Your funds are safe and held for you. Complete Stripe onboarding anytime to receive your money.
      </p>
      
      <p style="margin-top: 30px;">Questions? Just reply to this email.</p>
      
      <p>Best regards,<br>The myBidly Team</p>
    </div>
    
    <div class="footer">
      <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
      <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getPendingPayoutTemplateDE(data: PendingPayoutEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #a8469a 0%, #ae40a5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .amount { font-size: 36px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #a8469a 0%, #ae40a5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Großartige Neuigkeiten!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Sie haben ausstehende Auszahlungen</p>
    </div>
    
    <div class="content">
      <p>Hallo ${data.shopName || 'there'},</p>
      
      <p><strong>Glückwunsch! Ein Kunde hat gerade aus Ihrem Angebot gekauft.</strong></p>
      
      <div class="amount">€${data.pendingPayouts.toFixed(2)}</div>
      <p style="text-align: center; color: #6b7280;">ausstehende Auszahlungen</p>
      
      <p>Um Ihr Geld zu erhalten, vervollständigen Sie bitte Ihr Stripe-Onboarding:</p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/profile" class="button">
          Stripe-Einrichtung abschließen
        </a>
      </div>
      
      <p style="margin-top: 30px;"><strong>Was passiert als nächstes?</strong></p>
      <ul>
        <li>Schließen Sie Ihr Stripe-Onboarding ab (dauert 2-3 Minuten)</li>
        <li>Wir überweisen automatisch Ihre ausstehenden Gelder</li>
        <li>Alle zukünftigen Verkäufe werden direkt auf Ihr Stripe-Konto ausgezahlt</li>
      </ul>
      
      <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <strong>⚠️ Wichtig:</strong> Ihre Gelder sind sicher und werden für Sie aufbewahrt. Schließen Sie das Stripe-Onboarding jederzeit ab, um Ihr Geld zu erhalten.
      </p>
      
      <p style="margin-top: 30px;">Fragen? Antworten Sie einfach auf diese E-Mail.</p>
      
      <p>Mit freundlichen Grüßen,<br>Das myBidly-Team</p>
    </div>
    
    <div class="footer">
      <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
      <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// ============================================================================
// PAYOUT COMPLETED NOTIFICATION
// ============================================================================

interface PayoutCompletedEmailData {
  shopName: string
  shopEmail: string
  amount: number
  transferId: string
  locale: 'en' | 'de'
}

/**
 * Send payout completed notification to shop owner (after auto-transfer on Stripe connect)
 */
export async function sendPayoutCompletedEmail(data: PayoutCompletedEmailData) {
  const subject = data.locale === 'de'
    ? 'myBidly: Ihre ausstehenden Auszahlungen wurden überwiesen'
    : 'myBidly: Your pending payouts have been transferred'
  
  const html = data.locale === 'de'
    ? getPayoutCompletedTemplateDE(data)
    : getPayoutCompletedTemplateEN(data)

  if (!resend) {
    console.warn('Resend not configured - skipping payout completed email')
    return null
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.shopEmail,
      bcc: BCC_EMAIL,
      subject,
      html
    })
    console.log('Payout completed email sent:', result)
    return result
  } catch (error) {
    console.error('Failed to send payout completed email:', error)
    throw error
  }
}

function getPayoutCompletedTemplateEN(data: PayoutCompletedEmailData): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .amount { font-size: 36px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
    .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Payment Transferred!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Stripe account is now connected</p>
    </div>
    
    <div class="content">
      <p>Hi ${data.shopName || 'there'},</p>
      
      <p><strong>Great news! Your Stripe account is now connected and we've automatically transferred your pending payouts.</strong></p>
      
      <div class="info-box">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 10px 0;"><strong>Amount Transferred:</strong></td>
            <td style="padding: 10px 0; text-align: right; font-size: 24px; font-weight: bold; color: #16a34a;">€${data.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;"><strong>Transfer Date:</strong></td>
            <td style="padding: 10px 0; text-align: right; border-top: 1px solid #e5e7eb;">${today}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;"><strong>Transfer ID:</strong></td>
            <td style="padding: 10px 0; text-align: right; border-top: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${data.transferId}</td>
          </tr>
        </table>
      </div>
      
      <p><strong>When will I receive the funds?</strong></p>
      <p>You should see the funds in your Stripe account within 2-7 business days, depending on your bank and Stripe payout schedule.</p>
      
      <p style="margin-top: 30px; padding: 15px; background: #dcfce7; border-left: 4px solid #16a34a; border-radius: 4px;">
        <strong>✅ All set!</strong> All future sales will be paid directly to your Stripe account. No action needed from you.
      </p>
      
      <p style="margin-top: 30px;">You can view your payout details in your Stripe Dashboard.</p>
      
      <p>Questions? Just reply to this email.</p>
      
      <p>Best regards,<br>The myBidly Team</p>
    </div>
    
    <div class="footer">
      <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
      <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getPayoutCompletedTemplateDE(data: PayoutCompletedEmailData): string {
  const today = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .amount { font-size: 36px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
    .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Zahlung überwiesen!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Ihr Stripe-Konto ist jetzt verbunden</p>
    </div>
    
    <div class="content">
      <p>Hallo ${data.shopName || 'there'},</p>
      
      <p><strong>Großartige Neuigkeiten! Ihr Stripe-Konto ist jetzt verbunden und wir haben Ihre ausstehenden Auszahlungen automatisch überwiesen.</strong></p>
      
      <div class="info-box">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 10px 0;"><strong>Überwiesener Betrag:</strong></td>
            <td style="padding: 10px 0; text-align: right; font-size: 24px; font-weight: bold; color: #16a34a;">€${data.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;"><strong>Überweisungsdatum:</strong></td>
            <td style="padding: 10px 0; text-align: right; border-top: 1px solid #e5e7eb;">${today}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;"><strong>Überweisungs-ID:</strong></td>
            <td style="padding: 10px 0; text-align: right; border-top: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${data.transferId}</td>
          </tr>
        </table>
      </div>
      
      <p><strong>Wann erhalte ich das Geld?</strong></p>
      <p>Sie sollten das Geld innerhalb von 2-7 Werktagen auf Ihrem Stripe-Konto sehen, abhängig von Ihrer Bank und dem Stripe-Auszahlungsplan.</p>
      
      <p style="margin-top: 30px; padding: 15px; background: #dcfce7; border-left: 4px solid #16a34a; border-radius: 4px;">
        <strong>✅ Alles erledigt!</strong> Alle zukünftigen Verkäufe werden direkt auf Ihr Stripe-Konto ausgezahlt. Sie müssen nichts weiter tun.
      </p>
      
      <p style="margin-top: 30px;">Sie können Ihre Auszahlungsdetails in Ihrem Stripe-Dashboard einsehen.</p>
      
      <p>Fragen? Antworten Sie einfach auf diese E-Mail.</p>
      
      <p>Mit freundlichen Grüßen,<br>Das myBidly-Team</p>
    </div>
    
    <div class="footer">
      <p><strong>myBidly</strong> - Powered by <a href="https://mybidly.vercel.app" style="color: #9333ea; text-decoration: none;">myBidly</a></p>
      <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
