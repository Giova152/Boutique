import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findMany({
      where: {
        key: {
          in: [
            "store_name",
            "store_email",
            "flat_shipping_rate",
            "free_shipping_threshold",
            "favicon_url",
          ],
        },
      },
    });

    const settingsObj: Record<string, string> = {
      store_name: "VEGEDERM BIO COSMECEUTIQUES",
      store_email: "contact@vegedermbiocosmeceutiques.com",
      flat_shipping_rate: "13.00",
      free_shipping_threshold: "75.00",
      favicon_url: "/favicon.ico",
    };

    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json(settingsObj, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
