import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function testPassword() {
  const admin = await prisma.shop.findUnique({
    where: { email: 'admin@mybidly.io' },
    select: {
      email: true,
      passwordHash: true,
      isActive: true
    }
  })

  if (!admin) {
    console.log('❌ Admin account not found!')
    return
  }

  console.log(`\n✅ Found account: ${admin.email}`)
  console.log(`Active: ${admin.isActive}`)
  console.log(`\nTesting common passwords:\n`)

  const testPasswords = [
    'Password123!',
    'Admin123!',
    'admin123',
    'Admin@123',
    'MyBidly123!',
    'mybidly123'
  ]

  for (const password of testPasswords) {
    const isValid = await bcrypt.compare(password, admin.passwordHash)
    console.log(`${isValid ? '✅' : '❌'} ${password}: ${isValid ? 'WORKS!' : 'no'}`)
  }
}

testPassword()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
