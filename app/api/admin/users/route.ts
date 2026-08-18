import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { sendAdminInvitationEmail } from "@/app/lib/email";
import { requireAdmin } from "@/app/api/admin/require-admin";

/**
 * GET /api/admin/users
 * Liste tous les administrateurs enregistrés.
 */
export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(admins, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Crée un nouvel administrateur et lui envoie un mail personnalisé d'invitation avec ses accès.
 */
export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires (nom, courriel, mot de passe)." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Vérifier si l'email existe déjà dans la table Admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Cet email est déjà enregistré pour un administrateur." },
        { status: 400 }
      );
    }

    // 2. SÉCURITÉ : Vérifier si l'email existe déjà dans la table Customer (Acheteur)
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "🛑 Cette adresse courriel appartient déjà à un compte client acheteur. Un administrateur doit posséder une adresse courriel distincte." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: role || "admin",
      },
    });

    // Envoi du mail d'invitation personnalisé
    sendAdminInvitationEmail({
      name: newAdmin.name,
      email: newAdmin.email,
      password: password,
      role: newAdmin.role,
    }).catch((err) =>
      console.error("Erreur lors de l'envoi du mail d'invitation admin:", err)
    );

    return NextResponse.json(
      {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        message: "Administrateur créé avec succès ! Un courriel contenant ses accès lui a été envoyé.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur de création d'administrateur" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users
 * Modifie un administrateur existant (nom, courriel, rôle, et éventuellement mot de passe).
 */
export async function PUT(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id, name, email, role, password } = await request.json();

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "L'identifiant, le nom et le courriel sont requis." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Vérifier si l'email n'est pas déjà pris par UN AUTRE admin
    const existingWithEmail = await prisma.admin.findFirst({
      where: {
        email: cleanEmail,
        NOT: { id },
      },
    });

    if (existingWithEmail) {
      return NextResponse.json(
        { error: "Cette adresse courriel est déjà utilisée par un autre administrateur." },
        { status: 400 }
      );
    }

    // 2. SÉCURITÉ : Vérifier si l'email existe dans la table Customer (Acheteur)
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "🛑 Cette adresse courriel appartient déjà à un compte client acheteur. Veuillez utiliser une adresse différente pour l'administration." },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: name.trim(),
      email: cleanEmail,
      role: role || "admin",
    };

    // Si un nouveau mot de passe est renseigné
    if (password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      admin: updatedAdmin,
      message: "Administrateur mis à jour avec succès !",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur de modification de l'administrateur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Supprime un administrateur.
 */
export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID admin manquant" }, { status: 400 });
    }

    const count = await prisma.admin.count();
    if (count <= 1) {
      return NextResponse.json(
        { error: "Impossible de supprimer le dernier compte administrateur." },
        { status: 400 }
      );
    }

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Administrateur supprimé." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur de suppression" },
      { status: 500 }
    );
  }
}
