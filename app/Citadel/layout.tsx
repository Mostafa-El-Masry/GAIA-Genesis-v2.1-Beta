"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";

export default function CitadelLayout({ children }: { children: ReactNode }) {
  return <PermissionGate permission="citadel">{children}</PermissionGate>;
}

