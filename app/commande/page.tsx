"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import Button from "@/app/components/ui/Button";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  UserCheck,
  Building,
  MapPin,
  Phone,
  FileText,
  Clock,
} from "lucide-react";

const CANADIAN_PROVINCES = [
  { code: "QC", name: "Québec" },
  { code: "ON", name: "Ontario" },
  { code: "BC", name: "Colombie-Britannique" },
  { code: "AB", name: "Alberta" },
  { code: "MB", name: "Manitoba" },
  { code: "SK", name: "Saskatchewan" },
  { code: "NS", name: "Nouvelle-Écosse" },
  { code: "NB", name: "Nouveau-Brunswick" },
  { code: "NL", name: "Terre-Neuve-et-Labrador" },
  { code: "PE", name: "Île-du-Prince-Édouard" },
  { code: "NT", name: "Territoires du Nord-Ouest" },
  { code: "YT", name: "Yukon" },
  { code: "NU", name: "Nunavut" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, promoDiscount, clearCart } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "card">("stripe");

  // Precise Form State
  const [formData, setFormData] = useState({
    name: "Jean Tremblay",
    email: "jean.tremblay@example.ca",
    phone: "514-555-0199",
    street: "742 Rue Sainte-Catherine Est",
    apartment: "Apt 304",
    city: "Montréal",
    province: "QC",
    postalCode: "H2L 2E7",
    instructions: "Déposer devant la porte si absent.",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const shipping = subtotal >= 75 || items.length === 0 ? 0 : 9.99;
  const tax = Math.round((subtotal - promoDiscount) * 0.14975 * 100) / 100;
  const total = Math.max(0, subtotal - promoDiscount + shipping + tax);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Le nom complet est obligatoire";
    if (!formData.email.trim() || !formData.email.includes("@"))
      errs.email = "Adresse courriel valide requise";
    if (!formData.street.trim()) errs.street = "L'adresse civique est obligatoire";
    if (!formData.city.trim()) errs.city = "La ville est obligatoire";
    if (!formData.postalCode.trim()) {
      errs.postalCode = "Code postal canadien requis";
    } else {
      const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      if (!postalRegex.test(formData.postalCode.trim())) {
        errs.postalCode = "Format invalide (Ex: H2L 2E7 ou A1A 1A1)";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Veuillez corriger les erreurs de saisie.", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Votre panier est vide.", "error");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "stripe") {
        // Initiate Stripe Checkout session call
        const stripeRes = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            guestEmail: formData.email,
            guestName: formData.name,
            address: formData,
          }),
        });

        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          window.location.href = stripeData.url;
          return;
        }
      }

      // Standard / Fallback Order Creation
      const orderPayload = {
        guestName: formData.name,
        guestEmail: formData.email,
        address: JSON.stringify({
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode.toUpperCase(),
          country: "Canada",
          phone: formData.phone,
          instructions: formData.instructions,
        }),
        subtotal,
        shippingCost: shipping,
        taxAmount: tax,
        total,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        showToast("Commande créée avec succès ! Notification envoyée à l'administrateur.", "success");
        router.push(`/commande/confirmation?id=${data.id}`);
      } else {
        showToast(data.error || "Erreur de création de commande", "error");
      }
    } catch (err) {
      showToast("Une erreur est survenue lors de la validation.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Caisse & Finalisation de la commande
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Commande directe en tant qu'invité (aucun compte requis) • Expédition Canada 🇨🇦
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns: Address & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Customer Contact */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                <UserCheck className="text-emerald-600" size={20} />
                <span>1. Informations de contact (Invité)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nom et Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                  />
                  {errors.name && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Adresse courriel (pour confirmation) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                  />
                  {errors.email && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.email}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Phone size={14} className="text-slate-400" /> Numéro de téléphone (pour livraison)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="514-555-0199"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Canadian Shipping Address */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                <MapPin className="text-emerald-600" size={20} />
                <span>2. Adresse de livraison précise (Canada uniquement)</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Adresse civique & Rue *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Ex: 742 Rue Sainte-Catherine Est"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                    />
                    {errors.street && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.street}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      App. / Apt / Suite (optionnel)
                    </label>
                    <input
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      placeholder="Apt 304"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Ville *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Montréal"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                    />
                    {errors.city && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Province *</label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold bg-white focus:border-emerald-600 focus:outline-none"
                    >
                      {CANADIAN_PROVINCES.map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.name} ({prov.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Code postal canadien *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value.toUpperCase() })
                      }
                      placeholder="H2L 2E7"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-extrabold focus:border-emerald-600 focus:outline-none uppercase"
                    />
                    {errors.postalCode && (
                      <p className="text-[11px] text-red-600 font-bold mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <FileText size={14} className="text-slate-400" /> Instructions spéciales pour le livreur (optionnel)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Ex: Laisser devant la porte ou sonner chez le voisin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method (Stripe) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                <CreditCard className="text-emerald-600" size={20} />
                <span>3. Mode de paiement sécurisé</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setPaymentMethod("stripe")}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === "stripe"
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Paiement Stripe 💳</span>
                    <span className="text-xs text-slate-600 font-medium">Cartes bancaires (Visa, Mastercard, Amex)</span>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Paiement à la livraison / Virement</span>
                    <span className="text-xs text-slate-600 font-medium">Confirmation directe de la commande</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Guarantee */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                Commande ({items.reduce((acc, i) => acc + i.quantity, 0)} articles)
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">
                      {i.name} (x{i.quantity})
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {(i.price * i.quantity).toFixed(2)} $
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-xs text-slate-700 font-semibold pt-3 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="font-bold text-slate-900">{subtotal.toFixed(2)} $</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Rabais appliqué</span>
                    <span>- {promoDiscount.toFixed(2)} $</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Expédition Canada</span>
                  <span className="text-slate-900">{shipping === 0 ? "Gratuite (>= 75$)" : `${shipping.toFixed(2)} $`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (TPS/TVQ Canada)</span>
                  <span className="text-slate-900">{tax.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total final (CAD)</span>
                  <span className="text-emerald-600 text-xl">{total.toFixed(2)} $</span>
                </div>
              </div>

              {/* 30-min Cancellation Notice */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1 text-amber-900">
                  <Clock size={14} /> Annulation gratuite pendant 30 minutes
                </p>
                <p className="text-[11px] leading-relaxed">
                  Après confirmation, vous disposerez de 30 minutes pour annuler sans frais votre commande en un clic.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="!bg-emerald-600 hover:!bg-emerald-700 font-bold shadow-md"
              >
                Confirmer la commande ({total.toFixed(2)} $ CAD) <ArrowRight size={18} />
              </Button>

              <div className="text-[11px] text-slate-500 font-semibold text-center flex items-center justify-center gap-1">
                <Lock size={14} className="text-emerald-600" />
                <span>Paiement chiffré 256-bit SSL • Exclusif Canada 🇨🇦</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
