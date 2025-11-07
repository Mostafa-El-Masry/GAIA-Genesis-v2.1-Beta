"use client";

import Link from "next/link";
import { FormEvent, useCallback, useMemo, useEffect, useState } from "react";

import { completeAuth } from "./actions";
import { sanitizeRedirect } from "@/lib/auth";
import { recordUserLogin } from "@/lib/auth-client";

export default function LoginPage() {
  const [mode, setMode] = useState<"signup" | "login">("login");
  const [redirectTo, setRedirectTo] = useState<string>("/");

  // Avoid using next/navigation hooks at build/prerender time — read params on client
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search || "");
      const raw = sp.get("mode");
      setMode(raw === "signup" ? "signup" : "login");
      const rawRedirect = sp.get("redirect") ?? null;
      setRedirectTo(sanitizeRedirect(rawRedirect));
    } catch {
      // noop
    }
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      try {
        const form = event.currentTarget;
        const formData = new FormData(form);
        const emailEntry = formData.get("email");
        const nameEntry = formData.get("name");

        const email =
          typeof emailEntry === "string"
            ? emailEntry.trim()
            : emailEntry
            ? String(emailEntry).trim()
            : null;
        const name =
          typeof nameEntry === "string"
            ? nameEntry.trim()
            : nameEntry
            ? String(nameEntry).trim()
            : null;

        recordUserLogin({
          email,
          name,
          mode,
          sessionToken: email ?? undefined,
        });
      } catch {
        // ignore local persistence failures
      }
    },
    [mode]
  );

  const submitLabel = mode === "signup" ? "Create account" : "Sign in";
  const switchHref =
    mode === "signup"
      ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
      : `/auth/login?mode=signup&redirect=${encodeURIComponent(redirectTo)}`;
  const switchLabel =
    mode === "signup" ? "Already have an account?" : "Need an account?";
  const switchCta = mode === "signup" ? "Sign in" : "Create one";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950" />
      <div className="absolute inset-0 opacity-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_rgba(15,23,42,0))]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-4 py-12 sm:px-8">
        <div className="mx-auto flex w-full flex-col items-center gap-10 md:flex-row md:justify-center">
          <div className="hidden md:flex md:w-[50vw] md:justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gaia-intro-1.png"
              onError={(event) => {
                const el = event.currentTarget as HTMLImageElement;
                el.src = "/gaia-intro.png";
              }}
              alt="GAIA"
              className="w-[22vw] max-w-[360px] min-w-[220px] opacity-90"
            />
          </div>

          <div className="w-full md:w-[50vw] md:flex md:justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/90 p-8 shadow-xl shadow-cyan-500/10 md:max-w-[30vw] md:min-w-[320px]">
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold text-white">
                  {submitLabel}
                </h2>
                <p className="text-sm text-slate-400">
                  {mode === "signup"
                    ? "Set your credentials to begin your journey."
                    : "Enter your credentials to continue."}
                </p>
              </div>

              <form
                action={completeAuth}
                className="mt-10 space-y-6"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="redirect" value={redirectTo} />

                {mode === "signup" && (
                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-slate-200"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      placeholder="Phoenix Sterling"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/20"
                      autoComplete="name"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2 text-left">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-200"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@gaia.network"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/20"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="********"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/20"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                >
                  {submitLabel}
                </button>
              </form>

              <div className="mt-8 space-y-3 text-center text-sm text-slate-400">
                <p>
                  {switchLabel}{" "}
                  <Link
                    href={switchHref}
                    className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                  >
                    {switchCta}
                  </Link>
                </p>
                <p>
                  <Link
                    href="mailto:support@gaia.network"
                    className="transition hover:text-cyan-200"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
