"use client";

import React, { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/context/ToastContext";
import { Tag, Plus, Trash2 } from "lucide-react";

export default function AdminPromoCodesPage() {
  const { showToast } = useToast();
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "10",
    minPurchase: "30",
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await fetch("/api/promo-codes");
      const data = await res.json();
      if (Array.isArray(data)) setPromos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Code promo "${formData.code}" créé avec succès !`, "success");
        setFormData({ code: "", type: "percentage", value: "10", minPurchase: "30" });
        fetchPromos();
      } else {
        showToast(data.error || "Erreur de création", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le code promo "${code}" ?`)) return;

    try {
      const res = await fetch(`/api/promo-codes?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast(`Code promo "${code}" supprimé !`, "info");
        fetchPromos();
      } else {
        showToast("Erreur de suppression", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Gestion des Codes Promo
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Créez, visualisez ou supprimez vos réductions et offres promotionnelles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Plus size={16} className="text-primary-600" /> Nouveau Code Promo
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Code promo *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Ex: VEGEDERM20"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-extrabold uppercase focus:border-primary-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Type de réduction *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold bg-white focus:border-primary-600 focus:outline-none"
            >
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed">Montant fixe ($ CAD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Valeur de la réduction *</label>
            <input
              type="number"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="10"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:border-primary-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Achat minimum ($ CAD)</label>
            <input
              type="number"
              value={formData.minPurchase}
              onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
              placeholder="30"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:border-primary-600 focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth loading={creating} className="!bg-primary-600 font-bold">
            Ajouter le code promo
          </Button>
        </form>

        {/* Promo Codes List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Chargement…</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Code Promo</th>
                  <th className="p-4">Réduction</th>
                  <th className="p-4">Achat Min.</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {promos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-extrabold text-primary-700 text-sm">
                      {p.code}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {p.type === "percentage" ? `-${p.value} %` : `-${p.value.toFixed(2)} $ CAD`}
                    </td>
                    <td className="p-4 text-slate-500 font-semibold">
                      {p.minPurchase > 0 ? `${p.minPurchase.toFixed(2)} $` : "Aucun"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.code)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        title="Supprimer ce code promo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
