import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileContent } from '@/components/ProfileContent'

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.user.shopId },
    select: {
      id: true,
      email: true,
      shopName: true,
      firstName: true,
      lastName: true,
      shopUrl: true,
      orderEmail: true,
      businessAddress: true,
      vatNumber: true,
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      platformFeePercentage: true
    }
  })

  if (!shop) {
    redirect('/login')
  }

  // Serialize the shop data for Client Component (handle JSON fields and Decimals)
  const serializedShop = {
    ...shop,
    businessAddress: shop.businessAddress
      ? JSON.parse(JSON.stringify(shop.businessAddress))
      : null,
    platformFeePercentage: Number(shop.platformFeePercentage)
  }

  return <ProfileContent shop={serializedShop} />
}
