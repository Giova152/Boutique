"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import ImageUploader from "@/app/components/ui/ImageUploader";
import { useToast } from "@/app/context/ToastContext";
import { ArrowLeft, Save } from "lucide-react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "0",
    images: "",
    categoryId: "",
    stock: "0",
    ingredients: "",
    instructions: "",
    benefits: "",
    status: "active",
    featured: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        let imgStr = data.images;
        try {
          const parsed = JSON.parse(data.images);
          if (Array.isArray(parsed) && parsed.length > 0) imgStr = parsed[0];
        } catch {}

        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          price: data.price?.toString() || "0",
          images: imgStr || "",
          categoryId: data.categoryId || "",
          stock: data.stock?.toString() || "0",
          ingredients: data.ingredients || "",
          instructions: data.instructions || "",
          benefits: data.benefits || "",
          status: data.status || "active",
          featured: Boolean(data.featured),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: JSON.stringify([formData.images || "/images/products/vegederm-savon.png"]),
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Produit mis à jour avec succès !", "success");
        router.push("/admin/produits");
      } else {
        showToast("Erreur lors de la mise à jour", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Chargement du produit…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Modifier le Produit VEGEDERM
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Téléversez une nouvelle photo ou modifiez les détails du soin.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        {/* Photo Upload with Instant Preview */}
        <ImageUploader
          label="Téléverser / Remplacer la photo du produit *"
          value={formData.images}
          onChange={(url) => setFormData({ ...formData, images: url })}
        />

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Nom de la pommade *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:border-primary-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Catégorie *</label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold bg-white focus:border-primary-600 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Prix ($ CAD) *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:border-primary-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Stock disponible *</label>
            <input
              type="number"
              name="stock"
              required
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-extrabold focus:border-primary-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Statut *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold bg-white focus:border-primary-600 focus:outline-none"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Description *</label>
          <textarea
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:border-primary-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Ingrédients</label>
            <textarea
              name="ingredients"
              rows={2}
              value={formData.ingredients}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:border-primary-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Conseils d'utilisation</label>
            <textarea
              name="instructions"
              rows={2}
              value={formData.instructions}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:border-primary-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Bénéfices</label>
            <textarea
              name="benefits"
              rows={2}
              value={formData.benefits}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:border-primary-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-primary-600 accent-primary-600"
            />
            <span>Mettre en avant ce produit (Badge Vedette)</span>
          </label>

          <Button type="submit" variant="primary" size="lg" loading={saving} className="!bg-primary-600 font-bold">
            <Save size={18} /> Mettre à jour le produit
          </Button>
        </div>
      </form>
    </div>
  );
}
