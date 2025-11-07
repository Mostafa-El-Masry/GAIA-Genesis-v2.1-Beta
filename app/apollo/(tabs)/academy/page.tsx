import Academy from "./components/Academy";
import TabNav from "../_components/TabNav";

export const dynamic = "force-static";

export default function AcademyTab() {
  return (
    <div>
      <TabNav />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Academy />
      </div>
    </div>
  );
}
