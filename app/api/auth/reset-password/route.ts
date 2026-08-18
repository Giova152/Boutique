import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "L'adresse courriel et le nouveau mot de passe sont requis." },
        { status: 400 }
      );
    }

    const emailStr = email.trim().toLowerCase();

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 1. Check if user is in Admin table
    const admin = await prisma.admin.findUnique({
      where: { email: emailStr },
    });

    if (admin) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: "Mot de passe administrateur réinitialisé avec succès !",
      });
    }

    // 2. Check if user is in Customer table
    const customer = await prisma.customer.findUnique({
      where: { email: emailStr },
    });

    if (customer) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: "Mot de passe client réinitialisé avec succès !",
      });
    }

    return NextResponse.json(
      { error: "Aucun compte trouvé avec cette adresse courriel." },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur de réinitialisation du mot de passe" },
      { status: 500 }
    );
  }
}
