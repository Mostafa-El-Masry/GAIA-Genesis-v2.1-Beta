# 🆘 Inventory Integration Troubleshooting Guide

## Quick Diagnosis

### Issue 1: "Missing Supabase environment variables"

**What it means**: The app can't connect to Supabase because credentials are missing.

**How to fix**:
```bash
# 1. Check if .env.local exists
ls .env.local

# 2. If not, create it from the example
cp .env.example .env.local

# 3. Edit .env.local and add your Supabase credentials
# Get them from: https://supabase.com → Dashboard → Settings → API

# 4. Restart dev server
npm run dev

# 5. Hard refresh browser
Ctrl+Shift+R
```

### Issue 2: "Failed to list Supabase users" or "Invalid API key"

**What it means**: The API keys in `.env.local` are incorrect or invalid.

**How to fix**:
```bash
# 1. Go to Supabase Dashboard
# https://supabase.com → Your Project → Settings → API

# 2. Verify you copied the EXACT values:
#    - Project URL (not project name)
#    - Anon Key (not service role key)

# 3. Check for common mistakes:
#    - Extra spaces or newlines
#    - Wrong URL format (should start with https://)
#    - Expired keys (regenerate if needed)

# 4. Restart server after fixing
npm run dev
```

### Issue 3: Blank page or infinite loading

**What it means**: The AuthProvider is stuck checking authentication.

**How to fix**:
```bash
# 1. Clear browser cache
Ctrl+Shift+Delete → Clear browsing data

# 2. Delete .next build cache
rm -r .next

# 3. Restart dev server
npm run dev

# 4. Hard refresh
Ctrl+Shift+R
```

### Issue 4: "Cannot find name 'useAuth'"

**What it means**: AuthContext is not imported properly in a component.

**How to fix**:
```tsx
// ADD this import to the top of the file:
import { useAuth } from "@/app/context/AuthContext";

// Then you can use it:
const { user, loading, error } = useAuth();
```

### Issue 5: "Please sign in first" when accessing /labs/inventory

**What it means**: You're not logged in.

**How to fix**:
```bash
# 1. Go to login page
http://localhost:3000/auth/login

# 2. Sign up or sign in
# Use email: test@example.com
# Password: anything

# 3. After successful login, you're redirected to dashboard
# Or manually go to: http://localhost:3000/labs/inventory
```

### Issue 6: "Failed to create location" error

**What it means**: The API call failed - likely due to:
- Missing or invalid JWT token
- Database schema not created
- Supabase RLS policies blocking access

**How to fix**:
```bash
# 1. Verify you're logged in
# (Check if /auth/login works and redirects)

# 2. Check browser console for detailed error
F12 → Console tab → Look for error messages

# 3. Verify database schema is created
# In Supabase Dashboard:
# - Go to SQL Editor
# - Run: SELECT * FROM inventory_locations LIMIT 1;
# - Should show empty table (no error)

# 4. If table doesn't exist, run the migration:
# Copy contents of: db/migrations/0002_supabase_inventory.sql
# Paste in Supabase SQL Editor and execute
```

## Verification Checklist

### ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Git clone of GAIA-Genesis-v2.1-Beta
- [ ] Supabase account created (supabase.com)

### ✅ Setup Steps

- [ ] Create `.env.local` file
- [ ] Add NEXT_PUBLIC_SUPABASE_URL
- [ ] Add NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Add SUPABASE_SERVICE_ROLE_KEY
- [ ] Run `npm install`
- [ ] Run `npm run dev`

### ✅ Testing

- [ ] Can access http://localhost:3000
- [ ] Can see GAIA homepage
- [ ] Can access /auth/login
- [ ] Can sign in with email/password
- [ ] Redirected to dashboard after login
- [ ] Can access /labs/inventory
- [ ] Can see Locations link
- [ ] Can click "Add Location"
- [ ] Can fill form and submit
- [ ] Can see success message

### ✅ Database

- [ ] Supabase project created
- [ ] Inventory tables exist in database
- [ ] RLS policies enabled
- [ ] Service role key has proper permissions

## Common Mistakes

### ❌ Wrong URL format

```
❌ supabase.co                    (missing project)
❌ https://supabase.co            (generic, not specific)
❌ xyz.supabase.co/               (trailing slash)

✅ https://xyz.supabase.co        (correct format)
```

### ❌ Confusing different keys

```
❌ Using Service Role key as Anon key (wrong)
❌ Using Anon key as Service Role (also wrong)

✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = Anon Key
✅ SUPABASE_SERVICE_ROLE_KEY = Service Role Key
```

### ❌ Wrong file location

```
❌ app/.env.local                    (wrong - in subfolder)
❌ GAIA-Genesis/.env.local           (wrong - wrong project)
❌ .env                              (wrong - should be .env.local)

✅ GAIA-Genesis-v2.1-Beta/.env.local (correct)
```

### ❌ Forgetting to restart

```bash
# ❌ This won't work if you just changed .env.local
npm run dev
# (old environment variables cached)

# ✅ Stop (Ctrl+C) then restart
npm run dev
```

## Debug Commands

### Check Node version

```bash
node --version
# Should be v18.0.0 or higher
```

### Check npm packages

```bash
npm list @supabase/supabase-js
# Should show installed version
```

### Check environment loading

```bash
# Create a test file: test-env.js
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

# Run it
node test-env.js
# Should print your credentials

# Clean up
rm test-env.js
```

### Run diagnostic script

```bash
node scripts/check-supabase-setup.js
# Will tell you what's missing
```

## Error Messages Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing Supabase environment variables" | No `.env.local` | Create `.env.local` with credentials |
| "Invalid API key" | Wrong key in env | Copy correct key from Supabase dashboard |
| "NetworkError when attempting to fetch resource" | Wrong URL | Fix URL format in `.env.local` |
| "Cannot find name 'useAuth'" | Missing import | Add `import { useAuth } from "@/app/context/AuthContext"` |
| "Unauthorized" | Not logged in | Sign in at `/auth/login` |
| "Failed to create location" | DB schema missing | Run migration in Supabase SQL editor |
| "Cannot read property 'map' of undefined" | Data not loaded | Check if API returned correct data |

## Getting Help

### Resources

1. **Supabase Docs**: https://supabase.com/docs
2. **Next.js Docs**: https://nextjs.org/docs
3. **GAIA Docs**: See `docs/` folder
4. **Setup Guide**: `docs/SETUP-SUPABASE.md`
5. **Migration Guide**: `docs/supabase-migration.md`

### Debug Information to Collect

Before asking for help, gather:
```
- Node version: node --version
- npm version: npm --version
- Error message (full text)
- What you were trying to do
- Steps to reproduce
- Screenshot of error (if visual)
```

### When to Ask for Help

1. You've tried all steps in this guide
2. You've verified environment variables
3. You've restarted the dev server
4. You've cleared browser cache
5. You've checked the other troubleshooting pages

---

**Last Updated**: After Supabase Integration
**Status**: 🔧 Configuration Phase
