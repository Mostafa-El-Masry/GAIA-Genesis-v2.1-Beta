# Citadel — tracker (Week 14 feed from Archives)

**Updated**
- `app/Citadel/components/Academy.tsx` — merges built-in concepts with custom ones (from Archives).
- `app/Citadel/lib/customConcepts.ts` — reads `gaia.citadel.customConcepts` (populated via Archives “Add to Academy”).

**Notes**
- Custom concepts are stored locally and treated as Tier‑1 for now (nodeId `<trackId>-t1`). Unlock behavior remains consistent.
