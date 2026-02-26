'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { offerCreateSchema, type OfferCreateInput } from '@/lib/validations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { calculateRecommendedRange, formatCurrency, roundToSpecialDecimals } from '@/utils/calculations'

interface Offer {
  id: string
  productName: string
  productSku: string
  scopeOfDelivery: string | null
  offerHeadline: string | null
  offerSubheadline: string | null
  imageUrl: string
  minPrice: number
  fixPrice: number | null
  minRange: number
  maxRange: number
  stockQuantity: number
  priority: number
}

interface OfferEditFormProps {
  offer: Offer
}

export function OfferEditForm({ offer }: OfferEditFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [recommendedRange, setRecommendedRange] = useState({
    min: 0,
    max: 0
  })
  const [recommendedFixPrice, setRecommendedFixPrice] = useState(0)
  const [recommendedMinRangeValue, setRecommendedMinRangeValue] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OfferCreateInput>({
    resolver: zodResolver(offerCreateSchema),
    defaultValues: {
      productName: offer.productName,
      productSku: offer.productSku,
      scopeOfDelivery: offer.scopeOfDelivery || undefined,
      offerHeadline: offer.offerHeadline || undefined,
      offerSubheadline: offer.offerSubheadline || undefined,
      imageUrl: offer.imageUrl,
      minPrice: offer.minPrice,
      fixPrice: offer.fixPrice,
      minRange: offer.minRange,
      maxRange: offer.maxRange,
      stockQuantity: offer.stockQuantity,
      priority: offer.priority
    }
  })

  // Watch minPrice to calculate recommended range and auto-populate fields
  const minPrice = watch('minPrice')
  const [hasUserEditedFixPrice, setHasUserEditedFixPrice] = useState(false)
  const [hasUserEditedMinRange, setHasUserEditedMinRange] = useState(false)
  const [hasUserEditedMaxRange, setHasUserEditedMaxRange] = useState(false)

  useEffect(() => {
    if (minPrice && minPrice > 0) {
      const minRec = minPrice * 0.9  // -10%
      const maxRec = minPrice * 1.25 // +25%
      setRecommendedRange({ min: minRec, max: maxRec })

      // Calculate recommended fix price (92% of MAX range price)
      const calculatedFixPrice = maxRec * 0.92
      setRecommendedFixPrice(calculatedFixPrice)

      // Calculate recommended minimum range value with special rounding
      const minRangeValue = roundToSpecialDecimals(minRec)
      const maxRangeValue = roundToSpecialDecimals(maxRec)
      setRecommendedMinRangeValue(minRangeValue)

      // Auto-populate fixPrice if user hasn't manually edited it
      if (!hasUserEditedFixPrice) {
        setValue('fixPrice', Number(calculatedFixPrice.toFixed(2)))
      }

      // Auto-populate minRange if user hasn't manually edited it (as actual value with special rounding)
      if (!hasUserEditedMinRange) {
        setValue('minRange', minRangeValue)
      }

      // Auto-populate maxRange if user hasn't manually edited it (as actual value with special rounding)
      if (!hasUserEditedMaxRange) {
        setValue('maxRange', maxRangeValue)
      }
    }
  }, [minPrice, hasUserEditedFixPrice, hasUserEditedMinRange, hasUserEditedMaxRange, setValue])

  const onSubmit = async (data: OfferCreateInput) => {
    setError(null)

    try {
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        router.push('/dashboard/offers')
        router.refresh()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to update offer. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Product Name"
          {...register('productName')}
          error={errors.productName?.message}
          placeholder="e.g., Premium Bicycle Helmet"
        />

        <Input
          label="Product SKU *"
          {...register('productSku')}
          error={errors.productSku?.message}
          placeholder="e.g., HELMET-001"
        />
      </div>

      <Input
        label="Scope of Delivery (optional)"
        {...register('scopeOfDelivery')}
        error={errors.scopeOfDelivery?.message}
        placeholder="e.g., 1x Helmet, 1x Carrying bag, 1x User manual"
        helperText="Will be shown as a tooltip on the product page"
      />

      <Input
        label="Offer Headline (optional)"
        {...register('offerHeadline')}
        error={errors.offerHeadline?.message}
        placeholder="e.g., Want this helmet at a special price?"
        helperText="Custom headline shown in the widget"
      />

      <Input
        label="Offer Subheadline (optional)"
        {...register('offerSubheadline')}
        error={errors.offerSubheadline?.message}
        placeholder="e.g., Make your bid and get it delivered to your doorstep!"
        helperText="Custom subheadline shown in the widget"
      />

      <Controller
        name="imageUrl"
        control={control}
        render={({ field }) => (
          <ImageUpload
            value={field.value}
            onChange={field.onChange}
            error={errors.imageUrl?.message}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Minimum Selling Price (€) *"
          type="number"
          step="0.01"
          {...register('minPrice', { valueAsNumber: true })}
          error={errors.minPrice?.message}
          placeholder="30.00"
          tooltip="Your base cost/minimum acceptable price. Bids below this will auto-decline after 2 hours if not manually accepted. (incl. VAT)"
        />

        <Input
          label="Fix Selling Price (€) *"
          type="number"
          step="0.01"
          {...register('fixPrice', {
            valueAsNumber: true,
            onChange: () => setHasUserEditedFixPrice(true)
          })}
          error={errors.fixPrice?.message}
          placeholder="24.60"
          tooltip="Bids at or above this price are instantly accepted and charged. (incl. VAT)"
          helperText={recommendedFixPrice > 0 ? `💡 Recommended: ${formatCurrency(recommendedFixPrice)}` : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Minimum Range (€) *"
          type="number"
          step="0.20"
          {...register('minRange', {
            valueAsNumber: true,
            onChange: () => setHasUserEditedMinRange(true)
          })}
          error={errors.minRange?.message}
          placeholder="27.00"
          tooltip="Minimum bid price in euros (incl. VAT)"
          helperText={recommendedMinRangeValue > 0 ? `💡 Recommended: ${formatCurrency(recommendedMinRangeValue)}` : undefined}
        />

        <Input
          label="Maximum Range (€) *"
          type="number"
          step="0.20"
          {...register('maxRange', {
            valueAsNumber: true,
            onChange: () => setHasUserEditedMaxRange(true)
          })}
          error={errors.maxRange?.message}
          placeholder="37.50"
          tooltip="Maximum bid price in euros (incl. VAT)"
          helperText={recommendedRange.max > 0 ? `💡 Recommended: ${formatCurrency(roundToSpecialDecimals(recommendedRange.max))}` : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock Quantity *"
          type="number"
          {...register('stockQuantity', { valueAsNumber: true })}
          error={errors.stockQuantity?.message}
          placeholder="100"
          tooltip="If 0 then offer will not be visible"
        />

        <Input
          label="Priority Offer *"
          type="number"
          {...register('priority', { valueAsNumber: true })}
          error={errors.priority?.message}
          placeholder="1"
          tooltip="Set display order: 1 = shown first, 2 = second, etc. Only one offer shows at a time based on priority and stock availability"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Updating...' : 'Update Offer'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/dashboard/offers')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
