import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promoCodes, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, type, value, minPurchase, active } = body;

    if (!code || !value) {
      return NextResponse.json(
        { error: "Veuillez remplir les champs obligatoires" },
        { status: 400 }
      );
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: code.trim().toUpperCase(),
        type: type || "percentage",
        value: parseFloat(value),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur de création du code promo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de code promo manquant" }, { status: 400 });
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Code promo supprimé." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur de suppression" },
      { status: 500 }
    );
  }
}
