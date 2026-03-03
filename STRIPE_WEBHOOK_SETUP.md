# Stripe Webhook Setup for Staging

**Date:** 2026-03-02

This guide will help you configure Stripe webhooks for your staging environment to enable end-to-end testing of the unregistered mode feature.

---

## 🎯 What We're Setting Up

Stripe webhooks will notify your staging app when these events occur:
1. **`payment_intent.succeeded`** - Customer payment succeeds (tracks pending payouts)
2. **`payment_intent.payment_failed`** - Customer payment fails
3. **`account.updated`** - Seller's Stripe account status changes (triggers auto-payout)
4. **`account.application.authorized`** - Seller connects Stripe account
5. **`account.application.deauthorized`** - Seller disconnects Stripe account

---

## 📋 Step-by-Step Setup

### Step 1: Find Your Vercel Staging URL

First, you need to know your exact staging URL:

1. Go to https://vercel.com
2. Login with your account
3. Find your project (probably named "mybidly" or "bidupseller")
4. Click on it to see deployments
5. Look for the latest deployment and copy the URL

**Your staging URL will be something like:**
- `https://mybidly.vercel.app`
- `https://mybidly-git-main-yourusername.vercel.app`
- `https://bidupseller.vercel.app`

**Or check your GitHub repository settings:**
- Go to https://github.com/ivooa3/mybidly/settings
- Look for "Environments" or check recent deployments

---

### Step 2: Configure Stripe Webhook

1. **Login to Stripe Dashboard**
   - Go to https://dashboard.stripe.com
   - Make sure you're in **TEST MODE** (toggle in top right)

2. **Navigate to Webhooks**
   - Click "Developers" in the left sidebar
   - Click "Webhooks"
   - Click "+ Add endpoint" button

3. **Configure Endpoint URL**
   ```
   Endpoint URL: https://YOUR-VERCEL-URL.vercel.app/api/webhooks/stripe
   ```

   **Example:**
   ```
   https://mybidly.vercel.app/api/webhooks/stripe
   ```

4. **Select Events to Listen To**

   Click "Select events" and search for these 5 events:

   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `account.updated`
   - ✅ `account.application.authorized`
   - ✅ `account.application.deauthorized`

5. **Add Endpoint**
   - Click "Add endpoint"
   - Stripe will create the webhook

6. **Copy Signing Secret**
   - After creation, you'll see a "Signing secret" field
   - Click "Reveal" to show the secret
   - It starts with `whsec_`
   - **COPY THIS SECRET** - you'll need it in the next step

   Example: `whsec_abc123xyz789...`

---

### Step 3: Add Webhook Secret to Vercel

Now you need to add the webhook secret as an environment variable on Vercel:

1. **Go to Vercel Project Settings**
   - Open https://vercel.com
   - Select your project
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

2. **Add STRIPE_WEBHOOK_SECRET**
   - Click "Add New"
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_abc123xyz789...` (paste your secret)
   - **Environment:** Select "Production" (this includes main branch deployments)
   - Click "Save"

3. **Redeploy**
   - Go back to "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"
   - This ensures the new environment variable is loaded

---

### Step 4: Verify Webhook Configuration

After redeployment, test the webhook:

1. **In Stripe Dashboard**
   - Go to Developers → Webhooks
   - Click on your webhook endpoint
   - Scroll down to "Recent events"

2. **Send Test Event**
   - Click "Send test webhook"
   - Select "payment_intent.succeeded"
   - Click "Send test webhook"

3. **Check Response**
   - You should see a **200 OK** response
   - If you see an error, check:
     - URL is correct
     - Environment variable is set
     - App has been redeployed

---

## 🧪 End-to-End Testing Plan

Now you can test the complete unregistered mode flow on staging:

### Test Scenario: New Seller Without Stripe

**Prerequisites:**
- Staging app deployed: `https://YOUR-URL.vercel.app`
- Stripe webhooks configured
- Admin credentials: `admin@mybidly.io` / `Password123!`

---

### Phase 1: Register New Test Seller ✅

1. **Register:**
   - Go to `https://YOUR-URL.vercel.app/register`
   - Email: `testseller@example.com`
   - Password: `TestPass123!`
   - Accept Terms
   - Click "Create account"

2. **Expected Result:**
   - ✅ Registration succeeds
   - ✅ Database record created with `unregisteredMode: true`
   - ✅ Welcome email sent
   - ✅ Redirected to login page

---

### Phase 2: Create & Activate Offer (No Stripe) ✅

1. **Login:**
   - Email: `testseller@example.com`
   - Password: `TestPass123!`

2. **Complete Onboarding:**
   - Enter shop name: "Test Shop"
   - Save

3. **Create Offer:**
   - Go to "Create Offer"
   - Product Name: "Test Product"
   - Product SKU: "TEST-001"
   - Upload image
   - Min Price: €30.00
   - Stock: 10
   - Click "Save"

4. **Activate Offer:**
   - Go to "Offers" page
   - Toggle offer to "Active"

5. **Expected Result:**
   - ✅ No Stripe connection required
   - ✅ Offer activates immediately
   - ✅ No error messages

---

### Phase 3: Get Widget URL

1. **Go to Embed Code Page:**
   - Click "Embed Code" or go to `/dashboard/embed`

2. **Copy Shop ID from embed code:**
   ```html
   <script>
     myBidlyWidget.init({
       shopId: 'YOUR_SHOP_ID_HERE'
     });
   </script>
   ```

3. **Widget URL:**
   ```
   https://YOUR-URL.vercel.app/widget?shopId=YOUR_SHOP_ID
   ```

---

### Phase 4: Place Test Bid as Customer ✅

1. **Open Widget:**
   - Navigate to: `https://YOUR-URL.vercel.app/widget?shopId=YOUR_SHOP_ID`
   - Verify product displays

2. **Place Bid:**
   - Adjust price slider to €35.00
   - Click "Buy Now"

3. **Enter Shipping Address:**
   - Name: John Doe
   - Email: customer@test.com
   - Address: 123 Test St
   - City: Berlin
   - Postal Code: 10115
   - Country: Germany

4. **Payment (Use Stripe Test Card):**
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Click "Pay €35.00"

5. **Expected Result:**
   - ✅ Payment succeeds
   - ✅ Customer sees success message
   - ✅ Customer receives confirmation email

---

### Phase 5: Verify Webhook Processing ✅

**Wait 5-10 seconds for webhook processing**

1. **Check Stripe Dashboard:**
   - Go to Developers → Webhooks → Your endpoint
   - Check "Recent events"
   - Should see `payment_intent.succeeded` event
   - Status: **200 OK**

2. **Check Vercel Logs:**
   - Go to Vercel project → Deployments → Latest → Functions
   - Look for `/api/webhooks/stripe` logs
   - Should see:
     ```
     Payment succeeded for bid xxx
     Payment in unregistered mode - tracking pending payout
     Updated pending payouts for shop Test Shop: €35.00
     Sent pending payout notification to testseller@example.com
     ```

---

### Phase 6: Verify Pending Payout Tracking ✅

1. **Check Seller Email:**
   - Email: `testseller@example.com`
   - Should receive: **"myBidly: You have pending payouts"**
   - Body shows: €35.00 pending
   - Call-to-action: "Complete Stripe Onboarding"

2. **Check Seller Dashboard:**
   - Login as seller
   - Go to dashboard
   - **Should see orange banner:**
     ```
     ⚠️ Complete your Stripe Onboarding. You have pending payouts.
     Pending: €35.00
     [ Complete Setup → ]
     ```

3. **Verify Database:**
   - Run locally (connected to staging DB):
     ```bash
     npx prisma studio
     ```
   - Find the test shop
   - Check fields:
     - `unregistered_mode`: true ✅
     - `pending_payouts`: 35.00 ✅
     - `pending_payout_notified`: true ✅

---

### Phase 7: Place Second Bid (Test No Duplicate Email) ✅

1. **Place another bid** (different customer email)
   - Use widget again
   - Email: `customer2@test.com`
   - Bid: €40.00
   - Pay with test card

2. **Expected Result:**
   - ✅ Payment succeeds
   - ✅ Webhook processes successfully
   - ✅ `pending_payouts` increases to €75.00
   - ✅ **NO new email sent** (already notified)
   - ✅ Dashboard banner updates: "Pending: €75.00"

---

### Phase 8: Complete Stripe Onboarding ✅

1. **Login as Seller:**
   - Go to dashboard
   - Click "Complete Setup" button on banner
   - Or go to `/dashboard/profile`

2. **Start Stripe Connect:**
   - Click "Connect Stripe Account"
   - Should redirect to Stripe Connect onboarding

3. **Complete Onboarding (Stripe Test Mode):**
   - Use Stripe's test mode onboarding
   - Fill in required information:
     - Business type: Individual or Company
     - Business details (test data)
     - Bank account (use test account)
   - Submit all forms

4. **Expected Result:**
   - ✅ Redirected back to your app
   - ✅ Stripe sends `account.updated` webhook
   - ✅ Shop's `stripeOnboardingComplete`: true

---

### Phase 9: Verify Auto-Payout ✅

**Wait 10-30 seconds for webhook processing**

1. **Check Stripe Webhook Logs:**
   - Event: `account.updated`
   - Response: 200 OK
   - Logs should show:
     ```
     Account updated: acct_xxxxx
     Charges enabled: true
     Payouts enabled: true
     Shop Test Shop has pending payouts: €75.00
     Transfer breakdown: Pending €75.00, Fee €7.00, Transfer €68.00
     Transfer created: tr_xxxxx for €68.00
     Auto-payout completed for shop Test Shop
     ```

2. **Check Stripe Transfers:**
   - Go to Stripe Dashboard → Payments → Transfers
   - Should see new transfer:
     - Amount: €68.00 (after 8% + €1 fee)
     - Destination: Connected account
     - Status: Paid

3. **Check Seller Email:**
   - Should receive: **"myBidly: Your pending payouts have been transferred"**
   - Body shows: €68.00 transferred
   - Transfer ID: `tr_xxxxx`

4. **Check Seller Dashboard:**
   - Login as seller
   - **Banner should be GONE** ✅
   - `pending_payouts`: 0.00
   - `unregistered_mode`: false

5. **Verify Database:**
   - Check test shop record:
     - `pending_payouts`: 0.00 ✅
     - `unregistered_mode`: false ✅
     - `pending_payout_notified`: false ✅
     - `stripe_onboarding_complete`: true ✅

---

### Phase 10: Place New Bid (Normal Mode) ✅

1. **Place another bid:**
   - Use widget: `https://YOUR-URL.vercel.app/widget?shopId=YOUR_SHOP_ID`
   - Email: `customer3@test.com`
   - Bid: €45.00
   - Pay with test card

2. **Expected Result:**
   - ✅ Payment goes DIRECTLY to seller's Stripe account (not platform)
   - ✅ Platform fee automatically deducted (€4.60 = 8% + €1)
   - ✅ Seller receives €40.40 in their Stripe account
   - ✅ NO pending payout tracking
   - ✅ NO email notification
   - ✅ Dashboard shows normal stats

3. **Verify in Stripe:**
   - Check seller's connected account
   - Should see payment of €45.00
   - Platform fee of €4.60 deducted

---

## ✅ Success Criteria

Your end-to-end test is successful if:

- [x] New seller registers without Stripe
- [x] Offer activates without Stripe
- [x] Customer payment succeeds (goes to platform account)
- [x] Webhook processes `payment_intent.succeeded`
- [x] `pending_payouts` tracked correctly
- [x] Email sent ONCE after first payment
- [x] Dashboard banner displays with correct amount
- [x] Multiple payments accumulate in `pending_payouts`
- [x] NO duplicate emails for subsequent payments
- [x] Stripe onboarding completion detected
- [x] Auto-payout creates transfer to seller
- [x] Platform fee calculated correctly (8% + €1 for PAYG, 0% for Premium)
- [x] Email sent after payout
- [x] Dashboard banner disappears
- [x] Future payments go directly to seller
- [x] Stripe dashboard shows all transactions correctly

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Symptom:** Stripe shows webhook sent but app doesn't process

**Solutions:**
1. Check Vercel environment variable `STRIPE_WEBHOOK_SECRET` is set
2. Redeploy after adding environment variable
3. Verify webhook URL is correct (no typos)
4. Check Vercel function logs for errors

### Webhook Returns 401/403

**Symptom:** Stripe webhook fails with authentication error

**Solutions:**
1. `STRIPE_WEBHOOK_SECRET` mismatch
2. Copy secret again from Stripe dashboard
3. Make sure no extra spaces in environment variable

### Pending Payouts Not Tracked

**Symptom:** Payment succeeds but `pending_payouts` not incremented

**Solutions:**
1. Check webhook logs in Vercel
2. Verify `unregisteredMode: 'true'` in payment metadata
3. Check if `shopOwnerAmount` is calculated correctly
4. Verify database schema has `pending_payouts` field

### Auto-Payout Not Triggering

**Symptom:** Stripe connected but no transfer created

**Solutions:**
1. Check `account.updated` webhook received
2. Verify `charges_enabled` and `payouts_enabled` are both true
3. Check webhook logs for errors
4. Verify `pending_payouts > 0` before onboarding

### Email Not Received

**Symptom:** Webhook processes but no email sent

**Solutions:**
1. Check Vercel environment variable `RESEND_API_KEY` is set
2. Check spam folder
3. Check Resend dashboard for email logs
4. Verify `FROM_EMAIL` in `/lib/email.ts` is configured

---

## 🔄 Reset Test Environment

If you want to test again with the same seller:

```bash
# Connect to staging database (already configured in .env.local)
npx prisma studio

# Find your test shop
# Set these fields:
# - unregistered_mode: true
# - pending_payouts: 0
# - pending_payout_notified: false
# - stripe_account_id: null
# - stripe_onboarding_complete: false
```

---

## 📊 Monitoring

### Stripe Dashboard

**Webhook Events:**
- https://dashboard.stripe.com/test/webhooks/xxx/events

**Payments:**
- https://dashboard.stripe.com/test/payments

**Transfers:**
- https://dashboard.stripe.com/test/connect/transfers

**Connected Accounts:**
- https://dashboard.stripe.com/test/connect/accounts/overview

### Vercel Logs

**Function Logs:**
- https://vercel.com/your-project/deployments → Latest → Functions
- Look for `/api/webhooks/stripe`

**Real-time Logs (CLI):**
```bash
npx vercel logs --follow
```

---

## 📝 Checklist Before Testing

- [ ] Stripe webhook endpoint created
- [ ] 5 events configured (payment_intent.succeeded, payment_intent.payment_failed, account.updated, account.application.authorized, account.application.deauthorized)
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel environment variables
- [ ] App redeployed after adding environment variable
- [ ] Test webhook sent from Stripe (200 OK response)
- [ ] Database migration applied (unregisteredMode fields exist)
- [ ] Admin account exists and works
- [ ] Resend API key configured for emails
- [ ] Stripe test mode enabled

---

**Document Version:** 1.0
**Created:** 2026-03-02
**Status:** Ready for Testing
