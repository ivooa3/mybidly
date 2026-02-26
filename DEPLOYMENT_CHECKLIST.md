# myBidly Deployment Checklist

## Pre-Deployment Checklist

### ✅ **Code Preparation**
- [x] All features complete and tested locally
- [x] Password visibility toggles added
- [x] German email templates created
- [x] Support email added to all templates
- [x] Vercel cron job configured
- [x] Auto-bid processing with 10-20 min delay
- [ ] `.env.local` documented (see below)
- [ ] Security review completed

### ✅ **Database**
- [ ] Production Supabase project created
- [ ] Database migrations run
- [ ] Connection string secured

### ✅ **Third-Party Services**
- [ ] Stripe account setup (Live mode)
- [ ] Stripe webhook endpoint configured
- [ ] Resend email domain verified
- [ ] Cloudinary account configured (or Vercel Blob)

### ✅ **Domain & DNS**
- [ ] Domain purchased
- [ ] DNS configured for staging subdomain
- [ ] DNS configured for production domain
- [ ] SSL certificates (auto-handled by Vercel)

---

## Environment Variables

### Required for Both Staging & Production

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
NEXTAUTH_URL="https://your-domain.com"  # Change per environment

# Stripe
STRIPE_SECRET_KEY="sk_live_..."  # Use sk_test_ for staging
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Use pk_test_ for staging
STRIPE_WEBHOOK_SECRET="whsec_..."  # Different for staging/prod

# Resend Email
RESEND_API_KEY="re_..."

# Cloudinary (or Vercel Blob)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Cron Security
CRON_SECRET="[generate secure random string]"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"  # Change per environment
NODE_ENV="production"
```

---

## Deployment Strategy

### **Option 1: Staging + Production (Recommended)**

**Staging**: `staging.mybidly.io` (or `staging.yourdomain.com`)
- Test all features before production
- Use Stripe test mode
- Use test database
- Deploy from `staging` branch (optional)

**Production**: `mybidly.io` (or `yourdomain.com`)
- Live environment for real customers
- Use Stripe live mode
- Use production database
- Deploy from `main` branch

### **Option 2: Production Only (Faster Launch)**

Deploy directly to production, but:
- Test thoroughly locally first
- Have rollback plan ready
- Monitor closely after launch

---

## Step-by-Step Deployment

### 1. **Create Vercel Account & Install CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

### 2. **Create Production Supabase Project**

1. Go to https://supabase.com
2. Create new project: "mybidly-production"
3. Copy connection string (Settings → Database)
4. Run migrations:

```bash
# Set DATABASE_URL to production
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. **Setup Stripe Live Mode**

1. Go to https://dashboard.stripe.com
2. Switch to **Live mode** (toggle in top right)
3. Get API keys: Developers → API keys
   - Copy **Publishable key** (`pk_live_...`)
   - Copy **Secret key** (`sk_live_...`)
4. Create webhook:
   - Developers → Webhooks → Add endpoint
   - URL: `https://mybidly.io/api/webhooks/stripe`
   - Events: Select `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy **Signing secret** (`whsec_...`)

### 4. **Verify Resend Domain**

1. Go to https://resend.com
2. Add domain: `mybidly.io`
3. Add DNS records (provided by Resend)
4. Wait for verification (usually 5-10 minutes)
5. Update `FROM_EMAIL` in [lib/email.ts](lib/email.ts:12):

```typescript
const FROM_EMAIL = process.env.NODE_ENV === 'production'
  ? 'myBidly <orders@mybidly.io>'  // Use your verified domain
  : 'myBidly <onboarding@resend.dev>'
```

### 5. **Deploy to Vercel**

#### First Time Setup:

```bash
# From project directory
cd /Users/nextcommerce/BidUpseller

# Deploy to Vercel (will create project)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: mybidly
# - Directory: ./ (press Enter)
# - Override settings? No
```

#### Configure Environment Variables in Vercel:

1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `mybidly`
3. Go to Settings → Environment Variables
4. Add all variables from checklist above
5. **Important**: Set different values for:
   - Production: Use live Stripe keys, production database
   - Preview (staging): Use test Stripe keys, staging database

#### Deploy to Production:

```bash
# Deploy to production
vercel --prod
```

### 6. **Configure Custom Domain**

1. In Vercel dashboard → Settings → Domains
2. Add domain: `mybidly.io`
3. Add `www.mybidly.io` (optional)
4. Follow DNS instructions provided by Vercel
5. Wait for SSL certificate (automatic, 1-2 minutes)

### 7. **Verify Deployment**

Test these critical paths:

- [ ] Homepage loads: `https://mybidly.io`
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Create offer works
- [ ] Embed code generates
- [ ] Widget displays: Test with `?shopId=xxx`
- [ ] Stripe payment works (use real card in live mode!)
- [ ] Emails send correctly
- [ ] Cron job runs (check Vercel logs after 10 minutes)

### 8. **Setup Monitoring**

1. **Vercel Dashboard**: Monitor deployments, logs, performance
2. **Sentry** (optional): Error tracking
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```
3. **Uptime Monitor** (optional): Better Uptime, UptimeRobot

---

## Staging Environment Setup (Optional but Recommended)

### Create Staging Branch:

```bash
git checkout -b staging
git push origin staging
```

### In Vercel Dashboard:

1. Go to Settings → Git
2. Add branch: `staging`
3. Configure separate environment variables for staging
4. Access at: `mybidly-staging.vercel.app` or `staging.mybidly.io`

### Workflow:

```
Development → Staging → Production
     ↓            ↓          ↓
  Local        Test       Live
```

---

## Post-Deployment Tasks

### Immediate (Day 1):
- [ ] Test full customer journey end-to-end
- [ ] Create test shop account
- [ ] Create test offer
- [ ] Complete test purchase with real card
- [ ] Verify emails received (confirmation, acceptance, shop owner notification)
- [ ] Check cron job logs in Vercel
- [ ] Monitor error logs

### Week 1:
- [ ] Onboard first 3-5 pilot shops
- [ ] Monitor performance metrics
- [ ] Check Stripe dashboard for payments
- [ ] Review email delivery rates (Resend dashboard)
- [ ] Gather user feedback

### Ongoing:
- [ ] Monitor Vercel analytics
- [ ] Review Stripe transactions weekly
- [ ] Check database performance (Supabase dashboard)
- [ ] Update security patches
- [ ] Backup database regularly

---

## Rollback Plan

If something goes wrong:

```bash
# Revert to previous deployment in Vercel dashboard
# Or redeploy previous commit:
vercel --prod --force
```

---

## Environment Variable Generation

Generate secure secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -hex 32
```

---

## DNS Configuration

For domain `mybidly.io`:

### Production:
- **A Record**: `@` → Vercel IP (provided in dashboard)
- **CNAME**: `www` → `cname.vercel-dns.com`

### Staging (optional):
- **CNAME**: `staging` → `cname.vercel-dns.com`

### Resend Email:
- **TXT Record**: `@` → Verification code
- **MX Records**: As provided by Resend
- **CNAME**: `resend._domainkey` → DKIM key

---

## Troubleshooting

### Build Fails:
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Run `npm run build` locally first

### Database Connection Error:
- Verify `DATABASE_URL` is correct
- Check if IP whitelist needed (Supabase Settings → Database → Connection Pooling)
- Ensure Prisma client is generated

### Emails Not Sending:
- Verify Resend domain is verified
- Check API key is correct
- Review Resend logs
- Check `FROM_EMAIL` matches verified domain

### Stripe Webhook Fails:
- Verify webhook secret matches Vercel env var
- Check endpoint URL is correct: `https://mybidly.io/api/webhooks/stripe`
- Review Stripe webhook logs

### Cron Job Not Running:
- Verify `vercel.json` is deployed
- Check cron secret matches env var
- Review function logs in Vercel dashboard
- Ensure function doesn't timeout (max 10 seconds on Hobby plan)

---

## Security Checklist

- [ ] All secrets are in environment variables (not committed to git)
- [ ] `.env.local` is in `.gitignore`
- [ ] CRON_SECRET is secure random string
- [ ] NEXTAUTH_SECRET is secure random string
- [ ] Stripe webhook signature verification enabled
- [ ] CORS properly configured
- [ ] Rate limiting on critical endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)

---

## Cost Estimate

### Vercel:
- **Hobby Plan**: $0/month (suitable for MVP, includes 100GB bandwidth)
- **Pro Plan**: $20/month (for production, includes 1TB bandwidth)

### Supabase:
- **Free Plan**: $0/month (500MB database, 2GB bandwidth)
- **Pro Plan**: $25/month (8GB database, 50GB bandwidth)

### Stripe:
- **Standard Processing**: 1.4% + €0.25 per transaction (EU cards)

### Resend:
- **Free Plan**: 100 emails/day
- **Pro Plan**: $20/month (50,000 emails/month)

### Total MVP Cost:
- **Minimum**: $0/month (all free tiers)
- **Recommended**: $65-70/month (Pro plans for production)

---

## Questions?

Contact me if you need help with:
- DNS configuration
- Stripe setup
- Debugging deployment issues
- Environment variable setup
