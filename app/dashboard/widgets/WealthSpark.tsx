'use client';

import { useEffect, useState } from 'react';

/**
 * Wealth sparkline: looks for wealth_history = [number,…] or similar.
 */
function readJSON(key:string){ try{ const r=localStorage.getItem(key); return r?JSON.parse(r):null; }catch{ return null; } }

export default function WealthSpark(){
  const [points, setPoints] = useState<number[]>([]);

  useEffect(()=>{
    let arr:number[] = [];
    const cand = readJSON('wealth_history') || readJSON('wealth_balances');
    if (Array.isArray(cand)){
      arr = cand.map((x:any)=> Number(x?.total ?? x)).filter((n:any)=>!isNaN(n));
    }
    if (arr.length===0){
      // small dummy trend if none
      arr = [0, 2, 4, 7, 11, 16, 22, 29].map(n=> n*1000);
    }
    setPoints(arr.slice(-30));
  }, []);

  if (!points.length) return <div className="text-sm gaia-muted">No data</div>;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v:number)=> (max===min? 0.5 : (v-min)/(max-min));
  const w = 320, h = 64;
  const step = points.length>1 ? w/(points.length-1) : w;
  const d = points.map((p,i)=> `${i===0?'M':'L'} ${i*step},${(1-norm(p))*h}`).join(' ');

  return (
    <svg width={w} height={h} className="block">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
