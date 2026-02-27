import { PrismaClient, Prisma } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function importData() {
  try {
    console.log('🔄 Importing data to Neon...')

    // Read backup file
    const backupData = JSON.parse(
      fs.readFileSync('supabase_data_backup.json', 'utf-8')
    )

    // Import shops
    console.log('📥 Importing shops...')
    for (const shop of backupData.shops) {
      await prisma.shop.create({
        data: {
          id: shop.id,
          email: shop.email,
          passwordHash: shop.passwordHash,
          shopName: shop.shopName,
          firstName: shop.firstName,
          lastName: shop.lastName,
          businessAddress: shop.businessAddress,
          orderEmail: shop.orderEmail,
          shopUrl: shop.shopUrl,
          vatNumber: shop.vatNumber,
          stripeAccountId: shop.stripeAccountId,
          stripeAccountStatus: shop.stripeAccountStatus,
          stripeOnboardingComplete: shop.stripeOnboardingComplete,
          platformFeeEnabled: shop.platformFeeEnabled,
          platformFeePercentage: shop.platformFeePercentage ? new Prisma.Decimal(shop.platformFeePercentage) : null,
          isActive: shop.isActive,
          deactivatedAt: shop.deactivatedAt ? new Date(shop.deactivatedAt) : null,
          role: shop.role,
          planTier: shop.planTier,
          preferredLanguage: shop.preferredLanguage,
          resetToken: shop.resetToken,
          resetTokenExpiresAt: shop.resetTokenExpiresAt ? new Date(shop.resetTokenExpiresAt) : null,
          createdAt: new Date(shop.createdAt),
          updatedAt: new Date(shop.updatedAt)
        }
      })
    }
    console.log(`✅ Imported ${backupData.shops.length} shops`)

    // Import offers
    console.log('📥 Importing offers...')
    for (const offer of backupData.offers) {
      await prisma.offer.create({
        data: {
          id: offer.id,
          shopId: offer.shopId,
          productName: offer.productName,
          productSku: offer.productSku,
          imageUrl: offer.imageUrl,
          scopeOfDelivery: offer.scopeOfDelivery,
          minPrice: new Prisma.Decimal(offer.minPrice),
          minRange: offer.minRange,
          maxRange: offer.maxRange,
          fixPrice: offer.fixPrice ? new Prisma.Decimal(offer.fixPrice) : null,
          offerHeadline: offer.offerHeadline,
          offerSubheadline: offer.offerSubheadline,
          stockQuantity: offer.stockQuantity,
          priority: offer.priority,
          isActive: offer.isActive,
          createdAt: new Date(offer.createdAt),
          updatedAt: new Date(offer.updatedAt)
        }
      })
    }
    console.log(`✅ Imported ${backupData.offers.length} offers`)

    // Import bids
    console.log('📥 Importing bids...')
    for (const bid of backupData.bids) {
      await prisma.bid.create({
        data: {
          id: bid.id,
          shopId: bid.shopId,
          offerId: bid.offerId,
          customerEmail: bid.customerEmail,
          customerName: bid.customerName,
          shippingAddress: bid.shippingAddress,
          bidAmount: new Prisma.Decimal(bid.bidAmount),
          isFixPrice: bid.isFixPrice,
          status: bid.status,
          stripePaymentId: bid.stripePaymentId,
          locale: bid.locale,
          platformFeeAmount: bid.platformFeeAmount ? new Prisma.Decimal(bid.platformFeeAmount) : null,
          shopOwnerAmount: bid.shopOwnerAmount ? new Prisma.Decimal(bid.shopOwnerAmount) : null,
          stripeTransferId: bid.stripeTransferId,
          acceptanceEmailSentAt: bid.acceptanceEmailSentAt ? new Date(bid.acceptanceEmailSentAt) : null,
          createdAt: new Date(bid.createdAt),
          updatedAt: new Date(bid.updatedAt)
        }
      })
    }
    console.log(`✅ Imported ${backupData.bids.length} bids`)

    // Import widget views
    console.log('📥 Importing widget views...')
    for (const view of backupData.widgetViews) {
      await prisma.widgetView.create({
        data: {
          id: view.id,
          shopId: view.shopId,
          offerId: view.offerId,
          productId: view.productId,
          visitorId: view.visitorId,
          ipAddress: view.ipAddress,
          userAgent: view.userAgent,
          didBid: view.didBid,
          createdAt: new Date(view.createdAt)
        }
      })
    }
    console.log(`✅ Imported ${backupData.widgetViews.length} widget views`)

    console.log('🎉 All data imported successfully!')

  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData()
