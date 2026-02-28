'use client'

import { RegisterForm } from '@/components/RegisterForm'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get('plan')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            myBidly
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start earning with bid-based upsells
          </p>

          {/* Display selected plan */}
          {selectedPlan === 'premium' && (
            <div className="mt-4 inline-block bg-purple-100 border border-purple-300 text-purple-800 px-4 py-2 rounded-lg text-sm font-semibold">
              🎯 You selected: <strong>Premium Plan</strong>
            </div>
          )}
        </div>

        <RegisterForm selectedPlan={selectedPlan} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
