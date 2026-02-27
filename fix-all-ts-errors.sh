#!/bin/bash
set -e

echo "Fixing all TypeScript errors..."

# 1. Fix shopName: string -> shopName: string | null in ProfileContent.tsx
sed -i '' '16s/shopName: string$/shopName: string | null/' components/ProfileContent.tsx

# 2. Fix shopName in UsersList.tsx  
if grep -q "shopName: string$" components/admin/UsersList.tsx 2>/dev/null; then
  sed -i '' 's/shopName: string$/shopName: string | null/' components/admin/UsersList.tsx
fi

echo "✅ Fixed shopName null errors"

# 3. Remove duplicate translation keys
# This requires manual inspection - skipping for now

echo "✅ All automated fixes applied"
echo "⚠️  Some errors require manual fixes (see list)"

