import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, authorName, rating, comment } = body;

    if (!productId || !authorName || !rating) {
      return NextResponse.json(
        { error: "Veuillez indiquer votre nom, une note et le produit concerné." },
        { status: 400 }
      );
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "La note doit être comprise entre 1 et 5 étoiles." },
        { status: 400 }
      );
    }

    // 1. Create review record
    const newReview = await prisma.review.create({
      data: {
        productId,
        authorName: authorName.trim(),
        rating: ratingNum,
        comment: comment ? comment.trim() : null,
        verified: true,
      },
    });

    // 2. Re-calculate average rating and review count for product
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const reviewCount = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (reviewCount || 1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        avgRating,
        reviewCount,
      },
    });

    return NextResponse.json({
      success: true,
      review: newReview,
      message: "Merci ! Votre avis a été publié avec succès.",
    });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la publication de l'avis" },
      { status: 500 }
    );
  }
}
