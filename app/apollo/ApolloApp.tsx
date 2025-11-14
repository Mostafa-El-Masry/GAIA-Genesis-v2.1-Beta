"use client";

import AskPanel from "./components/AskPanel";

export default function ApolloApp() {
  return (
    <main className="min-h-screen gaia-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] gaia-muted">
            Apollo
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold gaia-strong">
            Ask ChatGPT · Capture the best bits into your archive
          </h1>
          <p className="max-w-3xl text-sm sm:text-base gaia-muted">
            Use this space to ask focused questions about what you&apos;re learning.
            When you get a good answer, select the useful parts and append them to your
            Apollo notes. Academy now handles topics and sections — this page is just
            your assistant surface.
          </p>
        </header>

        <section className="rounded-3xl gaia-panel-soft p-4 sm:p-6 shadow-sm">
          <AskPanel />
        </section>
      </div>
    </main>
  );
}
