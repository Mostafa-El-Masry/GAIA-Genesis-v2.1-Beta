'use client';

import TodayQuick from './components/TodayQuick';
import WeekView from './components/WeekView';
import HabitList from './components/HabitList';
import InsulinDrawer from './components/InsulinDrawer';
import BodyCheck from './components/BodyCheck';
import ExportImport from './components/ExportImport';
import Exercises from './components/Exercises';
import { useState } from 'react';

export default function HealthPage(){
  const [insulinOpen, setInsulinOpen] = useState(false);
  return (
    <main className="min-h-screen gaia-surface-soft">
      <div className="fixed left-4 top-4 z-40">
        <a href="/" className="inline-flex items-center gap-2 rounded-lg border gaia-border gaia-surface px-3 py-1.5 text-sm font-semibold shadow-sm">{'<- GAIA'}</a>
      </div>
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="gaia-strong text-2xl font-extrabold tracking-wide">Health - Week 5</h1>
          <div className="flex items-center gap-2">
            <button className="gaia-border gaia-surface rounded-lg px-3 py-1.5 text-sm font-semibold shadow-sm" onClick={()=>setInsulinOpen(true)}>Insulin</button>
          </div>
        </div>
        <TodayQuick />
        <WeekView />
        <HabitList />
        <Exercises />
        <BodyCheck />
        <ExportImport />
      </div>
      <InsulinDrawer open={insulinOpen} onClose={()=>setInsulinOpen(false)} />
    </main>
  );
}
