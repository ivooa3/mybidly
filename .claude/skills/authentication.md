# Authentication - Best Practices

## Overview

This skill covers authentication setup for the Justfouryou application using NextAuth.js (Auth.js v5), including shop owner registration, login, session management, and protected routes.

---

## Setup

### Installation

```bash
npm install next-auth@beta bcrypt
npm install -D @types/bcrypt
```

**Note:** Using `next-auth@beta` for Auth.js v5 (compatible with Next.js 14 App Router)

### Environment Variables

```env
# .env.local
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000" # Production: https://yourdomain.com
```

---

## NextAuth Configuration

### Auth Configuration

```typescript
// lib/auth.ts
import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { shopLoginSchema } from '@/lib/validations'

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Validate credentials
        const validation = shopLoginSchema.safeParse(credentials)
        if (!validation.success) {
          return null
        }

        const { email, password } = validation.data

        // Find shop by email
        const shop = await prisma.shop.findUnique({
          where: { email }
        })

        if (!shop) {
          return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          password,
          shop.passwordHash
        )

        if (!isValidPassword) {
          return null
        }

        // Return user object
        return {
          id: shop.id,
          email: shop.email,
          name: shop.shopName,
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add shop ID to token
      if (user) {
        token.shopId = user.id
        token.shopName = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Add shop ID to session
      if (session.user) {
        session.user.shopId = token.shopId as string
        session.user.shopName = token.shopName as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

### Type Definitions

```typescript
// types/next-auth.d.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      shopId: string
      shopName: string
    } & DefaultSession['user']
  }

  interface User {
    shopId?: string
    shopName?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    shopId?: string
    shopName?: string
  }
}
```

### API Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

---

## Registration

### Registration API Route

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { shopRegisterSchema } from '@/lib/validations'
import bcrypt from 'bcrypt'
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
  serverErrorResponse
} from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = shopRegisterSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { email, password, shopName } = validation.data

    // Check if email already exists
    const existingShop = await prisma.shop.findUnique({
      where: { email }
    })

    if (existingShop) {
      return errorResponse('Email already registered', 409)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create shop
    const shop = await prisma.shop.create({
      data: {
        email,
        passwordHash,
        shopName,
      },
      select: {
        id: true,
        email: true,
        shopName: true,
        createdAt: true,
      }
    })

    // Send welcome email (optional)
    // await sendWelcomeEmail(shop)

    return successResponse(
      {
        message: 'Registration successful',
        shop: {
          id: shop.id,
          email: shop.email,
          shopName: shop.shopName,
        }
      },
      201
    )

  } catch (error) {
    return serverErrorResponse(error)
  }
}
```

### Registration Page

```typescript
// app/(auth)/register/page.tsx
import { RegisterForm } from '@/components/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your Justfouryou account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start earning with bid-based upsells
          </p>
        </div>

        <RegisterForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Registration Form Component

```typescript
// components/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shopRegisterSchema, type ShopRegisterInput } from '@/lib/validations'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ShopRegisterInput>({
    resolver: zodResolver(shopRegisterSchema)
  })

  const onSubmit = async (data: ShopRegisterInput) => {
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to login
        router.push('/login?registered=true')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
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
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
            Shop Name
          </label>
          <input
            id="shopName"
            type="text"
            {...register('shopName')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.shopName && (
            <p className="mt-1 text-sm text-red-600">{errors.shopName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
```

---

## Login

### Login Page

```typescript
// app/(auth)/login/page.tsx
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
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to Justfouryou
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
            <Link href="/register" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Login Form Component

```typescript
// components/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shopLoginSchema, type ShopLoginInput } from '@/lib/validations'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ShopLoginInput>({
    resolver: zodResolver(shopLoginSchema)
  })

  const onSubmit = async (data: ShopLoginInput) => {
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Login failed. Please try again.')
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
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

---

## Protected Routes

### Protected Server Component

```typescript
// app/(dashboard)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const stats = await prisma.bid.groupBy({
    by: ['status'],
    where: { shopId: session.user.shopId },
    _count: true,
    _sum: { bidAmount: true }
  })

  return (
    <div>
      <h1>Welcome, {session.user.shopName}!</h1>
      {/* Dashboard content */}
    </div>
  )
}
```

### Protected Layout

```typescript
// app/(dashboard)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
```

### Protected API Route

```typescript
// app/api/offers/route.ts
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unauthorizedResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return unauthorizedResponse()
  }

  const offers = await prisma.offer.findMany({
    where: { shopId: session.user.shopId }
  })

  return NextResponse.json({ success: true, data: offers })
}
```

---

## Session Management

### Get Session in Server Component

```typescript
import { auth } from '@/lib/auth'

export default async function MyPage() {
  const session = await auth()

  if (!session) {
    // Not logged in
  }

  const shopId = session.user.shopId
  const shopName = session.user.shopName
}
```

### Get Session in Client Component

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    return <div>Not logged in</div>
  }

  return <div>Welcome, {session?.user.shopName}!</div>
}
```

**Note:** For client components, wrap your app with `SessionProvider`:

```typescript
// app/providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## Logout

### Logout Button Component

```typescript
// components/LogoutButton.tsx
'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
    >
      Sign out
    </button>
  )
}
```

### In Sidebar

```typescript
// components/Sidebar.tsx
import { LogoutButton } from './LogoutButton'

export function Sidebar({ user }: { user: { shopName: string; email: string } }) {
  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-4 border-b">
        <h2 className="font-bold">{user.shopName}</h2>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>

      <nav className="p-4">
        {/* Navigation links */}
      </nav>

      <div className="p-4 border-t">
        <LogoutButton />
      </div>
    </aside>
  )
}
```

---

## Middleware (Optional)

Protect routes at the edge with middleware:

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next()
  }

  // Widget is public
  if (pathname.startsWith('/widget') || pathname.startsWith('/payment')) {
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Password Reset (Optional - Post-MVP)

### Request Reset

```typescript
// app/api/auth/forgot-password/route.ts
export async function POST(request: NextRequest) {
  const { email } = await request.json()

  const shop = await prisma.shop.findUnique({ where: { email } })
  if (!shop) {
    // Don't reveal if email exists
    return NextResponse.json({ success: true })
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      resetToken,
      resetTokenExpiry
    }
  })

  // Send reset email with link
  // await sendPasswordResetEmail(email, resetToken)

  return NextResponse.json({ success: true })
}
```

---

## Security Best Practices

### ✅ DO

1. **Hash passwords with bcrypt** - Use `bcrypt.hash()` with salt rounds ≥ 10
2. **Validate all inputs** - Use Zod schemas for registration/login
3. **Use secure session secrets** - Generate with `openssl rand -base64 32`
4. **Set session expiry** - 30 days max, or shorter for sensitive apps
5. **Protect API routes** - Always check session in API routes
6. **Use HTTPS in production** - Required for secure cookies
7. **Rate limit auth endpoints** - Prevent brute force attacks (see below)
8. **Don't reveal if email exists** - Same response for valid/invalid emails

### ❌ DON'T

1. **Don't store plain text passwords** - Always hash with bcrypt
2. **Don't expose detailed error messages** - "Invalid credentials" not "Email not found"
3. **Don't skip CSRF protection** - NextAuth handles this by default
4. **Don't use weak secrets** - Minimum 32 characters, random
5. **Don't log passwords** - Even in development
6. **Don't trust client-side checks** - Always validate server-side

---

## Rate Limiting (Optional)

Prevent brute force attacks:

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  request: NextRequest,
  limit = 5,
  windowMs = 15 * 60 * 1000 // 15 minutes
): boolean {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

// Usage in login API
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  if (!rateLimit(request, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    )
  }

  // Continue with login...
}
```

---

## Testing

### Test Registration

```typescript
// Test user credentials for development
const testShop = {
  email: 'test@justfouryou.com',
  password: 'Test1234!',
  shopName: 'Test Shop'
}
```

### Seed Test User

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Test1234!', 10)

  await prisma.shop.upsert({
    where: { email: 'test@justfouryou.com' },
    update: {},
    create: {
      email: 'test@justfouryou.com',
      passwordHash,
      shopName: 'Test Shop'
    }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run: `npx prisma db seed`

---

## Resources

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Auth.js v5 (Beta)](https://authjs.dev/)
- [NextAuth + App Router](https://next-auth.js.org/configuration/nextjs#in-app-router)
- [Credentials Provider](https://next-auth.js.org/providers/credentials)
- [Session Management](https://next-auth.js.org/getting-started/client#usesession)
