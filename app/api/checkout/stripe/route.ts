import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.14975;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, address, guestEmail, guestName, customerId, promoCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !address) {
      return NextResponse.json(
        { error: "Données de commande invalides" },
        { status: 400 }
      );
    }

    // 1. Récupérer les produits depuis la base (prix autoritaires)
    const productIds = items.map((i: any) => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 2. Construire les lignes avec les prix serveur, valider le stock
    let subtotal = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: { productId: string; quantity: number; unitPrice: number }[] = [];

    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        return NextResponse.json(
          { error: `Produit introuvable (${item.id})` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      if (product.stock < qty) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour « ${product.name} » (${product.stock} restant).`,
          },
          { status: 400 }
        );
      }

      let images: string[] = [];
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed[0]) images = [parsed[0]];
      } catch {}
      // Stripe exige des URL absolues (http/https) — ignorer les chemins relatifs
      images = images.filter((img) => /^https?:\/\//i.test(img));

      subtotal += product.price * qty;
      orderItems.push({ productId: product.id, quantity: qty, unitPrice: product.price });

      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: product.name,
            images,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: qty,
      });
    }

    // 3. Promo code validé côté serveur
    let promoDiscount = 0;
    let promoId: string | null = null;
    if (promoCode && typeof promoCode === "string" && promoCode.trim()) {
      const promo = await prisma.promoCode.findFirst({
        where: {
          code: { equals: promoCode.trim().toUpperCase(), mode: "insensitive" },
        },
      });
      const promoValid =
        promo &&
        promo.active &&
        (!promo.minPurchase || promo.minPurchase <= subtotal) &&
        (!promo.maxUses || promo.currentUses < promo.maxUses);
      if (promo && promoValid) {
        promoDiscount =
          promo.type === "percentage"
            ? (subtotal * promo.value) / 100
            : promo.value;
        promoDiscount = Math.min(promoDiscount, subtotal);
        promoId = promo.id;
      }
    }

    // 4. Totaux calculés côté serveur
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const taxAmount = Math.round((subtotal - promoDiscount) * TAX_RATE * 100) / 100;
    const total = Math.max(0, subtotal - promoDiscount + shippingCost + taxAmount);
    const round2 = (n: number) => Math.round(n * 100) / 100;

    // 5. Clé Stripe (DB d'abord, sinon .env)
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

    const secretKey =
      settingsMap["stripe_secret_key"] ||
      settingsMap["stripe_connect_access_token"] ||
      process.env.STRIPE_SECRET_KEY;
    const connectAccountId = settingsMap["stripe_connect_account_id"];

    if (!secretKey) {
      return NextResponse.json(
        { error: "Stripe n'est pas configuré. Contactez l'administrateur." },
        { status: 500 }
      );
    }

    // 6. Pré-créer la commande (en attente de paiement)
    const order = await prisma.order.create({
      data: {
        customerId: customerId || null,
        guestEmail: guestEmail || null,
        guestName: guestName || null,
        address: typeof address === "string" ? address : JSON.stringify(address),
        subtotal: round2(subtotal),
        shippingCost,
        taxAmount,
        total,
        promoCodeId: promoId,
        promoDiscount: round2(promoDiscount),
        status: "pending",
        items: { create: orderItems },
      },
    });

    // 7. Session Stripe + coupon si promo
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-01-27.acacia" as any,
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: guestEmail,
      metadata: { orderId: order.id },
      shipping_address_collection: { allowed_countries: ["CA"] },
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/commande/confirmation?id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/panier`,
    };

    if (promoDiscount > 0) {
      const coupon = await stripe.coupons.create({
        name: `Promo ${(promoCode as string).trim().toUpperCase()}`,
        amount_off: Math.round(promoDiscount * 100),
        currency: "cad",
        duration: "once",
      });
      sessionParams.discounts = [{ coupon: coupon.id }];
    }

    const requestOptions: Stripe.RequestOptions = {};
    if (connectAccountId && !secretKey.startsWith("sk_")) {
      requestOptions.stripeAccount = connectAccountId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams, requestOptions);

    return NextResponse.json({ url: session.url, sessionId: session.id, orderId: order.id });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur de création de session Stripe" },
      { status: 500 }
    );
  }
}