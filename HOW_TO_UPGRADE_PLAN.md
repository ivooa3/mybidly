# How to Upgrade a Shop to Premium

When a shop owner upgrades to Premium, you need to update their `planTier` in the database.

## Method 1: Using Prisma Studio (Easiest)

1. **Start Prisma Studio:**
   ```bash
   npx prisma studio
   ```

2. **Navigate to the `Shop` model** in the left sidebar

3. **Find the shop** by email or shop name

4. **Click on the shop** to edit

5. **Change the `planTier` field** from `payg` to `premium`

6. **Click "Save 1 change"**

7. **Refresh the shop owner's dashboard** - They will now see:
   - Purple "Premium" badge in the sidebar (instead of blue "Pay-As-You-Go")
   - "€55/month • 0% fees" pricing display
   - No "Upgrade to Premium" link

## Method 2: Using Direct SQL

If you prefer SQL, you can update the plan tier directly:

```sql
-- Update a specific shop by email
UPDATE shops
SET "planTier" = 'premium'
WHERE email = 'customer@example.com';

-- Or by shop ID
UPDATE shops
SET "planTier" = 'premium'
WHERE id = 'clx123abc';
```

## Method 3: Using Prisma Client (Programmatic)

If you want to create an admin interface or script:

```typescript
import { prisma } from '@/lib/prisma'

// Upgrade a shop to premium
await prisma.shop.update({
  where: { email: 'customer@example.com' },
  data: { planTier: 'premium' }
})
```

## What Changes When Upgraded?

### In the Dashboard Sidebar:
- **Before (Pay-As-You-Go):**
  - Blue gradient badge
  - "Pay-As-You-Go • 8% per transaction"
  - "Upgrade to Premium" link visible

- **After (Premium):**
  - Purple gradient badge
  - "Premium • €55/month • 0% fees"
  - No upgrade link (already premium)

### In Billing:
- **Pay-As-You-Go:** 8% commission per transaction (includes Stripe)
- **Premium:** €55/month + only Stripe fees (~2.3%)

## Downgrading from Premium to Pay-As-You-Go

To downgrade a shop (e.g., if they cancel):

```sql
UPDATE shops
SET "planTier" = 'payg'
WHERE email = 'customer@example.com';
```

## Notes:

- The plan tier change is **instant** - no page refresh needed for the user
- The sidebar updates automatically based on the `planTier` value
- Currently, plan changes are **manual** (no automated billing)
- You handle upgrades/downgrades based on:
  - Customer emails to support@next-commerce.io
  - Stripe checkout confirmations
  - Payment tracking

## Future Enhancement Ideas:

- Add an admin panel page for plan management
- Automate plan changes based on Stripe webhook events
- Add plan change audit log
- Send confirmation emails when plan changes
