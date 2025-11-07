"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";

export default function HealthLayout({ children }: { children: ReactNode }) {
  return <PermissionGate permission="health">{children}</PermissionGate>;
}

