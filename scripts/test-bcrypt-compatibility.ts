import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function testBcryptCompatibility() {
  try {
    const admin = await prisma.shop.findUnique({
      where: { email: 'admin@mybidly.io' }
    });

    if (!admin) {
      console.log('❌ Admin user not found');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Admin account found:');
    console.log('   Email:', admin.email);
    console.log('   Hash (first 20 chars):', admin.passwordHash.substring(0, 20) + '...');
    console.log('');

    const testPassword = 'Password123!';

    console.log('🔍 Testing password:', testPassword);
    console.log('');

    // Test with bcrypt (native)
    console.log('Testing with bcrypt (native):');
    try {
      const bcryptResult = await bcrypt.compare(testPassword, admin.passwordHash);
      console.log('   Result:', bcryptResult ? '✅ WORKS' : '❌ FAILED');
    } catch (error) {
      console.log('   Error:', error);
    }

    // Test with bcryptjs
    console.log('');
    console.log('Testing with bcryptjs:');
    try {
      const bcryptjsResult = await bcryptjs.compare(testPassword, admin.passwordHash);
      console.log('   Result:', bcryptjsResult ? '✅ WORKS' : '❌ FAILED');
    } catch (error) {
      console.log('   Error:', error);
    }

    console.log('');
    console.log('📋 Hash analysis:');
    console.log('   Hash prefix:', admin.passwordHash.substring(0, 4));
    console.log('   Hash length:', admin.passwordHash.length);
    console.log('   Expected bcrypt prefix: $2a$ or $2b$');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBcryptCompatibility();
