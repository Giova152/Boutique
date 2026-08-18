"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/context/ToastContext";
import { Plus, Search, Edit3, Trash2, Package, Eye, Filter } from "lucide-react";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/api/products";
      if (search) url += `?search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la pommade "${name}" ?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Produit "${name}" supprimé !`, "info");
        setProducts(products.filter((p) => p.id !== id));
      } else {
        showToast("Erreur lors de la suppression", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Gestion du Catalogue Produits
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez l'ensemble des pommades, prix, descriptions, images et stocks.
          </p>
        </div>

        <Link href="/admin/produits/nouveau">
          <Button variant="primary" size="md">
            <Plus size={16} /> Ajouter une nouvelle pommade
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou ingrédient..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <span className="text-xs text-gray-500 font-semibold">
          {products.length} pommade{products.length > 1 ? "s" : ""} au catalogue
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Chargement du catalogue…</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Package size={40} className="mx-auto text-gray-300" />
            <p className="font-semibold text-gray-600">Aucune pommade trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Produit</th>
                  <th className="p-4">Catégorie</th>
                  <th className="p-4">Prix CAD</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {products.map((p) => {
                  let img = "/images/products/lumiere-noire.png";
                  try {
                    const arr = JSON.parse(p.images);
                    if (arr[0]) img = arr[0];
                  } catch {}

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <Image src={img} unoptimized alt="" fill className="object-cover" />
                        </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{p.name}</span>
                        <span className="text-[11px] text-gray-400">Note : {p.avgRating} ★</span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-600">
                      {p.category?.name || "Non catégorisé"}
                    </td>

                    <td className="p-4 font-bold text-gray-900">
                      {p.price.toFixed(2)} $
                    </td>

                    <td className="p-4">
                      {p.stock <= 0 ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Épuisé</span>
                      ) : p.stock <= 5 ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Faible ({p.stock})</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">{p.stock} unités</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        p.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
                      }`}>
                        {p.status === "active" ? "Actif" : "Inactif"}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/produit/${p.slug}`}
                        target="_blank"
                        className="p-2 text-gray-500 hover:text-primary-600 inline-block"
                        title="Voir la page produit"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/admin/produits/${p.id}`}
                        className="p-2 text-blue-600 hover:text-blue-800 inline-block"
                        title="Modifier"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-2 text-red-500 hover:text-red-700 inline-block"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
