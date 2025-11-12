# TODO v2.0.6 — tracker

This feature adds a Dashboard widget (Daily 3) and a simple TODO list page.

## Files

- `app/Dashboard/components/TodoDaily.tsx` — main "Daily 3" widget for the Dashboard
- `app/Dashboard/components/TodoSlot.tsx` — renders one category slot (Life / Work / Distraction)
- `app/Dashboard/components/TodoQuickAdd.tsx` — inline quick add form for empty slots
- `app/Dashboard/hooks/useTodoDaily.ts` — state, storage, ranking, and actions hook
- `app/TODO/page.tsx` — simple page listing all tasks (seed for future management UI)

## Notes

- Storage is localStorage now using key `gaia.todo.v2.0.6`.
- Timezone is fixed to `Asia/Kuwait` for daily reset and date display.
- Ranking: pinned → priority desc → due_date asc → created_at asc.
- Candidate pool: (repeat matches today) OR (due_date ≤ today), excluding tasks marked done/skipped for today.
- Daily selections are stored per-day under `gaia.todo.v2.0.6.selection.<YYYY-MM-DD>`.
