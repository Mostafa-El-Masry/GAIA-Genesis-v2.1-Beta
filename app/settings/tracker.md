# Settings — tracker

Files in this feature:

- `app/Settings/page.tsx` — Per-user Settings UI (Theme + primitives baseline)
- `app/Settings/components/ThemePicker.tsx` – Theme selection (per-user Supabase-backed store + `data-theme`)
- `app/Settings/components/PrimitivesPicker.tsx` — Shows baseline Button/Search primitives

References in other features:
- `app/layout.tsx` — wraps the app with `ThemeRoot` (DesignSystem) for theme application
- `app/components/AppBar.tsx` — uses `SearchInput` from DesignSystem
