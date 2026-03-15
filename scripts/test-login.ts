import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

async function testLogin() {
  const email = 'peter.pan@test.com'
  const password = 'TestPass123' // Change this to the actual password you used

  console.log(`\n🔐 Testing login for: ${email}\n`)

  // Find user
  const shop = await prisma.shop.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      shopName: true,
      shopUrl: true,
      isActive: true,
      deactivatedAt: true,
      createdAt: true,
    }
  })

  if (!shop) {
    console.log('❌ User not found!')
    return
  }

  console.log('✅ User found in database:')
  console.log(`   ID: ${shop.id}`)
  console.log(`   Email: ${shop.email}`)
  console.log(`   Shop Name: ${shop.shopName || 'NOT SET (will redirect to /setup)'}`)
  console.log(`   Shop URL: ${shop.shopUrl || 'NOT SET'}`)
  console.log(`   Active: ${shop.isActive}`)
  console.log(`   Created: ${shop.createdAt}`)

  // Test password
  const isValidPassword = await bcrypt.compare(password, shop.passwordHash)
  console.log(`\n🔑 Password test: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`)

  if (!isValidPassword) {
    console.log('\n⚠️  The password you provided does not match!')
    console.log('   Please verify the password or reset it.')
  }

  if (!shop.shopName) {
    console.log('\n⚠️  Shop name not set!')
    console.log('   User will be redirected to /setup page after login.')
  }

  if (!shop.isActive) {
    console.log('\n⚠️  Account is deactivated!')
    console.log(`   Deactivated at: ${shop.deactivatedAt}`)
  }

  await prisma.$disconnect()
}

testLogin().catch(console.error)
