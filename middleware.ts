import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/connexion") return NextResponse.next();
    
    // Check NextAuth session token cookie
    const token =
      req.cookies.get("authjs.session-token") ||
      req.cookies.get("__Secure-authjs.session-token") ||
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token");

    if (!token) {
      return NextResponse.redirect(new URL("/admin/connexion", req.url));
    }
  }

  // Protect customer account routes
  if (
    pathname.startsWith("/compte") &&
    pathname !== "/compte/connexion" &&
    pathname !== "/compte/inscription"
  ) {
    const token =
      req.cookies.get("authjs.session-token") ||
      req.cookies.get("__Secure-authjs.session-token") ||
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token");

    if (!token) {
      return NextResponse.redirect(new URL("/compte/connexion", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
};
