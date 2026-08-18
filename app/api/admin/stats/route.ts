import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const outOfStockProducts = await prisma.product.count({
      where: { stock: { lte: 0 } },
    });
    const lowStockProducts = await prisma.product.count({
      where: { stock: { gt: 0, lte: 5 } },
    });

    const orders = await prisma.order.findMany();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json({
      totalOrders,
      totalProducts,
      outOfStockProducts,
      lowStockProducts,
      totalRevenue,
      recentOrders,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
