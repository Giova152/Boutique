"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import Button from "../ui/Button";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    promoCode,
    promoDiscount,
    removePromoCode,
  } = useCart();

  if (!isCartOpen) return null;

  const total = Math.max(0, subtotal - promoDiscount);
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-up"
        role="dialog"
        aria-label="Panier"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary-400" size={20} aria-hidden="true" />
            <h2 className="text-lg font-serif font-bold text-white">Mon Panier</h2>
            {totalQuantity > 0 && (
              <span className="text-xs bg-primary-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                {totalQuantity}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors focus-visible-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            aria-label="Fermer le panier"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="bg-primary-50 px-4 py-2 text-xs font-bold text-primary-900 flex items-center justify-between border-b border-primary-200">
          <span>🇨🇦 <strong>Livraison Canada Uniquement</strong></span>
          <span className="text-primary-700">Gratuit dès 75 $</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <ShoppingBag size={48} className="text-slate-300 mb-3" aria-hidden="true" />
              <p className="font-bold text-slate-800 text-base">Votre panier est vide</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                Découvrez nos pommades cosmétiques naturelles et ajoutez vos soins préférés.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4 font-bold"
                onClick={() => setIsCartOpen(false)}
              >
                Découvrir le catalogue
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produit/${item.slug}`}
                    onClick={() => setIsCartOpen(false)}
                    className="font-bold text-sm text-slate-900 hover:text-primary-600 truncate block"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs font-extrabold text-slate-700 mt-0.5">
                    {item.price.toFixed(2)} $ CAD
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-700 hover:bg-slate-200 transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-slate-700 hover:bg-slate-200 transition-colors"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Supprimer"
                      aria-label={`Supprimer ${item.name}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-slate-900">
                    {(item.price * item.quantity).toFixed(2)} $
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            {promoCode && (
              <div className="flex justify-between items-center text-xs bg-primary-100 text-primary-900 p-2.5 rounded-xl border border-primary-200 font-bold">
                <span>Code <strong>{promoCode}</strong> appliqué</span>
                <button
                  type="button"
                  onClick={removePromoCode}
                  className="text-primary-800 underline font-bold"
                >
                  Retirer
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-bold text-slate-900">{subtotal.toFixed(2)} $ CAD</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-primary-700 font-bold">
                  <span>Rabais promo</span>
                  <span>- {promoDiscount.toFixed(2)} $</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Frais de livraison</span>
                <span>{subtotal >= 75 ? "Gratuit" : "Calculé au paiement"}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total estimé</span>
                <span className="text-primary-600 text-lg">{total.toFixed(2)} $ CAD</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/panier" onClick={() => setIsCartOpen(false)}>
                <Button variant="secondary" size="md" fullWidth className="font-bold border-slate-300">
                  Voir panier
                </Button>
              </Link>
              <Link href="/commande" onClick={() => setIsCartOpen(false)}>
                <Button variant="primary" size="md" fullWidth className="font-bold">
                  Commander <ArrowRight size={14} aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}