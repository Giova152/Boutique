"use client";

import React, { useEffect, useState } from "react";
import { Users, ShoppingBag } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Gestion des Clients
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Consultez la liste des comptes clients inscrits et leur nombre de commandes.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Chargement des clients…</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Users size={40} className="mx-auto text-gray-300" />
            <p className="font-semibold text-gray-600">Aucun client inscrit</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="p-4">Nom Client</th>
                <th className="p-4">Adresse Courriel</th>
                <th className="p-4">Commandes Effectuées</th>
                <th className="p-4">Date d'inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{c.name}</td>
                  <td className="p-4 font-mono text-gray-500">{c.email}</td>
                  <td className="p-4">
                    <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-bold">
                      {c._count?.orders || 0} commande(s)
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("fr-CA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
