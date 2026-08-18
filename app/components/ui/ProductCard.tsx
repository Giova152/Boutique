"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import StarRating from "./StarRating";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string;
  category?: { name: string; slug: string };
  stock: number;
  ingredients?: string;
  benefits?: string;
  status: string;
  featured?: boolean;
  avgRating: number;
  reviewCount: number;
}

export default function ProductCard({ product }: { product: ProductType }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = React.useState(false);

  let imageUrl = "/images/products/lumiere-noire.png";
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
  } catch {}

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      slug: product.slug,
      stock: product.stock,
    });
    setAdded(true);
    showToast(`"${product.name}" ajouté au panier !`, "success");
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-300">
      <div className="relative aspect-[4/3] bg-slate-100/80 overflow-hidden">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.featured && (
            <span className="badge badge-new">Vedette</span>
          )}
          {product.stock <= 0 ? (
            <span className="badge badge-out">Épuisé</span>
          ) : product.stock <= 5 ? (
            <span className="badge badge-low-stock">Stock limité ({product.stock})</span>
          ) : null}
        </div>

        <Link
          href={`/produit/${product.slug}`}
          className="block w-full h-full focus-visible-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label={`Voir ${product.name}`}
        >
          <Image
            src={imageUrl}
            unoptimized
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
      </div>

      <div className="p-5 flex flex-col flex-1 bg-white">
        {product.category && (
          <span className="inline-block mb-2 text-[11px] font-extrabold tracking-wider text-primary-600 uppercase">
            {product.category.name}
          </span>
        )}

        <Link
          href={`/produit/${product.slug}`}
          className="font-serif text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1.5 focus-visible-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
          aria-label={`Voir ${product.name}`}
        >
          {product.name}
        </Link>

        <div className="mb-3">
          <StarRating rating={product.avgRating} reviewsCount={product.reviewCount} size={14} />
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1 font-normal">
          {product.description}
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Prix CAD</span>
            <span className="text-xl font-extrabold text-slate-900">
              {product.price.toFixed(2)} $
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`
              px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-200
              focus-visible-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              ${added
                ? "bg-slate-900 text-white"
                : product.stock <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-primary-600 text-white hover:bg-primary-700 shadow-btn hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
              }
            `}
            aria-label={added ? "Ajouté au panier" : product.stock <= 0 ? "Produit épuisé" : `Ajouter ${product.name} au panier`}
          >
            {added ? (
              <>
                <Check size={16} aria-hidden="true" /> Ajouté
              </>
            ) : product.stock <= 0 ? (
              "Épuisé"
            ) : (
              <>
                <ShoppingBag size={16} aria-hidden="true" /> Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}