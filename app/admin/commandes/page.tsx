"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle, Truck, XCircle, Eye, ShoppingBag, Search } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "all" ? true : o.status === filterStatus;

    if (!searchQuery.trim()) return matchesStatus;

    const q = searchQuery.toLowerCase().trim();
    const orderId = (o.id || "").toLowerCase();
    const name = (o.guestName || "").toLowerCase();
    const email = (o.guestEmail || "").toLowerCase();

    let city = "";
    try {
      const addr = typeof o.address === "string" ? JSON.parse(o.address) : o.address;
      city = (addr.city || "").toLowerCase();
    } catch {}

    const matchesSearch =
      orderId.includes(q) || name.includes(q) || email.includes(q) || city.includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Gestion des Commandes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Recherchez et gérez toutes les commandes reçues sur VEGEDERM.
          </p>
        </div>

        {/* Live Search Box */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher N° commande, nom, courriel, ville…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-semibold focus:border-primary-600 focus:outline-none shadow-xs"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Status Filter & Cleanup Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Toutes ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus("processing")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "processing" ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            En traitement ({orders.filter((o) => o.status === "processing").length})
          </button>
          <button
            onClick={() => setFilterStatus("shipped")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "shipped" ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Expédiées ({orders.filter((o) => o.status === "shipped").length})
          </button>
          <button
            onClick={() => setFilterStatus("cancelled")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "cancelled" ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Annulées ({orders.filter((o) => o.status === "cancelled").length})
          </button>
        </div>

        {/* Purge Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!confirm("Voulez-vous supprimer toutes les commandes datant de plus de 30 jours ?")) return;
              const res = await fetch("/api/orders?olderThanDays=30", { method: "DELETE" });
              const data = await res.json();
              alert(data.message);
              fetchOrders();
            }}
            className="px-3 py-1.5 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold transition-all"
            title="Nettoyer l'historique"
          >
            Purger &gt; 30j
          </button>
          <button
            onClick={async () => {
              if (!confirm("Voulez-vous supprimer toutes les commandes datant de plus de 45 jours ?")) return;
              const res = await fetch("/api/orders?olderThanDays=45", { method: "DELETE" });
              const data = await res.json();
              alert(data.message);
              fetchOrders();
            }}
            className="px-3 py-1.5 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold transition-all"
            title="Nettoyer l'historique"
          >
            Purger &gt; 45j
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Chargement des commandes…</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium">
            Aucune commande ne correspond à ces critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">N° Commande</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Articles (Qté)</th>
                  <th className="p-4">Montant Total</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map((ord) => {
                  let addressObj: any = {};
                  try {
                    addressObj = typeof ord.address === "string" ? JSON.parse(ord.address) : ord.address;
                  } catch {}

                  const totalItems = ord.items?.reduce((acc: number, i: any) => acc + i.quantity, 0) || 0;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        #{ord.id.slice(-8)}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{ord.guestName || "Client"}</span>
                        <span className="text-[11px] text-slate-400 block">{ord.guestEmail}</span>
                        <span className="text-[10px] text-primary-700 font-bold block">🇨🇦 {addressObj.city || "Canada"}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg">
                          <ShoppingBag size={12} /> {totalItems} article{totalItems > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900 text-sm">
                        {ord.total.toFixed(2)} $ CAD
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            ord.status === "shipped"
                              ? "bg-primary-50 text-primary-800 border-primary-200"
                              : ord.status === "cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-900 border-amber-200"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString("fr-CA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/commandes/${ord.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
                        >
                          <Eye size={14} /> Détails
                        </Link>
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
