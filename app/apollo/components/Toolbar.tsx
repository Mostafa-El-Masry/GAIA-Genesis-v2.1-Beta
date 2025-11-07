"use client";

import { exportJSON, importJSON } from "../lib/store";

const buttonStyles =
  "inline-flex items-center justify-center rounded-2xl border gaia-border gaia-surface px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-black/10 disabled:gaia-muted";
// Primary button explicitly sets bg and text to avoid accidental overrides and ensure contrast
const primaryButton =
  "inline-flex items-center justify-center rounded-2xl border border-transparent bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-600";

export default function Toolbar({
  onNewSection,
}: {
  onNewSection: () => void;
}) {
  return (
    <div className="gaia-surface flex flex-wrap items-center gap-3 rounded-2xl border gaia-border px-4 py-3 shadow-sm">
      <button className={primaryButton} onClick={onNewSection}>
        New section (N)
      </button>
      <span className="ml-auto flex-1 text-right text-xs font-medium uppercase tracking-[0.25em] gaia-muted max-sm:hidden">
        Archive tools
      </span>
      <button
        className={buttonStyles}
        onClick={() =>
          exportJSON(
            JSON.parse(
              localStorage.getItem("gaia_apollo_v1_notes") || '{"topics":[]}'
            )
          )
        }
      >
        Export
      </button>
      <button className={buttonStyles} onClick={() => importJSON(() => {})}>
        Import
      </button>
    </div>
  );
}
