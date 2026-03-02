import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

async function createAdmin() {
  console.log('\n🔧 Creating admin account...\n')

  const adminEmail = 'admin@mybidly.io'
  const adminPassword = 'Password123!'

  // Check if admin already exists
  const existing = await prisma.shop.findUnique({
    where: { email: adminEmail }
  })

  if (existing) {
    console.log(`⚠️  Admin account already exists: ${adminEmail}`)
    console.log(`   Updating password to: ${adminPassword}\n`)

    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await prisma.shop.update({
      where: { email: adminEmail },
      data: {
        passwordHash,
        isActive: true,
        role: 'admin'
      }
    })

    console.log(`✅ Admin password updated successfully`)
  } else {
    console.log(`Creating new admin account: ${adminEmail}\n`)

    const passwordHash = await bcrypt.hash(adminPassword, 10)
    const admin = await prisma.shop.create({
      data: {
        email: adminEmail,
        passwordHash,
        shopName: 'myBidly Admin',
        isActive: true,
        role: 'admin',
        planTier: 'premium',
        stripeOnboardingComplete: true
      }
    })

    console.log(`✅ Admin account created successfully`)
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Role: ${admin.role}`)
  }

  console.log(`\n📝 Login credentials:`)
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}\n`)

  await prisma.$disconnect()
}

createAdmin()
  .catch(console.error)
