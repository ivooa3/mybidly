# myBidly - Implementation Summary

## ✅ COMPLETED

### 1. Rebranding: Bidly → myBidly
- **Status**: ✅ Complete
- **Files Updated**: All `.ts`, `.tsx`, `.js`, `.jsx`, `CLAUDE.md`, `package.json`
- **Command Used**: `sed -i '' 's/Bidly/myBidly/g'` globally

### 2. Registration Error Fixed
- **Status**: ✅ Complete
- **File**: `/lib/email.ts`
- **Change**: Made Resend optional - no longer crashes if API key missing
- **Result**: Registration now works even without email configured

### 3. Environment Variables
- **Status**: ✅ Complete
- **Added**: `RESEND_API_KEY=re_XM4V3a6C_4dX2u8ktNqQun4gpz2VfeYrJ` to `.env.local`

### 4. Database Schema
- **Status**: ✅ Complete
- **Added Fields**:
  - `resetToken` (String?, nullable)
  - `resetTokenExpiresAt` (DateTime?, nullable)
- **Migration**: Applied with `npx prisma db push`

### 5. Password Reset Pages Created
- **Status**: ✅ Complete
- **Files Created**:
  - `/app/forgot-password/page.tsx`
  - `/app/reset-password/page.tsx` (includes password visibility toggle)

---

## 🔄 IN PROGRESS / TODO

### 1. Remove "Out of Stock" from Bid Declined Email

**Files to Update**:
- `/app/api/email-preview/route.ts` (lines 326-329)
- Potentially `/lib/email.ts` if templates exist there

**Current Text** (English):
```
Why was my bid declined?
Bids may be declined for various reasons:
- The product is currently out of stock  ❌ REMOVE THIS
- The bid amount was below the minimum threshold
- High demand exceeded available inventory  ❌ REMOVE THIS
```

**Updated Text** (English):
```
Why was my bid declined?
Your bid did not meet our current acceptance criteria. This could be due to pricing thresholds or other factors.
```

**German Version** - Similar simplification needed.

---

### 2. Shop Owner Bid Decision Workflow

**REQUIREMENT**:
When a bid is **below the minimum selling price**, shop owner gets notified and has **20 minutes** to accept or decline before system auto-declines.

**Implementation Steps**:

#### A. Database Schema Updates
Add field to `Bid` model in `prisma/schema.prisma`:
```prisma
model Bid {
  // ... existing fields ...

  requiresManualReview  Boolean   @default(false) @map("requires_manual_review")
  reviewDecisionAt      DateTime? @map("review_decision_at")
  reviewedBy            String?   @map("reviewed_by") // "shop_owner" or "system"

  // ... rest of fields
}
```

Run: `npx prisma db push`

#### B. Email Template - Shop Owner Bid Notification

**New Function in `/lib/email.ts`**:
```typescript
export async function sendShopOwnerBidNotification(
  data: {
    shopOwnerEmail: string
    shopName: string
    customerName: string
    bidAmount: number
    minPrice: number
    productName: string
    productSku: string
    bidId: string
  },
  locale: 'en' | 'de'
)
```

**Email Content** (English):
```
Subject: New Bid Requires Your Decision - €XX.XX

Hi [Shop Name],

You've received a new bid that requires your review!

Bid Details:
- Customer: [Name]
- Product: [Product Name]
- Bid Amount: €XX.XX
- Your Minimum Price: €XX.XX
- Difference: €X.XX below minimum

⏰ You have 20 minutes to decide

[Accept Bid Button] [Decline Bid Button]

If you don't respond within 20 minutes, the bid will be automatically declined.

Best regards,
myBidly Team
```

**Email Content** (German):
```
Subject: Neues Gebot erfordert Ihre Entscheidung - €XX.XX

Hallo [Shop Name],

Sie haben ein neues Gebot erhalten, das Ihre Prüfung erfordert!

Gebotsdetails:
- Kunde: [Name]
- Produkt: [Product Name]
- Gebotsbetrag: €XX.XX
- Ihr Mindestpreis: €XX.XX
- Differenz: €X.XX unter Minimum

⏰ Sie haben 20 Minuten Zeit zu entscheiden

[Gebot annehmen Button] [Gebot ablehnen Button]

Wenn Sie nicht innerhalb von 20 Minuten antworten, wird das Gebot automatisch abgelehnt.

Mit freundlichen Grüßen,
myBidly Team
```

#### C. API Endpoints

**Create**: `/app/api/bids/[id]/review/route.ts`
```typescript
// POST /api/bids/:id/review
// Body: { action: 'accept' | 'decline' }
// Auth: Shop owner must own the bid
```

**Logic**:
1. Verify token in URL or check shop owner session
2. Check bid exists and belongs to shop
3. Check bid is still in review window (< 20 min old)
4. Update bid status
5. If accepted: charge customer, update stock, send acceptance email
6. If declined: refund customer, send decline email

#### D. Cron Job Updates

**File**: `/app/api/cron/process-bids/route.ts`

**Updated Logic**:
```typescript
IF bid.bidAmount >= offer.minPrice:
  // Auto-accept (current behavior)
  - Set status = 'accepted'
  - Send customer acceptance email
  - Send shop owner order notification

ELSE IF bid.bidAmount < offer.minPrice:
  // Requires manual review
  - Set status = 'pending_review'
  - Set requiresManualReview = true
  - Send shop owner bid notification with Accept/Decline buttons
  - Wait 20 minutes

  AFTER 20 MINUTES:
    IF still pending_review:
      - Set status = 'declined'
      - Set reviewedBy = 'system'
      - Refund customer
      - Send decline email
```

---

### 3. Password Reset Functionality

**Files Needed**:

#### A. API - Forgot Password
**File**: `/app/api/auth/forgot-password/route.ts`

```typescript
// POST /api/auth/forgot-password
// Body: { email: string }
// 1. Find shop by email
// 2. Generate crypto random token
// 3. Save token + expiry (1 hour) to database
// 4. Send reset email with link
// 5. Return success (don't reveal if email exists)
```

#### B. API - Reset Password
**File**: `/app/api/auth/reset-password/route.ts`

```typescript
// POST /api/auth/reset-password
// Body: { token: string, password: string }
// 1. Find shop by token
// 2. Check token not expired
// 3. Hash new password
// 4. Update password
// 5. Clear reset token fields
// 6. Return success
```

#### C. Email Templates
Add to `/lib/email.ts`:

```typescript
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  locale: 'en' | 'de'
)
```

**English Email**:
```
Subject: Reset Your myBidly Password

Hi,

We received a request to reset your password.

Click the button below to reset your password:
[Reset Password Button]

Or copy this link: https://mybidly.io/reset-password?token=[TOKEN]

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
myBidly Team
```

**German Email**: Similar translation

---

### 4. Password Visibility Toggle

**Files to Update**:
- `/app/(auth)/login/page.tsx` or `/components/LoginForm.tsx`
- `/app/(auth)/register/page.tsx` or `/components/RegisterForm.tsx`

**Add Eye Icon Toggle**:
```typescript
const [showPassword, setShowPassword] = useState(false)

// In password input:
<div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    // ... other props
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2"
  >
    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
  </button>
</div>
```

**Icons** (use Heroicons or inline SVG):
```tsx
// Eye icon (show password)
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
</svg>

// Eye-slash icon (hide password)
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
</svg>
```

---

### 5. Add "Forgot Password?" Link to Login Page

**File**: `/app/(auth)/login/page.tsx` or `/components/LoginForm.tsx`

**Add below password field**:
```tsx
<div className="text-right">
  <Link
    href="/forgot-password"
    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
  >
    Forgot password?
  </Link>
</div>
```

---

## Testing Checklist

After completing implementation:

- [ ] Registration works without Resend API key
- [ ] Registration sends welcome email with API key
- [ ] All branding shows "myBidly" (not "Bidly")
- [ ] Bid declined email doesn't mention stock reasons
- [ ] Shop owner gets email for bids below minimum
- [ ] Shop owner can accept/decline bids via email link
- [ ] Bids auto-decline after 20 minutes if no response
- [ ] Forgot password sends email
- [ ] Password reset link works and expires after 1 hour
- [ ] Password visibility toggle works on login
- [ ] Password visibility toggle works on register
- [ ] Email templates render correctly in Gmail, Outlook

---

## Priority Order

1. **CRITICAL**: Remove "out of stock" from declined email (5 min)
2. **HIGH**: Shop owner bid decision workflow (2-3 hours)
3. **MEDIUM**: Password reset functionality (1-2 hours)
4. **LOW**: Password visibility toggle (30 min)

---

## Files Summary

**To Create**:
- `/app/api/auth/forgot-password/route.ts`
- `/app/api/auth/reset-password/route.ts`
- `/app/api/bids/[id]/review/route.ts`

**To Update**:
- `/lib/email.ts` - Add 2 new email functions
- `/app/api/email-preview/route.ts` - Remove stock reasons
- `/prisma/schema.prisma` - Add review fields to Bid model
- `/app/(auth)/login/page.tsx` - Add forgot password link + eye icon
- `/app/(auth)/register/page.tsx` - Add eye icon
- `/app/api/cron/process-bids/route.ts` - Add manual review logic

**Already Created**:
- `/app/forgot-password/page.tsx` ✅
- `/app/reset-password/page.tsx` ✅

---

Last Updated: 2026-02-26
Status: Partial Implementation Complete
