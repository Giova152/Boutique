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

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-emerald-400" size={20} />
            <h2 className="text-lg font-serif font-bold text-white">Mon Panier</h2>
            <span className="text-xs bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-full">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Shipping Banner Alert */}
        <div className="bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200">
          <span>🇨🇦 <strong>Livraison Canada Uniquement</strong></span>
          <span className="text-emerald-700">Gratuit dès 75 $</span>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <ShoppingBag size={48} className="text-slate-300 mb-3" />
              <p className="font-bold text-slate-800 text-base">Votre panier est vide</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                Découvrez nos pommades cosmétiques naturelles et ajoutez vos soins préférés.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4 !bg-emerald-600 font-bold"
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
                    className="font-bold text-sm text-slate-900 hover:text-emerald-600 truncate block"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs font-extrabold text-slate-700 mt-0.5">
                    {item.price.toFixed(2)} $ CAD
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
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

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            {promoCode && (
              <div className="flex justify-between items-center text-xs bg-emerald-100 text-emerald-950 p-2.5 rounded-xl border border-emerald-200 font-bold">
                <span>Code <strong>{promoCode}</strong> appliqué</span>
                <button
                  onClick={removePromoCode}
                  className="text-emerald-800 underline font-bold"
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
                <div className="flex justify-between text-emerald-700 font-bold">
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
                <span className="text-emerald-600 text-lg">{total.toFixed(2)} $ CAD</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/panier" onClick={() => setIsCartOpen(false)}>
                <Button variant="secondary" size="md" fullWidth className="font-bold border-slate-300">
                  Voir panier
                </Button>
              </Link>
              <Link href="/commande" onClick={() => setIsCartOpen(false)}>
                <Button variant="primary" size="md" fullWidth className="!bg-emerald-600 font-bold">
                  Commander <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
