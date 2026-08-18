"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProductCard, { ProductType } from "./components/ui/ProductCard";
import { Filter, SlidersHorizontal, Sparkles, RefreshCw, Leaf, ShieldCheck, Award } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ShopHomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSkinType, setSelectedSkinType] = useState<string>("");
  const [priceSort, setPriceSort] = useState<string>("newest");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, priceSort, onlyInStock]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?sort=${priceSort}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      let data = await res.json();

      if (Array.isArray(data)) {
        if (onlyInStock) {
          data = data.filter((p: ProductType) => p.stock > 0);
        }
        if (selectedSkinType) {
          data = data.filter((p: ProductType) =>
            p.description.toLowerCase().includes(selectedSkinType.toLowerCase()) ||
            (p.ingredients && p.ingredients.toLowerCase().includes(selectedSkinType.toLowerCase())) ||
            (p.benefits && p.benefits.toLowerCase().includes(selectedSkinType.toLowerCase()))
          );
        }
        setProducts(data);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedSkinType("");
    setSearchQuery("");
    setOnlyInStock(false);
    setPriceSort("newest");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onSearch={(q) => setSearchQuery(q)} searchQuery={searchQuery} />

      {/* Compact Mobile Banner */}
      <div className="md:hidden bg-slate-900 text-white py-3 px-4 text-center text-xs font-bold border-b border-slate-800 flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-emerald-400 shrink-0" />
        <span>🌿 <strong>VEGEDERM BIO COSMECEUTIQUES</strong> — Catalogue de Soins Botaniques</span>
      </div>

      {/* Hero Banner — Desktop & Tablet Only */}
      <section className="hidden md:block relative bg-slate-950 text-white overflow-hidden py-16 md:py-24 border-b border-slate-800">
        {/* Dark overlay image background */}
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center">
          <Image
            src="/images/hero-banner.png"
            alt="VEGEDERM BIO COSMECEUTIQUES"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Ambient Gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-lg">
            <Sparkles size={14} /> VEGEDERM BIO COSMECEUTIQUES • Fabriqué au Canada 🇨🇦
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Soins Bio-Cosméceutiques Botaniques <br className="hidden sm:inline" />
            & Pommades d'Exception
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Formules riches concentrées en huiles végétales et beurres rares. Restaurez l'hydratation et la vitalité de votre peau et de vos cheveux.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-2">
              <Leaf size={16} className="text-emerald-400" /> Ingrédients Biologiques
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> Formules Sans Parabènes
            </span>
            <span className="flex items-center gap-2">
              <Award size={16} className="text-emerald-400" /> Fabriqué au Québec
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Filter size={18} className="text-emerald-600" />
                  <span>Filtres de recherche</span>
                </div>
                {(selectedCategory || selectedSkinType || onlyInStock || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Effacer
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Catégories de soin
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === ""
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Toutes les pommades
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat.slug
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Toggle */}
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span>En stock uniquement</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-bold text-slate-800">
                {loading ? (
                  <span className="text-slate-400">Recherche en cours…</span>
                ) : (
                  <span>
                    <strong className="text-emerald-600 text-base">{products.length}</strong> pommade{products.length > 1 ? "s" : ""} trouvée{products.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <SlidersHorizontal size={15} className="text-slate-400" />
                <span>Trier par :</span>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="newest">Nouveautés</option>
                  <option value="price-asc">Prix : croissant</option>
                  <option value="price-desc">Prix : décroissant</option>
                  <option value="popular">Les plus populaires</option>
                  <option value="rating">Meilleures évaluations</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 h-80 flex flex-col justify-between">
                    <div className="w-full h-44 skeleton rounded-xl" />
                    <div className="h-4 w-3/4 skeleton rounded" />
                    <div className="h-3 w-1/2 skeleton rounded" />
                    <div className="h-10 w-full skeleton rounded-xl" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-600 space-y-4">
                <p className="text-base font-bold text-slate-900">
                  Aucune pommade ne correspond à ces critères.
                </p>
                <p className="text-xs text-slate-500">
                  Essayez de réinitialiser vos filtres pour découvrir nos formules botaniques.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all"
                >
                  Afficher tout le catalogue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
