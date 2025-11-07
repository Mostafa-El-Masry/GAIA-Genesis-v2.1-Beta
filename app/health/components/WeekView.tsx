'use client';

import { useEffect, useMemo, useState } from 'react';
import type { HealthRecord } from '../lib/types';
import { loadRecords } from '../lib/store';

function daysBack(n: number): string {
  const d = new Date(); d.setDate(d.getDate()-n);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function spark(values: number[], w=120, h=32): string {
  if (values.length===0) return '';
  const min = Math.min(...values), max = Math.max(...values);
  const span = Math.max(1, max-min), step = w/(values.length-1 || 1);
  const pts = values.map((v,i)=>{ const x = i*step; const y = h - ((v-min)/span)*h; return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ');
  return `M0,${h} L ${pts} L ${w},${h} Z`;
}

export default function WeekView(){
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const days = [...Array(7)].map((_,i)=>daysBack(6-i));
  useEffect(()=>{ setRecords(loadRecords()); }, []);

  const list = days.map(d => records.find(r=>r.date===d) || {date:d});
  const water = list.map(r=>r.waterMl ?? 0);
  const sleep = list.map(r=>r.sleepHrs ?? 0);
  const avg = (arr:number[]) => (arr.reduce((a,b)=>a+b,0) / (arr.length||1));
  const textSummary = useMemo(()=>[
    `Week ${days[0]} .. ${days[6]}`,
    `Water avg: ${Math.round(avg(water))} ml`,
    `Sleep avg: ${avg(sleep).toFixed(1)} h`,
    `Notes: ${list.map(r=>r.notes).filter(Boolean).slice(-2).join(' | ') || '-'}`
  ].join('\n'), [records]);

  return (
    <section className="gaia-panel rounded-xl border p-4 shadow-sm">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-wide">This week</h2>
        <button className="gaia-contrast rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={()=>navigator.clipboard.writeText(textSummary)}>Copy weekly summary</button>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="gaia-panel-soft rounded-lg border p-3">
          <div className="gaia-muted text-sm font-semibold">Water (ml)</div>
          <svg className="gaia-ink-line mt-1 h-8 w-full" viewBox="0 0 120 32" preserveAspectRatio="none">
            <path d={spark(water)} fill="currentColor" />
          </svg>
          <div className="gaia-muted text-sm mt-1">Avg: {Math.round(avg(water))} ml</div>
        </div>
        <div className="gaia-panel-soft rounded-lg border p-3">
          <div className="gaia-muted text-sm font-semibold">Sleep (hrs)</div>
          <svg className="gaia-ink-line mt-1 h-8 w-full" viewBox="0 0 120 32" preserveAspectRatio="none">
            <path d={spark(sleep)} fill="currentColor" />
          </svg>
          <div className="gaia-muted text-sm mt-1">Avg: {avg(sleep).toFixed(1)} h</div>
        </div>
      </div>
    </section>
  );
}
