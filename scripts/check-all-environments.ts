import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllEnvironments() {
  const users = await prisma.shop.findMany({
    select: {
      email: true,
      environment: true,
      shopUrl: true
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('\nAll users and their environments:')
  console.log('==========================================')
  users.forEach(user => {
    console.log(`Email: ${user.email}`)
    console.log(`Environment: ${user.environment}`)
    console.log(`Shop URL: ${user.shopUrl}`)
    console.log('------------------------------------------')
  })

  console.log(`\nTotal users: ${users.length}`)
  console.log(`Users with null environment: ${users.filter(u => u.environment === null).length}`)

  await prisma.$disconnect()
}

checkAllEnvironments()
