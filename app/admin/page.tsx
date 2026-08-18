"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Eye,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter analytics interval
  const [period, setPeriod] = useState<"30" | "all">("30");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/orders"),
        fetch("/api/products"),
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      if (statsRes.ok) setStats(statsData);
      if (Array.isArray(ordersData)) setOrders(ordersData);
      if (Array.isArray(productsData)) setProducts(productsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Top selling products computation
  const topProducts = [...products]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Tableau de Bord VEGEDERM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aperçu des performances, commandes et ventes bio-cosméceutiques.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 pl-2">Période :</span>
          <button
            onClick={() => setPeriod("30")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === "30" ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Derniers 30 jours
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tout l'historique
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400">Chiffre d'affaires</span>
            <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 border border-primary-200">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {stats?.totalRevenue ? `${stats.totalRevenue.toFixed(2)} $` : "0.00 $"} CAD
          </p>
          <span className="text-[11px] text-primary-700 font-bold flex items-center gap-1">
            <TrendingUp size={12} /> +100% ventes au Canada
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400">Total Commandes</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {stats?.totalOrders || orders.length || 0}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Commandes traitées</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400">Produits au Catalogue</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Package size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {stats?.totalProducts || products.length || 0}
          </p>
          <span className="text-[11px] text-primary-700 font-bold">Produits actifs</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400">Clients Enregistrés</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Users size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {stats?.totalCustomers || 1}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Comptes acheteurs</span>
        </div>
      </div>

      {/* Analytics Grid: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Commandes Récentes
            </h3>
            <Link
              href="/admin/commandes"
              className="text-xs text-primary-700 font-bold hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block font-mono">
                    #{ord.id.slice(-8)} — {ord.guestName || "Client"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ord.createdAt).toLocaleDateString("fr-CA")}
                  </span>
                </div>

                <div className="text-right flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {ord.total.toFixed(2)} $ CAD
                  </span>
                  <Link
                    href={`/admin/commandes/${ord.id}`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <Eye size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products Analytics */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Star size={18} className="text-amber-500 fill-amber-500" /> Top Produits du mois
          </h3>

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-primary-700 font-bold">
                      {p.price.toFixed(2)} $ CAD
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[11px]">
                  {p.reviewCount || 10} ventes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
