"use client";

import React, { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/context/ToastContext";
import { ShieldCheck, UserPlus, UserCheck, Lock, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) setAdmins(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Nouvel administrateur "${formData.name}" créé avec succès !`, "success");
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "admin",
        });
        fetchAdmins();
      } else {
        showToast(data.error || "Erreur de création", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Gestion des Administrateurs
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Ajoutez et gérez les comptes administrateurs ayant accès au panneau de gestion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Create Admin */}
        <form onSubmit={handleCreateAdmin} className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
            <UserPlus size={16} className="text-primary-500" /> Ajouter un administrateur
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Marc-André Roy"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse courriel *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin2@pommades.ca"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mot de passe sécurisé"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Rôle *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:border-primary-500 focus:outline-none"
            >
              <option value="admin">Administrateur Standard</option>
              <option value="superadmin">Super Administrateur</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth loading={adding}>
            Ajouter cet admin
          </Button>
        </form>

        {/* Admins Table */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Chargement…</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Nom Admin</th>
                  <th className="p-4">Courriel</th>
                  <th className="p-4">Rôle</th>
                  <th className="p-4">Date de création</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                      <UserCheck size={16} className="text-emerald-600 shrink-0" />
                      {adm.name}
                    </td>
                    <td className="p-4 font-mono text-gray-500">{adm.email}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                        {adm.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(adm.createdAt).toLocaleDateString("fr-CA")}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={async () => {
                          if (!confirm(`Supprimer l'administrateur "${adm.name}" ?`)) return;
                          const res = await fetch(`/api/admin/users?id=${adm.id}`, { method: "DELETE" });
                          const data = await res.json();
                          if (res.ok) {
                            showToast("Administrateur supprimé", "info");
                            fetchAdmins();
                          } else {
                            showToast(data.error || "Erreur", "error");
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200"
                        title="Supprimer l'admin"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
