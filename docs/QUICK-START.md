# ⚡ Quick Start Guide - Inventory Module

## 🚀 Get Running in 5 Minutes

### Step 1: Get Supabase Credentials (2 min)

1. Open https://supabase.com/dashboard
2. Select your project (or create one)
3. Go to **Settings → API** (left sidebar)
4. Copy these THREE values:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **Anon Key** (looks like: `eyJhbGc...`)
   - **Service Role Key** (looks like: `eyJhbGc...`)

### Step 2: Create `.env.local` (2 min)

In VS Code, create a new file in the project root:

**File**: `GAIA-Genesis-v2.1-Beta/.env.local`

**Content**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Replace the `...` with the actual values you copied.

### Step 3: Restart & Test (1 min)

```bash
# Stop current server if running (Ctrl+C)
# Restart
npm run dev

# Wait for compilation...
# Open: http://localhost:3000/auth/login
```

### Step 4: Sign In

1. On the login page, click "Create one" to sign up
2. Use any email (e.g., `test@example.com`)
3. Use any password
4. Click "Create account" or "Sign in"

### Step 5: Try Inventory

1. After sign in, go to: http://localhost:3000/labs/inventory
2. Click on "Locations"
3. Click "+ Add Location"
4. Fill in:
   - **Name**: "Main Store"
   - **Code**: "LOC001"
   - **Type**: "Warehouse"
5. Click "Create Location"
6. ✅ Should see the location appear!

## 🎉 You're Done!

The inventory management system is now fully working with Supabase authentication.

### What's Next?

- **Explore**: Try creating products, stock entries, etc.
- **Customize**: Modify UI to match your needs
- **Deploy**: Push to production when ready

## 📚 Documentation

- **Setup Issues?** → See `docs/SETUP-SUPABASE.md`
- **Getting Errors?** → See `docs/TROUBLESHOOTING.md`
- **Technical Details?** → See `docs/supabase-migration.md`

## 🔑 Key Features Working

- ✅ User authentication (sign up/sign in)
- ✅ Locations management
- ✅ Products catalog
- ✅ Secure API endpoints (JWT protected)
- ✅ User data isolation (each user sees only their data)

## ⚠️ Common Mistakes (Don't Do These!)

```
❌ Sharing your SUPABASE_SERVICE_ROLE_KEY
❌ Committing .env.local to git
❌ Using old x-user-id headers (removed)
❌ Restarting without saving .env.local first
```

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing env vars" | Create `.env.local` with your Supabase URL and keys |
| "Invalid API key" | Copy exact values from Supabase dashboard (no spaces) |
| Still getting errors? | Delete `.next` folder and restart: `npm run dev` |
| Can't sign in? | Verify NEXT_PUBLIC_SUPABASE_URL and ANON_KEY are correct |

## ✅ Verification Checklist

- [ ] `.env.local` file created
- [ ] Supabase credentials filled in
- [ ] Dev server restarted
- [ ] Can access http://localhost:3000/auth/login
- [ ] Can sign up with email/password
- [ ] Can access http://localhost:3000/labs/inventory
- [ ] Can create a location
- [ ] No error messages in browser console

## 📞 Need Help?

1. **Check the docs**: `docs/SETUP-SUPABASE.md`
2. **Run diagnostic**: `node scripts/check-supabase-setup.js`
3. **Read errors carefully**: They usually tell you what's wrong
4. **Hard refresh browser**: `Ctrl+Shift+R`
5. **Clear cache**: Delete `.next` folder and restart

---

**Ready?** Let's go! 🚀
