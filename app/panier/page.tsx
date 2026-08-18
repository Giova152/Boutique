"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import Button from "@/app/components/ui/Button";
import { useCart } from "@/app/context/CartContext";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    promoCode,
    promoDiscount,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [codeMessage, setCodeMessage] = useState<{ success?: boolean; text?: string }>({});
  const [loadingCode, setLoadingCode] = useState(false);

  const shipping = subtotal >= 75 || items.length === 0 ? 0 : 9.99;
  const tax = Math.round((subtotal - promoDiscount) * 0.14975 * 100) / 100;
  const total = Math.max(0, subtotal - promoDiscount + shipping + tax);

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">Mon Panier</h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Gérez vos articles et appliquez vos offres promotionnelles.
            </p>
          </div>
          <Link href="/" className="text-xs font-bold text-emerald-700 hover:underline">
            ← Continuer mes achats
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Votre panier est actuellement vide</h2>
            <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
              Découvrez nos pommades cosmétiques naturelles adaptées à tous vos besoins.
            </p>
            <Link href="/">
              <Button variant="primary" size="md" className="!bg-emerald-600 font-bold">
                Explorer le catalogue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-center">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <Link
                        href={`/produit/${item.slug}`}
                        className="font-serif font-bold text-lg text-slate-900 hover:text-emerald-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-500 font-semibold">Pommade Cosmétique • Soin Bio</p>
                      <p className="text-sm font-extrabold text-emerald-700">
                        {item.price.toFixed(2)} $ CAD
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-slate-700 hover:bg-slate-200 transition-colors rounded-l-xl"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 font-extrabold text-xs text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-slate-700 hover:bg-slate-200 transition-colors rounded-r-xl"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="font-extrabold text-base text-slate-900 w-20 text-right">
                        {(item.price * item.quantity).toFixed(2)} $
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Supprimer l'article"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Promo */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                  Récapitulatif de la commande
                </h3>

                {/* Promo Input */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Tag size={14} className="text-emerald-600" /> Code promo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Ex: BIENVENUE10"
                      className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs uppercase text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                    />
                    <Button variant="secondary" size="sm" loading={loadingCode} type="submit" className="font-bold border-slate-300">
                      Appliquer
                    </Button>
                  </div>
                  {codeMessage.text && (
                    <p
                      className={`text-xs font-bold ${
                        codeMessage.success ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {codeMessage.text}
                    </p>
                  )}
                </form>

                {promoCode && (
                  <div className="flex justify-between items-center text-xs bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-200 font-bold">
                    <span>
                      Code <strong>{promoCode}</strong> (-{promoDiscount.toFixed(2)} $)
                    </span>
                    <button onClick={removePromoCode} className="text-emerald-800 font-bold underline">
                      Retirer
                    </button>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs text-slate-700 font-semibold pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span className="font-bold text-slate-900">{subtotal.toFixed(2)} $</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Rabais promotionnel</span>
                      <span>- {promoDiscount.toFixed(2)} $</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Livraison Canada</span>
                    <span className="text-slate-900">{shipping === 0 ? "Gratuite (offre >= 75$)" : `${shipping.toFixed(2)} $`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Taxes estimées (TPS/TVQ Canada)</span>
                    <span className="text-slate-900">{tax.toFixed(2)} $</span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                    <span>Total (CAD)</span>
                    <span className="text-emerald-600 text-xl">{total.toFixed(2)} $</span>
                  </div>
                </div>

                <Link href="/commande">
                  <Button variant="primary" size="lg" fullWidth className="mt-4 !bg-emerald-600 font-bold">
                    Passer la commande <ArrowRight size={18} />
                  </Button>
                </Link>

                <div className="text-xs text-slate-500 font-bold text-center flex items-center justify-center gap-1 pt-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Paiement 100% sécurisé • Exclusif Canada 🇨🇦</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
