import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/admin/stripe/connect/callback
 * Gère le retour de Stripe après que l'admin a autorisé l'application via OAuth.
 * Échange le `code` contre les informations du compte Stripe (account_id, access_token, etc.).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  const redirectBase = `${requestUrl.origin}/admin/parametres`;

  if (error) {
    console.error("Erreur Callback Stripe OAuth:", error, errorDescription);
    const redirectUrl = new URL(redirectBase);
    redirectUrl.searchParams.set("stripe_error", errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL(redirectBase);
    redirectUrl.searchParams.set("stripe_error", "Aucun code d'autorisation reçu de Stripe.");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // 1. Récupérer la clé secrète Stripe pour la requête OAuth
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      const redirectUrl = new URL(redirectBase);
      redirectUrl.searchParams.set(
        "stripe_error",
        "Clé secrète plateforme (STRIPE_SECRET_KEY) absente du serveur."
      );
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Échanger le `code` avec l'API OAuth Stripe
    const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_secret: stripeSecretKey,
        code: code,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error("Erreur de récupération du token Stripe OAuth:", tokenData);
      const redirectUrl = new URL(redirectBase);
      redirectUrl.searchParams.set(
        "stripe_error",
        tokenData.error_description || tokenData.error || "Échec de la connexion à Stripe."
      );
      return NextResponse.redirect(redirectUrl);
    }

    // `tokenData` contient:
    // - stripe_user_id (ex: "acct_1...")
    // - access_token (ex: "sk_live_..." ou "sk_test_...")
    // - stripe_publishable_key (ex: "pk_test_...")
    // - livemode (boolean)
    // - scope ("read_write")

    const stripeAccountId = tokenData.stripe_user_id;
    const accessToken = tokenData.access_token;
    const publishableKey = tokenData.stripe_publishable_key || "";

    // 3. Sauvegarder dans StoreSettings
    const settingsToSave = [
      { key: "stripe_connect_account_id", value: stripeAccountId },
      { key: "stripe_connect_access_token", value: accessToken },
      { key: "stripe_connect_publishable_key", value: publishableKey },
      { key: "stripe_secret_key", value: accessToken },
      { key: "stripe_publishable_key", value: publishableKey },
      { key: "stripe_connection_type", value: "oauth" },
    ];

    for (const setting of settingsToSave) {
      if (setting.value) {
        await prisma.storeSettings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        });
      }
    }

    const redirectUrl = new URL(redirectBase);
    redirectUrl.searchParams.set("stripe_success", "true");
    redirectUrl.searchParams.set("stripe_account", stripeAccountId);
    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error("Exception callback Stripe:", err);
    const redirectUrl = new URL(redirectBase);
    redirectUrl.searchParams.set("stripe_error", err.message || "Erreur serveur lors de la connexion Stripe.");
    return NextResponse.redirect(redirectUrl);
  }
}
