import AskPanel from "../../components/AskPanel";
import TabNav from "../_components/TabNav";

export const dynamic = "force-static";

export default function AskTab() {
  return (
    <div>
      <TabNav />
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Ask Apollo</h2>
          <p className="text-sm opacity-70">
            Chat with the assistant, then append the best parts into your archive.
          </p>
        </div>
        <div className="gaia-surface rounded-3xl border gaia-border p-5 shadow-sm ring-1 ring-black/5">
          <AskPanel />
        </div>
      </section>
    </div>
  );
}
