import { prisma } from '@/lib/prisma'

async function testUserPersistence() {
  try {
    console.log('🔍 Testing user persistence...\n')

    // Check for the most recently created user
    const recentUser = await prisma.shop.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        createdAt: true,
        isActive: true,
        deactivatedAt: true,
        shopName: true,
      }
    })

    if (recentUser) {
      console.log('✅ Most recent user found:')
      console.log(`   ID: ${recentUser.id}`)
      console.log(`   Email: ${recentUser.email}`)
      console.log(`   Created: ${recentUser.createdAt}`)
      console.log(`   Active: ${recentUser.isActive}`)
      console.log(`   Shop Name: ${recentUser.shopName || 'Not set'}`)
      console.log(`   Deactivated At: ${recentUser.deactivatedAt || 'N/A'}`)
    } else {
      console.log('❌ No users found in database')
    }

    // Check total user count
    const totalUsers = await prisma.shop.count()
    console.log(`\n📊 Total users in database: ${totalUsers}`)

    // Check if there are any test users
    const testUsers = await prisma.shop.findMany({
      where: {
        OR: [
          { email: { contains: 'test.com' } },
          { email: { contains: 'example.com' } },
        ]
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        isActive: true,
      }
    })

    if (testUsers.length > 0) {
      console.log(`\n🧪 Test users found (${testUsers.length}):`)
      testUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.isActive ? 'Active' : 'Inactive'})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserPersistence()
