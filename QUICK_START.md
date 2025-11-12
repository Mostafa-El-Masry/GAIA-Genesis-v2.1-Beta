// QUICK_START.md - Get Health Module Running

# Quick Start Guide - GAIA Health Module

## 1️⃣ Generate Dev Encryption Key

```bash
node -e "console.log(Buffer.from(require('crypto').randomBytes(32)).toString('base64'))"
```

Copy the output.

## 2️⃣ Add to Environment

Create/update `.env.local`:

```bash
NEXT_PUBLIC_ELEUTHIA_DEV_KEY="<paste-generated-key-here>"
```

## 3️⃣ Set Up D1 Database

In `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "gaia_db"
database_id = "your-database-id"
```

Run migration:

```bash
wrangler d1 execute gaia_db --file=db/migrations/0001_init.sql
```

## 4️⃣ Verify Setup

Navigate to `/health/conditions` and:

1. Add a test condition: "Test Diabetes"
2. Should see it on page immediately
3. Check D1 console: name should be base64 gibberish

```bash
# In D1 console
SELECT name FROM health_conditions LIMIT 1;
# Should show: KgJmK3Z9pL2mN1qOr4sT5uVwXy... (encrypted)
```

## 5️⃣ Explore Features

- **Conditions**: `/health/conditions`
- **Medications**: `/health/meds`
- **Metrics**: `/health/metrics`

---

## 🔧 File Locations

| What | Where |
|------|-------|
| Database schema | `db/migrations/0001_init.sql` |
| Crypto utilities | `services/eleuthia/crypto.ts` |
| Conditions API | `app/api/health/conditions/route.ts` |
| Meds API | `app/api/health/meds/route.ts` |
| Metrics API | `app/api/health/metrics/route.ts` |
| Conditions UI | `app/health/conditions/page.tsx` |
| Meds UI | `app/health/meds/page.tsx` |
| Metrics UI | `app/health/metrics/page.tsx` |

---

## 📚 Documentation

- **Overview**: `docs/whats-new/v2.1-week4.md`
- **Schema**: `docs/data-map/v2.1.md`
- **Verification**: `docs/how-to/verify-ciphertext.md`

---

## ❌ Troubleshooting

### Data shows as plaintext in D1
- [ ] Check `NEXT_PUBLIC_ELEUTHIA_DEV_KEY` is set
- [ ] Verify `ELEUTHIA.init()` called in component
- [ ] Check form submit code calls `ELEUTHIA.encrypt()`

### Decryption fails on page reload
- [ ] Ensure same dev key used for encrypt/decrypt
- [ ] Check ELEUTHIA initializes before decrypt
- [ ] Look for errors in browser console

### API returns 401
- [ ] Check `x-user-id` header sent with requests
- [ ] Default is "dev-user" (TODO: integrate real auth in Week 6)

---

## 🎯 Test Flow

```
1. Go to /health/conditions
2. Click "Add Condition"
3. Enter: Name="Type 2 Diabetes", Notes="Since 2020"
4. Submit
5. See condition in list (plaintext on UI)
6. Open D1 console
7. Query: SELECT name, notes FROM health_conditions WHERE user_id='dev-user' LIMIT 1;
8. Verify: name and notes are base64 (unreadable)
9. Reload page
10. Condition still shows with decrypted data
11. ✅ Success!
```

---

## 💡 Key Concepts

**Encryption**: Client encrypts before API call
```typescript
const encrypted = await ELEUTHIA.encrypt("sensitive data");
// Call API with encrypted payload
```

**Decryption**: Client decrypts after receiving from API
```typescript
const response = await fetch("/api/health/conditions");
const { data } = await response.json();
// data.name is base64 ciphertext
const decrypted = await ELEUTHIA.decrypt(data.name);
// Now plaintext
```

**Optimistic UI**: Show plaintext immediately, rollback on error
```typescript
// 1. Optimistically add to UI
setConditions(prev => [...prev, newCondition]);
// 2. Call API
const res = await fetch("/api/health/conditions", { method: "POST" });
// 3. If error, rollback (not shown here)
```

---

## 🔐 Security Notes

- Dev key in `.env.local` (NOT committed to git)
- Week 6: Key derivation from auth
- Never log plaintext sensitive fields
- Use HTTPS in production (TLS encrypts in transit)
- D1 breaches: data remains encrypted

---

**Ready?** Start at `/health/conditions` 🚀
