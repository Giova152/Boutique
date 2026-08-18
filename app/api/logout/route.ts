import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Déconnecté avec succès" });

  const cookiesToClear = [
    "authjs.session-token",
    "next-auth.session-token",
    "__Secure-authjs.session-token",
    "__Secure-next-auth.session-token",
    "authjs.csrf-token",
    "next-auth.csrf-token",
    "authjs.callback-url",
    "next-auth.callback-url",
  ];

  for (const cookieName of cookiesToClear) {
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}
