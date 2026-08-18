import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/api/admin/require-admin";

/**
 * GET /api/admin/stripe/connect/authorize
 * Redirige l'administrateur vers la page d'autorisation OAuth de Stripe Connect.
 */
export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    // 1. Récupérer le Client ID depuis l'environnement ou les paramètres enregistrés
    let clientId = process.env.STRIPE_CLIENT_ID;

    if (!clientId) {
      const setting = await prisma.storeSettings.findUnique({
        where: { key: "stripe_client_id" },
      });
      if (setting?.value) {
        clientId = setting.value;
      }
    }

    if (!clientId) {
      const url = new URL("/admin/parametres", request.url);
      url.searchParams.set(
        "stripe_error",
        "Client ID Stripe Connect non configuré (STRIPE_CLIENT_ID est requis dans .env ou les paramètres)."
      );
      return NextResponse.redirect(url);
    }

    // 2. Déterminer l'URL de redirection (callback)
    const requestUrl = new URL(request.url);
    const redirectUri = `${requestUrl.origin}/api/admin/stripe/connect/callback`;

    // 3. Construire l'URL OAuth Stripe Connect
    const stripeAuthUrl = new URL("https://connect.stripe.com/oauth/authorize");
    stripeAuthUrl.searchParams.set("response_type", "code");
    stripeAuthUrl.searchParams.set("client_id", clientId);
    stripeAuthUrl.searchParams.set("scope", "read_write");
    stripeAuthUrl.searchParams.set("redirect_uri", redirectUri);

    // 4. Rediriger l'admin vers Stripe
    return NextResponse.redirect(stripeAuthUrl.toString());
  } catch (error: any) {
    console.error("Erreur d'autorisation Stripe Connect:", error);
    const url = new URL("/admin/parametres", request.url);
    url.searchParams.set("stripe_error", "Erreur lors de l'initialisation de l'OAuth Stripe.");
    return NextResponse.redirect(url);
  }
}
