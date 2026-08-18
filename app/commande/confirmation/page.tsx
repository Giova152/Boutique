"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/context/ToastContext";
import {
  CheckCircle,
  Truck,
  Package,
  ArrowRight,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = use(searchParams);
  const { showToast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Countdown state for 30 minute cancellation window
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!order?.createdAt || order.status === "cancelled") return;

    const calculateTimeLeft = () => {
      const createdTime = new Date(order.createdAt).getTime();
      const thirtyMinMs = 30 * 60 * 1000;
      const expireTime = createdTime + thirtyMinMs;
      const diff = expireTime - Date.now();
      setTimeLeftMs(diff > 0 ? diff : 0);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (res.ok) setOrder(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette commande ? Les articles seront remis en stock.")) {
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "info");
        setOrder({ ...order, status: "cancelled" });
      } else {
        showToast(data.error || "Impossible d'annuler la commande", "error");
      }
    } catch {
      showToast("Erreur serveur lors de l'annulation", "error");
    } finally {
      setCancelling(false);
    }
  };

  let addressObj: any = {};
  if (order?.address) {
    try {
      addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
    } catch {}
  }

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes} min ${seconds < 10 ? "0" : ""}${seconds} sec`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce-in ${
              order?.status === "cancelled"
                ? "bg-red-100 text-red-600"
                : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {order?.status === "cancelled" ? (
              <XCircle size={48} />
            ) : (
              <CheckCircle size={48} />
            )}
          </div>

          <div className="space-y-2">
            <span
              className={`text-xs font-extrabold uppercase tracking-widest ${
                order?.status === "cancelled" ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {order?.status === "cancelled"
                ? "Commande Annulée"
                : "Commande Confirmée avec Succès"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              {order?.status === "cancelled"
                ? "Votre commande a été annulée"
                : "Merci pour votre commande !"}
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
              Commande numéro <strong className="text-slate-900 font-mono">#{id?.slice(-8) || "VEGEDERM-2026"}</strong>.
            </p>
          </div>

          {/* 30-MINUTE CANCELLATION BOX */}
          {order && order.status !== "cancelled" && (
            <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl max-w-xl mx-auto text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Clock size={16} className="text-emerald-600" /> Délai d'annulation gratuit (30 minutes)
                </span>
                {timeLeftMs !== null && timeLeftMs > 0 && (
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                    {formatTimeLeft(timeLeftMs)}
                  </span>
                )}
              </div>

              {timeLeftMs !== null && timeLeftMs > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-slate-600">
                    Vous avez changé d'avis ? Vous pouvez annuler votre commande sans frais pendant les 30 premières minutes.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={cancelling}
                    onClick={handleCancelOrder}
                    className="shrink-0 font-bold"
                  >
                    Annuler la commande
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Le délai d'annulation de 30 minutes est expiré. Votre commande est actuellement en cours de préparation dans nos locaux au Québec.
                </p>
              )}
            </div>
          )}

          {/* ORDER DETAILS SUMMARY */}
          {order && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-4 max-w-xl mx-auto text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 font-bold text-sm text-slate-900">
                <span>Statut : <span className="text-emerald-700 capitalize font-extrabold">{order.status}</span></span>
                <span>Total : {order.total.toFixed(2)} $ CAD</span>
              </div>

              <div className="space-y-1 text-slate-700 font-medium">
                <p className="font-bold text-slate-900">Adresse de livraison (Canada) :</p>
                <p>{addressObj.street}</p>
                <p>{addressObj.city}, {addressObj.province} {addressObj.postalCode}</p>
                <p className="text-emerald-800 font-bold">🇨🇦 {addressObj.country}</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900 mb-2">Articles commandés :</p>
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-slate-800">
                      <span>{item.product?.name || "Produit Vegederm"} (x{item.quantity})</span>
                      <span className="font-bold">{(item.unitPrice * item.quantity).toFixed(2)} $</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN NOTIFICATION CONFIRMATION */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-950 max-w-xl mx-auto flex items-center gap-3 text-left">
            <Truck size={24} className="text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold">Notification Admin Transmise</p>
              <p className="text-emerald-800">
                Un courriel d'alerte a été envoyé à l'administration VEGEDERM (contact@vegedermbiocosmeceutiques.com).
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button variant="primary" size="lg" className="!bg-emerald-600 font-bold">
                Retourner à la boutique <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
