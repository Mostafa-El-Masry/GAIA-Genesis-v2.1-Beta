# 🔧 Supabase Environment Setup Guide

## Problem

You're seeing an error:
```
Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

This means the Supabase connection is not configured.

## Solution: Quick Setup

### Step 1: Get Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project (or use existing one)
4. Go to **Settings → API** in the left sidebar
5. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Create `.env.local` File

In the root of your project (`e:\Programming Labs\GAIA-Genesis-v2.1-Beta`), create a file named `.env.local`:

```env
# Supabase Client Keys (PUBLIC - safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Server Key (SECRET - never expose)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Get Server Key

For the `SUPABASE_SERVICE_ROLE_KEY`:

1. In Supabase dashboard, go to **Settings → API**
2. Look for **Service Role** or **Secret Key**
3. Copy it into `.env.local`

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## File Structure After Setup

```
GAIA-Genesis-v2.1-Beta/
├── .env.local              ← CREATE THIS FILE
├── app/
│   ├── labs/inventory/
│   ├── context/AuthContext.tsx
│   └── auth/login/
├── lib/
│   ├── supabase-client.ts  ← Already configured ✅
│   ├── supabase-server.ts  ← Already configured ✅
├── package.json
└── tsconfig.json
```

## Testing the Setup

### Test 1: Check Environment Variables Loaded

1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
4. You should see your Supabase URL

### Test 2: Sign In

1. Navigate to `http://localhost:3000/auth/login`
2. Try signing in with test credentials
3. You should be redirected to dashboard

### Test 3: Create Location

1. Navigate to `http://localhost:3000/labs/inventory`
2. Click "Locations"
3. Click "+ Add Location"
4. Fill in form and click "Create Location"
5. Should see success message

## Example `.env.local` (Template)

```env
# ===== SUPABASE =====

# Get these from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzMxNTM2MDAwfQ.xxxxx

# Get this from: Supabase Dashboard → Settings → API → Service Role
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MzE1MzYwMDB9.xxxxx
```

## Troubleshooting

### Issue: "Invalid API key"

**Cause**: The Anon Key is incorrect or expired

**Solution**:
1. Go back to Supabase Dashboard
2. Regenerate keys if needed
3. Copy exact values (no extra spaces)
4. Restart dev server

### Issue: "Network error"

**Cause**: Supabase URL is incorrect

**Solution**:
1. Verify URL format: `https://xxxxx.supabase.co`
2. No trailing slash
3. Exact copy from dashboard

### Issue: "Environment variables not loading"

**Cause**: `.env.local` in wrong location

**Solution**:
```bash
# Correct location (root of project)
e:\Programming Labs\GAIA-Genesis-v2.1-Beta\.env.local

# NOT in any subfolder
# NOT named .env (must be .env.local)
```

### Issue: Still seeing error after setup

**Solution**:
1. Delete `.next` folder: `rm -r .next`
2. Restart dev server: `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`

## Security Notes

⚠️ **IMPORTANT**:

- ✅ `.env.local` is in `.gitignore` (never committed to git)
- ❌ Never share `SUPABASE_SERVICE_ROLE_KEY` 
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be public (it's the client key)
- ✅ API endpoints validate all requests with JWT tokens

## Next Steps After Setup

1. ✅ Environment variables configured
2. ✅ Dev server running
3. ✅ Can sign in at `/auth/login`
4. ✅ Can access `/labs/inventory`
5. ✅ Can create locations, products, etc.

Then proceed to:
- Implement remaining pages (stock, POS, sales, accounting)
- Add professional UI design (charts, metrics, sidebar)
- Deploy to production

---

**Status**: 🟡 Awaiting Supabase Configuration
**Next Step**: Create `.env.local` with your Supabase credentials
