"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";

export default function LabsLayout({ children }: { children: ReactNode }) {
  return <PermissionGate permission="labs">{children}</PermissionGate>;
}

