# TRACE_UI-THEME (Phase 5 — Week 13)

## Theme & Primitives
- `app/DesignSystem/context/DesignProvider.tsx` — provides per-user **theme**, **button**, **search** settings via localStorage.
- `app/DesignSystem/components/Button.tsx` — uses DesignProvider to choose Tailwind classes (no CSS).
- `app/DesignSystem/components/SearchInput.tsx` — uses DesignProvider; Enter navigates to `/Classic/SiteMap?q=…`.

## Settings
- `app/Settings/page.tsx` — pick **Theme**, **Button style**, **Search style** (stored locally).

## App chrome
- `app/layout.tsx` — wraps the app in `DesignProvider` and inserts the fixed **App Bar**.
- `app/components/AppBar.tsx` — (existing) imports `SearchInput` and shows global search at top.

## References in code (by path)
- `app/components/AppBar.tsx` — `import SearchInput from "@/app/DesignSystem/components/SearchInput";` (line ~5)
- `**/*.{tsx,ts}` — multiple references to `Button` at `@/app/DesignSystem/components/Button` (various lines).
- `app/Classic/SiteMap/components/SiteMapClient.tsx` — now reads `?q=` query to filter the site map.
