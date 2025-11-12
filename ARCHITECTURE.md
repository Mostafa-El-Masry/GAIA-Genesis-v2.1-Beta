/**
 * ARCHITECTURE.md
 * 
 * Visual architecture and data flow diagrams for GAIA v2.1 Health Module
 */

# GAIA v2.1 Health Module - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Pages                              │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  • /health/conditions/page.tsx    (Conditions UI)           │ │
│  │  • /health/meds/page.tsx          (Medications UI)          │ │
│  │  • /health/metrics/page.tsx       (Metrics UI)              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕  (JSON)                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              ELEUTHIA Crypto Module                         │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  services/eleuthia/crypto.ts                                │ │
│  │  ├─ AES-GCM encryption (256-bit)                            │ │
│  │  ├─ Random IV generation                                    │ │
│  │  ├─ Base64 encode/decode                                    │ │
│  │  └─ JSON helper functions                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Encrypted Payload                              │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  {                                                          │ │
│  │    "name": "KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBcDeFg==",          │ │
│  │    "notes": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3c=="            │ │
│  │  }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTES                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Health API Endpoints                           │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  POST   /api/health/conditions      (Create)               │ │
│  │  GET    /api/health/conditions      (List)                 │ │
│  │  PUT    /api/health/conditions/[id] (Update)               │ │
│  │  DELETE /api/health/conditions/[id] (Delete)               │ │
│  │  + Same for /meds and /metrics                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              D1 Database Client                             │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  db/client.ts                                               │ │
│  │  ├─ queryOne()    → SELECT single row                       │ │
│  │  ├─ queryAll()    → SELECT multiple rows                    │ │
│  │  └─ execute()     → INSERT, UPDATE, DELETE                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE D1 (SQLite)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Database Tables                          │ │
│  ├──────────────────┬──────────────────┬──────────────────────┤ │
│  │ users            │ settings         │ learning_progress    │ │
│  │ academy_results  │ labs             │                      │ │
│  ├──────────────────┴──────────────────┴──────────────────────┤ │
│  │ HEALTH TABLES (Encrypted Storage)                          │ │
│  ├──────────────────┬──────────────────┬──────────────────────┤ │
│  │ health_conditions│ health_meds      │ health_metrics       │ │
│  │                  │                  │                      │ │
│  │ name: ENC ✓      │ name: ENC ✓      │ date: PLAIN          │ │
│  │ notes: ENC ✓     │ dose: ENC ✓      │ weight: PLAIN        │ │
│  │                  │ unit: ENC ✓      │ bg_fasting: PLAIN    │ │
│  │                  │ schedule: ENC ✓  │ bg_post: PLAIN       │ │
│  │                  │                  │ notes: ENC ✓         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Create Condition

```
USER SUBMITS FORM
│
├─ Input: { name: "Type 2 Diabetes", notes: "Since 2020" }
│
↓
ENCRYPT ON CLIENT
│
├─ ELEUTHIA.encrypt("Type 2 Diabetes")
│  └─ Returns: "KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBc..." (base64)
│
├─ ELEUTHIA.encrypt("Since 2020")
│  └─ Returns: "aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3c4d..." (base64)
│
↓
POST /api/health/conditions
│
├─ Payload: {
│    "name": "KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBc...",
│    "notes": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3c4d..."
│  }
│
↓
API RECEIVES CIPHERTEXT
│
├─ Route handler validates
├─ Checks user ownership (x-user-id header)
├─ Calls execute() to INSERT
│
↓
D1 STORES ENCRYPTED DATA
│
├─ Row in health_conditions:
│  {
│    "id": "cond-123",
│    "user_id": "dev-user",
│    "name": "KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBc...",
│    "notes": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3c4d...",
│    "created_at": 1699000000000
│  }
│
│  ⚠️ Server never sees plaintext "Type 2 Diabetes"
│
↓
RESPONSE TO CLIENT
│
├─ Returns encrypted record (same as stored)
│
↓
CLIENT RECEIVES RESPONSE
│
├─ Decrypts: ELEUTHIA.decrypt("KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBc...")
│  └─ Returns: "Type 2 Diabetes"
│
├─ Renders plaintext in UI
├─ Shows in conditions list
│
✓ COMPLETE
```

---

## Data Flow: Read Conditions (Page Reload)

```
USER NAVIGATES TO /health/conditions
│
↓
COMPONENT MOUNTS
│
├─ Initialize ELEUTHIA.init()
├─ Fetch GET /api/health/conditions
│
↓
API EXECUTES queryAll()
│
├─ SELECT * FROM health_conditions WHERE user_id = 'dev-user'
├─ Returns array of encrypted records
│
↓
RESPONSE TO CLIENT
│
├─ {
│    "data": [
│      {
│        "id": "cond-123",
│        "name": "KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBc...",
│        "notes": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3c4d..."
│      }
│    ]
│  }
│
↓
CLIENT DECRYPTS ALL RECORDS
│
├─ for each condition in data:
│    ├─ plainName = await ELEUTHIA.decrypt(condition.name)
│    ├─ plainNotes = await ELEUTHIA.decrypt(condition.notes)
│    └─ Store in state: { ...condition, decryptedName, decryptedNotes }
│
↓
RENDER UI
│
├─ Display decryptedName and decryptedNotes
├─ User sees readable data
│
✓ COMPLETE
```

---

## Encryption Process (Detailed)

```
PLAINTEXT INPUT
│
├─ "Type 2 Diabetes"
│
↓
ENCODE TO UTF-8 BYTES
│
├─ [84, 121, 112, 101, 32, 50, 32, 68, 105, 97, 98, 101, 116, 101, 115]
│
↓
GENERATE RANDOM IV (12 bytes)
│
├─ crypto.getRandomValues(new Uint8Array(12))
├─ Example: [0x42, 0xA1, 0x23, 0x56, ...]
│
↓
AES-GCM ENCRYPT
│
├─ Algorithm: "AES-GCM"
├─ Key: 256-bit (32 bytes) from PBKDF2
├─ IV: 12 bytes (random per message)
├─ AAD: None (optional)
├─ Output: Ciphertext + Authentication Tag
│
├─ Ciphertext: [0x4B, 0x82, 0x62, 0x6B, ...]
├─ Auth Tag: [0x3D, 0x7E, 0xAB, 0xCD, ...]
│
↓
COMBINE IV + CIPHERTEXT + TAG
│
├─ [IV (12) | Ciphertext | Tag (16)]
│ └─ Total: ~28+ bytes
│
↓
ENCODE TO BASE64
│
├─ Binary → Base64 string
├─ "KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBcDeFg=="
│
✓ ENCRYPTED OUTPUT
```

---

## Database Schema Relationships

```
┌──────────────────┐
│     users        │ (PK: id)
│──────────────────│
│ id (TEXT)        │
│ email (TEXT)     │
│ created_at (INT) │
└────────┬─────────┘
         │ FK
         │ (user_id)
         │
    ┌────┴──────────────┬───────────────┬─────────────────┐
    │                   │               │                 │
    ↓                   ↓               ↓                 ↓
┌─────────────┐ ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
│ settings    │ │ health_         │ │ health_      │ │ learning_    │
│             │ │ conditions      │ │ meds         │ │ progress     │
├─────────────┤ ├────────────────┤ ├──────────────┤ ├──────────────┤
│ user_id ↑FK │ │ id (PK)        │ │ id (PK)      │ │ user_id ↑FK  │
│ key         │ │ user_id ↑FK    │ │ user_id ↑FK  │ │ topic        │
│ value       │ │ name (ENC)     │ │ name (ENC)   │ │ xp           │
│ updated_at  │ │ notes (ENC)    │ │ dose (ENC)   │ │ percent      │
└─────────────┘ │ created_at     │ │ unit (ENC)   │ │ last_touched │
                │                │ │ schedule(ENC)│ └──────────────┘
                │ ⚠️ ENCRYPTED   │ │ created_at   │
                └────────────────┘ │ ⚠️ ENCRYPTED │
                                   └──────────────┘
                                           │
                                           │ Also has:
                                           │
                                   ┌───────────────────┐
                                   │ health_metrics    │
                                   ├───────────────────┤
                                   │ id (PK)           │
                                   │ user_id ↑FK       │
                                   │ date              │
                                   │ weight (PLAIN)    │
                                   │ bg_fasting(PLAIN) │
                                   │ bg_post (PLAIN)   │
                                   │ notes (ENC)       │
                                   │ created_at        │
                                   └───────────────────┘
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

LAYER 1: TRANSPORT
├─ HTTPS/TLS encrypts all data in transit
├─ Even ciphertext is double-protected
└─ Man-in-the-middle protection

LAYER 2: CLIENT-SIDE ENCRYPTION (ELEUTHIA)
├─ AES-GCM (256-bit)
├─ Random IV per message
├─ Authentication tag validates integrity
└─ Key never leaves client (non-extractable CryptoKey)

LAYER 3: SERVER STORAGE (D1)
├─ Stores ONLY base64-encoded ciphertext
├─ No plaintext sensitive data in database
├─ D1 breach = encrypted data only
└─ Indexes on plaintext fields only (user_id, dates)

LAYER 4: APPLICATION SECURITY
├─ User ownership verification on every endpoint
├─ Partial updates prevent accidental overwrites
├─ Delete confirmations prevent accidents
└─ Error messages don't leak sensitive info

LAYER 5: KEY MANAGEMENT (Week 6+)
├─ Current: Dev key from environment
├─ Future: Derived from user auth + master key
├─ Rotation strategy for compromised keys
└─ Per-user encryption keys for multi-tenancy
```

---

## Performance Considerations

```
OPERATION                    TIME COMPLEXITY
──────────────────────────────────────────────

Create (GET + Encrypt + POST) O(n) where n = field size
  ├─ Encrypt: O(n) - AES-GCM linear
  ├─ POST: O(1) - Single INSERT
  └─ Total: ~50-100ms for typical record

Read (GET + Decrypt)         O(n*m) where n = records, m = fields
  ├─ GET: O(1) with user_id index
  ├─ Decrypt: O(n*m) - Serial decryption
  └─ Total: ~200-500ms for 10 conditions

Update (Decrypt + Encrypt)   O(n) per field
  ├─ Decrypt: O(n)
  ├─ Encrypt: O(n)
  └─ Total: ~100-200ms

Delete                       O(1)
  ├─ user_id + id indexed
  └─ Single DELETE

OPTIMIZATION STRATEGIES:
├─ Batch decryption (useCallback, memoization)
├─ Web Workers for crypto (offload from main thread)
├─ KV caching for frequently accessed data
├─ Lazy loading for large datasets
└─ Pagination for metrics (1000+ records)
```

---

## Error Handling Flow

```
┌─────────────────────────────────────┐
│      TRY OPERATION                  │
└─────────────────────────────────────┘
         │
         ├─ Validation Error?
         │  └─ Return 400 + message
         │
         ├─ Authorization Error?
         │  └─ Return 401 + message
         │
         ├─ Not Found?
         │  └─ Return 404 + message
         │
         ├─ Database Error?
         │  └─ Return 500 + generic message
         │
         └─ Success?
            └─ Return 200/201 + data

CLIENT ERROR HANDLING:
├─ Show inline error message (red box)
├─ Log to console for debugging
├─ Rollback optimistic UI on failure
├─ Retry button for temporary failures
└─ User-friendly error copy (no tech jargon)
```

---

## Deployment Architecture

```
Development              Staging                Production
├─ Local D1             ├─ Cloudflare D1      ├─ Cloudflare D1
├─ Dev key in .env      ├─ Staging key        ├─ Production key
├─ localhost:3000       ├─ staging.gaia.dev   ├─ gaia.app
└─ No auth required     ├─ Auth required      ├─ Auth required
                        └─ Rate limited       ├─ Rate limited
                                             ├─ DDoS protected
                                             ├─ Monitored 24/7
                                             └─ Backup strategy
```

---

**Last Updated**: November 2025
**Version**: GAIA v2.1-Beta (Week 4)
