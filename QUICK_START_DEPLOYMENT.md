# myBidly Quick Start Deployment

## ✅ What's Ready
- Landing page with €14/month pricing
- Bilingual support (EN/DE)
- Complete dashboard & widget
- Email system configured
- Stripe integration ready
- Auto-acceptance logic built

---

## 🚀 Deploy in 6 Steps (45 minutes)

### Step 1: Push to GitHub (5 min)

```bash
cd /Users/nextcommerce/BidUpseller
git init
git add .
git commit -m "Initial commit - myBidly ready for production"
git branch -M main

# Create repo on github.com/new (name it: mybidly)
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/mybidly.git
git push -u origin main
```

### Step 2: Generate Secrets (1 min)

```bash
# Save these outputs - you'll need them for Vercel
echo "NEXTAUTH_SECRET:"
openssl rand -base64 32

echo "CRON_SECRET:"
openssl rand -hex 32
```

### Step 3: Deploy to Vercel (10 min)

1. Go to **https://vercel.com/new**
2. Import GitHub repo: `mybidly`
3. Add environment variables:

```env
DATABASE_URL=postgresql://your-supabase-url
NEXTAUTH_SECRET=<from step 2>
NEXTAUTH_URL=https://mybidly.io
STRIPE_SECRET_KEY=sk_test_<your-stripe-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your-stripe-key>
STRIPE_WEBHOOK_SECRET=<leave empty for now>
RESEND_API_KEY=re_<your-resend-key>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
CRON_SECRET=<from step 2>
NEXT_PUBLIC_APP_URL=https://mybidly.io
```

4. Click **Deploy** → Wait 3 minutes

### Step 4: Run Database Migrations (3 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to project
vercel link

# Pull env vars
vercel env pull .env.production.local

# Run migrations
npx prisma migrate deploy
```

### Step 5: Connect Domain on IONOS (15 min)

1. **Login to IONOS** → Domains → mybidly.io → DNS
2. **Add A Record**:
   - Host: `@`
   - Value: `76.76.21.21`
   - TTL: `3600`
3. **Add CNAME Record**:
   - Host: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `3600`
4. **Wait for DNS** (check: https://dnschecker.org/#A/mybidly.io)

### Step 6: Configure Stripe Webhook (5 min)

1. **Stripe Dashboard** → Developers → Webhooks → Add endpoint
2. **URL**: `https://mybidly.io/api/webhooks/stripe`
3. **Events**: 
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
4. **Copy signing secret** (starts with `whsec_`)
5. **Add to Vercel**: 
   - Go to Vercel → Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_...`
6. **Redeploy** project

---

## ✅ Test Deployment (10 min)

- [ ] Visit https://mybidly.io
- [ ] Click "Start Free Trial"
- [ ] Register test account
- [ ] Check welcome email arrives
- [ ] Create test offer in dashboard
- [ ] Copy embed code
- [ ] Test widget on external page
- [ ] Submit test bid (card: 4242 4242 4242 4242)
- [ ] Verify confirmation email
- [ ] Wait 10-20 min for auto-processing
- [ ] Verify acceptance email

---

## 🎯 Go Live Checklist

When ready for real customers:

1. **Switch Stripe to live mode**:
   - Get live API keys (sk_live_ and pk_live_)
   - Update Vercel env vars
   - Redeploy

2. **Legal pages**:
   - Add Terms of Service
   - Add Privacy Policy
   - Add cookie consent (EU requirement)

3. **Monitoring**:
   - Enable Vercel Analytics
   - Set up UptimeRobot
   - Monitor Resend email logs

4. **Launch**:
   - Start with 5-10 pilot shops
   - Gather feedback
   - Iterate

---

## 📞 Need Help?

**Common Issues:**

- Build fails → Check Vercel logs, verify all env vars set
- Domain not connecting → Wait 1 hour, check DNS with `dig mybidly.io`
- Emails not sending → Verify Resend API key, check sender verified
- Database errors → Check DATABASE_URL format, ensure SSL enabled

**Full guide**: See `VERCEL_DEPLOYMENT_STEPS.md`

---

**You're ready to deploy! Follow steps 1-6 above. Total time: ~45 minutes.**

Good luck! 🚀
