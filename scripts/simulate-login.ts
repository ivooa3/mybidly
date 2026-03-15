import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { shopLoginSchema } from '../lib/validations';

const prisma = new PrismaClient();

async function simulateLogin(email: string, password: string) {
  console.log('🔐 Simulating login process for:', email);
  console.log('═══════════════════════════════════════════\n');

  try {
    // Step 1: Validate credentials
    console.log('Step 1: Validating input...');
    const validation = shopLoginSchema.safeParse({ email, password });

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return false;
    }
    console.log('✅ Input validation passed\n');

    // Step 2: Find shop by email
    console.log('Step 2: Looking up user in database...');
    const shop = await prisma.shop.findUnique({
      where: { email }
    });

    if (!shop) {
      console.log('❌ User not found in database');
      return false;
    }
    console.log('✅ User found:');
    console.log('   ID:', shop.id);
    console.log('   Email:', shop.email);
    console.log('   Shop Name:', shop.shopName);
    console.log('   Role:', shop.role);
    console.log('   Active:', shop.isActive);
    console.log('');

    // Step 3: Check if account is active
    console.log('Step 3: Checking account status...');
    if (!shop.isActive) {
      console.log('❌ Account is deactivated');
      console.log('   Deactivated at:', shop.deactivatedAt);
      return false;
    }
    console.log('✅ Account is active\n');

    // Step 4: Verify password
    console.log('Step 4: Verifying password...');
    console.log('   Password hash prefix:', shop.passwordHash.substring(0, 7) + '...');

    const isValidPassword = await bcrypt.compare(password, shop.passwordHash);

    if (!isValidPassword) {
      console.log('❌ Password does not match');
      return false;
    }
    console.log('✅ Password verified\n');

    // Step 5: Prepare user object (what NextAuth would return)
    console.log('Step 5: Creating user session object...');
    const user = {
      id: shop.id,
      email: shop.email,
      name: shop.shopName,
    };
    console.log('✅ User object:', user);
    console.log('');

    console.log('═══════════════════════════════════════════');
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('═══════════════════════════════════════════');
    return true;

  } catch (error) {
    console.log('\n❌ ERROR:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Test with admin credentials
const email = process.argv[2] || 'admin@mybidly.io';
const password = process.argv[3] || 'Password123!';

simulateLogin(email, password);
