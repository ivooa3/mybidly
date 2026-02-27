# Deployment Error Fixes

## Errors Found:

1. `/widget/page.tsx` - useSearchParams() needs Suspense
2. `/widget/success/page.tsx` - useSearchParams() needs Suspense  
3. `/api/widget/offers/route.ts` - Dynamic route needs export const dynamic = 'force-dynamic'
4. `/api/cron/auto-decline-bids/route.ts` - Dynamic route needs export const dynamic = 'force-dynamic'

## Solutions:

### For API Routes:
Add `export const dynamic = 'force-dynamic'` at top of file

### For Client Pages with useSearchParams():
Add `export const dynamic = 'force-dynamic'` at top of file (before default export)

