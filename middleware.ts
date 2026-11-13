import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "__Host-rl_session";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/app" || req.nextUrl.pathname.startsWith("/app/")) {
    const sid = req.cookies.get(SESSION_COOKIE)?.value;
    if (!sid) {
      const url = new URL("/", req.url);
      url.searchParams.set("error", "auth");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
