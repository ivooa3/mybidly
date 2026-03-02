import { prisma } from '@/lib/prisma'

async function checkActiveStatus() {
  console.log('\n🔍 Checking isActive status for all shops...\n')

  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      email: true,
      shopName: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`Found ${shops.length} shops:\n`)

  shops.forEach((shop, index) => {
    console.log(`${index + 1}. ${shop.email}`)
    console.log(`   Shop Name: ${shop.shopName || '(not set)'}`)
    console.log(`   isActive: ${shop.isActive}`)
    console.log(`   Created: ${shop.createdAt.toISOString()}`)
    console.log('')
  })

  // Summary
  const activeCount = shops.filter(s => s.isActive).length
  const inactiveCount = shops.filter(s => !s.isActive).length

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Active: ${activeCount}`)
  console.log(`   ❌ Inactive: ${inactiveCount}`)
  console.log(`   📝 Total: ${shops.length}`)

  if (inactiveCount > 0) {
    console.log(`\n⚠️  WARNING: ${inactiveCount} shops are inactive!`)
    console.log(`   This will prevent login for these accounts.`)
    console.log(`\n   To fix, run:`)
    console.log(`   UPDATE shops SET is_active = true WHERE is_active = false;`)
  }

  await prisma.$disconnect()
}

checkActiveStatus()
  .catch(console.error)
