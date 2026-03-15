import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Debug endpoint to test database connectivity and Prisma
 * DELETE THIS FILE after debugging!
 */
export async function GET(request: NextRequest) {
  try {
    // Test 1: Simple query
    console.log('Test 1: Testing simple query...')
    const shopCount = await prisma.shop.count()
    console.log(`✅ Shop count: ${shopCount}`)

    // Test 2: Create and delete test record
    console.log('Test 2: Testing create and delete...')
    const testEmail = `test-${Date.now()}@debug.com`

    const testShop = await prisma.shop.create({
      data: {
        email: testEmail,
        passwordHash: 'test-hash-debug-only',
        shopName: 'Debug Test Shop',
        environment: 'production'
      }
    })
    console.log('✅ Created test shop:', testShop.id)

    await prisma.shop.delete({
      where: { id: testShop.id }
    })
    console.log('✅ Deleted test shop')

    return NextResponse.json({
      success: true,
      message: 'All database operations working',
      tests: {
        shopCount,
        createDelete: 'passed'
      }
    })

  } catch (error) {
    console.error('❌ Database test failed:', error)
    console.error('Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      ...(error && typeof error === 'object' && 'code' in error && {
        prismaCode: (error as any).code,
        prismaMeta: (error as any).meta
      })
    })

    return NextResponse.json({
      success: false,
      error: (error as Error)?.message || 'Unknown error',
      details: error && typeof error === 'object' ? {
        name: (error as Error)?.name,
        ...(('code' in error) && { code: (error as any).code }),
        ...(('meta' in error) && { meta: (error as any).meta }),
      } : {}
    }, { status: 500 })
  }
}
