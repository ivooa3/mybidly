import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401)
    }

    const admin = await prisma.shop.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (admin?.role !== 'admin') {
      return errorResponse('Forbidden - Admin access required', 403)
    }

    // Fetch all users
    const users = await prisma.shop.findMany({
      select: {
        id: true,
        email: true,
        shopUrl: true,
        environment: true
      }
    })

    let updated = 0

    for (const user of users) {
      let newEnvironment = 'production' // Default

      // Determine environment based on shop URL if available
      if (user.shopUrl) {
        const url = user.shopUrl.toLowerCase()
        if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes(':3000') || url.includes(':3001')) {
          newEnvironment = 'local'
        } else if (url.includes('vercel.app') || url.includes('staging')) {
          newEnvironment = 'staging'
        }
      }

      // Update the user
      await prisma.shop.update({
        where: { id: user.id },
        data: { environment: newEnvironment }
      })

      updated++
    }

    return successResponse({
      message: `Successfully updated ${updated} users`,
      updated
    })

  } catch (error) {
    console.error('Error updating environments:', error)
    return errorResponse('Failed to update environments', 500)
  }
}
