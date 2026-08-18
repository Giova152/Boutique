"use client";

import React, { useState, useEffect } from "react";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import ProductCard from "@/app/components/ui/ProductCard";
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  Award,
  Filter,
  SlidersHorizontal,
  X,
  RefreshCw,
  Search,
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSkinType, setSelectedSkinType] = useState<string>("");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } catch (err) {
        console.error("Erreur de chargement de la boutique:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtrage des produits
  let filteredProducts = products.filter((p) => {
    // Filtre recherche
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat = p.category?.name?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    // Filtre catégorie
    if (selectedCategory && p.category?.slug !== selectedCategory) {
      return false;
    }

    // En stock uniquement
    if (onlyInStock && p.stock <= 0) {
      return false;
    }

    return true;
  });

  // Tri
  if (sortBy === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
  } else {
    // Par défaut "newest"
    filteredProducts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedSkinType("");
    setOnlyInStock(false);
    setSearchQuery("");
    setSortBy("newest");
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(selectedSkinType) ||
    onlyInStock ||
    Boolean(searchQuery);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onSearch={(q) => setSearchQuery(q)} searchQuery={searchQuery} />

      {/* HERO BANNER AVEC COMPATIBILITÉ ET TAILLE OPTIMISÉE MOBILE */}
      <section className="relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden py-6 sm:py-10 md:py-16 border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src="/images/hero-banner.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-2.5 sm:space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest shadow-md">
            <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" aria-hidden="true" /> VEGEDERM BIO COSMECEUTIQUES • Fabriqué au Canada 🇨🇦
          </div>

          <h1 className="font-serif text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight drop-shadow-md">
            Pommades Bio-Cosméceutiques <br className="hidden sm:inline" />
            &amp; Soins Botaniques
          </h1>

          <p className="max-w-xl mx-auto text-xs sm:text-base text-slate-200 font-medium leading-relaxed drop-shadow-xs">
            Formules riches en huiles végétales et beurres rares pour la peau et les cheveux.
          </p>

          <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1.5 text-[11px] sm:text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Leaf size={14} className="text-emerald-400 shrink-0" aria-hidden="true" /> Ingrédients Biologiques
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" aria-hidden="true" /> Formules Sans Parabènes
            </span>
            <span className="flex items-center gap-1.5">
              <Award size={14} className="text-emerald-400 shrink-0" aria-hidden="true" /> Fabriqué au Québec
            </span>
          </div>
        </div>
      </section>

      {/* CATALOGUE ET FILTRES */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR FILTRES DESKTOP */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Filter size={18} className="text-emerald-600" aria-hidden="true" />
                    <span>Filtres de recherche</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} aria-hidden="true" /> Effacer
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                    Catégories de soin
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === ""
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200"
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
                            : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200"
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
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <span>En stock uniquement</span>
                  </label>
                </div>
              </div>

              {/* BOUTON FILTRES MOBILE */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 shadow-card hover:border-emerald-300 transition-colors"
                aria-expanded={filtersOpen}
              >
                <Filter size={16} className="text-emerald-600" aria-hidden="true" />
                <span>Filtres</span>
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                    {[selectedCategory, selectedSkinType, onlyInStock, searchQuery].filter(Boolean).length}
                  </span>
                )}
                {filtersOpen ? <X size={16} aria-hidden="true" /> : <SlidersHorizontal size={16} aria-hidden="true" />}
              </button>

              {/* PANNEAU FILTRES MOBILE */}
              {filtersOpen && (
                <div className="lg:hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6 animate-slide-down">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Filter size={18} className="text-emerald-600" aria-hidden="true" />
                      <span>Filtres de recherche</span>
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={12} aria-hidden="true" /> Effacer
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                      Catégories de soin
                    </label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setSelectedCategory("")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          selectedCategory === ""
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200"
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
                              : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200"
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
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                      <span>En stock uniquement</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* LISTE DES PRODUITS */}
          <div className="flex-1 space-y-6">
            {/* BARRE DE TRI */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs font-bold text-slate-700">
                <span className="text-emerald-700 text-sm font-extrabold">{filteredProducts.length}</span> pommades trouvées
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label htmlFor="sort-select" className="text-xs font-bold text-slate-500 shrink-0">
                  Trier par :
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="newest">Nouveautés</option>
                  <option value="price-asc">Prix : croissant</option>
                  <option value="price-desc">Prix : décroissant</option>
                  <option value="rating">Meilleures notes</option>
                </select>
              </div>
            </div>

            {/* GRILLE DE PRODUITS */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-80 bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
                    <div className="h-40 bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-card">
                <Search size={48} className="text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 font-serif">Aucune pommade ne correspond</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Essayez de modifier vos critères de recherche ou de réinitialiser vos filtres.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md"
                  >
                    <RefreshCw size={14} /> Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
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