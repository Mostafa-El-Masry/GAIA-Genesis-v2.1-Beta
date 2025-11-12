# 🚀 GAIA Genesis v2.1-Beta - Inventory Module Setup

## ⚡ Quick Start (5 Minutes)

### 1. Create Environment File
```bash
cp .env.example .env.local
```

### 2. Add Supabase Credentials
Edit `.env.local` and fill in your Supabase Project URL, Anon Key, and Service Role Key.

Get these from: https://supabase.com/dashboard → Your Project → Settings → API

### 3. Restart Server
```bash
npm run dev
```

### 4. Test
- Go to http://localhost:3000/auth/login
- Sign in
- Navigate to http://localhost:3000/labs/inventory

## 📚 Documentation

Start here based on your needs:

- **I'm just getting started** → Read `docs/QUICK-START.md`
- **I need detailed setup** → Read `docs/SETUP-SUPABASE.md`
- **I'm getting an error** → Read `docs/TROUBLESHOOTING.md`
- **I want technical details** → Read `docs/INTEGRATION-STATUS.md`

## ✅ What's Included

- ✅ Supabase authentication (sign up, sign in, sign out)
- ✅ JWT-based API security
- ✅ Inventory management (locations, products, stock)
- ✅ POS terminals tracking
- ✅ Sales recording
- ✅ Cost accounting
- ✅ User data isolation
- ✅ Production-ready security

## 🔧 Troubleshooting

### Error: "Missing Supabase environment variables"

**Fix**: Create `.env.local` with your Supabase credentials.

See: `docs/SETUP-SUPABASE.md`

### Error: "Invalid API key"

**Fix**: Verify the credentials in `.env.local` match your Supabase project exactly.

See: `docs/TROUBLESHOOTING.md`

### Other issues?

Run the diagnostic:
```bash
node scripts/check-supabase-setup.js
```

## 📋 Project Structure

```
GAIA-Genesis-v2.1-Beta/
├── docs/                    ← All documentation
│   ├── QUICK-START.md       ← Start here!
│   ├── SETUP-SUPABASE.md    ← Detailed setup
│   ├── TROUBLESHOOTING.md   ← Error help
│   └── ...
├── app/
│   ├── labs/inventory/      ← Main inventory UI
│   ├── context/             ← Auth context
│   └── api/inventory/       ← API endpoints
├── lib/
│   ├── supabase-client.ts   ← Client auth
│   └── supabase-server.ts   ← Server auth
├── .env.example             ← Copy to .env.local
├── package.json
└── ...
```

## 🎯 Key Features

### Authentication
- Email/password sign up and sign in
- Automatic token refresh
- Session management
- Secure JWT tokens

### Inventory Management
- Create and manage 8 warehouse locations
- Product catalog with pricing
- Stock level tracking by location
- Low stock alerts

### POS System
- 8 configurable terminals
- Transaction recording
- Payment tracking
- Receipt generation

### Analytics
- Sales reports
- Profit & loss tracking
- Cost analysis
- Performance metrics

## 🚀 Getting Started

1. **Setup** (5 min)
   ```bash
   cp .env.example .env.local
   # Add Supabase credentials
   npm run dev
   ```

2. **Sign In** (1 min)
   - Go to http://localhost:3000/auth/login
   - Create account or sign in

3. **Explore Inventory** (5 min)
   - Go to http://localhost:3000/labs/inventory
   - Create locations
   - Add products
   - Track stock

## 📞 Need Help?

1. Check the documentation: `docs/QUICK-START.md`
2. Run diagnostic: `node scripts/check-supabase-setup.js`
3. Read errors carefully - they're descriptive
4. See `docs/TROUBLESHOOTING.md`

## 🔐 Security

- ✅ All API endpoints require valid JWT
- ✅ User data is completely isolated
- ✅ RLS policies enforced by Supabase
- ✅ Sessions auto-expire for security
- ✅ Production-ready configuration

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Styling**: Tailwind CSS
- **State**: React Context API

## 🎉 Ready?

```bash
# 1. Setup
cp .env.example .env.local

# 2. Configure (add Supabase credentials to .env.local)

# 3. Run
npm run dev

# 4. Visit
http://localhost:3000/auth/login
```

---

**Documentation**: See `docs/QUICK-START.md` or `docs/INTEGRATION-STATUS.md`
**Status**: Ready for configuration and testing
**Last Updated**: November 12, 2025
