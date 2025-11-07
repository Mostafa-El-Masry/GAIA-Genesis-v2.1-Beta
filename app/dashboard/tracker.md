# Dashboard — tracker (Week 10 polish)

**Route:** `/dashboard`

**Files**
- `app/dashboard/page.tsx` — Page shell (client-only render for live stats)
- `app/dashboard/components/DashboardClient.tsx` — Sections container
- `app/dashboard/components/Active.tsx` — Live stats: Citadel unlocks, last Academy score, Labs builds, ELEUTHIA vault presence
- `app/dashboard/components/Entry.tsx` — Action cards linking to Citadel, Labs, ELEUTHIA, Settings, Gallery, Intro

**Notes**
- Tailwind-only (no CSS). Reads local-first state keys:
  - `gaia.citadel.progress`
  - `gaia.citadel.academy.results`
  - `eleu.meta` / `eleu.vault` via `hasVault()`
- Depends on Labs utils for build counting.
