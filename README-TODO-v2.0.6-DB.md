# TODO v2.0.6 — DB Sync (Supabase)

This adds **Supabase** sync (server API routes using service role). Local-first remains; if API fails, app stays usable.

## What’s inside
- `supabase/schema.sql` — tables + RLS policies.
- `lib/supabaseAdmin.ts` — server-only Supabase client (service role).
- `app/api/todo/route.ts` — GET/POST/PATCH/DELETE tasks.
- `app/api/todo/status/route.ts` — POST daily status (done/skipped).
- `app/Dashboard/hooks/useTodoDaily.ts` — updated hook with hydrate + optimistic writes.

## Setup (5 minutes)
1. **Install dep**
   ```bash
   npm i @supabase/supabase-js
   ```
2. **Create tables in Supabase**
   - Open Supabase SQL editor → paste `supabase/schema.sql` → Run.
3. **Env vars (server)**
   Add to `.env.local`:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only
   TODO_USER_ID=00000000-0000-0000-0000-000000000001 # single-user baseline
   ```
   > Keep `SERVICE_ROLE_KEY` private (server only).

4. **Restart dev server**

5. **Test**
   - Open Dashboard, add tasks via **Quick Add**.
   - Check Supabase tables `tasks` and `task_day_status` — entries should appear.

## Notes
- RLS is **enabled**, but these server routes use the **service role** (bypasses RLS) for a single-user baseline.
- Later, replace `TODO_USER_ID` with the real `auth.uid()` by adding Supabase Auth, then switch API routes to the standard anon key and RLS policies.
- If API is misconfigured or Supabase is down, the widget continues in **local-only** mode.
