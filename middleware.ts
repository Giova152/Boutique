import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getTokenCookie(req: NextRequest): string | undefined {
  const raw =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function getRole(req: NextRequest): Promise<string | null> {
  const token = getTokenCookie(req);
  if (!token) return null;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return (payload as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes (page-level)
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/connexion") return NextResponse.next();

    const role = await getRole(req);
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/admin/connexion", req.url));
    }
  }

  // Protect customer account routes
  if (
    pathname.startsWith("/compte") &&
    pathname !== "/compte/connexion" &&
    pathname !== "/compte/inscription"
  ) {
    const role = await getRole(req);
    if (!role) {
      return NextResponse.redirect(new URL("/compte/connexion", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
};