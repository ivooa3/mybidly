# 🚀 myBidly Deployment Guide
## Complete Step-by-Step Instructions

**Domain**: mybidly.io
**Registrar**: IONOS
**Hosting**: Vercel

---

## 📋 **Pre-Deployment Checklist**

Before we start, you need accounts for:
- [x] Vercel (sign up at vercel.com)
- [ ] Supabase (database - sign up at supabase.com)
- [ ] Stripe (payments - sign up at stripe.com)
- [ ] Resend (emails - sign up at resend.com)

---

## 🎬 **DEPLOYMENT ROADMAP**

We'll do this in **10 steps** (takes about 30-45 minutes):

1. ✅ Setup Vercel CLI
2. ✅ Create Production Database (Supabase)
3. ✅ Setup Stripe Live Mode
4. ✅ First Vercel Deployment
5. ✅ Configure DNS (IONOS)
6. ✅ Add Custom Domain (Vercel)
7. ✅ Setup Resend Email
8. ✅ Configure Environment Variables
9. ✅ Deploy to Production
10. ✅ Test Everything

---

## **STEP 1: Setup Vercel CLI** ⏱️ 2 minutes

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Verify installation
vercel --version
```

✅ **Done? Continue to Step 2**

---

## **STEP 2: Create Production Database** ⏱️ 5 minutes

### 2.1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `mybidly-production`
   - **Database Password**: [Generate strong password - SAVE THIS!]
   - **Region**: Choose closest to EU (Frankfurt, London, or Paris)
4. Click **"Create new project"** (takes 2-3 minutes)

### 2.2: Get Connection String

1. Once created, go to **Settings** → **Database**
2. Scroll to **Connection String**
3. Select **"URI"** tab
4. Click **"Copy"** (looks like: `postgresql://postgres:[password]@...`)
5. **SAVE THIS** - you'll need it in Step 8

### 2.3: Run Migrations

```bash
# Set your production database URL temporarily
export DATABASE_URL="[paste your Supabase connection string here]"

# Run migrations to create all tables
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

✅ **Done? Continue to Step 3**

---

## **STEP 3: Setup Stripe Live Mode** ⏱️ 10 minutes

### 3.1: Activate Live Mode

1. Go to https://dashboard.stripe.com
2. **Toggle** switch in top right from "Test mode" to "Live mode"
3. If prompted, complete business verification (may take a few minutes)

### 3.2: Get Live API Keys

1. Go to **Developers** → **API keys**
2. Copy these two keys:
   - **Publishable key**: `pk_live_...` (Safe to expose)
   - **Secret key**: `sk_live_...` (Keep secret!) - Click "Reveal test key"
3. **SAVE THESE** - you'll need them in Step 8

### 3.3: Create Webhook Endpoint

**Important**: We'll do this AFTER deploying to Vercel (Step 6), so you have the live URL.

**For now, just note**: You'll create webhook at `https://mybidly.io/api/webhooks/stripe`

✅ **Done? Continue to Step 4**

---

## **STEP 4: First Vercel Deployment** ⏱️ 3 minutes

This creates your Vercel project and gives you a temporary URL.

```bash
# Make sure you're in the project directory
cd /Users/nextcommerce/BidUpseller

# Deploy (this is a preview deployment)
vercel

# Answer the prompts:
# ? Set up and deploy "~/BidUpseller"? → Y
# ? Which scope do you want to deploy to? → [Your Vercel account]
# ? Link to existing project? → N
# ? What's your project's name? → mybidly
# ? In which directory is your code located? → ./
# ? Want to override the settings? → N
```

**Result**: You'll get a URL like `https://mybidly-xxxxx.vercel.app`

✅ **Done? Copy the URL and continue to Step 5**

---

## **STEP 5: Configure DNS (IONOS)** ⏱️ 5 minutes

### 5.1: Login to IONOS

1. Go to https://www.ionos.com
2. Login to your account
3. Go to **Domains & SSL**
4. Click on **mybidly.io**
5. Click **DNS** or **Manage DNS**

### 5.2: Add DNS Records

**Delete any existing A or CNAME records for @ or www first!**

Then add these **3 records**:

#### Record 1: Root Domain
```
Type: A
Host: @ (or leave empty)
Points to: 76.76.21.21
TTL: 3600
```

#### Record 2: WWW Subdomain
```
Type: CNAME
Host: www
Points to: cname.vercel-dns.com
TTL: 3600
```

#### Record 3: Staging Subdomain
```
Type: CNAME
Host: staging
Points to: cname.vercel-dns.com
TTL: 3600
```

### 5.3: Save and Wait

1. Click **Save** for each record
2. DNS propagation takes **5-60 minutes** (usually ~10 min)
3. Check status at: https://dnschecker.org/#A/mybidly.io

✅ **Done? While DNS propagates, continue to Step 6**

---

## **STEP 6: Add Custom Domain in Vercel** ⏱️ 3 minutes

### 6.1: Add Production Domain

1. Go to https://vercel.com/dashboard
2. Click on your **mybidly** project
3. Go to **Settings** → **Domains**
4. Click **"Add"**
5. Enter: `mybidly.io`
6. Click **"Add"**

Vercel will show DNS configuration status. Since we already configured DNS in Step 5, it should turn green after DNS propagates.

### 6.2: Add WWW Domain

1. Click **"Add"** again
2. Enter: `www.mybidly.io`
3. Click **"Add"**
4. Choose: **"Redirect to mybidly.io"** (recommended)

### 6.3: Add Staging Domain

1. Click **"Add"** again
2. Enter: `staging.mybidly.io`
3. Click **"Add"**

### 6.4: Wait for SSL Certificates

Vercel automatically provisions SSL certificates. This takes 1-2 minutes after DNS propagates.

✅ **Done? Continue to Step 7**

---

## **STEP 7: Setup Resend Email** ⏱️ 8 minutes

### 7.1: Create Resend Account

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email

### 7.2: Get API Key

1. Go to **API Keys** in sidebar
2. Click **"Create API Key"**
3. Name: `mybidly-production`
4. Click **"Add"**
5. **COPY THE KEY** (starts with `re_...`)
6. **SAVE THIS** - you'll need it in Step 8

### 7.3: Add and Verify Domain

1. Go to **Domains** in sidebar
2. Click **"Add Domain"**
3. Enter: `mybidly.io`
4. Click **"Add"**

### 7.4: Add DNS Records for Email (Back to IONOS)

Resend will show you DNS records to add. Go back to IONOS DNS settings and add:

#### TXT Record (Verification)
```
Type: TXT
Host: @
Value: [Copy from Resend - looks like "resend-verification=..."]
TTL: 3600
```

#### MX Records (Email Delivery)
```
Type: MX
Host: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: 3600
```

#### CNAME Record (DKIM)
```
Type: CNAME
Host: resend._domainkey
Value: [Copy from Resend - looks like "xxxxx.dkim.amazonses.com"]
TTL: 3600
```

### 7.5: Verify Domain

1. After adding DNS records, go back to Resend
2. Click **"Verify Domain"**
3. Wait 2-5 minutes for DNS propagation
4. Refresh - Status should turn green ✅

✅ **Done? Continue to Step 8**

---

## **STEP 8: Configure Environment Variables** ⏱️ 5 minutes

Now we'll add all the secrets to Vercel.

### 8.1: Go to Vercel Environment Variables

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

### 8.2: Add These Variables (One by One)

Click **"Add New"** for each:

#### Database
```
Key: DATABASE_URL
Value: [Your Supabase connection string from Step 2]
Environment: Production, Preview, Development
```

#### NextAuth
```
Key: NEXTAUTH_SECRET
Value: [Generate with: openssl rand -base64 32]
Environment: Production, Preview, Development
```

```
Key: NEXTAUTH_URL
Value: https://mybidly.io
Environment: Production
```

```
Key: NEXTAUTH_URL
Value: https://staging.mybidly.io
Environment: Preview
```

#### Stripe (Live Mode)
```
Key: STRIPE_SECRET_KEY
Value: [Your sk_live_... from Step 3]
Environment: Production
```

```
Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: [Your pk_live_... from Step 3]
Environment: Production
```

**For Preview/Staging** (add separately with Test keys):
```
Key: STRIPE_SECRET_KEY
Value: [Your sk_test_... key from Stripe test mode]
Environment: Preview
```

```
Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: [Your pk_test_... key from Stripe test mode]
Environment: Preview
```

#### Resend
```
Key: RESEND_API_KEY
Value: [Your re_... from Step 7]
Environment: Production, Preview, Development
```

#### Cloudinary (if you're using it)
```
Key: CLOUDINARY_CLOUD_NAME
Value: [Your cloud name]
Environment: Production, Preview, Development
```

```
Key: CLOUDINARY_API_KEY
Value: [Your API key]
Environment: Production, Preview, Development
```

```
Key: CLOUDINARY_API_SECRET
Value: [Your API secret]
Environment: Production, Preview, Development
```

#### Cron Security
```
Key: CRON_SECRET
Value: [Generate with: openssl rand -hex 32]
Environment: Production, Preview, Development
```

#### App URL
```
Key: NEXT_PUBLIC_APP_URL
Value: https://mybidly.io
Environment: Production
```

```
Key: NEXT_PUBLIC_APP_URL
Value: https://staging.mybidly.io
Environment: Preview
```

✅ **Done? Continue to Step 9**

---

## **STEP 9: Deploy to Production** ⏱️ 2 minutes

Now let's do the official production deployment!

```bash
# From your project directory
cd /Users/nextcommerce/BidUpseller

# Deploy to production
vercel --prod

# Wait for build... ⏳
# When done, you'll see: ✅ Production: https://mybidly.io
```

✅ **Done? Continue to Step 10**

---

## **STEP 10: Final Configuration & Testing** ⏱️ 5 minutes

### 10.1: Create Stripe Webhook (NOW with live URL)

1. Go to https://dashboard.stripe.com (make sure you're in **Live mode**)
2. Go to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter:
   - **Endpoint URL**: `https://mybidly.io/api/webhooks/stripe`
   - **Description**: "myBidly Production Webhook"
5. Click **"Select events"**
6. Select these 3 events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
7. Click **"Add events"**
8. Click **"Add endpoint"**
9. **COPY THE SIGNING SECRET** (starts with `whsec_...`)

### 10.2: Add Webhook Secret to Vercel

1. Go back to Vercel → Settings → Environment Variables
2. Add new variable:
```
Key: STRIPE_WEBHOOK_SECRET
Value: [Your whsec_... from above]
Environment: Production
```

### 10.3: Redeploy (to apply webhook secret)

```bash
vercel --prod
```

---

## ✅ **DEPLOYMENT COMPLETE!**

Your app is now live at: **https://mybidly.io**

---

## 🧪 **Testing Checklist**

Test these critical paths in order:

### Basic Functionality
- [ ] Homepage loads: https://mybidly.io
- [ ] Can register new account
- [ ] Can login
- [ ] Dashboard loads and displays correctly
- [ ] Profile page works

### Shop Owner Features
- [ ] Can create new offer
- [ ] Image upload works (Cloudinary)
- [ ] Embed code generates correctly
- [ ] Can view offer list
- [ ] Can edit offer
- [ ] Stock tracking works

### Customer Widget
- [ ] Widget loads: `https://mybidly.io/widget?shopId=[your-shop-id]`
- [ ] Product displays correctly
- [ ] Price slider works
- [ ] Responsive on mobile

### Payment Flow (Use Real Card!)
- [ ] Click "Submit and Pay" opens payment form
- [ ] Can enter card details
- [ ] Payment processes successfully
- [ ] Redirects to success page
- [ ] Bid appears in dashboard as "pending"

### Email System (Critical!)
- [ ] Bid confirmation email received (customer)
- [ ] After 10-20 minutes: Acceptance email received (customer)
- [ ] After 10-20 minutes: Order notification received (shop owner)
- [ ] All emails show support@mybidly.io
- [ ] German emails work when locale set to 'de'

### Cron Job
- [ ] After 10-20 minutes, check Vercel logs (Functions → Logs)
- [ ] Cron job should run every 10 minutes
- [ ] Look for: "Bid processing cron completed"

### Password Reset
- [ ] Click "Forgot Password" on login
- [ ] Enter email
- [ ] Receive reset email
- [ ] Can reset password via link
- [ ] Can login with new password

---

## 📊 **Monitor Your App**

### Vercel Dashboard
https://vercel.com/dashboard
- **Analytics**: Traffic, performance
- **Deployments**: History of all deploys
- **Logs**: Real-time function logs
- **Functions**: Cron job execution logs

### Stripe Dashboard
https://dashboard.stripe.com
- **Payments**: All transactions
- **Webhooks**: Event delivery status
- **Logs**: Webhook requests

### Supabase Dashboard
https://supabase.com/dashboard
- **Database**: Table editor, SQL editor
- **Logs**: Database queries
- **Usage**: Storage, bandwidth

### Resend Dashboard
https://resend.com/emails
- **Emails**: All sent emails
- **Logs**: Delivery status
- **Analytics**: Open rates, click rates

---

## 🚨 **Troubleshooting**

### Site Not Loading?
1. Check DNS propagation: https://dnschecker.org
2. Wait 30-60 minutes for full propagation
3. Clear browser cache / try incognito mode
4. Check Vercel domain settings (should be green)

### Build Failed?
1. Check Vercel build logs
2. Run `npm run build` locally to test
3. Verify all environment variables are set
4. Check for TypeScript errors

### Database Connection Error?
1. Verify DATABASE_URL is correct in Vercel
2. Check Supabase project is active
3. Run migrations: `npx prisma migrate deploy`
4. Regenerate client: `npx prisma generate`

### Emails Not Sending?
1. Check Resend domain is verified (green checkmark)
2. Verify RESEND_API_KEY in Vercel
3. Check Resend logs for errors
4. Ensure FROM_EMAIL matches verified domain

### Stripe Webhook Failing?
1. Check webhook secret matches Vercel env var
2. Verify endpoint URL is correct
3. Check Stripe webhook logs for errors
4. Test webhook with Stripe CLI

### Cron Job Not Running?
1. Check Vercel functions logs
2. Verify CRON_SECRET matches env var
3. Test manually: `curl -H "Authorization: Bearer [secret]" https://mybidly.io/api/cron/auto-decline-bids`
4. Check vercel.json is deployed

---

## 🎉 **Next Steps**

### Immediate (Today)
1. ✅ Complete all testing checklist items
2. Create your first real shop account
3. Create your first real offer
4. Test the full customer journey

### This Week
1. Onboard 3-5 pilot shops
2. Monitor logs and analytics daily
3. Gather feedback
4. Fix any bugs found

### Ongoing
1. Monitor performance weekly
2. Review financials (Stripe + Supabase + Vercel costs)
3. Plan feature iterations based on feedback
4. Marketing and customer acquisition

---

## 💰 **Current Costs**

### Production Environment:
- **Vercel**: $20/month (Pro plan)
- **Supabase**: $25/month (Pro plan)
- **Stripe**: 1.4% + €0.25 per transaction
- **Resend**: $20/month (Pro - 50k emails)
- **Domain (IONOS)**: Already paid

**Total**: ~$65/month + transaction fees

---

## 🆘 **Need Help?**

If you run into issues:
1. Check the troubleshooting section above
2. Review Vercel/Stripe/Supabase logs
3. Search error messages in documentation
4. Ask me for help - I'm here!

---

## 🎯 **Congratulations!**

You've successfully deployed **myBidly** to production! 🚀

Your MVP is now live and ready for customers.

**Live URL**: https://mybidly.io
**Staging URL**: https://staging.mybidly.io

---

**Questions? Issues? Let me know and I'll help debug!**
