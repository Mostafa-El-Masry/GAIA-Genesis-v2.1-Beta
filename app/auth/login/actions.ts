"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, buildAuthCookie, sanitizeRedirect } from "@/lib/auth";

export async function completeAuth(formData: FormData) {
  const cookieStore = await cookies();
  const redirectTarget = sanitizeRedirect(
    formData.get("redirect")?.toString() ?? null,
  );

  // In lieu of a real auth backend, mint a lightweight session marker.
  const sessionToken =
    formData.get("email")?.toString()?.trim() || crypto.randomUUID();

  cookieStore.set(buildAuthCookie(sessionToken));

  redirect(redirectTarget);
}

export async function endSession() {
  const cookieStore = await cookies();
  try {
    cookieStore.delete(AUTH_COOKIE_NAME);
  } catch {
    cookieStore.set({
      ...buildAuthCookie(""),
      value: "",
      maxAge: 0,
    });
  }

  redirect("/auth/login");
}
