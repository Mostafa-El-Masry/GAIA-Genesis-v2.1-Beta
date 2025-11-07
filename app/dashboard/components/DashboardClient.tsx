'use client';

import Active from "./Active";
import Entry from "./Entry";

export default function DashboardClient() {
  return (
    <div className="space-y-8">
      <Active />
      <Entry />
    </div>
  );
}
