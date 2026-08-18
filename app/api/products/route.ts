import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort");
  const status = searchParams.get("status");

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (category) {
    where.category = { slug: category };
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { ingredients: { contains: search } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "popular") orderBy = { reviewCount: "desc" };
  if (sort === "rating") orderBy = { avgRating: "desc" };

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
      },
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      images,
      categoryId,
      stock,
      ingredients,
      instructions,
      benefits,
      featured,
      status,
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Veuillez remplir les champs obligatoires" },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || "",
        price: parseFloat(price),
        images: typeof images === "string" ? images : JSON.stringify(images || ["/images/products/lumiere-noire.png"]),
        categoryId,
        stock: parseInt(stock) || 0,
        ingredients: ingredients || "",
        instructions: instructions || "",
        benefits: benefits || "",
        featured: Boolean(featured),
        status: status || "active",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: error.message || "Impossible de créer le produit" },
      { status: 500 }
    );
  }
}
