"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProductCard, { ProductType } from "./components/ui/ProductCard";
import { Filter, SlidersHorizontal, Sparkles, RefreshCw, Leaf, ShieldCheck, Award, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ShopHomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSkinType, setSelectedSkinType] = useState<string>("");
  const [priceSort, setPriceSort] = useState<string>("newest");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const hasActiveFilters = selectedCategory || selectedSkinType || onlyInStock || searchQuery;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onSearch={(q) => setSearchQuery(q)} searchQuery={searchQuery} />

      <section className="relative bg-slate-950 text-white overflow-hidden py-10 md:py-14 lg:py-16 border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center">
          <Image
            src="/images/hero-banner.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-primary-500/50 text-primary-400 text-xs font-bold uppercase tracking-widest shadow-lg">
            <Sparkles size={14} aria-hidden="true" /> VEGEDERM BIO COSMECEUTIQUES • Fabriqué au Canada 🇨🇦
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Soins Bio-Cosméceutiques Botaniques <br className="hidden sm:inline" />
            & Pommades d&apos;Exception
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Formules riches concentrées en huiles végétales et beurres rares. Restaurez l&apos;hydratation et la vitalité de votre peau et de vos cheveux.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-2">
              <Leaf size={16} className="text-primary-400" aria-hidden="true" /> Ingrédients Biologiques
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary-400" aria-hidden="true" /> Formules Sans Parabènes
            </span>
            <span className="flex items-center gap-2">
              <Award size={16} className="text-primary-400" aria-hidden="true" /> Fabriqué au Québec
            </span>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Filter size={18} className="text-primary-500" aria-hidden="true" />
                    <span>Filtres de recherche</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} aria-hidden="true" /> Effacer
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                    Catégories de soin
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === ""
                          ? "bg-primary-500 text-white shadow-sm"
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
                            ? "bg-primary-500 text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                    />
                    <span>En stock uniquement</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 shadow-card hover:border-primary-300 transition-colors"
                aria-expanded={filtersOpen}
              >
                <Filter size={16} className="text-primary-500" aria-hidden="true" />
                <span>Filtres</span>
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center">
                    {[selectedCategory, selectedSkinType, onlyInStock, searchQuery].filter(Boolean).length}
                  </span>
                )}
                {filtersOpen ? <X size={16} aria-hidden="true" /> : <SlidersHorizontal size={16} aria-hidden="true" />}
              </button>

              {filtersOpen && (
                <div className="lg:hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6 animate-slide-down">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Filter size={18} className="text-primary-500" aria-hidden="true" />
                      <span>Filtres de recherche</span>
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={12} aria-hidden="true" /> Effacer
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                      Catégories de soin
                    </label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setSelectedCategory("")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          selectedCategory === ""
                            ? "bg-primary-500 text-white shadow-sm"
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
                              ? "bg-primary-500 text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(e) => setOnlyInStock(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 accent-primary-500 cursor-pointer"
                      />
                      <span>En stock uniquement</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-bold text-slate-800">
                {loading ? (
                  <span className="text-slate-400">Recherche en cours…</span>
                ) : (
                  <span>
                    <strong className="text-primary-500 text-base">{products.length}</strong>{" "}
                    pommade{products.length > 1 ? "s" : ""} trouvée{products.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <SlidersHorizontal size={15} className="text-slate-400" aria-hidden="true" />
                <span>Trier par :</span>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-primary-500"
                >
                  <option value="newest">Nouveautés</option>
                  <option value="price-asc">Prix : croissant</option>
                  <option value="price-desc">Prix : décroissant</option>
                  <option value="popular">Les plus populaires</option>
                  <option value="rating">Meilleures évaluations</option>
                </select>
              </div>
            </div>

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
                  className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-xs font-bold shadow-btn hover:bg-primary-600 transition-all"
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