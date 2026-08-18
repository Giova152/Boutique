"use client";

import React, { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/context/ToastContext";
import { FolderTree, Plus, Trash2, Tag } from "lucide-react";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
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
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Catégorie "${formData.name}" créée avec succès !`, "success");
        setFormData({ name: "", slug: "", description: "" });
        fetchCategories();
      } else {
        showToast(data.error || "Erreur de création", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ?`)) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Catégorie "${name}" supprimée !`, "info");
        fetchCategories();
      } else {
        showToast(data.error || "Erreur de suppression", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Gestion des Catégories
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ajoutez, visualisez ou supprimez les catégories de produits de la boutique.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Create */}
        <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Plus size={16} className="text-primary-600" /> Créer une catégorie
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Nom de la catégorie *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const n = e.target.value;
                setFormData({
                  ...formData,
                  name: n,
                  slug: n
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, ""),
                });
              }}
              placeholder="Ex: NOS SOINS DE PIEDS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold focus:border-primary-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Slug URL *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="nos-soins-de-pieds"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:border-primary-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Description (optionnelle)</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Soin intense réparateur..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:border-primary-600 focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth loading={creating} className="!bg-primary-600 font-bold">
            Ajouter la catégorie
          </Button>
        </form>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Chargement…</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Nom Catégorie</th>
                  <th className="p-4">Slug URL</th>
                  <th className="p-4">Produits associés</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-extrabold text-slate-900">{cat.name}</td>
                    <td className="p-4 font-mono text-slate-500">{cat.slug}</td>
                    <td className="p-4">
                      <span className="bg-primary-50 text-primary-800 border border-primary-200 px-2.5 py-0.5 rounded-full font-bold">
                        {cat._count?.products || 0} produit(s)
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        title="Supprimer la catégorie"
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
