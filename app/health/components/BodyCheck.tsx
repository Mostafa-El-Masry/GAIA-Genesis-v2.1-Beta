'use client';

import { useEffect, useState } from 'react';
import type { BodyMetric } from '../lib/types';
import { addBody, loadBody, todayLocal } from '../lib/store';
import { savePhoto, listPhotos, getPhotoBlob, removePhoto } from '../lib/photos';

export default function BodyCheck(){
  const [date, setDate] = useState<string>(todayLocal());
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [bodyFatPct, setBodyFatPct] = useState<string>('');
  const [waistCm, setWaistCm] = useState<string>('');
  const [list, setList] = useState<BodyMetric[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [urls, setUrls] = useState<Record<string,string>>({});

  useEffect(()=>{
    setList(loadBody());
    (async()=>{
      const metas = await listPhotos(); setPhotos(metas);
      const map: Record<string,string> = {};
      for (const m of metas){ const b = await getPhotoBlob(m.id); if(b){ map[m.id] = URL.createObjectURL(b);} }
      setUrls(map);
      return ()=>{ Object.values(map).forEach(u=>URL.revokeObjectURL(u)); };
    })();
  }, []);

  function addEntry(){
    const item = addBody({
      date,
      heightCm: heightCm? Number(heightCm): undefined,
      weightKg: weightKg? Number(weightKg): undefined,
      bodyFatPct: bodyFatPct? Number(bodyFatPct): undefined,
      waistCm: waistCm? Number(waistCm): undefined
    });
    setList(prev=>[...prev, item]);
    setWeightKg(''); setBodyFatPct(''); setWaistCm('');
  }

  async function onPhotoChange(e: any, kind: 'front'|'side'|'other'){
    const f = e.target.files?.[0]; if(!f) return;
    const id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2,10)) + Math.random().toString(36).slice(2,10);
    await savePhoto({ meta: { id, date, kind, name: f.name, type: f.type, size: f.size }, blob: f });
    const metas = await listPhotos(); setPhotos(metas);
    const b = await getPhotoBlob(id); if (b){ setUrls(prev=>({...prev, [id]: URL.createObjectURL(b)})); }
    e.currentTarget.value='';
  }

  return (
    <section className="gaia-panel rounded-xl border p-4 shadow-sm">
      <header className="mb-2"><h2 className="text-lg font-extrabold tracking-wide">Body check (monthly)</h2></header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="gaia-panel-soft rounded-lg border p-3">
          <div className="gaia-muted text-sm font-semibold mb-2">Metrics</div>
          <div className="mb-2">
            <label className="gaia-muted text-sm">Date</label>
            <input type="date" className="gaia-input mt-1 w-full rounded-lg border px-3 py-1.5" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Height (cm)" type="number" className="gaia-input rounded-lg border px-3 py-1.5" value={heightCm} onChange={e=>setHeightCm(e.target.value)} />
            <input placeholder="Weight (kg)" type="number" className="gaia-input rounded-lg border px-3 py-1.5" value={weightKg} onChange={e=>setWeightKg(e.target.value)} />
            <input placeholder="Body fat % (opt)" type="number" className="gaia-input rounded-lg border px-3 py-1.5" value={bodyFatPct} onChange={e=>setBodyFatPct(e.target.value)} />
            <input placeholder="Waist (cm) (opt)" type="number" className="gaia-input rounded-lg border px-3 py-1.5" value={waistCm} onChange={e=>setWaistCm(e.target.value)} />
          </div>
          <button className="gaia-contrast mt-2 rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={addEntry}>Add entry</button>
        </div>

        <div className="gaia-panel-soft rounded-lg border p-3 sm:col-span-2 lg:col-span-3">
          <div className="gaia-muted text-sm font-semibold mb-2">Body photos</div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="gaia-border rounded-lg border px-3 py-1.5 text-sm font-semibold cursor-pointer">Upload front<input type="file" accept="image/*" className="hidden" onChange={e=>onPhotoChange(e,'front')} /></label>
            <label className="gaia-border rounded-lg border px-3 py-1.5 text-sm font-semibold cursor-pointer">Upload side<input type="file" accept="image/*" className="hidden" onChange={e=>onPhotoChange(e,'side')} /></label>
            <label className="gaia-border rounded-lg border px-3 py-1.5 text-sm font-semibold cursor-pointer">Upload other<input type="file" accept="image/*" className="hidden" onChange={e=>onPhotoChange(e,'other')} /></label>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.slice().reverse().map(m => (
              <div key={m.id} className="gaia-panel-soft rounded-lg border p-2">
                {urls[m.id] ? <img src={urls[m.id]} alt={m.name} className="aspect-[4/5] w-full rounded-md object-cover" /> : <div className="gaia-ink-faint aspect-[4/5] w-full rounded-md" />}
                <div className="mt-1 text-sm font-semibold">{m.date} - {m.kind}</div>
                <div className="gaia-muted text-xs">{(m.size/1024).toFixed(0)} KB</div>
                <button className="gaia-border mt-2 rounded-lg border px-2 py-1 text-xs" onClick={async()=>{ await removePhoto(m.id); const metas = await listPhotos(); setPhotos(metas); }}>Delete</button>
              </div>
            ))}
            {photos.length === 0 && <div className="gaia-muted">No photos yet</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
