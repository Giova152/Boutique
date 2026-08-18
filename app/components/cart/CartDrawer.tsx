"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check } from "lucide-react";
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
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState<{ success?: boolean; text?: string }>({});

  if (!isCartOpen) return null;

  const total = Math.max(0, subtotal - promoDiscount);
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setLoadingCode(true);
    setCodeMessage({});
    const res = await applyPromoCode(inputCode.trim());
    setLoadingCode(false);
    if (res.success) {
      setCodeMessage({ success: true, text: res.message });
      setInputCode("");
    } else {
      setCodeMessage({ success: false, text: res.message });
    }
  };

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
            <ShoppingBag className="text-emerald-400" size={20} aria-hidden="true" />
            <h2 className="text-lg font-serif font-bold text-white">Mon Panier</h2>
            {totalQuantity > 0 && (
              <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                {totalQuantity}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors focus-visible-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Fermer le panier"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200">
          <span>🇨🇦 <strong>Livraison Canada Uniquement</strong></span>
          <span className="text-emerald-800">Gratuit dès 75 $</span>
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
            {/* FORMULAIRE CODE PROMO DANS LE TIROIR PANIER */}
            {!promoCode ? (
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Code promo (ex: VEGEDERM10)"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                  <Button variant="secondary" size="sm" loading={loadingCode} type="submit" className="font-bold border-slate-300 text-xs shrink-0">
                    Appliquer
                  </Button>
                </div>
                {codeMessage.text && (
                  <p className={`text-[11px] font-bold ${codeMessage.success ? "text-emerald-700" : "text-rose-600"}`}>
                    {codeMessage.text}
                  </p>
                )}
              </form>
            ) : (
              <div className="flex justify-between items-center text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 font-bold">
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600" />
                  Code <strong>{promoCode}</strong> (-{promoDiscount.toFixed(2)} $)
                </span>
                <button
                  type="button"
                  onClick={removePromoCode}
                  className="text-emerald-800 underline font-bold"
                >
                  Retirer
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-700 font-semibold pt-1">
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
                <Button variant="primary" size="md" fullWidth className="font-bold !bg-emerald-600">
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