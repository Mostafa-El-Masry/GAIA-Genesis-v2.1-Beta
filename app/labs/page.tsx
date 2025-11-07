import LabsClient from "./components/LabsClient";

export default function LabsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Labs</h1>
        <p className="text-xs gaia-muted">Private builds from Academy</p>
      </header>
      <LabsClient />
    </main>
  );
}
