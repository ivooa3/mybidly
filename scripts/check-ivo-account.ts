import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIvoAccount() {
  try {
    const user = await prisma.shop.findUnique({
      where: { email: 'ivo.sprachrohr@gmail.com' }
    });

    if (user) {
      console.log('✅ Account found: ivo.sprachrohr@gmail.com');
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Active:', user.isActive);
      console.log('   Shop Name:', user.shopName);
      console.log('   Created:', user.createdAt);
    } else {
      console.log('❌ Account ivo.sprachrohr@gmail.com does NOT exist in the database');
      console.log('');
      console.log('📋 All registered accounts:');

      const allUsers = await prisma.shop.findMany({
        select: {
          email: true,
          role: true,
          shopName: true,
          createdAt: true,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Shop: ${user.shopName}`);
        console.log(`   Created: ${user.createdAt.toISOString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIvoAccount();
