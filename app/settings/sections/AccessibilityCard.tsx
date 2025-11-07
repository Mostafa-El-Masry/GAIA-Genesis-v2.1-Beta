'use client';

import { useEffect, useState } from 'react';

export default function AccessibilityCard(){
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);

  useEffect(()=>{
    try{
      const r = localStorage.getItem('settings_reduceMotion'); if (r) setReduceMotion(JSON.parse(r));
      const hc = localStorage.getItem('settings_highContrast'); if (hc) setHighContrast(JSON.parse(hc));
      const ul = localStorage.getItem('settings_underlineLinks'); if (ul) setUnderlineLinks(JSON.parse(ul));
    }catch{}
  }, []);

  useEffect(()=>{
    localStorage.setItem('settings_reduceMotion', JSON.stringify(reduceMotion));
    localStorage.setItem('settings_highContrast', JSON.stringify(highContrast));
    localStorage.setItem('settings_underlineLinks', JSON.stringify(underlineLinks));
  }, [reduceMotion, highContrast, underlineLinks]);

  return (
    <section className="gaia-panel rounded-xl border p-4 shadow-sm">
      <div className="mb-2 font-semibold">Accessibility</div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="gaia-panel-soft flex items-center justify-between gap-3 rounded-lg border p-3">
          <span className="text-sm">Reduce motion</span>
          <input type="checkbox" checked={reduceMotion} onChange={e=>setReduceMotion(e.target.checked)} />
        </label>
        <label className="gaia-panel-soft flex items-center justify-between gap-3 rounded-lg border p-3">
          <span className="text-sm">High-contrast text</span>
          <input type="checkbox" checked={highContrast} onChange={e=>setHighContrast(e.target.checked)} />
        </label>
        <label className="gaia-panel-soft flex items-center justify-between gap-3 rounded-lg border p-3 sm:col-span-2">
          <span className="text-sm">Underline links</span>
          <input type="checkbox" checked={underlineLinks} onChange={e=>setUnderlineLinks(e.target.checked)} />
        </label>
      </div>
    </section>
  );
}
