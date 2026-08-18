import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendAdminOrderNotification, sendCustomerInvoiceEmail } from "@/app/lib/email";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");

  try {
    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: true },
        },
        customer: true,
      },
    });
    return NextResponse.json(orders, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      guestEmail,
      guestName,
      address,
      subtotal,
      shippingCost,
      taxAmount,
      total,
      items,
    } = body;

    if (!items || items.length === 0 || !address) {
      return NextResponse.json(
        { error: "Données de commande invalides" },
        { status: 400 }
      );
    }

    // Sécurité : recalculer les prix depuis la base (ignorer les prix envoyés par le client)
    const productIds = items.map((item: any) => item.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let serverSubtotal = 0;
    const orderItemData: { productId: string; quantity: number; unitPrice: number }[] = [];

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
      serverSubtotal += product.price * qty;
      orderItemData.push({ productId: product.id, quantity: qty, unitPrice: product.price });
    }

    const serverShippingCost = serverSubtotal >= 75 ? 0 : 9.99;
    const serverTaxAmount = Math.round(serverSubtotal * 0.14975 * 100) / 100;
    const serverTotal = serverSubtotal + serverShippingCost + serverTaxAmount;

    const order = await prisma.order.create({
      data: {
        customerId: customerId || null,
        guestEmail: guestEmail || null,
        guestName: guestName || null,
        address: typeof address === "string" ? address : JSON.stringify(address),
        subtotal: Math.round(serverSubtotal * 100) / 100,
        shippingCost: serverShippingCost,
        taxAmount: serverTaxAmount,
        total: Math.round(serverTotal * 100) / 100,
        status: "processing",
        items: {
          create: orderItemData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Update stock levels
    for (const item of orderItemData) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Trigger Customer Invoice Email & Admin Notification
    sendCustomerInvoiceEmail(order).catch((err) =>
      console.error("Error sending customer invoice email:", err)
    );

    sendAdminOrderNotification(order).catch((err) =>
      console.error("Error sending admin notification:", err)
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur de création de la commande" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const olderThanDays = searchParams.get("olderThanDays");

    if (id) {
      // Delete single order
      await prisma.orderItem.deleteMany({ where: { orderId: id } });
      await prisma.order.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Commande supprimée." });
    }

    if (olderThanDays) {
      // Bulk delete orders older than X days
      const days = parseInt(olderThanDays);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const oldOrders = await prisma.order.findMany({
        where: { createdAt: { lt: cutoffDate } },
        select: { id: true },
      });

      const oldOrderIds = oldOrders.map((o) => o.id);

      if (oldOrderIds.length > 0) {
        await prisma.orderItem.deleteMany({
          where: { orderId: { in: oldOrderIds } },
        });
        await prisma.order.deleteMany({
          where: { id: { in: oldOrderIds } },
        });
      }

      return NextResponse.json({
        success: true,
        message: `${oldOrderIds.length} commande(s) datant de plus de ${days} jours ont été supprimées.`,
      });
    }

    return NextResponse.json({ error: "Paramètre id ou olderThanDays manquant" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur de suppression" },
      { status: 500 }
    );
  }
}
