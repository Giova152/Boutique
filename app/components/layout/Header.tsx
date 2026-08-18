"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, ShieldCheck, Sparkles, Menu, X, ShoppingBag, LogOut } from "lucide-react";
import CartIcon from "../ui/CartIcon";
import CartDrawer from "../cart/CartDrawer";
import { useSession, signOut } from "next-auth/react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function Header({ onSearch, searchQuery = "" }: HeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setLocalSearch(q);
    if (onSearch) onSearch(q);
  };

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className="bg-slate-950 text-white text-xs py-2 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-primary-400 shrink-0" aria-hidden="true" />
        <span>🌿 <strong>VEGEDERM BIO COSMECEUTIQUES</strong> — Soins Bio & Produits Botaniques</span>
        <span className="hidden sm:inline-block text-slate-600" aria-hidden="true">|</span>
        <span className="hidden sm:inline-block text-primary-400 font-semibold">🇨🇦 Livraison gratuite au Canada dès 75 $</span>
      </div>

      <header
        className={`
          sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200
          ${scrolled ? "shadow-sm" : "shadow-xs"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group focus-visible-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl"
            aria-label="VEGEDERM BIO COSMECEUTIQUES - Accueil"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-primary-600 transition-colors" aria-hidden="true">
              V
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900 block leading-none">
                VEGEDERM
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-primary-600 uppercase block mt-1">
                Bio Cosméceutiques • Canada
              </span>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <label htmlFor="header-search" className="sr-only">Rechercher une pommade</label>
            <input
              id="header-search"
              type="search"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Rechercher une pommade..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all shadow-xs"
              autoComplete="off"
            />
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          <div className="flex items-center gap-2">
            {session ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href={(session.user as { role?: string })?.role === "admin" ? "/admin" : "/compte/commandes"}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  {(session.user as { role?: string })?.role === "admin" ? (
                    <>
                      <ShieldCheck size={16} className="text-primary-500" aria-hidden="true" />
                      <span>Admin</span>
                    </>
                  ) : (
                    <>
                      <User size={16} className="text-primary-500" aria-hidden="true" />
                      <span className="max-w-[120px] truncate">{session.user?.name || session.user?.email || "Mon Compte"}</span>
                    </>
                  )}
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/compte/connexion" })}
                  title="Déconnexion"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <LogOut size={15} />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link
                href="/compte/connexion"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-primary-600 px-3.5 py-2 rounded-xl hover:bg-primary-50 transition-colors border border-slate-200/80"
              >
                <User size={16} className="text-primary-500" aria-hidden="true" />
                <span>Connexion / Inscription</span>
              </Link>
            )}

            <CartIcon />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-slide-down">
            <div className="relative">
              <label htmlFor="mobile-search" className="sr-only">Rechercher une pommade</label>
              <input
                id="mobile-search"
                type="search"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder="Rechercher une pommade..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-primary-500"
                autoComplete="off"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
            </div>
            <nav className="flex flex-col gap-2 pt-2 border-t border-slate-100" aria-label="Navigation mobile">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="py-2 px-3 rounded-lg hover:bg-slate-100 text-sm font-bold text-slate-800 transition-colors"
              >
                Boutique (Catalogue)
              </Link>
              <Link
                href="/panier"
                onClick={closeMobileMenu}
                className="py-2 px-3 rounded-lg hover:bg-slate-100 text-sm font-bold text-slate-800 transition-colors flex items-center gap-2"
              >
                <ShoppingBag size={18} className="text-primary-500" aria-hidden="true" />
                <span>Mon Panier</span>
              </Link>
              {session ? (
                <>
                  <Link
                    href={(session.user as { role?: string })?.role === "admin" ? "/admin" : "/compte/commandes"}
                    onClick={closeMobileMenu}
                    className="py-2 px-3 rounded-lg hover:bg-slate-100 text-sm font-bold text-slate-800 transition-colors flex items-center gap-2"
                  >
                    <User size={18} className="text-primary-500" aria-hidden="true" />
                    <span>Mon Compte ({session.user?.name || session.user?.email})</span>
                  </Link>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      signOut({ callbackUrl: "/compte/connexion" });
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg hover:bg-rose-50 text-sm font-bold text-rose-600 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={18} aria-hidden="true" />
                    <span>Se Déconnecter</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/compte/connexion"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-lg hover:bg-slate-100 text-sm font-bold text-slate-800 transition-colors flex items-center gap-2"
                >
                  <User size={18} className="text-primary-500" aria-hidden="true" />
                  <span>Connexion / Inscription</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}