import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function checkPassword() {
  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      email: true,
      passwordHash: true
    }
  })

  console.log('\n🔍 Checking all shop accounts:\n')

  for (const shop of shops) {
    console.log(`Email: ${shop.email}`)
    console.log(`Password Hash: ${shop.passwordHash.substring(0, 30)}...`)

    // Test with Password123!
    const testPassword = 'Password123!'
    const isValid = await bcrypt.compare(testPassword, shop.passwordHash)
    console.log(`✓ Password123! works: ${isValid}`)

    // Check if hash looks valid
    const isValidHash = shop.passwordHash.startsWith('$2b$') || shop.passwordHash.startsWith('$2a$')
    console.log(`✓ Hash format valid: ${isValidHash}`)
    console.log('---\n')
  }
}

checkPassword()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
