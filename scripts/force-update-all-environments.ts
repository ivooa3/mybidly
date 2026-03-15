import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function forceUpdateAllEnvironments() {
  console.log('Fetching all users...')

  const users = await prisma.shop.findMany({
    select: {
      id: true,
      email: true,
      shopUrl: true,
      environment: true
    }
  })

  console.log(`Found ${users.length} users`)

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

    console.log(`✓ Updated ${user.email}: ${user.environment} → ${newEnvironment}`)
  }

  console.log('\n✅ All users updated!')
  await prisma.$disconnect()
}

forceUpdateAllEnvironments()
