import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code promo vide" },
        { status: 400 }
      );
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.active) {
      return NextResponse.json({
        success: false,
        message: "Code promo invalide ou expiré.",
      });
    }

    if (promo.minPurchase > subtotal) {
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
      discount = (subtotal * promo.value) / 100;
    } else {
      discount = promo.value;
    }

    return NextResponse.json({
      success: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discount: Math.min(discount, subtotal),
      message: `Code ${promo.code} appliqué (-${discount.toFixed(2)} $ CAD)`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erreur lors de la validation du promo code" },
      { status: 500 }
    );
  }
}
