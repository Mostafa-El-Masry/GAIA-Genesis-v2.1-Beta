# Supabase Integration Checklist & Quick Reference

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js Browser)               │
│                                                              │
│  lib/supabase-client.ts                                    │
│  ├─ supabaseClient (Anon JWT)                              │
│  ├─ getAuthenticatedUser()                                 │
│  ├─ signInWithPassword()                                   │
│  └─ authenticatedFetch() ──→ Authorization: Bearer <JWT>   │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP Requests
┌─────────────────────────────────────────────────────────────┐
│              API Routes (Next.js App Router)                │
│                                                              │
│  app/api/inventory/**/route.ts                             │
│  ├─ Extract JWT from Authorization header                 │
│  ├─ Call getAuthUser(request)                            │
│  └─ All queries scoped to user.id                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         lib/supabase-server.ts (Service Role)              │
│                                                              │
│  supabase.from("table")                                    │
│    .select().eq("user_id", userId)                        │
│                                                              │
│  ✅ Automatic user isolation                              │
│  ✅ JWT validation on every request                       │
│  ✅ RLS policies enforced by Supabase                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Supabase PostgreSQL (Cloud)                        │
│                                                              │
│  Tables with RLS policies:                                 │
│  ├─ inventory_locations                                    │
│  ├─ inventory_products                                     │
│  ├─ inventory_stock                                        │
│  ├─ pos_terminals                                          │
│  ├─ pos_sales                                              │
│  ├─ pos_sale_items                                         │
│  └─ cost_accounting                                        │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Completed Components

### 1. Server-Side Auth & Queries
**File**: `lib/supabase-server.ts`

```typescript
// Initialize with service role key (server-only)
const supabase = createClient(url, serviceRoleKey);

// Validate JWT from request
const user = await getAuthUser(request);
// Returns: { id: "uuid", email: "...", aud: "authenticated" }

// Auto-scoped queries
const { data } = await supabase
  .from("inventory_locations")
  .select("*")
  .eq("user_id", user.id);
```

### 2. Client-Side Auth
**File**: `lib/supabase-client.ts`

```typescript
// Initialize with anon key (client-side safe)
const supabaseClient = createClient(url, anonKey);

// Auth methods
await supabaseClient.auth.signInWithPassword(email, password);
const user = await getAuthenticatedUser();
const session = await getSession();
await supabaseClient.auth.signOut();

// Auto-attach JWT to fetch requests
const response = await authenticatedFetch("/api/inventory/locations");
// Header added: Authorization: Bearer <session.access_token>
```

### 3. API Endpoints (All 20 Updated)
**Pattern** (Example: locations/route.ts):

```typescript
export async function GET(request: NextRequest) {
  // ✅ Step 1: Get authenticated user
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ Step 2: Execute query with automatic user isolation
  const { data, error } = await supabase
    .from("inventory_locations")
    .select("*")
    .eq("user_id", user.id)  // ← Automatic
    .eq("is_active", true);

  // ✅ Step 3: Return data
  return NextResponse.json({ data });
}
```

### 4. Database Schema
**File**: `db/migrations/0002_supabase_inventory.sql`

- 7 Inventory tables with proper indexes
- Row-Level Security (RLS) policies
- UUIDs for all primary keys
- TIMESTAMP WITH TIME ZONE for proper time handling
- JSONB for customer_info, schedule fields

## 🔧 Environment Setup

### Required Variables (.env.local)

```env
# Client-side (NEXT_PUBLIC_*)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Verify Setup
```bash
# Check if environment variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test API endpoint
curl -X GET http://localhost:3000/api/inventory/locations \
  -H "Authorization: Bearer $(get_jwt_token)"
```

## 📋 Frontend Implementation Tasks

### 1. Create Auth Context Provider
**File**: `app/DesignSystem/context/AuthContext.tsx`

```typescript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription?.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};
```

### 2. Update Inventory Pages to Use Auth
**File**: `app/labs/inventory/ClientPage.tsx` (example)

```typescript
"use client";
import { useContext } from "react";
import { AuthContext } from "@/app/DesignSystem/context/AuthContext";
import { authenticatedFetch } from "@/lib/supabase-client";

export default function InventoryDashboard() {
  const { user } = useContext(AuthContext);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (user) {
      // ✅ Now using authenticated fetch with JWT
      authenticatedFetch("/api/inventory/locations")
        .then(r => r.json())
        .then(data => setLocations(data.data));
    }
  }, [user]);

  // Render UI with locations...
}
```

### 3. Protected Routes Middleware
**File**: `lib/middleware.ts` (optional)

```typescript
export function middleware(request: NextRequest) {
  const token = request.headers.get("Authorization");
  
  if (request.nextUrl.pathname.startsWith("/api/inventory")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/inventory/:path*"],
};
```

## 🧪 Testing Checklist

### Test Authentication Flow
- [ ] User can sign up with email/password
- [ ] User can sign in
- [ ] JWT token is set in session
- [ ] Token refreshes automatically
- [ ] User can sign out
- [ ] Unauthenticated requests return 401

### Test API Endpoints
- [ ] GET /api/inventory/locations (returns user's data only)
- [ ] POST /api/inventory/locations (creates with user_id)
- [ ] PUT /api/inventory/locations/[id] (updates only user's records)
- [ ] DELETE /api/inventory/locations/[id] (deletes only user's records)
- [ ] Repeat for: products, stock, terminals, sales, accounting

### Test Data Isolation
- [ ] User A cannot see User B's locations
- [ ] User A cannot modify User B's products
- [ ] RLS policies enforced by Supabase
- [ ] Cross-user updates return 403 or 0 affected rows

### Test Error Handling
- [ ] 401 Unauthorized (missing JWT)
- [ ] 403 Forbidden (JWT invalid)
- [ ] 404 Not Found (record doesn't exist)
- [ ] 409 Conflict (duplicate unique constraint)

## 📊 Data Type Mappings

| Feature | D1/SQLite | Supabase/PostgreSQL | Notes |
|---------|-----------|-------------------|-------|
| ID | UUID TEXT | UUID | Native UUID |
| Timestamps | INTEGER (ms) | TIMESTAMP WITH TIME ZONE | ISO format |
| Booleans | INTEGER (0/1) | BOOLEAN | true/false |
| JSON | TEXT | JSONB | Native JSON |
| Dates | TEXT (ISO) | DATE | YYYY-MM-DD |
| Decimals | REAL | DECIMAL(12,2) | For money |

## 🚀 Deployment Checklist

- [ ] Supabase project created
- [ ] Database migrated (`0002_supabase_inventory.sql`)
- [ ] RLS policies enabled
- [ ] Environment variables set in production
- [ ] API endpoints tested in production
- [ ] Frontend updated with auth flow
- [ ] Error handling verified
- [ ] Documentation updated

## 🔄 Migration Reference

### Before (D1 Pattern)
```typescript
// API Endpoint
const db = getD1Binding((global as any).ENV);
const locations = await queryAll(db, "SELECT * FROM inventory_locations WHERE user_id = ?", [userId]);
return NextResponse.json({ data: locations });

// Frontend
fetch("/api/inventory/locations", {
  headers: { "x-user-id": "dev-user" }
})
```

### After (Supabase Pattern)
```typescript
// API Endpoint
const user = await getAuthUser(request); // Gets from JWT
const { data } = await supabase
  .from("inventory_locations")
  .select("*")
  .eq("user_id", user.id);
return NextResponse.json({ data });

// Frontend
import { authenticatedFetch } from "@/lib/supabase-client";
authenticatedFetch("/api/inventory/locations"); // JWT auto-attached
```

## 📚 Documentation Files

- `docs/supabase-migration.md` - Full migration guide
- `README.md` - Update with Supabase setup instructions
- `docs/deployment-guide.md` - Update with Supabase deployment steps
- `docs/api-reference.md` - Update API examples

## ⚠️ Common Issues & Solutions

### Issue: "D1 binding not found"
**Solution**: Already fixed! All endpoints use Supabase now.

### Issue: 401 Unauthorized on API calls
**Solution**: Ensure JWT token is being sent:
```typescript
// Check this
const token = request.headers.get("Authorization");
console.log("Token:", token);
```

### Issue: Data from other users visible
**Solution**: Check RLS policies are enabled:
```sql
-- Verify in Supabase dashboard:
SELECT * FROM pg_policies 
WHERE tablename = 'inventory_locations';
```

### Issue: Type errors with Supabase queries
**Solution**: Add explicit typing:
```typescript
const { data, error } = await supabase
  .from("inventory_locations")
  .select("*") as any;
```

---

**Last Updated**: After API migration complete
**Status**: 🔄 Awaiting frontend auth integration & UI redesign
