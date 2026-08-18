"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/context/ToastContext";
import { useSession } from "next-auth/react";
import { Package, Clock, XCircle, ChevronRight, ShoppingBag, LogOut, User, UserPlus } from "lucide-react";
import { signOut } from "next-auth/react";

export default function CustomerOrdersPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const fetchCustomerOrders = async () => {
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

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Voulez-vous vraiment annuler cette commande ?")) return;

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "info");
        fetchCustomerOrders();
      } else {
        showToast(data.error || "Erreur d'annulation", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      await signOut({ redirect: false });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = "/compte/connexion";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {session?.user && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-extrabold text-lg">
                <User size={24} />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold text-slate-900">
                  {session.user.name || "Client VEGEDERM"}
                </h1>
                <p className="text-xs text-slate-500 font-mono">{session.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/compte/connexion"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <UserPlus size={14} /> Créer / Changer de compte
              </Link>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Historique de vos Commandes
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Consultez vos achats passés et gérez l'annulation immédiate (disponible 30 min après l'achat).
            </p>
          </div>
          <Link href="/">
            <Button variant="secondary" size="sm" className="font-bold border-slate-300">
              Continuer mes achats
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            Chargement de l'historique…
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto my-8 shadow-sm">
            <ShoppingBag size={40} className="text-slate-300 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Aucune commande enregistrée</h2>
            <p className="text-xs text-slate-500 font-medium">
              Vos futurs achats s'afficheront ici automatiquement.
            </p>
            <Link href="/">
              <Button variant="primary" size="md" className="!bg-primary-600 font-bold">
                Découvrir le catalogue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const createdTime = new Date(ord.createdAt).getTime();
              const thirtyMinMs = 30 * 60 * 1000;
              const isCancelable =
                ord.status !== "cancelled" && Date.now() - createdTime < thirtyMinMs;

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-base">
                        #{ord.id.slice(-8)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          ord.status === "shipped"
                            ? "bg-primary-50 text-primary-800 border-primary-200"
                            : ord.status === "cancelled"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-900 border-amber-200"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      Passée le {new Date(ord.createdAt).toLocaleDateString("fr-CA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <p className="text-xs font-extrabold text-slate-900">
                      Total : {ord.total.toFixed(2)} $ CAD ({ord.items?.length || 1} article(s))
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCancelable && (
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5"
                      >
                        <Clock size={14} /> Annuler la commande (30 min)
                      </button>
                    )}

                    <Link
                      href={`/commande/confirmation?id=${ord.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
                    >
                      Détails <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
