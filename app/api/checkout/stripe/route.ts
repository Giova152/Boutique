import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, address, guestEmail, guestName, promoCode } = body;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      // If Stripe keys are not set, return simulated payment instructions
      return NextResponse.json({
        simulated: true,
        message: "Stripe en mode simulation (clés API non renseignées dans .env)",
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-01-27.acacia" as any,
    });

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: guestEmail,
      shipping_address_collection: {
        allowed_countries: ["CA"], // Restrict Stripe Checkout to Canada only!
      },
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/panier`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur de création de session Stripe" },
      { status: 500 }
    );
  }
}
