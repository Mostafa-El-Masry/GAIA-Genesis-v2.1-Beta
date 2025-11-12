# Inventory Management System - GAIA v2.1 Week 4

## Overview

The Inventory Management System is a comprehensive multi-location inventory control, POS (Point of Sale), and cost accounting solution fully integrated into GAIA v2.1.

**Key Features:**
- 8 configurable warehouse/retail locations
- 8 POS terminal checkout stations
- Real-time stock tracking by location
- Product catalog with cost/price management
- Complete cost accounting and profit/loss tracking
- Transaction history and reporting
- User-isolated data with x-user-id headers

---

## System Architecture

### Database Schema

The system adds 7 new tables to the D1 database:

```
inventory_locations         (8 locations max)
inventory_products          (Product catalog)
inventory_stock            (Stock levels by location + product)
pos_terminals              (8 POS checkout stations)
pos_sales                  (Sale transactions)
pos_sale_items             (Line items per sale)
cost_accounting            (Profit/loss tracking)
```

### File Structure

```
app/
  api/inventory/
    locations/
      route.ts              # GET/POST locations
      [id]/route.ts        # GET/PUT/DELETE single location
    products/
      route.ts              # GET/POST products
      [id]/route.ts        # GET/PUT/DELETE single product
    stock/
      route.ts              # GET/POST stock entries
      [id]/route.ts        # GET/PUT/DELETE stock
    pos/
      terminals/
        route.ts            # GET/POST POS terminals
        [id]/route.ts       # GET/PUT/DELETE terminal
      sales/
        route.ts            # GET/POST sales transactions
        [id]/route.ts       # GET/PUT/DELETE sales
    accounting/
      route.ts              # GET accounting records, POST to calculate
  labs/inventory/
    page.tsx                # Main dashboard
    layout.tsx              # Layout wrapper
    locations/page.tsx      # Location management
    products/page.tsx       # Product management
    stock/page.tsx          # Stock management (TBD)
    pos/page.tsx            # POS terminal management (TBD)
    sales/page.tsx          # Sales reports (TBD)
    accounting/page.tsx     # Cost accounting reports (TBD)

db/migrations/
  0001_init.sql            # Extended with 7 new inventory tables
```

---

## API Endpoints

### Locations Management

**GET /api/inventory/locations**
- Returns all active locations for the user
- Response: `{ data: Location[] }`

**POST /api/inventory/locations**
- Create new location
- Body: `{ name, code, address?, city?, state?, zip?, location_type }`
- Response: `{ data: Location }`

**GET /api/inventory/locations/[id]**
- Retrieve single location
- Response: `{ data: Location }`

**PUT /api/inventory/locations/[id]**
- Update location (partial or full)
- Response: `{ data: Location }`

**DELETE /api/inventory/locations/[id]**
- Soft delete location (sets is_active = 0)
- Response: `{ success: true }`

### Products Management

**GET /api/inventory/products**
- List all products, optionally filtered by category
- Query params: `?category=Electronics`
- Response: `{ data: Product[] }`

**POST /api/inventory/products**
- Create new product
- Body: `{ sku, name, description?, unit_cost, unit_price, category? }`
- Response: `{ data: Product }`

**GET /api/inventory/products/[id]**
- Retrieve product details
- Response: `{ data: Product }`

**PUT /api/inventory/products/[id]**
- Update product pricing and details
- Response: `{ data: Product }`

**DELETE /api/inventory/products/[id]**
- Soft delete product (sets is_active = 0)
- Response: `{ success: true }`

### Stock Management

**GET /api/inventory/stock**
- List stock entries
- Query params: `?location_id=xxx&product_id=yyy`
- Response: `{ data: InventoryStock[] }`

**POST /api/inventory/stock**
- Create stock entry for product at location
- Body: `{ product_id, location_id, quantity?, reorder_point?, reorder_qty? }`
- Response: `{ data: InventoryStock }`

**GET /api/inventory/stock/[id]**
- Retrieve stock details
- Response: `{ data: InventoryStock }`

**PUT /api/inventory/stock/[id]**
- Update stock quantity, reserved, or thresholds
- Auto-calculates available = quantity - reserved
- Response: `{ data: InventoryStock }`

**DELETE /api/inventory/stock/[id]**
- Hard delete stock entry
- Response: `{ success: true }`

### POS Terminals

**GET /api/inventory/pos/terminals**
- List all POS terminals (1-8)
- Query params: `?location_id=xxx`
- Response: `{ data: POSTerminal[] }`

**POST /api/inventory/pos/terminals**
- Create POS terminal
- Body: `{ terminal_num (1-8), location_id, terminal_name? }`
- Response: `{ data: POSTerminal }`

**GET /api/inventory/pos/terminals/[id]**
- Retrieve terminal info
- Response: `{ data: POSTerminal }`

**PUT /api/inventory/pos/terminals/[id]**
- Update terminal name or status
- Response: `{ data: POSTerminal }`

**DELETE /api/inventory/pos/terminals/[id]**
- Soft delete terminal
- Response: `{ success: true }`

### POS Sales

**GET /api/inventory/pos/sales**
- List sales transactions
- Query params: `?terminal_id=xxx&location_id=yyy&start_date=1234567890&end_date=1234567890`
- Response: `{ data: POSSale[] }`

**POST /api/inventory/pos/sales**
- Record completed sale transaction
- Body: `{ terminal_id, location_id, transaction_num, total_items, subtotal, tax_amount?, total_amount, payment_method?, customer_info?, notes?, items[] }`
- Items format: `[ { product_id, sku, product_name, quantity, unit_price, unit_cost }, ... ]`
- Automatically:
  - Calculates line totals and profit per item
  - Records profit in pos_sale_items
  - Updates terminal last_online
- Response: `{ data: POSSale }`

**GET /api/inventory/pos/sales/[id]**
- Retrieve sale with all line items
- Response: `{ data: { ...POSSale, items: POSSaleItem[] } }`

**PUT /api/inventory/pos/sales/[id]**
- Update notes or void transaction (voided = 1)
- Response: `{ data: POSSale }`

**DELETE /api/inventory/pos/sales/[id]**
- Void transaction (sets voided = 1) instead of hard delete
- Response: `{ success: true }`

### Cost Accounting

**GET /api/inventory/accounting**
- List accounting records
- Query params: `?location_id=xxx&period=2024-01-15`
- Filter by location_id shows location totals, omitting shows company-wide totals
- Response: `{ data: CostAccounting[] }`

**POST /api/inventory/accounting/calculate**
- Calculate and upsert accounting for a period
- Body: `{ date_period (YYYY-MM-DD or YYYY-MM), location_id? }`
- Queries pos_sales and pos_sale_items to compute:
  - total_sales (sum of line totals)
  - total_cost (COGS from unit_cost * quantity)
  - total_profit (sum of line_profit)
  - profit_margin (%)
  - transaction_count
  - items_sold
- Response: `{ data: CostAccounting }`

---

## Frontend Pages

### Dashboard (`/labs/inventory`)
- Overview metrics: Locations, Active POS terminals, Daily sales/profit
- Quick navigation cards to subsystems
- POS terminal status overview (active/inactive)

### Locations (`/labs/inventory/locations`)
- View all 8 locations
- Add/Edit/Delete locations
- Displays location type, address, city/state

### Products (`/labs/inventory/products`)
- View product catalog
- Add/Edit/Delete products
- Shows SKU, name, cost, price, profit margin (%)
- Filter by category

### Stock (coming soon) (`/labs/inventory/stock`)
- Stock levels by location
- Low stock alerts (below reorder_point)
- Bulk reorder suggestions

### POS Terminals (coming soon) (`/labs/inventory/pos`)
- Manage 8 checkout terminals
- View terminal status and last activity
- Configure terminal names and assignment to locations

### Sales Reports (coming soon) (`/labs/inventory/sales`)
- Transaction history with filters
- Daily/weekly/monthly sales trends
- Payment method breakdown

### Cost Accounting (coming soon) (`/labs/inventory/accounting`)
- Daily/monthly profit & loss reports
- Profit margin by location
- Detailed cost analysis

---

## Data Models

### Location
```typescript
id: string;
user_id: string;
name: string;
code: string;
address: string | null;
city: string | null;
state: string | null;
zip: string | null;
location_type: "warehouse" | "retail" | "storage";
is_active: 1 | 0;
created_at: number;
updated_at: number;
```

### Product
```typescript
id: string;
user_id: string;
sku: string;                    // Unique
name: string;
description: string | null;
unit_cost: number;              // Cost to acquire
unit_price: number;             // Sale price
category: string | null;
is_active: 1 | 0;
created_at: number;
updated_at: number;
```

### InventoryStock
```typescript
id: string;
user_id: string;
product_id: string;
location_id: string;
quantity: number;               // Physical count
reserved: number;               // Reserved for orders
available: number;              // quantity - reserved
reorder_point: number;          // Alert threshold
reorder_qty: number;            // Suggested order qty
last_counted_at: number | null;
created_at: number;
updated_at: number;
```

### POSTerminal
```typescript
id: string;
user_id: string;
terminal_num: 1-8;              // Fixed range
location_id: string;
terminal_name: string | null;
is_active: 1 | 0;
last_online: number | null;     // Updated on each sale
created_at: number;
updated_at: number;
```

### POSSale
```typescript
id: string;
user_id: string;
terminal_id: string;
location_id: string;
transaction_num: string;        // Receipt #
total_items: number;
subtotal: number;
tax_amount: number;
total_amount: number;
payment_method: string | null;  // "cash", "card", etc.
customer_info: string | null;   // JSON: name, phone, etc.
notes: string | null;
voided: 1 | 0;
created_at: number;
```

### POSSaleItem
```typescript
id: string;
user_id: string;
sale_id: string;
product_id: string;
sku: string;
product_name: string;
quantity: number;
unit_price: number;             // Price at time of sale
unit_cost: number;              // Cost at time of sale
line_total: number;             // quantity * unit_price
line_profit: number;            // (unit_price - unit_cost) * quantity
created_at: number;
```

### CostAccounting
```typescript
id: string;
user_id: string;
date_period: string;            // "YYYY-MM-DD" or "YYYY-MM"
location_id: string | null;     // null = company-wide
total_sales: number;            // Sum of line totals
total_cost: number;             // Sum of COGS
total_profit: number;           // total_sales - total_cost
profit_margin: number;          // (profit / sales) * 100
transaction_count: number;
items_sold: number;
created_at: number;
updated_at: number;
```

---

## Usage Workflow

### 1. Setup Phase
1. Create 8 locations (warehouses/retail stores)
2. Add products to catalog with cost/price
3. Set initial stock levels by location
4. Create 8 POS terminals (assign to locations)

### 2. Daily Operations
1. Clerk uses POS terminal to ring up sale
2. System records transaction with line items
3. Tracks cost per item sold
4. Updates terminal last_online timestamp

### 3. Reporting Phase
1. Run cost accounting calculation for period (daily/monthly)
2. Review profit margins by location
3. Check stock levels for reordering
4. Export reports for analysis

---

## Integration with GAIA Labs

The Inventory System is accessed from the Labs dashboard:

```
Labs → System Modules → Inventory Management
```

The system is completely isolated as a separate component with:
- Independent API routes (`/api/inventory/*`)
- Separate React pages (`/labs/inventory/*`)
- Own database tables (inventory_*, pos_*, cost_accounting)
- User isolation via x-user-id headers

Can be used standalone or integrated with other GAIA modules.

---

## Security & User Isolation

- All endpoints require `x-user-id` header (dev-user for testing)
- All queries filtered by user_id automatically
- Soft deletes preserve audit trail
- Profit calculations use unit_cost and unit_price at time of sale (prevents retroactive changes)
- Transaction numbers must be unique per user

---

## Future Enhancements

- Barcode scanning for POS
- Multi-user support with role-based access
- Inventory forecasting based on sales trends
- Supplier management and purchase orders
- Multi-currency support
- Real-time inventory sync across locations
- Advanced reporting and dashboards
- Tax calculation by jurisdiction
- Integration with accounting software

---

## Testing

All endpoints have been created and are ready for integration. To test:

```bash
# Create a location
curl -X POST http://localhost:3000/api/inventory/locations \
  -H "Content-Type: application/json" \
  -H "x-user-id: dev-user" \
  -d '{"name":"Main Warehouse","code":"LOC001","location_type":"warehouse"}'

# Create a product
curl -X POST http://localhost:3000/api/inventory/products \
  -H "Content-Type: application/json" \
  -H "x-user-id: dev-user" \
  -d '{"sku":"PROD001","name":"Widget","unit_cost":10,"unit_price":25}'

# And so on...
```

---

**Status:** ✅ All API routes complete, Frontend dashboard complete, Integration with Labs complete
**Last Updated:** GAIA v2.1 Week 4
