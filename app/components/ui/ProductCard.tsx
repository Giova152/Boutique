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
  images: string; // JSON array
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
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300">
      {/* Photo Container */}
      <div className="relative aspect-4/3 bg-slate-100/80 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.featured && (
            <span className="badge-new">Vedette</span>
          )}
          {product.stock <= 0 ? (
            <span className="badge-out">Épuisé</span>
          ) : product.stock <= 5 ? (
            <span className="badge-sale">Stock Limité ({product.stock})</span>
          ) : null}
        </div>

        <Link href={`/produit/${product.slug}`} className="block w-full h-full">
          <Image
            src={imageUrl}
            unoptimized
            alt={product.name}
            fill
            className="object-cover group-hover:scale-108 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      </div>

      {/* Product Content */}
      <div className="p-5 flex flex-col flex-1 bg-white">
        {product.category && (
          <span className="text-[11px] font-extrabold tracking-wider text-emerald-600 uppercase mb-1">
            {product.category.name}
          </span>
        )}

        <Link
          href={`/produit/${product.slug}`}
          className="font-serif text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1.5"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <StarRating rating={product.avgRating} reviewsCount={product.reviewCount} size={15} />
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1 font-normal">
          {product.description}
        </p>

        {/* Price + Action Button */}
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-200 ${
              added
                ? "bg-slate-900 text-white"
                : product.stock <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-emerald-600/30 active:scale-95"
            }`}
          >
            {added ? (
              <>
                <Check size={16} /> Ajouté
              </>
            ) : product.stock <= 0 ? (
              "Épuisé"
            ) : (
              <>
                <ShoppingBag size={16} /> Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
