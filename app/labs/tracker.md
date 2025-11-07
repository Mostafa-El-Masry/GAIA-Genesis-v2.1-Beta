# Labs — tracker (Week 6)

**Route:** `/Labs`

**Files**
- `app/Labs/page.tsx` — Page shell
- `app/Labs/components/LabsClient.tsx` — Lists private builds from Academy
- `app/Labs/components/BuildCard.tsx` — Renders embed/notes for each build
- `app/Labs/lib/labs.ts` — Reads Academy results + notes from localStorage, parses first URL for embed

**Notes**
- Private by default; reads from local storage only.
- If a note contains a URL, an iframe preview appears. Otherwise, the note text is shown.
