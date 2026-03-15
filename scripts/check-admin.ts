import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmin() {
  const admins = await prisma.shop.findMany({
    where: {
      OR: [
        { role: 'admin' },
        { email: { contains: 'admin' } },
        { email: { contains: 'mybidly' } }
      ]
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      shopName: true
    }
  })

  console.log('\n🔍 Admin accounts found:\n')

  if (admins.length === 0) {
    console.log('❌ No admin accounts found!\n')
  } else {
    admins.forEach((admin) => {
      console.log(`Email: ${admin.email}`)
      console.log(`Role: ${admin.role}`)
      console.log(`Active: ${admin.isActive}`)
      console.log(`Shop Name: ${admin.shopName || 'N/A'}`)
      console.log('---\n')
    })
  }
}

checkAdmin()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
