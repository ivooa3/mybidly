# myBidly Vercel Deployment Guide

## Prerequisites Checklist
- ✅ Domain: mybidly.io (purchased on IONOS)
- ✅ GitHub account
- ✅ Vercel account (create at vercel.com)
- ✅ Supabase database ready
- ✅ Stripe account (with EUR support)
- ✅ Resend account for emails

---

## Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
cd /Users/nextcommerce/BidUpseller
git init

# Create .gitignore if missing
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
prisma/dev.db
prisma/dev.db-journal
EOF

# Add all files
git add .

# Commit
git commit -m "Initial commit - myBidly ready for deployment"

# Create GitHub repo (go to github.com/new and create 'mybidly')
# Then connect and push:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mybidly.git
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to **https://vercel.com**
2. Click **"Add New" → "Project"**
3. Import your GitHub repository: `mybidly`
4. Vercel will auto-detect Next.js

### 2.2 Configure Build Settings
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add these:

```bash
# Database
DATABASE_URL=postgresql://YOUR_SUPABASE_CONNECTION_STRING

# Authentication
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE
NEXTAUTH_URL=https://mybidly.io

# Stripe
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Resend (Email)
RESEND_API_KEY=re_YOUR_RESEND_API_KEY

# Cloudinary (Image Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Cron Job Security
CRON_SECRET=YOUR_GENERATED_CRON_SECRET

# App Config
NEXT_PUBLIC_APP_URL=https://mybidly.io
```

**To generate secrets:**
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -hex 32
```

### 2.4 Deploy
Click **"Deploy"** and wait ~3 minutes

---

## Step 3: Run Database Migrations

After first deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migration command via Vercel CLI
vercel env pull .env.production.local
npx prisma migrate deploy --preview-feature
```

**Or via Vercel Dashboard:**
1. Go to your project → Settings → General
2. Under "Build & Development Settings"
3. Add to Build Command: `npx prisma migrate deploy && npm run build`

---

## Step 4: Configure Domain (IONOS → Vercel)

### 4.1 Get Vercel DNS Records
1. In Vercel project → **Settings** → **Domains**
2. Enter: `mybidly.io` and `www.mybidly.io`
3. Vercel will show DNS records to add

### 4.2 Update IONOS DNS
1. Login to **IONOS** (https://www.ionos.com)
2. Go to **Domains** → **mybidly.io** → **DNS Settings**
3. Add these records:

**For Root Domain (mybidly.io):**
```
Type: A
Host: @
Value: 76.76.21.21
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Alternative (if A record doesn't work):**
```
Type: CNAME
Host: @
Value: cname.vercel-dns.com
TTL: 3600
```

### 4.3 Wait for DNS Propagation
- DNS changes take 5 minutes to 48 hours (usually <1 hour)
- Check status: https://dnschecker.org/#A/mybidly.io

### 4.4 Verify in Vercel
Once DNS propagates, Vercel will auto-issue SSL certificate (Let's Encrypt)

---

## Step 5: Configure Stripe Webhooks

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://mybidly.io/api/webhooks/stripe`
4. **Events to send**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to Vercel env vars: `STRIPE_WEBHOOK_SECRET=whsec_...`
7. Redeploy project (Vercel dashboard → Deployments → Redeploy)

---

## Step 6: Configure Cron Jobs

Vercel automatically reads `vercel.json` for cron jobs.

**Check your vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-decline-bids",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes to auto-process bids.

**Secure the endpoint:**
Your cron endpoint should check for authorization:
```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 })
}
```

---

## Step 7: Test Production Deployment

### 7.1 Test Landing Page
Visit: https://mybidly.io
- ✅ Language toggle works (EN/DE)
- ✅ All sections load
- ✅ CTAs link to `/register`

### 7.2 Test Registration
1. Click "Start Free Trial"
2. Create test account
3. Verify welcome email arrives

### 7.3 Test Dashboard
1. Login with test account
2. Create test offer
3. Copy embed code
4. Test on external page

### 7.4 Test Widget
1. Embed widget on test page
2. Submit test bid
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify emails sent

### 7.5 Test Cron Job
1. Wait 10-20 minutes
2. Check if bid auto-processed
3. Verify acceptance/decline email sent

---

## Step 8: Switch Stripe to Live Mode

**Currently using test keys. To go live:**

1. **Stripe Dashboard** → Switch to **Live Mode**
2. Get live API keys:
   - `sk_live_...` (Secret Key)
   - `pk_live_...` (Publishable Key)
3. Update Vercel env vars:
   ```bash
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
   ```
4. Update webhook URL to live endpoint
5. **Redeploy** on Vercel

---

## Step 9: Monitor & Optimize

### Analytics
- Vercel Analytics: Auto-enabled
- Check: Vercel Dashboard → Analytics

### Error Tracking
Add Sentry (optional):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Performance
- Check Lighthouse score: https://pagespeed.web.dev/
- Target: 90+ score

### Database
- Monitor Supabase dashboard for query performance
- Add indexes if needed

---

## Troubleshooting

### Issue: Domain not connecting
**Solution**:
- Verify DNS records in IONOS
- Wait 1 hour for propagation
- Use `dig mybidly.io` to check DNS

### Issue: Build fails on Vercel
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all env vars are set
- Run `npm run build` locally first

### Issue: Database connection fails
**Solution**:
- Verify `DATABASE_URL` is correct
- Check Supabase connection pooling settings
- Use connection pooler URL for production

### Issue: Emails not sending
**Solution**:
- Verify Resend API key is correct
- Check Resend dashboard for delivery logs
- Ensure `from` email is verified in Resend

### Issue: Cron jobs not running
**Solution**:
- Check Vercel logs: Dashboard → Logs → Filter by `/api/cron`
- Verify `vercel.json` is in root directory
- Ensure `CRON_SECRET` env var is set

---

## Security Checklist

Before going live:

- [ ] All env vars use production values (not test/dev)
- [ ] `NEXTAUTH_SECRET` is random and secure
- [ ] Stripe is in live mode
- [ ] Webhook endpoints are secured
- [ ] Cron endpoints check `CRON_SECRET`
- [ ] Database URL uses SSL (`?sslmode=require`)
- [ ] No sensitive data in GitHub repo
- [ ] CORS settings are restrictive
- [ ] Rate limiting enabled on API routes

---

## Post-Launch

1. **Monitor first 24 hours**:
   - Check Vercel logs for errors
   - Test registration flow
   - Verify emails arriving
   - Test payment flow end-to-end

2. **Set up monitoring**:
   - Uptime monitoring: Better Uptime or UptimeRobot
   - Error tracking: Sentry
   - Analytics: Vercel + Google Analytics

3. **Backup database**:
   - Enable Supabase daily backups
   - Export schema: `npx prisma migrate diff --to-migrations`

---

## Costs Estimate

- **Vercel**: Free (Pro: $20/month if needed)
- **Supabase**: Free tier (upgrade at 500MB: $25/month)
- **Stripe**: 1.5% + €0.25 per transaction (EU)
- **Resend**: Free (1,000 emails/month, then $10/month)
- **Domain (IONOS)**: ~€12/year

**Total**: ~€0-50/month depending on usage

---

## Next Steps After Deployment

1. Set up Google Analytics
2. Create Terms of Service page
3. Create Privacy Policy page
4. Add cookie consent banner (EU law)
5. Launch marketing campaign
6. Gather initial customer feedback

---

**Ready to deploy?** Follow steps 1-8 above. Each step should take 5-10 minutes.

Good luck! 🚀
