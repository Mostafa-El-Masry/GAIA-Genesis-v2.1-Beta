"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import LogoutButton from "./LogoutButton";
import { useAuthSnapshot } from "@/lib/auth-client";
import { capitalizeWords, normaliseEmail } from "@/lib/strings";

/**
 * Slim App Bar
 */
export default function AppBar() {
  const pathname = usePathname();
  const { profile, status } = useAuthSnapshot();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    try {
      const hideNav = pathname === "/" || pathname.startsWith("/auth");
      if (hideNav) {
        document.body.classList.remove("has-navbar");
        return;
      }
      document.body.classList.add("has-navbar");
      return () => {
        document.body.classList.remove("has-navbar");
      };
    } catch {
      // ignore DOM access errors outside the browser
    }
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || pathname === "/" || pathname.startsWith("/auth")) return null;

  return (
    <header className="gaia-glass-strong gaia-border fixed inset-x-0 top-0 z-50 border-b border backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-3 px-3">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gaia-intro.svg"
            onError={(event) => {
              const el = event.currentTarget as HTMLImageElement;
              el.src = "/gaia-intro.png";
            }}
            alt="GAIA"
            className="h-9 w-auto"
          />
          <span className="sr-only">GAIA Home</span>
        </Link>

        <div className="flex-1" />

        <div
          className="relative"
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
            <div className="gaia-glass gaia-border absolute right-0 top-[calc(100%+0.5rem)] min-w-[220px] rounded-lg border p-3 shadow-lg">
              <div className="mb-3 text-xs uppercase tracking-wide gaia-muted">
                Signed in as
              </div>
              <div className="text-sm font-semibold">{title}</div>
              {email && (
                <div className="break-all text-xs gaia-muted">{email}</div>
              )}
              <div className="mt-4">
                <LogoutButton className="w-full rounded-lg border gaia-border px-3 py-1.5 text-sm font-medium gaia-hover-soft" />
              </div>
            </div>
          )}
          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="absolute right-0 top-[calc(100%+0.5rem)] rounded-lg border gaia-border px-3 py-1.5 text-sm font-medium gaia-hover-soft"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
