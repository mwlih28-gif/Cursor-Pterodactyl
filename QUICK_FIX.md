# 🚀 Quick Fix for TypeScript Error

## Problem
TypeScript error: `Property 'ip' is missing in type '{ name: string; }' but required in type '{ name: string; ip: string; }'`

## Solution
Run this command on your VPS to fix the Server interface:

```bash
cd /opt/gaming-panel/frontend

# Fix dashboard/page.tsx
sed -i 's/node?: {\s*name: string\s*}/node?: {\n    name: string\n    ip: string\n  }/' app/dashboard/page.tsx

# Fix servers/[id]/page.tsx - add node property before allocation
sed -i '/docker_image: string/a\  node?: {\n    name: string\n    ip: string\n  }' app/dashboard/servers/\[id\]/page.tsx

# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

## Alternative Manual Fix

If sed doesn't work, manually edit these files:

### 1. `/opt/gaming-panel/frontend/app/dashboard/page.tsx`
Change line 16-18 from:
```typescript
  node?: {
    name: string
  }
```
To:
```typescript
  node?: {
    name: string
    ip: string
  }
```

### 2. `/opt/gaming-panel/frontend/app/dashboard/servers/[id]/page.tsx`
Add after line 16:
```typescript
  node?: {
    name: string
    ip: string
  }
```

Then run:
```bash
cd /opt/gaming-panel/frontend
rm -rf .next
npm run build
```