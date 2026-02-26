'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'

interface BusinessAddress {
  street?: string
  city?: string
  postalCode?: string
  country?: string
}

interface Shop {
  id: string
  email: string
  shopName: string
  firstName: string | null
  lastName: string | null
  shopUrl: string | null
  orderEmail: string | null
  businessAddress: BusinessAddress | null
  vatNumber: string | null
  stripeAccountId: string | null
  stripeOnboardingComplete: boolean
  platformFeePercentage: number
}

interface ProfileFormProps {
  shop: Shop
}

export function ProfileForm({ shop }: ProfileFormProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isConnectingStripe, setIsConnectingStripe] = useState(false)

  const address = shop.businessAddress as BusinessAddress | null

  const handleStripeConnect = async () => {
    setIsConnectingStripe(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to Stripe onboarding
        window.location.href = result.data.url
      } else {
        setError(result.error || 'Failed to connect Stripe account')
      }
    } catch (err) {
      setError('Failed to connect Stripe account. Please try again.')
    } finally {
      setIsConnectingStripe(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const data = {
      email: formData.get('email') as string,
      shopName: formData.get('shopName') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      shopUrl: formData.get('shopUrl') as string,
      orderEmail: formData.get('orderEmail') as string,
      businessAddress: {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        postalCode: formData.get('postalCode') as string,
        country: formData.get('country') as string
      },
      vatNumber: formData.get('vatNumber') as string
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Profile updated successfully!')
        router.refresh()
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Fixed toast notification at bottom-right */}
      {success && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                defaultValue={shop.firstName || ''}
                placeholder="John"
              />

              <Input
                label="Last Name"
                name="lastName"
                defaultValue={shop.lastName || ''}
                placeholder="Doe"
              />
            </div>

            <Input
              label="Login Email"
              name="email"
              type="email"
              defaultValue={shop.email}
              required
              placeholder="your@email.com"
            />

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Change Password →
              </button>
            </div>
          </div>
        </div>

        {/* Shop Information */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shop Information</h2>

          <div className="space-y-4">
            <Input
              label="Shop Name *"
              name="shopName"
              defaultValue={shop.shopName}
              required
              placeholder="John's Bike Shop"
            />

            <Input
              label="Shop URL *"
              name="shopUrl"
              value={shop.shopUrl || ''}
              disabled
              required
              placeholder="https://johnsbikes.com"
              tooltip="Cannot be changed. Contact support if needed."
            />

            <Input
              label="Order Confirmation Email *"
              name="orderEmail"
              type="email"
              defaultValue={shop.orderEmail || ''}
              required
              placeholder="orders@johnsbikes.com"
              tooltip="Customers will see this email on order confirmations."
            />
          </div>
        </div>

        {/* Business Address */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Business Address</h2>
          <p className="text-sm text-gray-600 mb-4">Required for invoices and legal compliance</p>

          <div className="space-y-4">
            <Input
              label="Street Address"
              name="street"
              defaultValue={address?.street || ''}
              placeholder="123 Main Street"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                defaultValue={address?.city || ''}
                placeholder="Berlin"
              />

              <Input
                label="Postal Code"
                name="postalCode"
                defaultValue={address?.postalCode || ''}
                placeholder="10115"
              />
            </div>

            <Input
              label="Country"
              name="country"
              defaultValue={address?.country || ''}
              placeholder="Germany"
            />
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tax Information</h2>

          <Input
            label="VAT Number"
            name="vatNumber"
            defaultValue={shop.vatNumber || ''}
            placeholder="DE123456789"
            tooltip="Optional. Required for EU VAT reporting."
          />
        </div>

        {/* Payment Setup - Temporarily Hidden */}
        {/*
        NOTE: Stripe Connect feature temporarily disabled
        To enable: Activate Stripe Connect in your Stripe Dashboard
        https://dashboard.stripe.com/connect/overview

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Setup</h2>
          <p className="text-sm text-gray-600 mb-4">
            Connect your Stripe account to receive payments directly from customers. We charge an 8% platform fee per successful transaction.
          </p>

          {!shop.stripeOnboardingComplete ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-medium text-gray-900">Connect Stripe Account</p>
                    <p className="text-sm text-gray-600 mt-1">
                      You'll receive payments directly to your Stripe account. Setup takes 2-3 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStripeConnect}
                disabled={isConnectingStripe}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnectingStripe ? 'Connecting...' : 'Connect Stripe Account'}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-medium text-green-900">Stripe Account Connected</p>
                  <p className="text-sm text-green-700 mt-1">
                    You're all set! Customers will pay directly to your Stripe account.
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Platform fee: {shop.platformFeePercentage || 8}% per transaction
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        */}

        {/* Save Button */}
        <div className="flex justify-between items-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 bg-red-50 border border-red-200 rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-700 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setShowPasswordModal(false)
            setSuccess('Password changed successfully!')
          }}
        />
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          shopName={shop.shopName}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}

function PasswordChangeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to change password')
      }
    } catch (err) {
      setError('Failed to change password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            required
          />

          <Input
            label="New Password"
            name="newPassword"
            type="password"
            required
            placeholder="Min. 8 characters"
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteAccountModal({ shopName, onClose }: { shopName: string; onClose: () => void }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== shopName) {
      setError('Shop name does not match')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        router.push('/login')
      } else {
        setError(result.error || 'Failed to delete account')
        setIsDeleting(false)
      }
    } catch (err) {
      setError('Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-bold text-red-900 mb-4">Delete Account</h3>

        <div className="mb-4 bg-red-50 border border-red-300 rounded p-4">
          <p className="text-sm text-red-900 font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
          <p className="text-sm text-red-700">
            All your data will be permanently deleted including:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
            <li>All offers</li>
            <li>All bids</li>
            <li>All customer data</li>
            <li>Your account settings</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold">{shopName}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={shopName}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== shopName}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
