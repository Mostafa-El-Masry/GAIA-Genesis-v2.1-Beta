# Labs — tracker (Week 6)

**Route:** `/Labs`

**Files**
- `app/Labs/page.tsx` — Page shell
- `app/Labs/components/LabsClient.tsx` — Lists private builds from Academy
- `app/Labs/components/BuildCard.tsx` – Renders embed/notes for each build
- `app/Labs/lib/labs.ts` – Reads Academy results + notes from the per-user Supabase store, parses first URL for embed

**Notes**
- Private by default; data comes from the authenticated Supabase-backed user store.
- If a note contains a URL, an iframe preview appears. Otherwise, the note text is shown.
