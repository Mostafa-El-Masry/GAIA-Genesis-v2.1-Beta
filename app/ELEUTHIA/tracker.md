# ELEUTHIA — tracker (Week 8 features)

**Routes:** `/ELEUTHIA`, `/ELEUTHIA/Backups`

**New**
- `app/ELEUTHIA/Backups/page.tsx` — Backups inside ELEUTHIA (encrypted export/import + local snapshots)
- `app/ELEUTHIA/Backups/components/BackupsClient.tsx`
- `app/ELEUTHIA/lib/snapshots.ts` — snapshot utilities
- `app/ELEUTHIA/components/ImportChrome.tsx` — Chrome CSV import helper

**Updated**
- `app/ELEUTHIA/components/Vault.tsx` — search refinements (site filter, has-password), Import Chrome CSV button, link to Backups

**Notes**
- Import supports typical Chrome CSV headers; fields are mapped to title/url/username/password.
- Backups are encrypted-only; plaintext export is intentionally not implemented.
