import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function resetPasswords() {
  const defaultPassword = 'Password123!' // Change this to your desired password

  console.log('🔐 Resetting passwords for all shops...')

  const passwordHash = await bcrypt.hash(defaultPassword, 10)

  const result = await prisma.shop.updateMany({
    data: {
      passwordHash
    }
  })

  console.log(`✅ Updated ${result.count} shop passwords to: ${defaultPassword}`)
  console.log('⚠️  Remember to change this password after logging in!')
}

resetPasswords()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
