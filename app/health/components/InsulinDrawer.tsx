'use client';

import { useEffect, useMemo, useState } from 'react';
import type { InsulinEntry } from '../lib/types';
import { addInsulin, loadInsulin, removeInsulin, todayLocal } from '../lib/store';

export default function InsulinDrawer({ open, onClose }:{ open:boolean; onClose:()=>void }){
  const [date, setDate] = useState<string>(todayLocal());
  const [time, setTime] = useState<string>(new Date().toTimeString().slice(0,5));
  const [kind, setKind] = useState<'basal'|'bolus'>('bolus');
  const [units, setUnits] = useState<string>('');
  const [context, setContext] = useState<InsulinEntry['context'] | ''>('');
  const [note, setNote] = useState<string>('');
  const [list, setList] = useState<InsulinEntry[]>([]);

  useEffect(()=>{ setList(loadInsulin()); }, [open]);

  function add(){ const u = Number(units); if(!Number.isFinite(u) || u<=0) return;
    const item = addInsulin({ date, time, kind, units: u, context: context || undefined, note: note || undefined });
    setList(prev=>[...prev, item]); setUnits(''); setNote(''); }

  const last7 = useMemo(()=>{ const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-6); const isoCut = cutoff.toISOString().slice(0,10);
    return [...list].filter(e=>e.date >= isoCut).sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time)); }, [list]);
  const weeklyTotal = last7.reduce((sum,e)=>sum+e.units,0);

  return (
    <div className={"fixed inset-0 z-50 " + (open? "" : "pointer-events-none")}>
      <div className={"gaia-overlay absolute inset-0 transition-opacity " + (open? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div className={"gaia-surface gaia-border absolute right-0 top-0 h-full w-full max-w-md border-l shadow-2xl transition-transform " + (open? "translate-x-0" : "translate-x-full")}>
        <div className="gaia-border flex items-center justify-between border-b p-3">
          <div className="font-extrabold">Insulin log</div>
          <button className="gaia-border rounded-lg border px-3 py-1.5 text-sm" onClick={onClose}>Close</button>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="gaia-input rounded-lg border px-3 py-1.5" value={date} onChange={e=>setDate(e.target.value)} />
            <input type="time" className="gaia-input rounded-lg border px-3 py-1.5" value={time} onChange={e=>setTime(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select className="gaia-input rounded-lg border px-3 py-1.5" value={kind} onChange={e=>setKind(e.target.value as any)}>
              <option value="basal">Basal</option>
              <option value="bolus">Bolus</option>
            </select>
            <input type="number" min="0" step="0.5" placeholder="Units" className="gaia-input rounded-lg border px-3 py-1.5" value={units} onChange={e=>setUnits(e.target.value)} />
            <select className="gaia-input rounded-lg border px-3 py-1.5" value={context} onChange={e=>setContext(e.target.value as InsulinEntry['context'] | '')}>
              <option value="">Context (optional)</option>
              <option>pre-meal</option>
              <option>post-meal</option>
              <option>correction</option>
              <option>other</option>
            </select>
          </div>
          <input placeholder="Note (optional)" className="gaia-input w-full rounded-lg border px-3 py-1.5" value={note} onChange={e=>setNote(e.target.value)} />
          <button className="gaia-contrast rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={add}>Add</button>
          <div className="gaia-muted pt-2 text-sm">Last 7 days total: {weeklyTotal} units</div>
          <div className="gaia-panel-soft max-h-[50vh] overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="gaia-panel-soft">
                <tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Time</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Units</th><th className="p-2"></th></tr>
              </thead>
              <tbody>
                {last7.map(e=> (
                  <tr key={e.id} className="gaia-border border-t">
                    <td className="p-2">{e.date}</td>
                    <td className="p-2">{e.time}</td>
                    <td className="p-2 capitalize">{e.kind}</td>
                    <td className="p-2">{e.units}</td>
                    <td className="p-2 text-right"><button className="gaia-border rounded-lg border px-2 py-1 text-xs" onClick={()=>{ removeInsulin(e.id); setList(loadInsulin()); }}>Delete</button></td>
                  </tr>
                ))}
                {last7.length===0 && <tr><td className="gaia-muted p-3 text-center" colSpan={5}>No entries</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
