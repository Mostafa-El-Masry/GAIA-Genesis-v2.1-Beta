"use client";

import { useEffect } from "react";
import { previewChannels } from "../../../lib/composeDocument";

type PreviewPaneProps = {
  documentHtml: string;
  version: number;
  error?: string | null;
  onReady?: () => void;
  onError?: (message: string) => void;
};

export default function PreviewPane({
  documentHtml,
  version,
  error,
  onReady,
  onError,
}: PreviewPaneProps) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === previewChannels.ready) {
        onReady?.();
      }
      if (data.type === previewChannels.error) {
        onError?.(data.payload?.message || "Preview error");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onReady, onError]);

  return (
    <div className="flex h-full flex-col rounded-3xl border gaia-border bg-white/95 p-4 shadow-sm">
      <header className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700/70">
            Preview
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            Live iframe output
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          Updates after ~250ms of idle time
        </span>
      </header>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/90">
        <iframe
          key={version}
          title="Abollo practice preview"
          sandbox="allow-scripts"
          className="h-full w-full bg-white"
          srcDoc={documentHtml}
        />
      </div>

      {error ? (
        <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          Preview error: {error}
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          No runtime errors detected.
        </p>
      )}
    </div>
  );
}
