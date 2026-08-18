import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Non authentifié. Connectez-vous à l'administration." },
      { status: 401 }
    );
  }

  const role = (session.user as { role?: string })?.role;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json(
      { error: "Accès réservé à l'administration." },
      { status: 403 }
    );
  }

  return null;
}