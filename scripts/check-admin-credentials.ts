import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAdminCredentials() {
  try {
    const admin = await prisma.shop.findUnique({
      where: { email: 'admin@mybidly.io' }
    });

    if (!admin) {
      console.log('❌ Admin user not found in database');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Admin account found:');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.isActive);
    console.log('   Shop Name:', admin.shopName);
    console.log('');

    // Test common passwords
    const passwords = [
      'Password123!',
      'Admin123!',
      'admin123',
      'MyBidly123!',
      'mybidly123',
      'Admin@123',
      'password123',
      'Mybidly2024!'
    ];

    console.log('🔑 Testing passwords:\n');
    let foundPassword = false;

    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, admin.passwordHash);
      if (isValid) {
        console.log(`   ✅ ${pwd}: WORKS! ← This is the correct password`);
        foundPassword = true;
        break;
      } else {
        console.log(`   ❌ ${pwd}: No`);
      }
    }

    if (!foundPassword) {
      console.log('\n⚠️  None of the common passwords worked.');
      console.log('   You may need to reset the password.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminCredentials();
