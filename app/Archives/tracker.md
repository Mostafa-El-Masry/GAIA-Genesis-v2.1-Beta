# Archives — tracker (Week 14)

**Routes**
- `/Archives` — subjects grid
- `/Archives/[subject]` — lessons with “Teachable” toggle + “Add to Academy”

**Files**
- `app/Archives/page.tsx`
- `app/Archives/components/SubjectsClient.tsx`
- `app/Archives/[subject]/page.tsx`
- `app/Archives/[subject]/components/SubjectClient.tsx`
- `app/Archives/data/subjects.ts`
- `app/Archives/lib/teachables.ts`

**Notes**
- Mark “Teachable” to track what you want to study.
- “Add to Academy” creates a custom Tier‑1 concept in local storage; Academy now shows those items automatically.
