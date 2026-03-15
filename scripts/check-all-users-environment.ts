import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllUsers() {
  const users = await prisma.shop.findMany({
    select: {
      email: true,
      environment: true,
      shopUrl: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log('Last 10 users:')
  console.table(users)

  await prisma.$disconnect()
}

checkAllUsers()
