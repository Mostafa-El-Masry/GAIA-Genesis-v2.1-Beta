'use client';

type BuildEntry = {
  conceptId: string;
  nodeId: string;
  trackId: string;
  trackTitle: string;
  title: string;
  note: string;
  embedUrl?: string;
  score?: number;
  total?: number;
  completedAt?: number;
};

export default function BuildCard({ b }: { b: BuildEntry }) {
  return (
    <article className="rounded-lg border gaia-border p-4">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs gaia-muted">{b.trackTitle}</div>
          <h3 className="text-lg font-semibold">{b.title}</h3>
        </div>
        {typeof b.score === "number" && typeof b.total === "number" && (
          <div className="text-xs gaia-muted">Score {b.score}/{b.total}</div>
        )}
      </header>

      {b.embedUrl ? (
        <div className="mt-3 overflow-hidden rounded border gaia-border">
          <div className="aspect-video w-full">
            <iframe
              src={b.embedUrl}
              className="h-full w-full"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
              title={b.title}
            />
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm gaia-text-default">{b.note || "No notes provided."}</p>
      )}

      <footer className="mt-3 text-xs gaia-muted">
        {b.completedAt ? new Date(b.completedAt).toLocaleString() : "Unsubmitted draft"}
        {b.embedUrl && (
          <a className="ml-3 underline hover:no-underline" href={b.embedUrl} target="_blank" rel="noreferrer">Open</a>
        )}
      </footer>
    </article>
  );
}
