"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, User, ShieldCheck, Sparkles, Menu, X, ShoppingBag } from "lucide-react";
import CartIcon from "../ui/CartIcon";
import CartDrawer from "../cart/CartDrawer";
import { useSession } from "next-auth/react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function Header({ onSearch, searchQuery = "" }: HeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setLocalSearch(q);
    if (onSearch) onSearch(q);
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-emerald-400 shrink-0" />
        <span>🌿 <strong>VEGEDERM BIO COSMECEUTIQUES</strong> — Soins Bio & Produits Botaniques</span>
        <span className="hidden sm:inline-block text-slate-600">|</span>
        <span className="hidden sm:inline-block text-emerald-400 font-semibold">🇨🇦 Livraison gratuite au Canada dès 75 $</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-emerald-700 transition-colors">
              V
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900 block leading-none">
                VEGEDERM
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-emerald-600 uppercase block mt-1">
                Bio Cosméceutiques • Canada
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Rechercher une pommade..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Right Navigation & Cart */}
          <div className="flex items-center gap-3">
            {/* Account link */}
            {session ? (
              <Link
                href={(session.user as { role?: string })?.role === "admin" ? "/admin" : "/compte/commandes"}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                {(session.user as { role?: string })?.role === "admin" ? (
                  <>
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Admin</span>
                  </>
                ) : (
                  <>
                    <User size={16} className="text-emerald-600" />
                    <span>Mon Compte</span>
                  </>
                )}
              </Link>
            ) : (
              <Link
                href="/compte/connexion"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 px-3.5 py-2 rounded-xl hover:bg-emerald-50 transition-colors border border-slate-200/80"
              >
                <User size={16} className="text-emerald-600" />
                <span>Connexion</span>
              </Link>
            )}

            {/* Cart Icon */}
            <CartIcon />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200"
              aria-label="Menu mobile"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder="Rechercher une pommade..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-sm font-bold text-slate-800">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-100"
              >
                Boutique (Catalogue)
              </Link>
              <Link
                href="/panier"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-100"
              >
                Mon Panier
              </Link>
              <Link
                href="/compte/connexion"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-100"
              >
                Espace Client (Connexion)
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
