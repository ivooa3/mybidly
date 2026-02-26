# IONOS DNS Setup for myBidly.io

## 🎯 Goal
Configure DNS to point `mybidly.io` and `staging.mybidly.io` to Vercel

---

## Step 1: Login to IONOS

1. Go to https://www.ionos.com
2. Login to your account
3. Go to **Domains & SSL**
4. Click on **mybidly.io**

---

## Step 2: Access DNS Settings

1. Click **DNS** or **Manage DNS** button
2. You should see a list of DNS records

---

## Step 3: Configure DNS Records for Vercel

### Add These Records:

#### For Production (mybidly.io):

**Record 1: A Record for Root Domain**
```
Type: A
Host: @ (or leave empty)
Value: 76.76.21.21
TTL: 3600 (or default)
```

**Record 2: CNAME for www**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 3600 (or default)
```

#### For Staging (staging.mybidly.io):

**Record 3: CNAME for staging**
```
Type: CNAME
Host: staging
Value: cname.vercel-dns.com
TTL: 3600 (or default)
```

---

## Step 4: Resend Email DNS (Do This After Vercel Deployment)

We'll add these later when we verify your domain with Resend:

```
Type: TXT
Host: @
Value: [Provided by Resend after domain verification]

Type: MX
Host: @
Value: [Provided by Resend]
Priority: 10

Type: CNAME
Host: resend._domainkey
Value: [DKIM key provided by Resend]
```

**Don't add these yet - we'll do this in Step 9!**

---

## Step 5: Save & Wait

1. Click **Save** or **Add Record** for each entry
2. DNS propagation takes **5-60 minutes** (usually ~10 minutes)
3. You can check propagation status at: https://dnschecker.org

---

## Verification

Once DNS propagates, these should work:
- ✅ `mybidly.io` → Points to Vercel
- ✅ `www.mybidly.io` → Points to Vercel
- ✅ `staging.mybidly.io` → Points to Vercel

---

## Troubleshooting

### DNS Not Propagating?
- Wait 30-60 minutes
- Clear your browser cache
- Try incognito/private mode
- Use different DNS checker: https://www.whatsmydns.net

### IONOS-Specific Issues:
- Some IONOS accounts require using `@` instead of leaving host empty
- If you see "CNAME flattening" options, enable it
- If IONOS asks for IP instead of CNAME, use: `76.76.21.21`

---

## Next Steps

After DNS is configured:
1. Deploy to Vercel (see DEPLOYMENT_GUIDE.md)
2. Add custom domain in Vercel dashboard
3. Verify email domain with Resend
4. Test everything!
