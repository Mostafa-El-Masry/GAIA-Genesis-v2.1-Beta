# GAIA v2.1 - D1 to Supabase Migration Guide

**Status**: ✅ Database & API Migration Complete | ⏳ UI Redesign Pending

## Overview

Successfully migrated GAIA v2.1 Inventory Management System from Cloudflare D1 (SQLite) to Supabase PostgreSQL. All 20 API endpoints converted, server & client authentication patterns updated.

## What Was Changed

### 1. Database Layer
**From**: Cloudflare D1 (SQLite) with D1 binding
**To**: Supabase PostgreSQL

**New File**: `db/migrations/0002_supabase_inventory.sql`
- 7 Inventory tables (locations, products, stock, terminals, sales, items, accounting)
- 10+ performance indexes
- Row-Level Security (RLS) policies for multi-tenant data isolation
- PostgreSQL-specific syntax (UUID, TIMESTAMP WITH TIME ZONE, JSONB)

### 2. Server-Side Authentication
**From**: `x-user-id` headers (dev testing)
**To**: JWT token validation from `Authorization: Bearer <token>`

**New File**: `lib/supabase-server.ts` (90 lines)
```typescript
- createClient(url, serviceRole) - Initialize Supabase admin client
- getAuthUser(request) - Extract & validate JWT from request headers
- queryWithUserIsolation(table, userId, filters) - Scoped queries
- insert/update/delete helpers with automatic user_id injection
```

### 3. Client-Side Authentication
**From**: Manual header injection
**To**: Supabase session management with automatic token refresh

**New File**: `lib/supabase-client.ts` (70 lines)
```typescript
- getAuthenticatedUser() - Get current user from session
- signInWithPassword(email, password) - Email/password auth
- signUpWithPassword(email, password) - User registration
- signOut() - Session cleanup
- authenticatedFetch(url, options) - Auto-attach JWT to requests
- Example fetch helpers: fetchLocations(), fetchProducts(), fetchStock()
- onAuthStateChange(callback) - Subscribe to auth state updates
```

### 4. API Routes - All 20 Endpoints Updated

#### Locations Management
- `GET /api/inventory/locations` - Fetch all locations
- `POST /api/inventory/locations` - Create location
- `GET /api/inventory/locations/[id]` - Get single location
- `PUT /api/inventory/locations/[id]` - Update location
- `DELETE /api/inventory/locations/[id]` - Soft delete location

#### Products Management
- `GET /api/inventory/products` - Fetch products (with category filter)
- `POST /api/inventory/products` - Create product
- `GET /api/inventory/products/[id]` - Get single product
- `PUT /api/inventory/products/[id]` - Update product
- `DELETE /api/inventory/products/[id]` - Soft delete product

#### Stock Management
- `GET /api/inventory/stock` - Fetch stock (with location/product filters)
- `POST /api/inventory/stock` - Create stock entry
- `GET /api/inventory/stock/[id]` - Get single stock entry
- `PUT /api/inventory/stock/[id]` - Update stock (auto-recalculate available)
- `DELETE /api/inventory/stock/[id]` - Hard delete stock entry

#### POS Terminals
- `GET /api/inventory/pos/terminals` - Fetch terminals
- `POST /api/inventory/pos/terminals` - Create terminal
- `GET /api/inventory/pos/terminals/[id]` - Get single terminal
- `PUT /api/inventory/pos/terminals/[id]` - Update terminal
- `DELETE /api/inventory/pos/terminals/[id]` - Soft delete terminal

#### POS Sales
- `GET /api/inventory/pos/sales` - Fetch sales (with date range, location, terminal filters)
- `POST /api/inventory/pos/sales` - Create sale with line items
- `GET /api/inventory/pos/sales/[id]` - Get sale with items
- `PUT /api/inventory/pos/sales/[id]` - Update sale (void, notes)
- `DELETE /api/inventory/pos/sales/[id]` - Void sale

#### Cost Accounting
- `GET /api/inventory/accounting` - Fetch accounting records
- `POST /api/inventory/accounting` - Calculate/upsert accounting metrics

## Key Technical Changes

### Pattern Shift: D1 to Supabase

**D1 Pattern (SQLite)**:
```typescript
const db = getD1Binding((global as any).ENV);
const result = await queryAll(db, "SELECT * FROM table WHERE id = ?", [id]);
```

**Supabase Pattern (PostgreSQL)**:
```typescript
const { data, error } = await supabase
  .from("table")
  .select("*")
  .eq("id", id);
```

### Data Type Changes

| Column | D1/SQLite | Supabase/PostgreSQL | Change |
|--------|-----------|-------------------|---------|
| id | TEXT(UUID format) | UUID | Native UUID type |
| created_at | INTEGER (timestamp ms) | TIMESTAMP WITH TIME ZONE | ISO string format |
| is_active | INTEGER (0/1) | BOOLEAN | True/false |
| boolean_field | INTEGER (0/1) | BOOLEAN | True/false |
| json_field | TEXT (JSON string) | JSONB | Native JSON type |

### User Isolation Pattern

**Authentication Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Validation** (lib/supabase-server.ts):
```typescript
const token = request.headers.get("Authorization")?.replace("Bearer ", "");
const user = await supabase.auth.getUser(token);
```

**Query Isolation** (automatic):
```typescript
// Every query includes user_id filter
.eq("user_id", user.id)
```

## Environment Variables Required

### Server-Side
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Client-Side
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Migration Steps Completed

1. ✅ Create Supabase client wrapper (`lib/supabase-server.ts`)
2. ✅ Convert SQLite schema to PostgreSQL (`db/migrations/0002_supabase_inventory.sql`)
3. ✅ Update all 20 API endpoints to use Supabase SDK
4. ✅ Create client-side auth wrapper (`lib/supabase-client.ts`)
5. ✅ Implement JWT token authentication in API routes
6. ⏳ Redesign 8 frontend pages with professional dashboard UI
7. ⏳ Update all documentation

## Breaking Changes for Frontend

### Before (D1)
```typescript
// Frontend sent x-user-id header
const response = await fetch("/api/inventory/locations", {
  headers: { "x-user-id": "dev-user" }
});
```

### After (Supabase)
```typescript
// Frontend gets JWT from session and sends Authorization header
import { supabaseClient } from "@/lib/supabase-client";
import { authenticatedFetch } from "@/lib/supabase-client";

const response = await authenticatedFetch("/api/inventory/locations");
```

## Frontend Component Updates Needed

All 8 inventory pages in `/app/labs/inventory/` need to:
1. Import `supabaseClient` and auth functions from `lib/supabase-client.ts`
2. Use `useEffect` with `onAuthStateChange` to track auth state
3. Use `authenticatedFetch()` instead of manual fetch with headers
4. Update error handling for 401 Unauthorized responses
5. Redesign UI to match professional dashboard style (reference: BASA SPA screenshot)

## Files Modified/Created

### New Files
- `lib/supabase-server.ts` - Server-side Supabase client
- `lib/supabase-client.ts` - Client-side Supabase auth
- `db/migrations/0002_supabase_inventory.sql` - PostgreSQL schema

### Modified Files (All 20 Endpoints)
- `app/api/inventory/locations/route.ts` ✅
- `app/api/inventory/locations/[id]/route.ts` ✅
- `app/api/inventory/products/route.ts` ✅
- `app/api/inventory/products/[id]/route.ts` ✅
- `app/api/inventory/stock/route.ts` ✅
- `app/api/inventory/stock/[id]/route.ts` ✅
- `app/api/inventory/pos/terminals/route.ts` ✅
- `app/api/inventory/pos/terminals/[id]/route.ts` ✅
- `app/api/inventory/pos/sales/route.ts` ✅
- `app/api/inventory/pos/sales/[id]/route.ts` ✅
- `app/api/inventory/accounting/route.ts` ✅

### Files Still Using D1 Pattern
- `db/client.ts` - Can be deprecated (kept for reference)

## Testing Endpoints

### Create Test Location
```bash
curl -X POST http://localhost:3000/api/inventory/locations \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Store",
    "code": "MAIN001",
    "location_type": "retail",
    "city": "New York"
  }'
```

### Fetch Locations
```bash
curl http://localhost:3000/api/inventory/locations \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Next Steps

1. **UI Redesign** - Update 8 inventory pages to professional dashboard style
   - Add sidebar navigation
   - Implement metric cards with icons
   - Add charts (Chart.js or Recharts)
   - Professional color scheme (teal, purple, green)

2. **Frontend Auth Integration**
   - Create login page using `supabaseClient.auth`
   - Implement auth context provider
   - Add protected routes middleware

3. **Documentation** - Update deployment guide, API docs, architecture guide

4. **Testing** - QA all 20 endpoints with Supabase

5. **Deployment**
   - Create Supabase project
   - Run migrations
   - Set environment variables
   - Deploy to production

## Rollback Plan

If reverting to D1 is needed:
1. Keep `db/client.ts` (D1 wrapper) for reference
2. Revert API endpoints to use D1 pattern
3. Switch environment to Cloudflare Pages Functions runtime
4. Restore `x-user-id` header pattern in frontend

---

**Last Updated**: After all API migrations complete
**Status**: 🔄 IN PROGRESS - Awaiting UI redesign & docs update
