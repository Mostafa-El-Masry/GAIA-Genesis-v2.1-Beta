'use client';

import { useEffect, useState } from 'react';

export default function SceneCard(){
  const [landing, setLanding] = useState<'/'|'/gallery'|'/dashboard'|'/search'>('/');
  const [introStyle, setIntroStyle] = useState<'gaia-only'|'gaia-glass'>('gaia-glass');

  useEffect(()=>{
    try{
      const l = localStorage.getItem('settings_landing'); if (l) setLanding(JSON.parse(l));
      const i = localStorage.getItem('settings_introStyle'); if (i) setIntroStyle(JSON.parse(i));
    }catch{}
  }, []);

  useEffect(()=>{
    localStorage.setItem('settings_landing', JSON.stringify(landing));
    localStorage.setItem('settings_introStyle', JSON.stringify(introStyle));
  }, [landing, introStyle]);

  return (
    <section className="gaia-panel rounded-xl border p-4 shadow-sm">
      <div className="mb-2 font-semibold">Scene preferences</div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="gaia-panel-soft flex items-center justify-between gap-3 rounded-lg border p-3">
          <span className="text-sm">Default landing page</span>
          <select value={landing} onChange={e=>setLanding(e.target.value as any)} className="gaia-input rounded border px-2 py-1 text-sm">
            <option value="/">Intro</option>
            <option value="/gallery">Gallery</option>
            <option value="/dashboard">Dashboard</option>
            <option value="/search">Search</option>
          </select>
        </label>

        <label className="gaia-panel-soft flex items-center justify-between gap-3 rounded-lg border p-3">
          <span className="text-sm">Intro style</span>
          <select value={introStyle} onChange={e=>setIntroStyle(e.target.value as any)} className="gaia-input rounded border px-2 py-1 text-sm">
            <option value="gaia-only">GAIA only</option>
            <option value="gaia-glass">GAIA + glass search</option>
          </select>
        </label>
      </div>
    </section>
  );
}
