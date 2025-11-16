'use client';

import { useCallback, useState } from 'react';
import {
  exportAll,
  importAll,
  loadBody,
  loadHabits,
  loadInsulin,
  loadLogs,
  loadPlans,
  loadRecords,
} from '../lib/store';

type Snapshot = {
  records: number;
  habits: number;
  insulin: number;
  body: number;
  plans: number;
  workouts: number;
};

function takeSnapshot(): Snapshot {
  return {
    records: loadRecords().length,
    habits: loadHabits().length,
    insulin: loadInsulin().length,
    body: loadBody().length,
    plans: loadPlans().length,
    workouts: loadLogs().length,
  };
}

export default function ExportImport() {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => takeSnapshot());
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setSnapshot(takeSnapshot());
  }, []);

  function handleExport() {
    exportAll();
    setStatus(`Exported ${new Date().toLocaleTimeString()}`);
  }

  async function handleImport() {
    setBusy(true);
    setStatus('Importing...');
    try {
      let didImport = false;
      await importAll(() => {
        didImport = true;
        refresh();
      });
      setStatus(
        didImport ? `Import complete ${new Date().toLocaleTimeString()}` : 'Import canceled'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="gaia-panel rounded-xl border p-4 shadow-sm">
      <header className="mb-2">
        <h2 className="text-lg font-extrabold tracking-wide">Export / Import</h2>
        <p className="gaia-muted text-sm">
          Download a local backup of your health data (photos are stored separately) or import a
          JSON export to restore it. Files stay on your device; GAIA never uploads this data
          anywhere.
        </p>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          className="gaia-contrast rounded-lg border px-3 py-1.5 text-sm font-semibold"
          type="button"
          onClick={handleExport}
          disabled={busy}
        >
          Download export
        </button>
        <button
          className="gaia-border rounded-lg border px-3 py-1.5 text-sm font-semibold"
          type="button"
          onClick={handleImport}
          disabled={busy}
        >
          {busy ? 'Importing...' : 'Import from file'}
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div className="gaia-panel-soft rounded-lg border p-2">
          <dt className="gaia-muted font-semibold">Daily records</dt>
          <dd className="text-base font-bold">{snapshot.records}</dd>
        </div>
        <div className="gaia-panel-soft rounded-lg border p-2">
          <dt className="gaia-muted font-semibold">Habits</dt>
          <dd className="text-base font-bold">{snapshot.habits}</dd>
        </div>
        <div className="gaia-panel-soft rounded-lg border p-2">
          <dt className="gaia-muted font-semibold">Insulin entries</dt>
          <dd className="text-base font-bold">{snapshot.insulin}</dd>
        </div>
        <div className="gaia-panel-soft rounded-lg border p-2">
          <dt className="gaia-muted font-semibold">Body metrics</dt>
          <dd className="text-base font-bold">{snapshot.body}</dd>
        </div>
        <div className="gaia-panel-soft rounded-lg border p-2">
          <dt className="gaia-muted font-semibold">Exercise plan items</dt>
          <dd className="text-base font-bold">{snapshot.plans}</dd>
        </div>
        <div className="gaia-panel-soft rounded-lg border p-2">
          <dt className="gaia-muted font-semibold">Workout logs</dt>
          <dd className="text-base font-bold">{snapshot.workouts}</dd>
        </div>
      </dl>

      {status && <p className="gaia-muted mt-3 text-xs uppercase tracking-wide">{status}</p>}
    </section>
  );
}
