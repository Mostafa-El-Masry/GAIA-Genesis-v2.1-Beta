'use client';

import { useEffect, useState } from 'react';
import type { HealthRecord } from '../lib/types';
import { loadRecords, todayLocal } from '../lib/store';

function hasData(rec: HealthRecord | null): boolean {
  if (!rec) return false;
  return !!(rec.waterMl || rec.sleepHrs || rec.mood || rec.energy || rec.notes);
}

export default function SummaryStrip() {
  const [todayRec, setTodayRec] = useState<HealthRecord | null>(null);
  const [today, setToday] = useState<string>(todayLocal());

  useEffect(() => {
    const all = loadRecords();
    const rec = all.find((r) => r.date === today) || null;
    setTodayRec(rec);
  }, [today]);

  const show = hasData(todayRec);

  return (
    <section className="mb-4 rounded-xl border gaia-border bg-card/60 p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide gaia-muted">
            Today at a glance
          </span>
          <span className="text-[0.7rem] text-muted-foreground">{today}</span>
        </div>

        {show ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-[0.8rem]">
            {todayRec?.waterMl != null && (
              <span>
                <span className="gaia-muted">Water:</span> {todayRec.waterMl} ml
              </span>
            )}
            {todayRec?.sleepHrs != null && (
              <span>
                <span className="gaia-muted">Sleep:</span>{" "}
                {todayRec.sleepHrs.toFixed(1).replace(/\.0$/, "")} h
              </span>
            )}
            {todayRec?.mood != null && (
              <span>
                <span className="gaia-muted">Mood:</span> {todayRec.mood}/5
              </span>
            )}
            {todayRec?.energy != null && (
              <span>
                <span className="gaia-muted">Energy:</span> {todayRec.energy}/5
              </span>
            )}
            {todayRec?.notes && (
              <span className="max-w-xs truncate">
                <span className="gaia-muted">Notes:</span> {todayRec.notes}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No entries yet for today. Use the quick form below to log water, sleep, mood, and a short note.
          </p>
        )}
      </div>
    </section>
  );
}
