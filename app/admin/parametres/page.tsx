"use client";

import React, { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import ImageUploader from "@/app/components/ui/ImageUploader";
import { useToast } from "@/app/context/ToastContext";
import { Settings, Truck, DollarSign, Image as ImageIcon, Save, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    store_name: "VEGEDERM BIO COSMECEUTIQUES",
    store_email: "contact@vegedermbiocosmeceutiques.com",
    flat_shipping_rate: "13.00",
    free_shipping_threshold: "75.00",
    favicon_url: "/favicon.ico",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data && typeof data === "object") {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Paramètres enregistrés avec succès !", "success");
      } else {
        showToast(data.error || "Erreur d'enregistrement", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Paramètres de la Boutique VEGEDERM
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gérez le nom, le tarif de livraison par défaut (13$), les seuils et l'icône favicon du site.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        {/* Section 1: Informations Générales */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Settings size={18} className="text-emerald-600" /> Informations Générales
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nom officiel de la boutique *
              </label>
              <input
                type="text"
                required
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-extrabold focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Courriel de notification Admin *
              </label>
              <input
                type="email"
                required
                value={settings.store_email}
                onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Frais de Livraison (13$ de base) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Truck size={18} className="text-emerald-600" /> Tarification Livraison (Canada)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Frais de livraison de base ($ CAD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.flat_shipping_rate}
                onChange={(e) => setSettings({ ...settings, flat_shipping_rate: e.target.value })}
                placeholder="13.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-extrabold focus:border-emerald-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Tarif par défaut appliqué au panier.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Seuil de livraison gratuite ($ CAD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                placeholder="75.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-extrabold focus:border-emerald-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Gratuit pour toute commande supérieure ou égale à ce montant.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Favicon & Logo */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ImageIcon size={18} className="text-emerald-600" /> Icône du site (Favicon)
          </h3>

          <ImageUploader
            label="Téléverser l'icône favicon (.ico, .png)"
            value={settings.favicon_url}
            onChange={(url) => setSettings({ ...settings, favicon_url: url })}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={saving} className="!bg-emerald-600 font-bold">
            <Save size={18} /> Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
