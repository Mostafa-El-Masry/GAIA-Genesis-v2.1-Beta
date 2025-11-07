# GAIA v1.3 — Week 5: Health (merged with Exercises)

Route: /health

Components:
- TodayQuick — water, sleep, mood, energy, notes for a date.
- WeekView — 7-day sparkline for water & sleep + copy summary.
- HabitList — simple habits with per-day checkboxes + streak.
- Exercises — plan vs actual logging (minutes/reps) + daily summary.
- InsulinDrawer — right-side drawer for insulin entries (weekly total).
- BodyCheck — monthly metrics & body photos (photos in IndexedDB).
- ExportImport — JSON round-trip (photos excluded).

Lib:
- types.ts, store.ts, photos.ts

Notes:
- All client files start with 'use client' as the first line.
- Styling is Tailwind inline in TSX.
- Local only (LocalStorage + IndexedDB).
