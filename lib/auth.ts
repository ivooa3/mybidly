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

        // Check if account is active
        if (!shop.isActive) {
          throw new Error('ACCOUNT_DEACTIVATED')
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
    async jwt({ token, user, trigger, session }) {
      // Add shop ID to token
      if (user) {
        token.shopId = user.id
        token.shopName = user.name
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

      return token
    },
    async session({ session, token }) {
      // Add shop ID to session
      if (session.user) {
        session.user.shopId = token.shopId as string
        session.user.shopName = token.shopName as string
        session.user.impersonatingFrom = token.impersonatingFrom as string | undefined
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
