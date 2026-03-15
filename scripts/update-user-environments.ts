import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserEnvironments() {
  try {
    console.log('Fetching users with null environment...')

    // Get all users with null environment
    const users = await prisma.shop.findMany({
      where: {
        environment: null
      },
      select: {
        id: true,
        email: true,
        shopUrl: true,
        createdAt: true
      }
    })

    console.log(`Found ${users.length} users with null environment`)

    for (const user of users) {
      let environment = 'production' // Default to production

      if (user.shopUrl) {
        const url = user.shopUrl.toLowerCase()

        // Detect based on shopUrl
        if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes(':3000') || url.includes(':3001')) {
          environment = 'local'
        } else if (url.includes('vercel.app') || url.includes('staging')) {
          environment = 'staging'
        }
      }

      console.log(`Updating ${user.email} to environment: ${environment}`)

      await prisma.shop.update({
        where: { id: user.id },
        data: { environment }
      })
    }

    console.log('✅ All users updated successfully!')
  } catch (error) {
    console.error('Error updating user environments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserEnvironments()
