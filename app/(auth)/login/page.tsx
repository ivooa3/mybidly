import { LoginForm } from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage({
  searchParams
}: {
  searchParams: { registered?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            myBidly
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Sign in to your account
          </h2>
          {searchParams.registered && (
            <p className="mt-2 text-sm text-green-600">
              Registration successful! Please sign in.
            </p>
          )}
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-purple-600 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
