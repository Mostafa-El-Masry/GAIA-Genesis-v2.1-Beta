'use client';

import { useEffect, useState } from 'react';
import type { LabCategory } from '../lib/types';

export type SortKey = 'newest' | 'trend';

export default function Controls({
  initialQuery='',
  initialCat='All',
  initialSort='newest',
  onChange
}:{ initialQuery?: string; initialCat?: 'All'|LabCategory; initialSort?: SortKey; onChange:(s:{q:string; cat:'All'|LabCategory; sort:SortKey})=>void }) {
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState<'All'|LabCategory>(initialCat as any);
  const [sort, setSort] = useState<SortKey>(initialSort);

  useEffect(()=>{ onChange({ q, cat, sort }); /* eslint-disable-next-line */ }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e)=>{ setQ(e.target.value); onChange({ q: e.target.value, cat, sort }); }}
          placeholder="Search title or tags..."
          className="gaia-input w-[260px] rounded-lg border px-3 py-1.5"
        />
        <div className="hidden sm:block text-sm opacity-50">/labs?open=&lt;slug&gt;</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {(['All','HTML','CSS','JS'] as const).map(c => (
          <button
            key={c}
            onClick={()=>{ setCat(c); onChange({ q, cat:c, sort }); }}
            className={'rounded-lg border px-3 py-1.5 text-sm font-semibold ' + (cat===c ? 'gaia-contrast' : 'gaia-border')}
          >
            {c}
          </button>
        ))}
        <select value={sort} onChange={(e)=>{ const v = e.target.value as SortKey; setSort(v); onChange({ q, cat, sort:v }); }} className="gaia-input rounded-lg border px-3 py-1.5">
          <option value="newest">Newest</option>
          <option value="trend">Trend</option>
        </select>
      </div>
    </div>
  );
}
