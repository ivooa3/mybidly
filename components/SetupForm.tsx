'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shopSetupSchema, type ShopSetupInput } from '@/lib/validations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function SetupForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ShopSetupInput>({
    resolver: zodResolver(shopSetupSchema)
  })

  const onSubmit = async (data: ShopSetupInput) => {
    setError(null)

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Setup failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Shop Name"
          type="text"
          placeholder="My Shop"
          {...register('shopName')}
          error={errors.shopName?.message}
          helperText="The name of your online shop"
        />

        <Input
          label="Shop URL"
          type="text"
          placeholder="myshop.com"
          {...register('shopUrl')}
          error={errors.shopUrl?.message}
          helperText="Your shop domain (https:// will be added automatically)"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Saving...' : 'Complete Setup'}
      </Button>
    </form>
  )
}
