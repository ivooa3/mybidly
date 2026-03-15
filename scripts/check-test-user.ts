import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTestUser() {
  const user = await prisma.shop.findUnique({
    where: { email: 'test-staging@example.com' },
    select: { email: true, environment: true, shopUrl: true }
  })
  console.log('Test user:', user)
  await prisma.$disconnect()
}

checkTestUser()
