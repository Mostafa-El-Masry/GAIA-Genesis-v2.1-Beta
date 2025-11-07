'use client';

import { useMemo, useState } from "react";

type Datum = { label: string; value: number };

// Simple exponential scaler to make differences more visible
function expScale(value: number, min: number, max: number, k = 1.6) {
  if (max <= min) return 50;
  const t = (value - min) / (max - min); // 0..1
  const s = Math.pow(t, k); // emphasize highs
  return Math.round(10 + s * 80); // 10%..90%
}

export default function TrendBars({ title = "Health trend", data }: { title?: string; data: Datum[] }) {
  const [k, setK] = useState(1.6);
  const min = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const max = useMemo(() => Math.max(...data.map(d => d.value)), [data]);

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2 text-xs gaia-muted">
          <span>Height exp:</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={k}
            onChange={(e) => setK(parseFloat(e.target.value))}
          />
          <span>{k.toFixed(1)}×</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {data.map((d) => {
          const h = expScale(d.value, min, max, k);
          return (
            <div key={d.label} className="flex flex-col items-center gap-2">
              <div className="flex h-40 w-8 items-end justify-center rounded border gaia-border gaia-panel-soft">
                <div
                  className="w-6 rounded-t transition-[height]"
                  style={{ height: `${h}%`, backgroundColor: "var(--gaia-contrast-bg)" }}
                  title={`${d.label}: ${d.value}`}
                />
              </div>
              <div className="w-10 truncate text-center text-xs gaia-muted">{d.label}</div>
            </div>
          );
        })}
      </div>
      <p className="text-xs gaia-muted">Bars use exponential height scaling to avoid looking flat.</p>
    </section>
  );
}
