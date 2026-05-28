import { NextResponse, type NextRequest } from "next/server";

// Lightweight gate — bounces unauthenticated visitors away from /admin.
// Deep authZ (role checks, /api/auth/me) happens in the admin layout.
export function middleware(req: NextRequest) {
  const token = req.cookies.get("captor_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
