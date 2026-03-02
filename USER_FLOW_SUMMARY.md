# New Shop Owner User Flow - Complete Summary

**Date:** 2026-03-02
**Feature:** Unregistered Mode (Sellers can start without Stripe)

---

## Overview

This document summarizes the complete new shop owner user flow, focusing on the **unregistered mode** feature that allows sellers to activate offers and receive orders BEFORE connecting their Stripe account.

---

## User Journey: From Registration to First Payout

### Phase 1: Registration (No Stripe Required) ✅

**User Action:**
1. Visit https://mybidly.io or https://mybidly.io/pricing
2. Click "Get Started" (optionally select Premium plan)
3. Fill registration form:
   - Email
   - Password (min 8 chars, uppercase, lowercase, number)
   - Accept Terms of Service
4. Click "Create account"

**System Behavior:**
- Creates shop record in database with:
  - `unregisteredMode: true` (default)
  - `pendingPayouts: 0` (default)
  - `pendingPayoutNotified: false` (default)
  - `planTier: 'payg'` or `'premium'`
  - `stripeAccountId: null`
  - `stripeOnboardingComplete: false`
- Sends welcome email
- Redirects to login page

**Result:** ✅ Seller can proceed without any Stripe connection

---

### Phase 2: First Login & Onboarding

**User Action:**
1. Login with email/password
2. Complete onboarding:
   - Enter shop name
   - Basic shop details

**System Behavior:**
- Redirects to `/onboarding/shop-details`
- Saves shop name to database
- After completion, redirects to `/dashboard`

**Result:** ✅ Seller reaches dashboard without Stripe setup

---

### Phase 3: Create First Offer (No Stripe) ✅

**User Action:**
1. Navigate to "Create Offer" or `/dashboard/offers/new`
2. Fill offer details:
   - Product Name: "Premium Bike Helmet"
   - Product SKU: "HELMET-001"
   - Upload image
   - Min Price: €35.00
   - Stock Quantity: 50
3. Click "Save Offer"

**System Behavior:**
- **NO** Stripe connection check
- Creates offer record with `isActive: false`
- Returns success response

**Code Path:**
- POST `/api/offers`
- No Stripe validation required

**Result:** ✅ Offer created successfully without Stripe

---

### Phase 4: Activate Offer (No Stripe) ✅

**User Action:**
1. Navigate to `/dashboard/offers`
2. Toggle offer to "Active"

**System Behavior:**
- **NO** Stripe connection check (removed in implementation)
- Updates offer: `isActive: true`
- Offer immediately available for widget display

**Code Path:**
- PATCH `/app/api/offers/[id]/route.ts` (lines 56-73)
- Stripe check removed for activation

**Result:** ✅ Offer activated without Stripe - customers can now purchase!

---

### Phase 5: Customer Places Bid (Unregistered Mode) ✅

**User Action (Customer):**
1. Visit widget: `/widget?shopId=<SHOP_ID>`
2. View product offer
3. Adjust price slider to €40.00
4. Click "Buy Now"
5. Enter shipping address
6. Enter payment details (Stripe test card: `4242 4242 4242 4242`)
7. Submit payment

**System Behavior:**
1. **Check if shop is in unregistered mode:**
   ```typescript
   const isUnregisteredMode = !offer.shop.stripeAccountId || !offer.shop.stripeOnboardingComplete
   ```

2. **If unregistered mode (true):**
   - Create Payment Intent WITHOUT `stripeAccount` parameter
   - Create Payment Intent WITHOUT `application_fee_amount`
   - Payment goes to PLATFORM Stripe account (not seller's)
   - Add metadata:
     - `unregisteredMode: 'true'`
     - `heldForShop: 'true'`
     - All other bid details

3. **Create bid record:**
   - `status: 'accepted'` (if bid >= minPrice)
   - `stripePaymentId: paymentIntent.id`
   - `bidAmount: 40.00`
   - `platformFeeAmount: 4.20` (8% + €1 for PAYG)
   - `shopOwnerAmount: 35.80`

4. **Send confirmation email to customer**

**Code Path:**
- POST `/app/api/bids/route.ts` (lines 140-195)
- Conditional payment flow based on `isUnregisteredMode`

**Stripe Payment Intent:**
```javascript
// Unregistered Mode Payment Intent
{
  amount: 4000, // €40.00 in cents
  currency: 'eur',
  metadata: {
    shopId: '<SHOP_ID>',
    offerId: '<OFFER_ID>',
    customerEmail: 'customer@example.com',
    unregisteredMode: 'true',
    heldForShop: 'true',
    // ... other metadata
  }
  // NO stripeAccount field
  // NO application_fee_amount field
}
```

**Result:** ✅ Payment succeeds and stays in platform account (held for seller)

---

### Phase 6: Webhook Tracks Pending Payout ✅

**Webhook Event:** `payment_intent.succeeded`

**System Behavior:**
1. Stripe sends webhook to `/api/webhooks/stripe`
2. Find bid by `stripePaymentId` (more reliable than metadata)
3. Check if `paymentIntent.metadata.unregisteredMode === 'true'`
4. If true:
   - Get `bid.shopOwnerAmount` (€35.80 in example)
   - Increment shop's `pendingPayouts` by €35.80
   - Check if `shop.pendingPayoutNotified === false`
   - If false (first payment):
     - Send email: "myBidly: You have pending payouts"
     - Set `pendingPayoutNotified: true`
   - If true (subsequent payments):
     - Skip email (already notified)

**Code Path:**
- `/app/api/webhooks/stripe/route.ts` (lines 143-208)
- Finds bid by: `stripePaymentId: paymentIntent.id`
- Checks: `isUnregisteredMode = paymentIntent.metadata.unregisteredMode === 'true'`

**Database After First Payment:**
```sql
-- Shop record
unregistered_mode: true
pending_payouts: 35.80
pending_payout_notified: true
stripe_account_id: null
stripe_onboarding_complete: false
```

**Email Sent (ONCE only):**
- **Subject:** "myBidly: You have pending payouts"
- **Body:**
  - "You have €35.80 in pending payouts"
  - "Complete your Stripe onboarding to receive your funds"
  - Call-to-action button: "Complete Setup"
  - Explanation: "Once you connect Stripe, funds will be automatically transferred"

**Result:** ✅ Pending payout tracked, seller notified once

---

### Phase 7: Multiple Bids Accumulate

**Scenario:**
- Customer 2 bids €50.00 → Shop owner amount: €44.20
- Customer 3 bids €45.00 → Shop owner amount: €39.70

**System Behavior:**
- Each `payment_intent.succeeded` webhook:
  - Increments `pendingPayouts`
  - Checks `pendingPayoutNotified` (already true)
  - Skips email notification

**Database After 3 Payments:**
```sql
pending_payouts: 119.70  -- (35.80 + 44.20 + 39.70)
pending_payout_notified: true
```

**Result:** ✅ All payments tracked, only ONE email sent

---

### Phase 8: Dashboard Banner Display ✅

**User Action (Seller):**
1. Login to dashboard
2. Navigate to `/dashboard`

**System Behavior:**
- Dashboard loads with shop data
- Passes `pendingPayouts: 119.70` and `locale: 'en'` to `DashboardContent`
- `UnregisteredModeBanner` component checks: `if (pendingPayouts > 0)`
- If true, displays orange banner

**Banner Display:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Complete your Stripe Onboarding. You have pending       │
│     payouts.                                                │
│                                                             │
│     Pending: €119.70                                        │
│                                                             │
│     [ Complete Setup → ]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Code Path:**
- `/app/(dashboard)/dashboard/page.tsx` (lines 56-57)
- `/components/DashboardContent.tsx` (line 47)
- `/components/UnregisteredModeBanner.tsx`

**Result:** ✅ Prominent banner encourages Stripe onboarding

---

### Phase 9: Start Stripe Onboarding

**User Action:**
1. Click "Complete Setup" button on banner
2. Redirect to `/dashboard/profile`
3. Click "Connect Stripe Account" button
4. Redirect to Stripe Connect hosted onboarding

**System Behavior:**
- Creates Stripe Standard Connect account
- Redirects to Stripe's onboarding flow
- Saves `stripeAccountId` to database
- Sets `stripeAccountStatus: 'pending'`

**Result:** Seller begins Stripe onboarding process

---

### Phase 10: Complete Stripe Onboarding & Auto-Payout ✅

**User Action:**
1. Complete all Stripe onboarding steps
2. Submit required information
3. Stripe verifies and enables account

**Webhook Event:** `account.updated`

**System Behavior:**

1. **Check account status:**
   ```typescript
   if (account.charges_enabled && account.payouts_enabled)
   ```

2. **Update shop status:**
   ```typescript
   stripeAccountStatus: 'active'
   stripeOnboardingComplete: true
   ```

3. **Check for pending payouts:**
   ```typescript
   const hasPendingPayouts = Number(shop.pendingPayouts) > 0
   ```

4. **If pending payouts exist, execute auto-payout:**

   **For PAYG Plan:**
   ```typescript
   // Calculate platform fee: 8% + €1
   const pendingAmount = 119.70
   const platformFee = (119.70 * 0.08) + 1.00 = 10.58
   const transferAmount = 119.70 - 10.58 = 109.12
   ```

   **For Premium Plan:**
   ```typescript
   // Calculate platform fee: 0%
   const pendingAmount = 119.70
   const platformFee = 0.00
   const transferAmount = 119.70
   ```

5. **Create Stripe transfer:**
   ```typescript
   await stripe.transfers.create({
     amount: 10912, // €109.12 in cents (PAYG example)
     currency: 'eur',
     destination: account.id,
     description: `Auto-payout of pending funds for ${shop.shopName}`,
     metadata: {
       shopId: shop.id,
       shopName: shop.shopName,
       originalAmount: '119.70',
       platformFee: '10.58',
       planTier: 'payg'
     }
   })
   ```

6. **Update database:**
   ```typescript
   await prisma.shop.update({
     where: { id: shop.id },
     data: {
       pendingPayouts: 0,
       unregisteredMode: false,
       pendingPayoutNotified: false // Reset for future use
     }
   })
   ```

7. **Send payout completed email:**
   - **Subject (EN):** "myBidly: Your pending payouts have been transferred"
   - **Subject (DE):** "myBidly: Ihre ausstehenden Auszahlungen wurden überwiesen"
   - **Body:**
     - "€109.12 has been transferred to your Stripe account" (PAYG)
     - "Transfer ID: tr_xxxxx"
     - "Funds available in your Stripe Dashboard"

**Code Path:**
- `/app/api/webhooks/stripe/route.ts` (lines 35-141)
- Auto-payout logic in `account.updated` case

**Database After Auto-Payout:**
```sql
unregistered_mode: false
pending_payouts: 0.00
pending_payout_notified: false
stripe_account_id: 'acct_xxxxx'
stripe_onboarding_complete: true
stripe_account_status: 'active'
```

**Result:** ✅ Funds automatically transferred to seller's Stripe account

---

### Phase 11: Normal Operations (Post-Onboarding)

**Customer Places New Bid:**

**System Behavior:**
1. **Check if shop is in unregistered mode:**
   ```typescript
   const isUnregisteredMode = !offer.shop.stripeAccountId || !offer.shop.stripeOnboardingComplete
   // Returns: false (shop now has Stripe connected)
   ```

2. **Normal mode payment flow:**
   - Create Payment Intent WITH `stripeAccount: offer.shop.stripeAccountId`
   - Create Payment Intent WITH `application_fee_amount: platformFeeAmount`
   - Payment goes DIRECTLY to seller's Stripe account
   - Platform fee automatically deducted and sent to platform account

3. **No pending payout tracking:**
   - Payment goes directly to seller
   - No `pendingPayouts` increment
   - No email notification needed

**Stripe Payment Intent (Normal Mode):**
```javascript
{
  amount: 4000, // €40.00
  currency: 'eur',
  application_fee_amount: 420, // €4.20 (8% + €1 for PAYG)
  metadata: {
    shopId: '<SHOP_ID>',
    offerId: '<OFFER_ID>',
    // NO unregisteredMode flag
    // NO heldForShop flag
  }
}
// Request options:
{ stripeAccount: 'acct_xxxxx' } // Seller's account
```

**Dashboard:**
- Banner NO LONGER displayed (`pendingPayouts: 0`)
- Normal stats and analytics
- Future payments go directly to seller

**Result:** ✅ Seller now receives payments directly through Stripe

---

## Technical Implementation Summary

### Modified Files

1. **`/prisma/schema.prisma`**
   - Added `unregisteredMode Boolean @default(true)`
   - Added `pendingPayouts Decimal @default(0)`
   - Added `pendingPayoutNotified Boolean @default(false)`

2. **`/app/api/offers/[id]/route.ts`** (lines 56-73)
   - Removed Stripe onboarding check from offer activation
   - Allows activation in unregistered mode

3. **`/app/api/bids/route.ts`** (lines 140-195)
   - Added conditional payment flow
   - If unregistered: payment to platform account (no fees deducted)
   - If registered: destination charge to seller (with application fee)

4. **`/app/api/webhooks/stripe/route.ts`**
   - **Lines 143-208:** `payment_intent.succeeded` handler
     - Finds bid by `stripePaymentId`
     - Tracks pending payouts
     - Sends email notification (once only)
   - **Lines 35-141:** `account.updated` handler
     - Detects Stripe onboarding completion
     - Calculates platform fees (8% + €1 for PAYG, 0% for Premium)
     - Creates transfer to seller's account
     - Resets `pendingPayouts` and `unregisteredMode`
     - Sends payout completed email
   - **Lines 210-227:** `payment_intent.payment_failed` handler
     - Updated to find bid by `stripePaymentId`

5. **`/lib/email.ts`** (appended ~300 lines)
   - Added `sendPendingPayoutNotification()`
   - Added `sendPayoutCompletedEmail()`
   - Both with EN/DE translations

6. **`/components/UnregisteredModeBanner.tsx`** (new file)
   - Orange warning banner
   - Shows pending payout amount
   - Call-to-action to complete Stripe onboarding
   - Only displays when `pendingPayouts > 0`

7. **`/app/(dashboard)/dashboard/page.tsx`** (lines 56-57)
   - Passes `pendingPayouts` and `locale` to DashboardContent

8. **`/components/DashboardContent.tsx`** (line 47)
   - Renders `UnregisteredModeBanner` component

---

## Key Benefits

### For Sellers
✅ **No Friction:** Start receiving orders immediately after registration
✅ **Risk-Free Trial:** Test the platform before connecting payment account
✅ **Transparent:** Clear notification of pending funds with exact amounts
✅ **Automatic:** Funds transferred automatically when Stripe connected
✅ **Plan Flexibility:** PAYG or Premium plan selection during registration

### For Platform
✅ **Higher Conversion:** More sellers complete registration (no Stripe barrier)
✅ **Faster Time-to-First-Order:** Sellers can go live immediately
✅ **Better Retention:** Sellers more likely to connect Stripe after seeing value
✅ **Payment Security:** All funds held securely in platform account
✅ **Automated Payouts:** No manual intervention required

---

## Edge Cases Handled

### ✅ Multiple Payments Before Stripe Connection
- All payments tracked in `pendingPayouts`
- Only ONE email sent (after first payment)
- Full amount transferred when Stripe connected

### ✅ Duplicate Webhooks
- Check `if (hasPendingPayouts)` before creating transfer
- Idempotent - won't create duplicate transfers

### ✅ Partial Stripe Onboarding
- Shop has `stripeAccountId` but `charges_enabled: false`
- Remains in unregistered mode until fully onboarded
- Pending payouts NOT transferred yet

### ✅ Webhook Lookup by Payment Intent ID
- Changed from metadata `bidId` to `stripePaymentId` lookup
- More reliable since bid created after payment intent

### ⚠️ TODO: Failed Transfer Error Handling
- If Stripe transfer fails during auto-payout
- Currently: Error logged, webhook returns 200
- **Needs:** Manual investigation process documented

---

## Testing Checklist

### Code Review Tests ✅
- [x] Database schema has correct defaults
- [x] Registration doesn't require Stripe
- [x] Offer activation doesn't require Stripe
- [x] Payment API has conditional flow
- [x] Webhook tracks pending payouts
- [x] Webhook implements auto-payout
- [x] Email templates created (EN & DE)
- [x] Dashboard banner component created
- [x] Webhook finds bid by `stripePaymentId`

### Live Tests Required ⏳
- [ ] Full end-to-end user journey (PAYG plan)
- [ ] Full end-to-end user journey (Premium plan)
- [ ] Stripe webhook integration with test account
- [ ] Email delivery verification (Gmail, Outlook, etc.)
- [ ] Mobile widget responsiveness
- [ ] Multiple concurrent bids
- [ ] Edge case: Partial Stripe onboarding
- [ ] Edge case: Failed transfer handling

---

## Database Queries for Verification

### Check Shop Status
```sql
SELECT
  email,
  shop_name,
  unregistered_mode,
  pending_payouts,
  pending_payout_notified,
  stripe_account_id,
  stripe_onboarding_complete,
  plan_tier
FROM shops
WHERE email = 'testshop@example.com';
```

### Check All Shops with Pending Payouts
```sql
SELECT
  s.email,
  s.shop_name,
  s.pending_payouts,
  s.pending_payout_notified,
  COUNT(b.id) AS total_accepted_bids,
  SUM(b.shop_owner_amount) AS calculated_pending
FROM shops s
LEFT JOIN bids b ON s.id = b.shop_id AND b.status = 'accepted'
WHERE s.unregistered_mode = true
  AND s.pending_payouts > 0
GROUP BY s.id, s.email, s.shop_name, s.pending_payouts, s.pending_payout_notified;
```

### Check Bids in Unregistered Mode
```sql
SELECT
  b.id,
  b.created_at,
  b.customer_email,
  b.bid_amount,
  b.shop_owner_amount,
  b.platform_fee_amount,
  b.status,
  s.email AS shop_email,
  s.unregistered_mode,
  s.pending_payouts
FROM bids b
JOIN shops s ON b.shop_id = s.id
WHERE s.unregistered_mode = true
ORDER BY b.created_at DESC;
```

---

## Deployment Checklist

### Environment Variables
- ✅ `STRIPE_SECRET_KEY` configured
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configured
- ✅ `STRIPE_WEBHOOK_SECRET` configured
- ✅ `RESEND_API_KEY` configured

### Stripe Configuration
- ⏳ Webhook endpoint: `https://mybidly.io/api/webhooks/stripe`
- ⏳ Webhook events enabled:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `account.updated`
  - `account.application.authorized`
  - `account.application.deauthorized`

### Database Migration
- ✅ Schema updated with new fields
- ✅ Applied with `npx prisma db push --accept-data-loss`
- ✅ Existing shops have default values

---

## Documentation References

- **Full QA Testing Guide:** [/QA_TESTING.md](/QA_TESTING.md)
- **Original Implementation Spec:** [/TRIAL_MODE_IMPLEMENTATION.md](/TRIAL_MODE_IMPLEMENTATION.md)
- **Project Documentation:** [/CLAUDE.md](/CLAUDE.md)

---

**Document Version:** 1.0
**Author:** Claude (AI Assistant)
**Review Status:** Pending User Testing
**Next Steps:** Execute end-to-end live testing with Stripe test account
