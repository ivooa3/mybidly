'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/calculations'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Offer {
  id: string
  productName: string
  productSku: string
  scopeOfDelivery: string | null
  imageUrl: string
  minPrice: number
  maxPrice: number
  fixPrice: number
  stockQuantity: number
}

interface BidFormProps {
  offer: Offer
  shopId: string
  locale: 'en' | 'de'
  onBack: () => void
}

const translations = {
  en: {
    back: 'Back to Offers',
    yourBid: 'Your Bid',
    customerInfo: 'Customer Information',
    name: 'Full Name',
    email: 'Email Address',
    shippingAddress: 'Shipping Address',
    addressLine1: 'Address Line 1',
    addressLine2: 'Address Line 2 (optional)',
    city: 'City',
    postalCode: 'Postal Code',
    country: 'Country',
    payment: 'Payment Authorization',
    submitBid: 'Authorize Payment & Submit Bid',
    buyNow: 'Buy Now',
    processing: 'Processing...',
    priceRangeInfo: 'Price range for this offer',
    sliderInfo: 'Drag the slider to set your bid amount',
    success: 'Bid submitted successfully!',
    successMessage: 'Your payment has been authorized. We will review your bid and notify you via email within 24-48 hours. You will only be charged if your bid is accepted.',
    error: 'Payment authorization failed. Please try again.',
    authorizationNote: 'Your payment will be authorized (not charged). You will only be charged if your bid is accepted.'
  },
  de: {
    back: 'Zurück zu Angeboten',
    yourBid: 'Ihr Gebot',
    customerInfo: 'Kundeninformationen',
    name: 'Vollständiger Name',
    email: 'E-Mail-Adresse',
    shippingAddress: 'Lieferadresse',
    addressLine1: 'Adresszeile 1',
    addressLine2: 'Adresszeile 2 (optional)',
    city: 'Stadt',
    postalCode: 'Postleitzahl',
    country: 'Land',
    payment: 'Zahlungsautorisierung',
    submitBid: 'Zahlung autorisieren & Gebot abgeben',
    buyNow: 'Jetzt kaufen',
    processing: 'Verarbeitung...',
    priceRangeInfo: 'Preisspanne für dieses Angebot',
    sliderInfo: 'Ziehen Sie den Schieberegler, um Ihren Gebotsbetrag festzulegen',
    success: 'Gebot erfolgreich abgegeben!',
    successMessage: 'Ihre Zahlung wurde autorisiert. Wir werden Ihr Gebot prüfen und Sie innerhalb von 24-48 Stunden per E-Mail benachrichtigen. Die Belastung erfolgt nur bei Annahme Ihres Gebots.',
    error: 'Zahlungsautorisierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    authorizationNote: 'Ihre Zahlung wird autorisiert (nicht belastet). Die Belastung erfolgt nur, wenn Ihr Gebot angenommen wird.'
  }
}

const createBidSchema = (locale: 'en' | 'de') => z.object({
  customerName: z.string().min(2, locale === 'en' ? 'Name must be at least 2 characters' : 'Name muss mindestens 2 Zeichen lang sein'),
  customerEmail: z.string().email(locale === 'en' ? 'Invalid email address' : 'Ungültige E-Mail-Adresse'),
  addressLine1: z.string().min(1, locale === 'en' ? 'Address is required' : 'Adresse ist erforderlich'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, locale === 'en' ? 'City is required' : 'Stadt ist erforderlich'),
  postalCode: z.string().min(1, locale === 'en' ? 'Postal code is required' : 'Postleitzahl ist erforderlich'),
  country: z.string().length(2, locale === 'en' ? 'Country code must be 2 letters' : 'Ländercode muss 2 Buchstaben lang sein')
})

type BidFormInput = z.infer<ReturnType<typeof createBidSchema>>

function UnifiedPaymentForm({
  offer,
  shopId,
  locale,
  bidAmount,
  isFixPricePurchase,
  register,
  errors,
  onError
}: {
  offer: Offer
  shopId: string
  locale: 'en' | 'de'
  bidAmount: number
  isFixPricePurchase: boolean
  register: any
  errors: any
  onError: (message: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const t = translations[locale]

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      setIsMobile(mobileKeywords.test(userAgent) || window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate VAT (19% for Germany)
  const VAT_RATE = 0.19
  const subtotal = bidAmount
  const vat = subtotal * VAT_RATE
  const total = subtotal

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Get form data
      const form = e.currentTarget
      const formData = new FormData(form)

      // For mobile: only email is required, address comes from wallet
      // For desktop: all fields from form
      const customerEmail = formData.get('customerEmail') as string
      const customerData = isMobile ? {
        customerEmail
      } : {
        customerName: formData.get('customerName') as string,
        customerEmail: customerEmail,
        addressLine1: formData.get('addressLine1') as string,
        addressLine2: formData.get('addressLine2') as string || '',
        city: formData.get('city') as string,
        postalCode: formData.get('postalCode') as string,
        country: formData.get('country') as string
      }

      // Submit the payment to Stripe
      const { error: submitError } = await elements.submit()
      if (submitError) {
        onError(submitError.message || t.error)
        setIsProcessing(false)
        return
      }

      // Create bid with payment intent
      // Check if this is a fix price purchase (bid amount equals fix price)
      const isFixPrice = Math.abs(bidAmount - offer.fixPrice) < 0.01

      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          offerId: offer.id,
          bidAmount,
          isFixPrice,
          customerName: isMobile ? 'customerEmail' : (customerData as any).customerName,
          customerEmail: customerEmail,
          shippingAddress: isMobile ? null : {
            line1: (customerData as any).addressLine1,
            line2: (customerData as any).addressLine2,
            city: (customerData as any).city,
            postalCode: (customerData as any).postalCode,
            country: (customerData as any).country
          },
          isMobileWallet: isMobile,
          locale
        })
      })

      const result = await response.json()

      if (!result.success) {
        onError(result.error || t.error)
        setIsProcessing(false)
        return
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: result.data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/widget/success?bidId=${result.data.bidId}`,
          ...(isMobile && {
            shipping: {
              name: customerEmail,
              address: {
                line1: '',
                city: '',
                postal_code: '',
                country: 'DE'
              }
            }
          })
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        onError(confirmError.message || t.error)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // For mobile wallets, extract shipping from payment intent
        if (isMobile && paymentIntent.shipping) {
          // Update bid with shipping address from wallet
          await fetch(`/api/bids/${result.data.bidId}/shipping`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shipping: paymentIntent.shipping
            })
          })
        }

        // Redirect to success page
        window.location.href = `${window.location.origin}/widget/success?bidId=${result.data.bidId}`
      }
    } catch (error) {
      onError(t.error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 text-gray-600">Product</td>
              <td className="py-2 text-right font-medium">{offer.productName}</td>
            </tr>
            {!isFixPricePurchase && (
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Your Bid</td>
                <td className="py-2 text-right font-medium">{formatCurrency(subtotal)}</td>
              </tr>
            )}
            {isFixPricePurchase && (
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Price</td>
                <td className="py-2 text-right font-medium">{formatCurrency(subtotal)}</td>
              </tr>
            )}
            <tr className="border-b border-gray-200">
              <td className="py-2 text-gray-600">VAT (19%)</td>
              <td className="py-2 text-right font-medium">{formatCurrency(vat)}</td>
            </tr>
            <tr>
              <td className="py-2 font-bold text-gray-900">Total</td>
              <td className="py-2 text-right font-bold text-lg text-purple-600">{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Customer Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.customerInfo}</h3>
        <div className="space-y-4">
          {!isMobile && (
            <Input
              label={t.name}
              {...register('customerName')}
              error={errors.customerName?.message}
              placeholder="John Doe"
            />
          )}
          <Input
            label={t.email}
            type="email"
            {...register('customerEmail')}
            error={errors.customerEmail?.message}
            placeholder="john@example.com"
          />
          {isMobile && (
            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              ℹ️ Use Apple Pay, Google Pay, or PayPal for quick checkout. Your shipping address will be collected from your wallet.
            </p>
          )}
        </div>
      </div>

      {/* Shipping Address - Only show on desktop */}
      {!isMobile && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.shippingAddress}</h3>
          <div className="space-y-4">
            <Input
              label={t.addressLine1}
              {...register('addressLine1')}
              error={errors.addressLine1?.message}
              placeholder="123 Main St"
            />
            <Input
              label={t.addressLine2}
              {...register('addressLine2')}
              error={errors.addressLine2?.message}
              placeholder="Apt 4B"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.city}
                {...register('city')}
                error={errors.city?.message}
                placeholder="Berlin"
              />
              <Input
                label={t.postalCode}
                {...register('postalCode')}
                error={errors.postalCode?.message}
                placeholder="10115"
              />
            </div>
            <Input
              label={t.country}
              {...register('country')}
              error={errors.country?.message}
              placeholder="DE"
              maxLength={2}
            />
          </div>
        </div>
      )}

      {/* Payment */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.payment}</h3>

        {/* Authorization Notice - Only show for bids, not fix price purchases */}
        {!isFixPricePurchase && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl flex-shrink-0">ℹ️</span>
              <p className="text-sm text-blue-900">{t.authorizationNote}</p>
            </div>
          </div>
        )}

        <PaymentElement />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? t.processing : (isFixPricePurchase ? t.buyNow : t.submitBid)}
      </Button>
    </form>
  )
}

export function BidForm({ offer, shopId, locale, onBack }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState(offer.minPrice)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Detect if this is a "Buy It Now" purchase (fix price)
  const isFixPricePurchase = bidAmount === offer.fixPrice
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  const t = translations[locale]
  const bidSchema = createBidSchema(locale)

  // Detect if device is mobile (for parent component)
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
    setIsMobileDevice(mobileKeywords.test(userAgent) || window.innerWidth < 768)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<BidFormInput>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      country: 'DE'
    }
  })

  // Create payment intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoadingPayment(true)
      try {
        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: bidAmount,
            locale
          })
        })

        const result = await response.json()

        if (result.success) {
          setClientSecret(result.data.clientSecret)
        } else {
          setError(result.error || t.error)
        }
      } catch (err) {
        setError(t.error)
      } finally {
        setIsLoadingPayment(false)
      }
    }

    createPaymentIntent()
  }, [bidAmount, locale, t.error])

  // Calculate VAT (19% for Germany)
  const VAT_RATE = 0.19
  const subtotal = bidAmount
  const vat = subtotal * VAT_RATE
  const total = subtotal

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h2>
          <p className="text-gray-600 mb-6">{t.successMessage}</p>
          <Button onClick={onBack} variant="secondary">
            {t.back}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M15 19l-7-7 7-7"></path>
        </svg>
        {t.back}
      </button>

      {/* Bid Amount Display */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{t.yourBid}</h3>
        <div className="text-center">
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            {formatCurrency(bidAmount)}
          </p>
        </div>
      </div>

      {/* Unified Payment Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoadingPayment || !clientSecret ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t.processing}</p>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              locale,
              ...(isMobileDevice && {
                appearance: {
                  theme: 'stripe'
                },
                wallets: {
                  applePay: 'auto',
                  googlePay: 'auto'
                }
              })
            }}
          >
            <UnifiedPaymentForm
              offer={offer}
              shopId={shopId}
              locale={locale}
              bidAmount={bidAmount}
              isFixPricePurchase={isFixPricePurchase}
              register={register}
              errors={errors}
              onError={setError}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
