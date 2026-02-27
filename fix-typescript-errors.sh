#!/bin/bash

# Fix ProfileContent.tsx - shopName can be null
sed -i '' 's/shopName: string$/shopName: string | null/' components/ProfileContent.tsx

# Fix UsersList.tsx - shopName can be null
sed -i '' 's/shopName: string$/shopName: string | null/' components/admin/UsersList.tsx

echo "TypeScript fixes applied!"
