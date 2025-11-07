'use client';

import { useEffect, useMemo, useState } from "react";
import Button from "@/app/DesignSystem/components/Button";
import { subjects, type Subject, type Lesson } from "../../data/subjects";
import { isTeachable, toggleTeachable, addLessonToAcademy } from "../../lib/teachables";

export default function SubjectClient({ subjectId }: { subjectId: string }) {
  const subj = useMemo<Subject | undefined>(() => subjects.find(s => s.id === subjectId), [subjectId]);
  const [teach, setTeach] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!subj) return;
    const map: Record<string, boolean> = {};
    subj.lessons.forEach(l => { map[l.id] = isTeachable(l.id); });
    setTeach(map);
  }, [subj]);

  if (!subj) {
    return <div className="gaia-callout gaia-callout-negative p-4 text-sm">Unknown subject.</div>;
  }

  const onToggle = (l: Lesson, on: boolean) => {
    toggleTeachable(l.id, on);
    setTeach(prev => ({ ...prev, [l.id]: on }));
  };

  const onAddToAcademy = (l: Lesson) => {
    const c = addLessonToAcademy(subj, l);
    alert(`Added to Academy: ${c.title}`);
  };

  return (
    <div className="space-y-4">
      <header>
        <div className="text-xs gaia-muted">Track: {subj.trackTitle}</div>
        <h2 className="text-lg font-semibold">{subj.title}</h2>
      </header>

      <ol className="space-y-3">
        {subj.lessons.map(l => (
          <li key={l.id} className="rounded border gaia-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{l.title}</div>
                <div className="text-sm gaia-text-default">{l.summary}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!teach[l.id]} onChange={(e) => onToggle(l, e.target.checked)} />
                  Teachable
                </label>
                <Button onClick={() => onAddToAcademy(l)} className="shrink-0">Add to Academy</Button>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs gaia-muted">
        Marking “Teachable” helps you track what to study. “Add to Academy” creates a Tier‑1 concept that shows up in the Academy list.
      </p>
    </div>
  );
}
