import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  sendAdminOrderCancellationEmail,
  sendCustomerOrderCancellationEmail,
} from "@/app/lib/email";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.status === "cancelled") {
      return NextResponse.json({ error: "Cette commande est déjà annulée." }, { status: 400 });
    }

    // Check if within 30 minutes (30 * 60 * 1000 ms = 1,800,000 ms)
    const createdAt = new Date(order.createdAt).getTime();
    const now = Date.now();
    const thirtyMinutesMs = 30 * 60 * 1000;

    if (now - createdAt > thirtyMinutesMs) {
      return NextResponse.json(
        {
          error:
            "L'annulation n'est plus possible : le délai de 30 minutes après la création de la commande est écoulé.",
        },
        { status: 400 }
      );
    }

    // Cancel order and restore stock
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Trigger Admin & Customer Cancellation Notifications
    sendAdminOrderCancellationEmail(updatedOrder).catch((err) =>
      console.error("Échec d'envoi du mail d'annulation à l'admin:", err)
    );

    sendCustomerOrderCancellationEmail(updatedOrder).catch((err) =>
      console.error("Échec d'envoi du mail d'annulation au client:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Votre commande a été annulée avec succès et les stocks ont été restaurés.",
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'annulation" },
      { status: 500 }
    );
  }
}
