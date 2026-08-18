"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const { items, subtotal, promoDiscount, promoCode, applyPromoCode, removePromoCode, clearCart } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [promoMsg, setPromoMsg] = useState<{ success?: boolean; text?: string }>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    province: "QC",
    postalCode: "",
    instructions: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const shipping = subtotal >= 75 || items.length === 0 ? 0 : 9.99;
  const tax = Math.round((subtotal - promoDiscount) * 0.14975 * 100) / 100;
  const total = Math.max(0, subtotal - promoDiscount + shipping + tax);
  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);

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
      const stripeRes = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          guestEmail: formData.email,
          guestName: formData.name,
          address: formData,
          promoCode,
        }),
      });

      const stripeData = await stripeRes.json();
      if (stripeData.url) {
        clearCart();
        window.location.href = stripeData.url;
        return;
      }

      // Paiement Stripe indisponible (clé invalide, erreur réseau, etc.)
      // => NE PAS créer la commande ni afficher un faux succès.
      if (!stripeRes.ok || !stripeData.url) {
        showToast(
          stripeData.error ||
            stripeData.message ||
            "Le paiement Stripe est temporairement indisponible. Veuillez réessayer.",
          "error"
        );
        return;
      }

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Caisse & Finalisation de la commande
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Commande directe en tant qu&apos;invité (aucun compte requis) • Expédition Canada 🇨🇦
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                <UserCheck className="text-primary-500" size={20} aria-hidden="true" />
                <span>1. Informations de contact (Invité)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-name" className="label">Nom et Prénom *</label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Marie Tremblay"
                    className={`input ${errors.name ? "input-error" : ""}`}
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="checkout-email" className="label">Adresse courriel (pour confirmation) *</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ex: marie.tremblay@example.ca"
                    className={`input ${errors.email ? "input-error" : ""}`}
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="checkout-phone" className="label flex items-center gap-1 normal-case tracking-normal">
                    <Phone size={14} className="text-slate-400" aria-hidden="true" /> Numéro de téléphone (pour livraison)
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="514-555-0199"
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                <MapPin className="text-primary-500" size={20} aria-hidden="true" />
                <span>2. Adresse de livraison précise (Canada uniquement)</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-street" className="label">Adresse civique & Rue *</label>
                    <input
                      id="checkout-street"
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Ex: 742 Rue Sainte-Catherine Est"
                      className={`input ${errors.street ? "input-error" : ""}`}
                    />
                    {errors.street && <p className="form-error">{errors.street}</p>}
                  </div>

                  <div>
                    <label htmlFor="checkout-apartment" className="label">App. / Apt / Suite (optionnel)</label>
                    <input
                      id="checkout-apartment"
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      placeholder="Apt 304"
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="checkout-city" className="label">Ville *</label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Montréal"
                      className={`input ${errors.city ? "input-error" : ""}`}
                    />
                    {errors.city && <p className="form-error">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="checkout-province" className="label">Province *</label>
                    <select
                      id="checkout-province"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="input"
                    >
                      {CANADIAN_PROVINCES.map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.name} ({prov.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="checkout-postal" className="label">Code postal canadien *</label>
                    <input
                      id="checkout-postal"
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value.toUpperCase() })
                      }
                      placeholder="H2L 2E7"
                      className={`input uppercase ${errors.postalCode ? "input-error" : ""}`}
                    />
                    {errors.postalCode && <p className="form-error">{errors.postalCode}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-instructions" className="label flex items-center gap-1 normal-case tracking-normal">
                    <FileText size={14} className="text-slate-400" aria-hidden="true" /> Instructions spéciales pour le livreur (optionnel)
                  </label>
                  <textarea
                    id="checkout-instructions"
                    rows={2}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Ex: Laisser devant la porte ou sonner chez le voisin"
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                <CreditCard className="text-primary-500" size={20} aria-hidden="true" />
                <span>3. Mode de paiement sécurisé</span>
              </div>

              <div className="p-4 rounded-2xl border-2 border-primary-500 bg-primary-50/50 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Paiement par carte bancaire 💳</span>
                    <span className="text-xs text-slate-600 font-medium">Cartes bancaires acceptées (Visa, Mastercard, Amex)</span>
                  </div>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full shrink-0">
                  100% Sécurisé
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4 lg:sticky lg:top-24">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                Commande ({totalQuantity} article{totalQuantity > 1 ? "s" : ""})
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

              {/* FORMULAIRE CODE PROMO SUR LA PAGE DE PAIEMENT */}
              <div className="pt-3 border-t border-slate-100">
                {!promoCode ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!promoInput.trim()) return;
                      setLoadingPromo(true);
                      setPromoMsg({});
                      const res = await applyPromoCode(promoInput.trim());
                      setLoadingPromo(false);
                      if (res.success) {
                        setPromoMsg({ success: true, text: res.message });
                        setPromoInput("");
                      } else {
                        setPromoMsg({ success: false, text: res.message });
                      }
                    }}
                    className="space-y-1.5"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Code promo (ex: VEGEDERM10)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                      <Button variant="secondary" size="sm" loading={loadingPromo} type="submit" className="font-bold text-xs border-slate-300 shrink-0">
                        Appliquer
                      </Button>
                    </div>
                    {promoMsg.text && (
                      <p className={`text-[11px] font-bold ${promoMsg.success ? "text-emerald-700" : "text-rose-600"}`}>
                        {promoMsg.text}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="flex justify-between items-center text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 font-bold">
                    <span>Code <strong>{promoCode}</strong> (-{promoDiscount.toFixed(2)} $)</span>
                    <button type="button" onClick={removePromoCode} className="text-emerald-800 underline font-bold">
                      Retirer
                    </button>
                  </div>
                )}
              </div>

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

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1 text-amber-900">
                  <Clock size={14} aria-hidden="true" /> Annulation gratuite pendant 30 minutes
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
                className="font-bold shadow-md"
              >
                Confirmer la commande ({total.toFixed(2)} $ CAD) <ArrowRight size={18} aria-hidden="true" />
              </Button>

              <div className="text-[11px] text-slate-500 font-semibold text-center flex items-center justify-center gap-1">
                <Lock size={14} className="text-primary-500" aria-hidden="true" />
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