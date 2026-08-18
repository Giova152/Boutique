"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  FolderTree,
  Users,
  Settings,
  LogOut,
  Store,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on admin login page, don't wrap with layout sidebar
  if (pathname === "/admin/connexion") {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { label: "Produits (Catalogue)", href: "/admin/produits", icon: Package },
    { label: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
    { label: "Catégories", href: "/admin/categories", icon: FolderTree },
    { label: "Codes promo", href: "/admin/codes-promo", icon: Tag },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Administrateurs", href: "/admin/administrateurs", icon: ShieldCheck },
    { label: "Paramètres boutique", href: "/admin/parametres", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100/70 text-slate-800">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-white shrink-0 hidden md:flex flex-col border-r border-slate-800 sticky top-0 h-screen">
        {/* Header Branding */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            V
          </div>
          <div>
            <span className="font-serif text-sm font-bold tracking-tight text-white block">
              VEGEDERM ADMIN
            </span>
            <span className="text-[10px] text-primary-400 font-bold tracking-wider uppercase">
              Gestion Boutique
            </span>
          </div>
        </div>

        {/* Quick link to storefront */}
        <div className="p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-primary-950/80 text-primary-300 hover:bg-primary-900 border border-primary-800 text-xs font-bold transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store size={16} /> Voir la boutique
            </span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/connexion" })}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            <span>Déconnexion Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-slate-900 text-white flex flex-col h-full z-10 shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-extrabold text-sm">
                  V
                </div>
                <span className="font-serif text-sm font-bold text-white">
                  VEGEDERM ADMIN
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary-600 text-white shadow-md"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-950 text-primary-300 border border-primary-800 text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <Store size={16} /> Voir boutique
                </span>
                <ExternalLink size={12} />
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/admin/connexion" })}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/50 rounded-xl"
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
              Panneau d'Administration — VEGEDERM
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="hidden sm:inline-block bg-primary-50 text-primary-800 font-bold px-2.5 py-1 rounded-full border border-primary-200 text-[11px]">
              Session Active
            </span>
            <Link
              href="/"
              target="_blank"
              className="md:hidden text-primary-700 font-bold underline text-xs"
            >
              Boutique ↗
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
