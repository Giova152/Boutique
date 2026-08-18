"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/context/ToastContext";
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  MapPin,
  User,
  ShoppingBag,
} from "lucide-react";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { showToast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

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

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`Statut de la commande mis à jour : "${newStatus}"`, "success");
        setOrder({ ...order, status: newStatus });
      } else {
        showToast("Erreur de mise à jour du statut", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Chargement…</div>;
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Commande introuvable</h2>
        <Link href="/admin/commandes">
          <Button variant="secondary" size="sm">
            ← Retour aux commandes
          </Button>
        </Link>
      </div>
    );
  }

  let addressObj: any = {};
  try {
    addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
  } catch {}

  const totalItemsCount = order.items?.reduce((acc: number, i: any) => acc + i.quantity, 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/commandes"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Commande #{order.id.slice(-8)}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Reçue le {new Date(order.createdAt).toLocaleDateString("fr-CA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Change Status Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Statut :</span>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 focus:border-emerald-600 focus:outline-none shadow-xs"
          >
            <option value="processing">En traitement</option>
            <option value="shipped">Expédiée 🇨🇦</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Table & Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Articles commandés ({totalItemsCount})</span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {order.items?.length || 0} référence(s)
              </span>
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any) => {
                let imgUrl = "/images/products/lumiere-noire.png";
                if (item.product?.images) {
                  try {
                    const parsed = JSON.parse(item.product.images);
                    if (Array.isArray(parsed) && parsed[0]) imgUrl = parsed[0];
                  } catch {}
                }

                return (
                  <div key={item.id} className="py-3 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <Image src={imgUrl} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {item.product?.name || "Produit VEGEDERM"}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold">
                        {item.unitPrice.toFixed(2)} $ CAD × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-slate-900">
                        {(item.unitPrice * item.quantity).toFixed(2)} $
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-700 font-semibold">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-bold text-slate-900">{order.subtotal.toFixed(2)} $ CAD</span>
              </div>
              <div className="flex justify-between">
                <span>Frais d'expédition Canada</span>
                <span className="text-slate-900">{order.shippingCost.toFixed(2)} $ CAD</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (TPS/TVQ)</span>
                <span className="text-slate-900">{order.taxAmount.toFixed(2)} $ CAD</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total de la commande</span>
                <span className="text-emerald-600 text-lg">{order.total.toFixed(2)} $ CAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Address Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User size={18} className="text-emerald-600" /> Information Client
            </h3>
            <div className="text-xs space-y-1.5 text-slate-700 font-medium">
              <p><strong className="text-slate-900">Nom :</strong> {order.guestName || "Client Invité"}</p>
              <p><strong className="text-slate-900">Courriel :</strong> {order.guestEmail}</p>
              {addressObj.phone && (
                <p><strong className="text-slate-900">Téléphone :</strong> {addressObj.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" /> Adresse de Livraison (Canada)
            </h3>
            <div className="text-xs space-y-1 text-slate-700 font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <p className="font-bold text-slate-900">{addressObj.street}</p>
              {addressObj.apartment && <p>{addressObj.apartment}</p>}
              <p>{addressObj.city}, {addressObj.province} {addressObj.postalCode}</p>
              <p className="text-emerald-800 font-bold mt-1">🇨🇦 {addressObj.country || "Canada"}</p>

              {addressObj.instructions && (
                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <strong>Notes de livraison :</strong> "{addressObj.instructions}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
