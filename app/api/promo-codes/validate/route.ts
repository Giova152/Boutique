import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Veuillez entrer un code promo." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Recherche insensible à la casse et sans espaces superflus
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: {
          equals: cleanCode,
          mode: "insensitive",
        },
      },
    });

    if (!promo || !promo.active) {
      return NextResponse.json({
        success: false,
        message: "Code promo invalide, expiré ou inexistant.",
      });
    }

    const currentSubtotal = parseFloat(subtotal) || 0;

    if (promo.minPurchase && promo.minPurchase > currentSubtotal) {
      return NextResponse.json({
        success: false,
        message: `Ce code nécessite un achat minimum de ${promo.minPurchase.toFixed(2)} $ CAD.`,
      });
    }

    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return NextResponse.json({
        success: false,
        message: "Ce code promo a atteint sa limite d'utilisations.",
      });
    }

    let discount = 0;
    if (promo.type === "percentage") {
      discount = (currentSubtotal * promo.value) / 100;
    } else {
      discount = promo.value;
    }

    const finalDiscount = Math.min(discount, currentSubtotal);

    return NextResponse.json({
      success: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discount: finalDiscount,
      message: `Code ${promo.code} appliqué avec succès (-${finalDiscount.toFixed(2)} $ CAD) !`,
    });
  } catch (error: any) {
    console.error("Erreur validation promo code:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la validation du code promo." },
      { status: 500 }
    );
  }
}
