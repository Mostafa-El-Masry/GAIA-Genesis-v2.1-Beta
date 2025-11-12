# How to Verify Ciphertext in D1

This guide helps you verify that sensitive data is properly encrypted and unreadable in the D1 database.

## Overview

When you add a health record with encrypted fields (e.g., a condition name), the data stored in D1 should be **base64-encoded ciphertext**, not plaintext. This document shows how to verify this.

---

## Step-by-Step Verification

### 1. Add a Test Record

Navigate to `/health/conditions` and create a new condition:
- **Name**: "Test Condition for Verification"
- **Notes**: "This is a test to verify encryption"

The UI should show the plaintext immediately (optimistic update), but the stored data should be encrypted.

### 2. Access D1 Console

#### Option A: Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **D1**
3. Select your database (e.g., `gaia_db`)
4. Click **Console**

#### Option B: Wrangler CLI

```bash
wrangler d1 shell gaia_db
```

### 3. Query the Encrypted Data

In the D1 console, run:

```sql
SELECT id, user_id, name, notes, created_at
FROM health_conditions
WHERE user_id = 'dev-user'
ORDER BY created_at DESC
LIMIT 1;
```

### 4. Verify the Output

**Expected Result** (Encrypted):
```
id                                  | user_id  | name                            | notes                           | created_at
------------------------------------|----------|--------------------------------|--------------------------------|----------------
cond-abc123                         | dev-user | KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBc | aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2 | 1699000000000
```

The `name` and `notes` fields should be **unreadable base64 gibberish**.

**Incorrect Result** (Plaintext - RED FLAG 🚨):
```
id                                  | user_id  | name                | notes                           | created_at
------------------------------------|----------|---------------------|--------------------------------|----------------
cond-abc123                         | dev-user | Test Condition      | This is a test to verify...    | 1699000000000
```

If you see plaintext, the encryption is **not working**. Debug with:
1. Check `NEXT_PUBLIC_ELEUTHIA_DEV_KEY` is set in `.env.local`
2. Verify ELEUTHIA is initialized before submit: `await ELEUTHIA.init(...)`
3. Check form submit code is calling `ELEUTHIA.encrypt(...)` correctly

---

## Decryption Verification

### In Browser Console

After logging a metric and viewing it on the page, the client has already decrypted it. To verify decryption:

1. Open browser DevTools (F12)
2. Go to **Console**
3. Check the Network tab for the API response - should see base64 ciphertext

### Example: Decrypt a Ciphertext Manually

In browser console:

```javascript
import { ELEUTHIA } from "@/services/eleuthia/crypto";

// Initialize
await ELEUTHIA.init({ devKey: "your-dev-key-here" });

// Copy the ciphertext from D1
const ciphertext = "KgJmK3Z9pL2mN1qOr4sT5uVwXyZaBcDeFg==";

// Decrypt
const plaintext = await ELEUTHIA.decrypt(ciphertext);
console.log(plaintext); // Should output original plaintext
```

---

## Metrics: Plaintext vs. Encrypted

For `health_metrics`, some fields are intentionally **plaintext** for trending queries:

```sql
SELECT id, user_id, date, weight, bg_fasting, bg_post, notes
FROM health_metrics
WHERE user_id = 'dev-user'
ORDER BY date DESC
LIMIT 1;
```

**Expected Output**:
```
id           | user_id  | date          | weight | bg_fasting | bg_post | notes (ENC)
-------------|----------|---------------|--------|------------|---------|---------------------------
metric-xyz   | dev-user | 1699000000000 | 75.5   | 110        | 180     | KgJmK3Z9pL2mN1qOr4sT5uVwXy
```

- `weight`, `bg_fasting`, `bg_post`: **PLAIN** (readable)
- `notes`: **ENCRYPTED** (base64 gibberish)

This design allows the app to run analytics on weight trends without ever reading plaintext sensitive notes.

---

## Common Issues & Debugging

### Issue 1: Data Stored as Plaintext

**Symptom**: D1 shows readable data, but should be encrypted.

**Debug Steps**:
1. Check API route (`app/api/health/conditions/route.ts`) receives encrypted data:
   ```typescript
   console.log("Received payload:", body); // Should see base64
   ```
2. Verify `NEXT_PUBLIC_ELEUTHIA_DEV_KEY` environment variable is set
3. Check browser console for ELEUTHIA init errors

### Issue 2: Cannot Decrypt After Reload

**Symptom**: Data stored encrypted, but decryption fails on reload.

**Debug Steps**:
1. Verify same dev key is used for encryption and decryption
2. Check if `ELEUTHIA.init()` is called before `ELEUTHIA.decrypt()`
3. Look for errors in browser console

### Issue 3: Ciphertext Looks Garbled

**Expected**: Ciphertext should be valid base64 (alphanumeric + `+/=`)

**If Not**:
- Check that `ELEUTHIA.encrypt()` returns valid base64
- Verify IV is 12 bytes, not corrupted
- Check crypto algorithm settings in `services/eleuthia/crypto.ts`

---

## Performance Notes

### Encrypted Queries

Since encrypted data is opaque to D1, the following queries **cannot be optimized**:

```sql
-- DON'T: This won't work (comparing encrypted values)
SELECT * FROM health_conditions WHERE name = 'diabetes';
```

Instead, always:
1. Fetch records by user/ID
2. Decrypt on client
3. Filter in application logic

### Indexes

Current indexes are on **plaintext** fields only:
```sql
CREATE INDEX idx_health_conditions_user_id ON health_conditions(user_id);
```

This allows efficient user-scoped queries, but encrypted `name` fields cannot be indexed.

---

## Security Checklist

- [ ] Sensitive fields are encrypted before API call
- [ ] D1 shows base64 ciphertext, not plaintext
- [ ] Decryption works correctly on client
- [ ] Dev key in `.env.local` is not committed to git
- [ ] All health data uses consistent key/algorithm
- [ ] No plaintext logging of sensitive fields
- [ ] API only accepts/stores ciphertext

---

## Additional Resources

- [ELEUTHIA Crypto Module](../../services/eleuthia/crypto.ts)
- [Data Map](./v2.1.md)
- [Week 4 Release Notes](../whats-new/v2.1-week4.md)
- [WebCrypto API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

**Last Updated**: November 2025
