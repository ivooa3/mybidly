# Vercel Environment Variables Checklist

## Issue: Login not working on production (mybidly.io)

### Root Cause
NextAuth requires specific environment variables to be set correctly on Vercel for production.

### ✅ Admin Credentials (Confirmed Working Locally)
```
Email: admin@mybidly.io
Password: Password123!
```

### 🔧 Required Environment Variables on Vercel

Go to: **Vercel Dashboard → mybidly → Settings → Environment Variables**

#### 1. NEXTAUTH_URL (CRITICAL)
```
Name: NEXTAUTH_URL
Value: https://mybidly.io
Environment: Production
```

**Current Issue:** Likely missing or set to localhost

#### 2. NEXTAUTH_SECRET (CRITICAL)
```
Name: NEXTAUTH_SECRET
Value: <your-secret-key>
Environment: Production, Preview, Development
```

**To generate a new secret if needed:**
```bash
openssl rand -base64 32
```

#### 3. DATABASE_URL
```
Name: DATABASE_URL
Value: <your-postgres-connection-string>
Environment: Production, Preview, Development
```

**Check:** This should already be set

### 📋 How to Fix

1. **Login to Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your mybidly project

2. **Go to Settings → Environment Variables**

3. **Add/Update these variables:**
   - Set `NEXTAUTH_URL` to `https://mybidly.io` (for Production)
   - Verify `NEXTAUTH_SECRET` exists (same value across all environments)
   - Verify `DATABASE_URL` is correct

4. **Redeploy** (required for env var changes to take effect):
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### 🧪 Testing After Fix

1. Visit: https://mybidly.io/login
2. Use credentials:
   - Email: `admin@mybidly.io`
   - Password: `Password123!`
3. Should redirect to `/dashboard` on success

### ✅ Verification Checklist

- [ ] NEXTAUTH_URL = `https://mybidly.io` (Production)
- [ ] NEXTAUTH_SECRET is set and matches local
- [ ] DATABASE_URL is correct
- [ ] Redeployed after setting variables
- [ ] Login works on https://mybidly.io/login

### 🔍 If Still Not Working

Check browser console for errors:
1. Open https://mybidly.io/login
2. Open DevTools (F12)
3. Try to login
4. Check Console tab for errors
5. Check Network tab for failed API calls

Common errors:
- `NEXTAUTH_URL` not set → "Configuration error"
- `NEXTAUTH_SECRET` not set → "Please define NEXTAUTH_SECRET"
- Wrong `NEXTAUTH_URL` → CSRF token mismatch

### 📞 Additional Notes

The login system is working perfectly in local development and the database connection is confirmed. The issue is specifically related to NextAuth configuration on Vercel production environment.

All user accounts in database:
1. admin@mybidly.io (admin, active) ✅
2. dhi@demo.com (shop_owner, active)
3. peter.pan@test.com (shop_owner, active)
4. abc@gmail.com (shop_owner, active)

**Note:** `ivo.sprachrohr@gmail.com` does NOT exist in the database.
