# TODO v2.0.6 — Implementation (Dashboard "Daily 3")

This ZIP contains the **Dashboard widget** for Daily 3 (Life / Work / Distraction), plus a basic `/TODO` page.
No external deps. Tailwind-only. Local-first storage (will wire DB in the next sprint).

## Install

1) Unzip at your project root — it will create/update:
```
app/Dashboard/components/TodoDaily.tsx
app/Dashboard/components/TodoSlot.tsx
app/Dashboard/components/TodoQuickAdd.tsx
app/Dashboard/hooks/useTodoDaily.ts
app/TODO/page.tsx
app/TODO/tracker.md
TRACE_UI-THEME.md
```

2) **Render the widget in the Dashboard** (where you want it inside the "Active" section):
```tsx
// app/Dashboard/page.tsx (or the component that renders "Active")
import dynamic from "next/dynamic";
const TodoDaily = dynamic(() => import("./components/TodoDaily"), { ssr: false });

export default function DashboardPage() {
  return (
    <main className="p-4">
      {/* ...your existing cards... */}
      <TodoDaily />
      {/* ...rest... */}
    </main>
  );
}
```
> `dynamic(..., { ssr:false })` ensures the widget only renders on the client (it uses localStorage).

3) **Run dev** and visit Dashboard. You should see the "Daily 3 · YYYY-MM-DD" card.

## Usage

- Click **Quick Add** in any empty slot to add a task for **today** in that category.
- Use **Done**, **Skip**, or **Next** to manage the daily selection.
- Basic edit is available via the `⋯` menu (Pin/Unpin, Increase priority, Delete).

## Local storage keys

- `gaia.todo.v2.0.6` — task store
- `gaia.todo.v2.0.6.selection.<YYYY-MM-DD>` — per-day chosen task IDs

## Timezone

- All daily logic uses **Asia/Kuwait**. The header shows today's date in that timezone.

## Next (DB sync — planned)

- Supabase tables: `tasks`, `task_day_status` with RLS.
- Hydrate local cache from server on load; optimistic writes; background sync.

Enjoy!
