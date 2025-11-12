"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import { useAuthSnapshot } from "@/lib/auth-client";
import { capitalizeWords, normaliseEmail } from "@/lib/strings";

export default function UserDropdown() {
  const { profile, status } = useAuthSnapshot();
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  const handleToggle = (value: boolean) => {
    if (value) {
      clearCloseTimer();
      setOpen(true);
    } else {
      clearCloseTimer();
      closeTimeout.current = setTimeout(() => {
        setOpen(false);
        closeTimeout.current = null;
      }, 250);
    }
  };

  const { title, email, isLoggedIn } = useMemo(() => {
    const rawName = profile?.name?.trim() ?? null;
    const name = rawName ? capitalizeWords(rawName) : null;
    const emailRaw = profile?.email ?? status?.email ?? null;
    const prettyEmail = emailRaw ? normaliseEmail(emailRaw) : null;
    const session = status?.session ?? null;

    return {
      title: name ?? "Creator",
      email: prettyEmail,
      isLoggedIn: Boolean(prettyEmail && session),
    };
  }, [profile, status]);

  if (!isLoggedIn) {
    return (
      <Link
        href="/auth/login"
        className="rounded-lg border gaia-border px-3 py-1.5 text-sm font-medium gaia-hover-soft"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => handleToggle(true)}
      onMouseLeave={() => handleToggle(false)}
    >
      <button
        type="button"
        className="rounded-lg border gaia-border px-3 py-1.5 text-sm font-semibold gaia-hover-soft transition"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={() => handleToggle(true)}
        onBlur={() => handleToggle(false)}
      >
        {title}
      </button>
      {open && isLoggedIn && (
        <div className="gaia-glass gaia-border absolute right-0 top-[calc(100%+0.5rem)] min-w-[220px] rounded-lg border p-3 shadow-lg z-50">
          <div className="mb-3 text-xs uppercase tracking-wide gaia-muted">
            Signed in as
          </div>
          <div className="text-sm font-semibold">{title}</div>
          {email && <div className="break-all text-xs gaia-muted">{email}</div>}
          <div className="mt-4">
            <LogoutButton className="w-full rounded-lg border gaia-border px-3 py-1.5 text-sm font-medium gaia-hover-soft" />
          </div>
        </div>
      )}
    </div>
  );
}
