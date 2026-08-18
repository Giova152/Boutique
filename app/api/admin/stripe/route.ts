import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const STRIPE_KEYS = [
  "stripe_secret_key",
  "stripe_publishable_key",
  "stripe_connect_account_id",
  "stripe_connect_access_token",
  "stripe_connect_publishable_key",
  "stripe_connection_type",
  "stripe_client_id",
];

/**
 * GET /api/admin/stripe
 * Retourne le statut de connexion Stripe (OAuth Connect ou Clés manuelles).
 */
export async function GET() {
  try {
    const rows = await prisma.storeSettings.findMany({
      where: { key: { in: STRIPE_KEYS } },
    });

    const map: Record<string, string> = {};
    rows.forEach((r) => (map[r.key] = r.value));

    const secretKey = map["stripe_secret_key"] ?? "";
    const publishableKey = map["stripe_publishable_key"] ?? "";
    const connectAccountId = map["stripe_connect_account_id"] ?? "";
    const connectionType = map["stripe_connection_type"] ?? (connectAccountId ? "oauth" : secretKey ? "manual" : "none");
    const clientId = process.env.STRIPE_CLIENT_ID || map["stripe_client_id"] || "";

    const isConnected = (connectionType === "oauth" && connectAccountId.length > 0) || (secretKey.length > 0 && publishableKey.length > 0);

    return NextResponse.json({
      connected: isConnected,
      connection_type: isConnected ? connectionType : "none",
      stripe_connect_account_id: connectAccountId,
      stripe_client_id: clientId,
      has_env_client_id: Boolean(process.env.STRIPE_CLIENT_ID),
      stripe_secret_key_preview: secretKey
        ? `sk_...${secretKey.slice(-4)}`
        : "",
      stripe_publishable_key: publishableKey,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/stripe
 * Sauvegarde les clés Stripe manuelles ou la mise à jour du Client ID Connect.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stripe_secret_key, stripe_publishable_key, stripe_client_id } = body as {
      stripe_secret_key?: string;
      stripe_publishable_key?: string;
      stripe_client_id?: string;
    };

    // Si on enregistre un Client ID Stripe Connect
    if (stripe_client_id !== undefined) {
      await prisma.storeSettings.upsert({
        where: { key: "stripe_client_id" },
        update: { value: stripe_client_id.trim() },
        create: { key: "stripe_client_id", value: stripe_client_id.trim() },
      });
      
      if (!stripe_secret_key && !stripe_publishable_key) {
        return NextResponse.json({
          success: true,
          message: "Client ID Stripe Connect sauvegardé avec succès !",
        });
      }
    }

    // Validation des clés manuelles
    if (stripe_secret_key || stripe_publishable_key) {
      if (!stripe_secret_key || !stripe_publishable_key) {
        return NextResponse.json(
          { error: "Les deux clés Stripe (secrète et publique) sont requises." },
          { status: 400 }
        );
      }

      if (
        !stripe_secret_key.startsWith("sk_") ||
        !stripe_publishable_key.startsWith("pk_")
      ) {
        return NextResponse.json(
          {
            error:
              "Format invalide. La clé secrète doit commencer par sk_ et la clé publique par pk_.",
          },
          { status: 400 }
        );
      }

      // Sauvegarde dans StoreSettings
      const settingsToSave = [
        { key: "stripe_secret_key", value: stripe_secret_key.trim() },
        { key: "stripe_publishable_key", value: stripe_publishable_key.trim() },
        { key: "stripe_connection_type", value: "manual" },
      ];

      for (const setting of settingsToSave) {
        await prisma.storeSettings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Configuration Stripe sauvegardée avec succès !",
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/stripe
 * Supprime la connexion Stripe (OAuth et clés manuelles).
 */
export async function DELETE() {
  try {
    await prisma.storeSettings.deleteMany({
      where: { key: { in: STRIPE_KEYS } },
    });

    return NextResponse.json({
      success: true,
      message: "Compte Stripe déconnecté avec succès.",
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
