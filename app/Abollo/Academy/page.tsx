import dynamic from "next/dynamic";
import { htmlCssPath } from "@/app/apollo/(tabs)/academy/data/academy";

const LivePlayground = dynamic(() => import("./components/LivePlayground"), { ssr: false });

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AcademyPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 text-white">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Abollo -> Academy
          </p>
          <h1 className="text-4xl font-semibold">{htmlCssPath.title}</h1>
          <p className="text-slate-300">{htmlCssPath.overview}</p>
          <p className="text-sm text-slate-400">{htmlCssPath.description}</p>
        </header>

        <section className="space-y-6">
          {htmlCssPath.sections.map((section) => (
            <div key={section.id} className="space-y-4 rounded-3xl border border-white/5 bg-slate-900/60 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Lesson track</p>
                <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {section.lessons.map((lesson) => (
                  <article
                    key={lesson.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-sm transition hover:border-white/30"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      <span>{lesson.type === "project" ? "Project" : "Lesson"}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white">{lesson.title}</h3>
                    <p className="text-sm text-slate-300">{lesson.summary}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Live Playground
            </p>
            <h2 className="text-3xl font-semibold text-white">CodeBin -- build beside the lesson</h2>
            <p className="text-sm text-slate-300">
              Experiment with the current concept, save snapshots to your browser, import previous zips,
              or export a bundle to share. The environment mirrors Sandpack (CodeSandbox) so what you see here
              matches production.
            </p>
          </div>
          <LivePlayground lessonId="academy-html-css" template="vanilla" starterKey="vanilla" />
        </section>
      </div>
    </main>
  );
}
