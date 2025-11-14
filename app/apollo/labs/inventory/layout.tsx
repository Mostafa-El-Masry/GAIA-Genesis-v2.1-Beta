"use client";

/**
 * app/labs/inventory/layout.tsx
 *
 * Layout for inventory management system
 */

import { AuthProvider } from "@/app/context/AuthContext";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </AuthProvider>
  );
}
