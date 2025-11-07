'use client';

import { useState } from "react";
import Tower from "./Tower";
import Academy from "./Academy";
import Button from "@/app/DesignSystem/components/Button";

export default function CitadelClient() {
  const [tab, setTab] = useState<"tower" | "academy">("tower");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setTab("tower")}
          className={tab === "tower" ? "" : "gaia-muted"}
          aria-pressed={tab === "tower"}
        >
          Tower
        </Button>
        <Button
          onClick={() => setTab("academy")}
          className={tab === "academy" ? "" : "gaia-muted"}
          aria-pressed={tab === "academy"}
        >
          Academy
        </Button>
      </div>

      {tab === "tower" ? <Tower /> : <Academy />}
    </div>
  );
}
