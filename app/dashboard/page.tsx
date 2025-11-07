import DashboardWrapper from "./components/DashboardWrapper";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm gaia-muted">
          Quick overview of your learning, builds, and safety.
        </p>
      </header>
      <DashboardWrapper />
    </main>
  );
}
