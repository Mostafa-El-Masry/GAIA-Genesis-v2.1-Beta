import TabNav from '../_components/TabNav';

export const dynamic = 'force-static';

export default function ArchivesTab() {
  return (
    <div>
      <TabNav />
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-xl font-semibold">Archives</h2>
        <p className="opacity-80">
          Place your HTML/CSS/JS/Tailwind docs, logs, and references here.
        </p>
        <div className="mt-4 rounded-lg border border-base-300 p-4">
          <p className="text-sm opacity-70">
            If you already have an Archives page elsewhere, move it here or add a redirect.
          </p>
        </div>
      </section>
    </div>
  );
}
