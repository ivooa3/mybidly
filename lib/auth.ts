import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { shopLoginSchema } from '@/lib/validations'

export const authConfig: NextAuthConfig = {
  trustHost: true, // Required for production deployment
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('[Auth] Authorize called with email:', credentials?.email)

        // Validate credentials
        const validation = shopLoginSchema.safeParse(credentials)
        if (!validation.success) {
          console.log('[Auth] Validation failed:', validation.error)
          return null
        }

        const { email, password } = validation.data

        // Find shop by email
        const shop = await prisma.shop.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            shopName: true,
            passwordHash: true,
            isActive: true,
            role: true
          }
        })

        if (!shop) {
          console.log('[Auth] Shop not found for email:', email)
          return null
        }

        console.log('[Auth] Shop found:', { id: shop.id, email: shop.email, role: shop.role, isActive: shop.isActive })

        // Check if account is active
        if (!shop.isActive) {
          console.log('[Auth] Account is not active')
          throw new Error('ACCOUNT_DEACTIVATED')
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          password,
          shop.passwordHash
        )

        if (!isValidPassword) {
          console.log('[Auth] Invalid password')
          return null
        }

        console.log('[Auth] Authentication successful for:', shop.email)

        // Return user object
        return {
          id: shop.id,
          email: shop.email,
          name: shop.shopName,
          role: shop.role
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
    async jwt({ token, user, trigger, session }) {
      // Add shop ID to token
      if (user) {
        console.log('[Auth] JWT callback - user login:', { id: user.id, email: user.email, role: user.role })
        token.shopId = user.id
        token.shopName = user.name
        token.role = user.role
      }

      // Handle impersonation via session update
      if (trigger === 'update' && session?.impersonateUserId) {
        // Store original admin ID
        if (!token.impersonatingFrom) {
          token.impersonatingFrom = token.shopId
        }
        // Switch to impersonated user
        token.shopId = session.impersonateUserId
        token.shopName = session.impersonateUserName
      }

      // Handle exit impersonation
      if (trigger === 'update' && session?.exitImpersonation && token.impersonatingFrom) {
        token.shopId = token.impersonatingFrom
        token.shopName = session.originalShopName
        token.impersonatingFrom = undefined
      }

      console.log('[Auth] JWT callback - token:', { shopId: token.shopId, role: token.role })
      return token
    },
    async session({ session, token }) {
      // Add shop ID to session
      if (session.user) {
        session.user.shopId = token.shopId as string
        session.user.shopName = token.shopName as string
        session.user.role = token.role as string
        session.user.impersonatingFrom = token.impersonatingFrom as string | undefined
      }
      console.log('[Auth] Session callback - session user:', {
        shopId: session.user?.shopId,
        role: session.user?.role
      })
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
