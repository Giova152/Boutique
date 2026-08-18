"use client";

import React, { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/context/ToastContext";
import { ShieldCheck, UserPlus, UserCheck, Lock, Trash2, Edit3, X, MailCheck } from "lucide-react";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // État Formulaire Ajouter / Éditer
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
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

  const handleStartEdit = (admin: any) => {
    setEditingAdminId(admin.id);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", // Laisser vide si inchangé
      role: admin.role,
    });
  };

  const handleCancelEdit = () => {
    setEditingAdminId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isEdit = Boolean(editingAdminId);
      const url = "/api/admin/users";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit ? { id: editingAdminId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          isEdit
            ? `Administrateur "${formData.name}" mis à jour avec succès !`
            : `Nouvel administrateur "${formData.name}" créé ! Un courriel d'accès lui a été envoyé.`,
          "success"
        );
        handleCancelEdit();
        fetchAdmins();
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = async (adm: any) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'administrateur "${adm.name}" (${adm.email}) ?`))
      return;

    try {
      const res = await fetch(`/api/admin/users?id=${adm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(`Administrateur "${adm.name}" supprimé avec succès.`, "info");
        fetchAdmins();
      } else {
        showToast(data.error || "Erreur de suppression", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Gestion des Administrateurs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ajoutez, modifiez ou supprimez les comptes administrateurs ayant accès au panneau de gestion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulaire Ajouter / Éditer */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              {editingAdminId ? (
                <>
                  <Edit3 size={16} className="text-violet-600" /> Modifier l'admin
                </>
              ) : (
                <>
                  <UserPlus size={16} className="text-emerald-600" /> Ajouter un administrateur
                </>
              )}
            </h3>

            {editingAdminId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Annuler l'édition"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {!editingAdminId && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-[11px] font-medium flex items-start gap-2">
              <MailCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Un courriel d'accès personnalisé contenant ses identifiants lui sera automatiquement envoyé lors de la création.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Nom complet *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Sophie Gagnon"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Adresse courriel *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@vegederm.ca"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {editingAdminId ? "Nouveau mot de passe (laisser vide pour ne pas modifier)" : "Mot de passe d'accès *"}
            </label>
            <input
              type="password"
              required={!editingAdminId}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingAdminId ? "•••••••• (Optionnel)" : "Mot de passe sécurisé"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Rôle d'accès *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="admin">Administrateur Standard</option>
              <option value="superadmin">Super Administrateur</option>
            </select>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={saving}
              className={`font-bold ${editingAdminId ? "!bg-violet-600" : "!bg-emerald-600"}`}
            >
              {editingAdminId ? "Mettre à jour l'admin" : "Créer et Envoyer l'accès"}
            </Button>
          </div>
        </form>

        {/* Liste des Administrateurs */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Administrateurs Enregistrés ({admins.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Chargement des comptes…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Administrateur</th>
                    <th className="p-4">Courriel</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Date de création</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {admins.map((adm) => {
                    const isBeingEdited = editingAdminId === adm.id;
                    return (
                      <tr
                        key={adm.id}
                        className={`transition-colors ${
                          isBeingEdited ? "bg-violet-50/70" : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="p-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                              {adm.name[0]?.toUpperCase()}
                            </div>
                            <span>{adm.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-600">{adm.email}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                              adm.role === "superadmin"
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            {adm.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {new Date(adm.createdAt).toLocaleDateString("fr-CA")}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(adm)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isBeingEdited
                                  ? "bg-violet-600 text-white border-violet-600"
                                  : "text-slate-600 hover:bg-slate-100 border-slate-200"
                              }`}
                              title="Modifier les détails de cet admin"
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteAdmin(adm)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                              title="Supprimer cet admin"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
    </div>
  );
}
