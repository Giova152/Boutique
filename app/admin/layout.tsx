"use client";

import React from "react";
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
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
    <div className="min-h-screen flex bg-slate-100/70 text-gray-800">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-charcoal-900 text-white shrink-0 hidden md:flex flex-col border-r border-charcoal-800 sticky top-0 h-screen">
        {/* Header Branding */}
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <div>
            <span className="font-serif text-sm font-bold tracking-tight text-white block">
              AURÉLIA ADMIN
            </span>
            <span className="text-[10px] text-primary-400 font-semibold tracking-wider uppercase">
              Gestion Boutique
            </span>
          </div>
        </div>

        {/* Quick link to storefront */}
        <div className="p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold transition-colors"
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary-500 text-white shadow-btn"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/connexion" })}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/50 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            <span>Déconnexion Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-primary-500 md:hidden" />
            <h1 className="font-bold text-sm text-gray-900">
              Panneau d'Administration — Aurélia Botanicals
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
              Session Admin Active
            </span>
            <Link href="/" className="md:hidden text-primary-600 font-semibold underline">
              Boutique
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
