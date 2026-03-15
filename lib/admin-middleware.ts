import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Admin middleware to protect admin routes
 * Call this at the top of any admin page
 */
export async function requireAdmin() {
  try {
    const session = await auth()

    console.log('[requireAdmin] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      shopId: session?.user?.shopId,
      role: session?.user?.role
    })

    if (!session || !session.user) {
      console.log('[requireAdmin] No session, redirecting to login')
      redirect('/login')
    }

    // Get the original user ID (in case we're impersonating)
    const actualUserId = session.user.impersonatingFrom || session.user.shopId

    if (!actualUserId) {
      console.error('[requireAdmin] No user ID found in session:', session)
      redirect('/login')
    }

    // Check if the actual logged-in user is an admin
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.shop.findUnique({
      where: { id: actualUserId },
      select: { role: true, isActive: true }
    })

    console.log('[requireAdmin] User from DB:', {
      actualUserId,
      found: !!user,
      role: user?.role,
      isActive: user?.isActive
    })

    if (!user) {
      console.error('[requireAdmin] User not found in database:', actualUserId)
      redirect('/login')
    }

    if (user.role !== 'admin') {
      console.error('[requireAdmin] User is not admin:', { actualUserId, role: user.role })
      redirect('/dashboard')
    }

    console.log('[requireAdmin] Admin check passed')
    return session
  } catch (error) {
    // Re-throw redirect errors (they are expected)
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error
    }
    console.error('[requireAdmin] Unexpected error:', error)
    throw error
  }
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
