# 🚀 Inventory Management System - Deployment & Setup Guide

## Overview

The Inventory Management System is built for **Cloudflare Pages + D1 Database**. This guide walks you through setting it up for development and production.

---

## 📋 Prerequisites

- Node.js 18+ with npm
- Wrangler CLI (`npm install -g @cloudflare/wrangler`)
- Cloudflare account with Pages & D1 enabled
- Git repository

---

## 🏗️ Development Setup (Local Testing)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create wrangler.toml

Create a `wrangler.toml` file in the project root:

```toml
name = "gaia-genesis-v2.1"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "gaia-inventory"
database_id = "YOUR_DATABASE_ID"  # Leave empty for local dev

[env.development]
d1_databases = [
  { binding = "DB", database_name = "gaia-inventory", database_id = "local" }
]

[env.production]
d1_databases = [
  { binding = "DB", database_name = "gaia-inventory", database_id = "YOUR_PRODUCTION_ID" }
]
```

### 3. Initialize D1 Database (Local)

```bash
# Create a local D1 database
wrangler d1 create gaia-inventory --local

# Run the migration
wrangler d1 execute gaia-inventory --local --file db/migrations/0001_init.sql
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

### 5. Test the Inventory System

1. Navigate to: `http://localhost:3000/labs/inventory`
2. You should see the dashboard load successfully
3. Click "Add Location" and create a test location
4. Try adding products and managing inventory

---

## 🌍 Production Deployment (Cloudflare Pages + D1)

### 1. Create D1 Database on Cloudflare

```bash
# Create production database
wrangler d1 create gaia-inventory

# Save the DATABASE_ID from the output
```

### 2. Update wrangler.toml

```toml
[[d1_databases]]
binding = "DB"
database_name = "gaia-inventory"
database_id = "YOUR_DATABASE_ID"  # From the create command above
```

### 3. Apply Migration to Production

```bash
# Apply to remote database
wrangler d1 execute gaia-inventory --file db/migrations/0001_init.sql --remote
```

### 4. Deploy to Cloudflare Pages

```bash
# Build the project
npm run build

# Deploy using Wrangler
wrangler pages deploy
```

Or, connect your GitHub repository to Cloudflare Pages:

1. Go to **Cloudflare Dashboard** → **Pages** → **Create a project**
2. Select your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
4. Environment variables:
   - Add any required env vars (none needed for basic setup)
5. Click **Deploy**

Cloudflare will automatically redeploy on each git push to `main` branch.

### 5. Verify Production Deployment

1. Visit your production URL
2. Navigate to `/labs/inventory`
3. Test CRUD operations (create, read, update, delete)
4. Verify data persists across page refreshes

---

## 🗄️ Database Management

### View Database Data (Local)

```bash
# Connect to local database
wrangler d1 execute gaia-inventory --local --interactive

# Example queries
SELECT * FROM inventory_locations;
SELECT * FROM inventory_products;
SELECT * FROM inventory_stock;
SELECT * FROM pos_sales;
```

### View Database Data (Production)

```bash
# Connect to production database
wrangler d1 execute gaia-inventory --interactive --remote

# Example queries
SELECT * FROM inventory_locations WHERE user_id = 'dev-user';
SELECT COUNT(*) as product_count FROM inventory_products;
SELECT SUM(total_profit) FROM pos_sales;
```

### Backup Database

```bash
# Export production data as JSON
wrangler d1 execute gaia-inventory --remote --json > backup.json

# Or export as SQL
wrangler d1 execute gaia-inventory --remote > backup.sql
```

### Reset Database (Development Only)

```bash
# Drop all tables and re-apply migration
wrangler d1 execute gaia-inventory --local --file db/migrations/0001_init.sql
```

---

## 🔒 Environment Variables

### Development (.env.local)

```env
# Not needed - uses default x-user-id: dev-user
```

### Production (.env.production)

```env
# Configure user authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🐛 Troubleshooting

### Issue: "D1 binding not found"

**Solution:** Ensure `wrangler.toml` is in the project root and `[[d1_databases]]` binding is named "DB".

### Issue: Database migrations not applied

**Solution:** 
```bash
# Re-apply migration
wrangler d1 execute gaia-inventory --local --file db/migrations/0001_init.sql
```

### Issue: "Failed to fetch locations" in dashboard

**Possible causes:**
1. D1 database not initialized - run the migration
2. Wrangler not configured correctly - check `wrangler.toml`
3. Development server not restarted - stop and restart `npm run dev`

**Solution:**
```bash
# Verify database is initialized
wrangler d1 execute gaia-inventory --local "SELECT 1"

# Restart dev server
npm run dev
```

### Issue: CORS errors when accessing API

**Solution:** Ensure you're using the correct origin:
- Local: `http://localhost:3000`
- Production: Your Cloudflare Pages domain

---

## 📊 Database Schema Reference

### Tables Created

```sql
CREATE TABLE inventory_locations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  -- ... (see db/migrations/0001_init.sql for full schema)
  UNIQUE(user_id, code)
);

CREATE TABLE inventory_products (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  -- ... 
  UNIQUE(user_id, sku)
);

-- Additional tables:
CREATE TABLE inventory_stock (...)
CREATE TABLE pos_terminals (...)
CREATE TABLE pos_sales (...)
CREATE TABLE pos_sale_items (...)
CREATE TABLE cost_accounting (...)
```

See `db/migrations/0001_init.sql` for complete schema definition.

---

## 🚦 API Testing

### Test Endpoints Locally

```bash
# Get all locations
curl -X GET http://localhost:3000/api/inventory/locations \
  -H "x-user-id: dev-user"

# Create a location
curl -X POST http://localhost:3000/api/inventory/locations \
  -H "Content-Type: application/json" \
  -H "x-user-id: dev-user" \
  -d '{
    "name": "Main Warehouse",
    "code": "LOC001",
    "location_type": "warehouse"
  }'

# Create a product
curl -X POST http://localhost:3000/api/inventory/products \
  -H "Content-Type: application/json" \
  -H "x-user-id: dev-user" \
  -d '{
    "sku": "PROD001",
    "name": "Widget Pro",
    "unit_cost": 10.00,
    "unit_price": 24.99,
    "category": "Electronics"
  }'
```

### Test with Postman

1. Import the Postman collection: `docs/postman-collection.json` (create this)
2. Set base URL: `http://localhost:3000` (local) or `https://your-domain.pages.dev` (production)
3. Add header: `x-user-id: dev-user`
4. Run requests

---

## 📈 Monitoring & Logging

### View Cloudflare Pages Logs

```bash
# Stream live logs
wrangler tail

# View analytics
wrangler analytics
```

### View Application Logs (Local)

Logs are printed to the console. Look for messages like:
```
[GET /api/inventory/locations:] ...
[POST /api/inventory/products:] ...
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: gaia-genesis-v2.1
          directory: .next
```

---

## 📚 Additional Resources

- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/
- **System Architecture**: See `docs/inventory-system-guide.md`

---

## ✅ Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Wrangler CLI installed (`wrangler --version`)
- [ ] Cloudflare account created
- [ ] D1 database created
- [ ] `wrangler.toml` configured with DATABASE_ID
- [ ] Migration applied (`wrangler d1 execute ...`)
- [ ] Development server tested locally (`npm run dev`)
- [ ] All CRUD operations working
- [ ] Production database created
- [ ] Build succeeds (`npm run build`)
- [ ] Deployed to Cloudflare Pages
- [ ] Production URLs tested
- [ ] Monitoring/logging configured

---

## 🎉 Next Steps

Once deployed:

1. **Configure Authentication** (Week 6)
   - Integrate with Supabase Auth
   - Replace x-user-id headers with actual user IDs

2. **Add Advanced Features**
   - Barcode scanning for POS
   - Multi-user with role-based access
   - Inventory forecasting
   - Supplier management

3. **Build Remaining UI Pages**
   - Complete Stock Management dashboard
   - Build POS checkout interface
   - Create Sales Reports page
   - Build Cost Accounting dashboard

4. **Monitor & Optimize**
   - Set up error tracking (Sentry)
   - Add performance monitoring
   - Optimize database queries
   - Scale as needed

---

**Happy deploying! 🚀**
