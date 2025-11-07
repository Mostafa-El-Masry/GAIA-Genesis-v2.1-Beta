import CitadelClient from "./components/CitadelClient";

export default function CitadelPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Citadel</h1>
        <p className="text-xs gaia-muted">Foundation · Tower + Academy (skeleton)</p>
      </header>
      <CitadelClient />
    </main>
  );
}
