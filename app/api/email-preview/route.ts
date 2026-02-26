import { NextRequest, NextResponse } from 'next/server'

// Sample data for email previews
const sampleBidData = {
  customerName: 'John Doe',
  customerEmail: 'customer@example.com',
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

const sampleShopOwnerData = {
  shopOwnerEmail: 'shop@example.com',
  shopName: 'My Awesome Shop',
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

// Email template functions (copied from lib/email.ts for preview)
function getBidConfirmationTemplateEN(data: typeof sampleBidData) {
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
        <p>Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
        <p style="font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidConfirmationTemplateDE(data: typeof sampleBidData) {
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
        <p>Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
        <p style="font-size: 12px;">Dies ist eine automatische E-Mail. Bitte antworten Sie nicht darauf.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidAcceptedTemplateEN(data: typeof sampleBidData) {
  const addressHTML = `
    ${data.shippingAddress.line1}<br>
    ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
    ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
    ${data.shippingAddress.country}
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
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
    .success { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Confirmation</p>
    </div>

    <div class="content">
      <div class="success">✅ Your bid was accepted!</div>

      <h2>Hi ${data.customerName},</h2>

      <p>Great news! Your bid has been accepted and your order is confirmed.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>SKU:</strong> ${data.productSku}</p>
        <p><strong>Final Price:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
        <p style="font-size: 12px; color: #6b7280;">Including VAT</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Shipping Address</h3>
        <p>${addressHTML}</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">What's Next?</h3>
        <p>Your order will be prepared and shipped within <strong>1-2 business days</strong>.</p>
        <p>You'll receive a shipping confirmation email with tracking information once your item is on its way.</p>
        <p><strong>Expected Delivery:</strong> 3-5 business days</p>
      </div>

      <p>Thank you for your purchase!</p>

      <div class="footer">
        <p>Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
        <p style="font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidAcceptedTemplateDE(data: typeof sampleBidData) {
  const addressHTML = `
    ${data.shippingAddress.line1}<br>
    ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
    ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
    ${data.shippingAddress.country}
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
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
    .success { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 myBidly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Bestellbestätigung</p>
    </div>

    <div class="content">
      <div class="success">✅ Ihr Gebot wurde angenommen!</div>

      <h2>Hallo ${data.customerName},</h2>

      <p>Gute Neuigkeiten! Ihr Gebot wurde angenommen und Ihre Bestellung ist bestätigt.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Bestelldetails</h3>
        <p><strong>Produkt:</strong> ${data.productName}</p>
        <p><strong>SKU:</strong> ${data.productSku}</p>
        <p><strong>Endpreis:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
        <p style="font-size: 12px; color: #6b7280;">Inkl. MwSt.</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Versandadresse</h3>
        <p>${addressHTML}</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Wie geht es weiter?</h3>
        <p>Ihre Bestellung wird innerhalb von <strong>1-2 Werktagen</strong> vorbereitet und versendet.</p>
        <p>Sie erhalten eine Versandbestätigung mit Tracking-Informationen, sobald Ihr Artikel unterwegs ist.</p>
        <p><strong>Voraussichtliche Lieferung:</strong> 3-5 Werktage</p>
      </div>

      <p>Vielen Dank für Ihren Kauf!</p>

      <div class="footer">
        <p>Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
        <p style="font-size: 12px;">Dies ist eine automatische E-Mail. Bitte antworten Sie nicht darauf.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidDeclinedTemplateEN(data: typeof sampleBidData) {
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
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #9333ea; }
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

      <p>Unfortunately, we cannot accept your bid at this time.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Refund Information</h3>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Your Bid:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
        <p style="margin-top: 15px;">Your payment has been <strong>fully refunded</strong> and will appear in your account within <strong>5-10 business days</strong>.</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Why was my bid declined?</h3>
        <p>Your bid did not meet our current acceptance criteria. Thank you for your understanding.</p>
      </div>

      <p>Thank you for your interest in myBidly. We hope to serve you again in the future!</p>

      <div class="footer">
        <p>Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
        <p style="font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getBidDeclinedTemplateDE(data: typeof sampleBidData) {
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
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #9333ea; }
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

      <p>Leider können wir Ihr Gebot derzeit nicht annehmen.</p>

      <div class="box">
        <h3 style="margin-top: 0;">Rückerstattungsinformationen</h3>
        <p><strong>Produkt:</strong> ${data.productName}</p>
        <p><strong>Ihr Gebot:</strong> <span class="amount">€${data.bidAmount.toFixed(2)}</span></p>
        <p style="margin-top: 15px;">Ihre Zahlung wurde <strong>vollständig erstattet</strong> und wird innerhalb von <strong>5-10 Werktagen</strong> auf Ihrem Konto erscheinen.</p>
      </div>

      <div class="box">
        <h3 style="margin-top: 0;">Warum wurde mein Gebot abgelehnt?</h3>
        <p>Ihr Gebot entsprach nicht unseren aktuellen Annahmekriterien. Vielen Dank für Ihr Verständnis.</p>
      </div>

      <p>Vielen Dank für Ihr Interesse an myBidly. Wir hoffen, Sie in Zukunft wieder bedienen zu können!</p>

      <div class="footer">
        <p>Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
        <p style="font-size: 12px;">Dies ist eine automatische E-Mail. Bitte antworten Sie nicht darauf.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getShopOwnerOrderTemplate(data: typeof sampleShopOwnerData) {
  const addressHTML = `
    ${data.shippingAddress.line1}<br>
    ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
    ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
    ${data.shippingAddress.country}
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
    .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
    table { width: 100%; }
    td { padding: 8px 0; }
    .label { font-weight: bold; width: 120px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔔 New Order</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">myBidly Order Notification</p>
    </div>

    <div class="content">
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
        <p><strong>myBidly</strong> - Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
        <p style="font-size: 12px;">This is an automated notification.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
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
        <p><strong>myBidly</strong> - Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
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
        <p><strong>myBidly</strong> - Powered by <a href="https://www.next-commerce.io" style="color: #9333ea; text-decoration: none;">Next Commerce</a></p>
        <p style="margin-top: 10px;">Support: <a href="mailto:support@mybidly.io" style="color: #9333ea; text-decoration: none;">support@mybidly.io</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'welcome'
  const locale = searchParams.get('locale') || 'en'

  let html = ''

  switch (type) {
    case 'welcome':
      html = locale === 'de'
        ? getWelcomeTemplateDE('My Awesome Shop')
        : getWelcomeTemplateEN('My Awesome Shop')
      break
    case 'bid-confirmation':
      html = locale === 'de'
        ? getBidConfirmationTemplateDE(sampleBidData)
        : getBidConfirmationTemplateEN(sampleBidData)
      break
    case 'bid-accepted':
      html = locale === 'de'
        ? getBidAcceptedTemplateDE(sampleBidData)
        : getBidAcceptedTemplateEN(sampleBidData)
      break
    case 'bid-declined':
      html = locale === 'de'
        ? getBidDeclinedTemplateDE(sampleBidData)
        : getBidDeclinedTemplateEN(sampleBidData)
      break
    case 'shop-owner':
      html = getShopOwnerOrderTemplate(sampleShopOwnerData)
      break
    default:
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
