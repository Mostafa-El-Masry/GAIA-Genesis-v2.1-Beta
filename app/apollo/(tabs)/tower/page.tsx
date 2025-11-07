import Tower from "./components/Tower";
import TabNav from "../_components/TabNav";

export const dynamic = "force-static";

export default function TowerHome() {
  return (
    <div>
      <TabNav />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Tower />
      </div>
    </div>
  );
}
