# GAIA Supabase server API

This document explains the small server-side API added at `app/api/user-storage/route.ts`.

What it does
- Provides GET /api/user-storage — returns all key/value pairs for the authenticated user.
- Provides POST /api/user-storage — upserts a key/value pair for the authenticated user. Send JSON { key: string, value: string }. If value is null use DELETE semantics.
- Provides DELETE /api/user-storage?key=... — deletes the given key for the authenticated user.

Authentication
- The routes expect an Authorization header: `Authorization: Bearer <access_token>`.
- The server code validates the token using the Supabase admin client (service role key) then performs operations scoped to that user.

Setup
1. Ensure these environment variables are set for your Next.js runtime:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

2. Create the `user_storage` table in your Supabase project (SQL provided in `sql/001_create_user_storage.sql`).

Quick testing (dev)
1. Start dev server:
```powershell
npm install
npm run dev
```
2. Sign in with Supabase auth in the app to get a session.
3. In the browser devtools console get the access token:
```js
// in browser console
const token = (await fetch('/api/auth/session').then(r=>r.json())).access_token; // if you expose session endpoint; otherwise read supabase client session
```
4. Call the server API (example with fetch):
```js
// list all keys
fetch('/api/user-storage', { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).then(console.log)

// upsert a key
fetch('/api/user-storage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ key: 'gaia.dailytrio.v1', value: JSON.stringify({/*...*/}) }),
}).then(r=>r.json()).then(console.log)

// delete a key
fetch('/api/user-storage?key=gaia.dailytrio.v1', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).then(console.log)
```

Notes and caveats
- The code uses the Supabase service role key on the server — keep it secret.
- For normal client operations the existing `lib/user-storage.ts` already persists client-side using the Supabase client; these routes provide a server-side alternative if you need server-handled fetches or batch operations.
