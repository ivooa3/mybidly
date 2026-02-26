import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Admin middleware to protect admin routes
 * Call this at the top of any admin page
 */
export async function requireAdmin() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Get the original user ID (in case we're impersonating)
  const actualUserId = session.user.impersonatingFrom || session.user.shopId

  // Check if the actual logged-in user is an admin
  const { prisma } = await import('@/lib/prisma')
  const user = await prisma.shop.findUnique({
    where: { id: actualUserId },
    select: { role: true, isActive: true }
  })

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  return session
}

/**
 * Check if current user is admin (without redirecting)
 */
export async function isAdmin() {
  const session = await auth()
  if (!session) return false

  const actualUserId = session.user.impersonatingFrom || session.user.shopId

  const { prisma } = await import('@/lib/prisma')
  const user = await prisma.shop.findUnique({
    where: { id: actualUserId },
    select: { role: true }
  })

  return user?.role === 'admin'
}
