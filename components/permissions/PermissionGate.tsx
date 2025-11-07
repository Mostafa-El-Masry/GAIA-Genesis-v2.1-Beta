"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useAuthSnapshot } from "@/lib/auth-client";
import { normaliseEmail } from "@/lib/strings";
import {
  usePermissionSnapshot,
  isCreatorAdmin,
  getPermissionSet,
  type PermissionKey,
} from "@/lib/permissions";

type PermissionGateProps = {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
};

export default function PermissionGate({
  permission,
  children,
  fallback,
}: PermissionGateProps) {
  const { profile, status } = useAuthSnapshot();
  const snapshot = usePermissionSnapshot();
  const email = profile?.email ?? status?.email ?? null;
  const normalised = normaliseEmail(email);
  const isAdmin = isCreatorAdmin(normalised);

  const hasAccess = useMemo(() => {
    if (isAdmin) return true;
    if (!normalised) return false;
    const fromSnapshot = snapshot[normalised];
    if (fromSnapshot) return Boolean(fromSnapshot[permission]);
    const fallbackSet = getPermissionSet(email);
    return Boolean(fallbackSet[permission]);
  }, [email, isAdmin, normalised, permission, snapshot]);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      {fallback ?? (
        <>
          <h1 className="text-2xl font-semibold">Access Restricted</h1>
          <p className="mt-3 text-sm text-gray-400">
            You do not have permission to view this section. Contact the Creator
            admin for access.
          </p>
        </>
      )}
    </div>
  );
}

