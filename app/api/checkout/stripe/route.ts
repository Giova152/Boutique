import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, address, guestEmail, guestName, promoCode } = body;

    // 1. Récupérer la configuration Stripe active depuis la DB
    const dbSettings = await prisma.storeSettings.findMany({
      where: {
        key: {
          in: [
            "stripe_secret_key",
            "stripe_connect_access_token",
            "stripe_connect_account_id",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    dbSettings.forEach((s) => (settingsMap[s.key] = s.value));

    let secretKey =
      settingsMap["stripe_secret_key"] ||
      settingsMap["stripe_connect_access_token"] ||
      process.env.STRIPE_SECRET_KEY;

    const connectAccountId = settingsMap["stripe_connect_account_id"];

    if (!secretKey) {
      // Si aucune clé Stripe n'est configurée, mode simulation
      return NextResponse.json({
        simulated: true,
        message: "Stripe en mode simulation (clés API non renseignées).",
      });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-01-27.acacia" as any,
    });

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: guestEmail,
      shipping_address_collection: {
        allowed_countries: ["CA"], // Restreint au Canada
      },
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/panier`,
    };

    // Si connecté via Connect avec un account_id spécifique (Standard/Express account header option)
    const requestOptions: Stripe.RequestOptions = {};
    if (connectAccountId && !secretKey.startsWith("sk_")) {
      requestOptions.stripeAccount = connectAccountId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams, requestOptions);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur de création de session Stripe" },
      { status: 500 }
    );
  }
}
