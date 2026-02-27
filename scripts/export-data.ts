import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function exportData() {
  try {
    console.log('🔄 Exporting data from Supabase...')

    // Fetch all data
    const shops = await prisma.shop.findMany()
    const offers = await prisma.offer.findMany()
    const bids = await prisma.bid.findMany()
    const widgetViews = await prisma.widgetView.findMany()

    const data = {
      shops,
      offers,
      bids,
      widgetViews,
      exportedAt: new Date().toISOString()
    }

    // Convert Decimal fields to strings for JSON serialization
    const sanitizedData = JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (value && typeof value === 'object' && value.constructor?.name === 'Decimal') {
          return value.toString()
        }
        return value
      })
    )

    // Write to file
    fs.writeFileSync(
      'supabase_data_backup.json',
      JSON.stringify(sanitizedData, null, 2)
    )

    console.log('✅ Data exported successfully!')
    console.log(`📊 Records exported:`)
    console.log(`   - Shops: ${shops.length}`)
    console.log(`   - Offers: ${offers.length}`)
    console.log(`   - Bids: ${bids.length}`)
    console.log(`   - Widget Views: ${widgetViews.length}`)
    console.log(`📁 Saved to: supabase_data_backup.json`)

  } catch (error) {
    console.error('❌ Export failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()
