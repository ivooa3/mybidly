import { SetupForm } from '@/components/SetupForm'

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            myBidly
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Complete your profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tell us about your shop to get started
          </p>
        </div>

        <SetupForm />
      </div>
    </div>
  )
}
