import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/_next")) return NextResponse.next();
  if (pathname.startsWith("/api")) return NextResponse.next();
  if (pathname.startsWith("/auth")) return NextResponse.next();
  if (PUBLIC_FILE.test(pathname)) return NextResponse.next();

  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set(
      "redirect",
      pathname + (search ?? ""),
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|robots.txt).*)",
  ],
};
