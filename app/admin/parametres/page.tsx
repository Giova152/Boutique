"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import ImageUploader from "@/app/components/ui/ImageUploader";
import { useToast } from "@/app/context/ToastContext";
import {
  Settings,
  Truck,
  Image as ImageIcon,
  Save,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Unlink,
  Zap,
  Key,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface StripeStatus {
  connected: boolean;
  connection_type: "oauth" | "manual" | "none";
  stripe_connect_account_id?: string;
  stripe_client_id?: string;
  has_env_client_id?: boolean;
  stripe_secret_key_preview: string;
  stripe_publishable_key: string;
}

function SettingsContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    store_name: "VEGEDERM BIO COSMECEUTIQUES",
    store_email: "contact@vegedermbiocosmeceutiques.com",
    flat_shipping_rate: "13.00",
    free_shipping_threshold: "75.00",
    favicon_url: "/favicon.ico",
  });

  // --- État Stripe ---
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>({
    connected: false,
    connection_type: "none",
    stripe_connect_account_id: "",
    stripe_client_id: "",
    has_env_client_id: false,
    stripe_secret_key_preview: "",
    stripe_publishable_key: "",
  });

  const [stripeKeys, setStripeKeys] = useState({
    stripe_secret_key: "",
    stripe_publishable_key: "",
  });

  const [clientIdInput, setClientIdInput] = useState("");
  const [showManualConfig, setShowManualConfig] = useState(false);

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [savingStripeKeys, setSavingStripeKeys] = useState(false);
  const [savingClientId, setSavingClientId] = useState(false);
  const [disconnectingStripe, setDisconnectingStripe] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchStripeStatus();
  }, []);

  // Traiter les retours d'URL de l'OAuth Stripe
  useEffect(() => {
    const success = searchParams.get("stripe_success");
    const account = searchParams.get("stripe_account");
    const error = searchParams.get("stripe_error");

    if (success) {
      showToast(
        `Compte Stripe Connect lié avec succès ! (ID: ${account || "Acct"})`,
        "success"
      );
      router.replace("/admin/parametres");
      fetchStripeStatus();
    } else if (error) {
      showToast(`Erreur Stripe OAuth : ${error}`, "error");
      router.replace("/admin/parametres");
    }
  }, [searchParams, router, showToast]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data && typeof data === "object") {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeStatus = async () => {
    try {
      const res = await fetch("/api/admin/stripe");
      const data = await res.json();
      if (res.ok) {
        setStripeStatus(data);
        if (data.stripe_client_id) {
          setClientIdInput(data.stripe_client_id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveStripeKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeKeys.stripe_secret_key || !stripeKeys.stripe_publishable_key) {
      showToast("Veuillez saisir vos deux clés Stripe (Secret et Publique).", "error");
      return;
    }
    setSavingStripeKeys(true);
    try {
      const res = await fetch("/api/admin/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stripeKeys),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Configuration Stripe sauvegardée !", "success");
        setStripeKeys({ stripe_secret_key: "", stripe_publishable_key: "" });
        await fetchStripeStatus();
      } else {
        showToast(data.error || "Erreur de sauvegarde Stripe", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setSavingStripeKeys(false);
    }
  };

  const handleSaveClientId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      showToast("Veuillez entrer votre Client ID Stripe Connect (format ca_...)", "error");
      return;
    }
    setSavingClientId(true);
    try {
      const res = await fetch("/api/admin/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripe_client_id: clientIdInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Client ID Stripe Connect enregistré avec succès !", "success");
        await fetchStripeStatus();
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setSavingClientId(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!confirm("Êtes-vous sûr de vouloir déconnecter votre compte Stripe ? Les paiements en ligne seront suspendus."))
      return;
    setDisconnectingStripe(true);
    try {
      const res = await fetch("/api/admin/stripe", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast("Compte Stripe déconnecté avec succès.", "success");
        await fetchStripeStatus();
      } else {
        showToast(data.error || "Erreur lors de la déconnexion", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setDisconnectingStripe(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Paramètres généraux enregistrés !", "success");
      } else {
        showToast(data.error || "Erreur d'enregistrement", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setSaving(false);
    }
  };

  const hasClientId = Boolean(stripeStatus.stripe_client_id || stripeStatus.has_env_client_id);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Paramètres de la Boutique VEGEDERM
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gérez la configuration globale, la tarification des livraisons et la connexion de votre compte Stripe.
        </p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* SECTION STRIPE CONNECT OAUTH & CLÉS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
        {/* Accent Bar Top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />

        {/* En-tête Section Stripe */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard size={22} className="text-violet-600" />
              <h2 className="font-serif font-bold text-lg text-slate-900">
                Paiements &amp; Stripe Connect
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Liez directement le compte Stripe de votre boutique pour encaisser les ventes par carte bancaire.
            </p>
          </div>

          {/* Statut Badge */}
          {stripeStatus.connected ? (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold shadow-2xs">
                <CheckCircle2 size={15} className="text-emerald-600" />
                {stripeStatus.connection_type === "oauth" ? "Stripe Connect Lié (OAuth)" : "Stripe Connecté (Clés API)"}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold self-start sm:self-auto">
              <AlertCircle size={15} className="text-amber-600" />
              Non connecté
            </span>
          )}
        </div>

        {/* SI DEJA CONNECTE — AFFICHER LES INFOS DU COMPTE */}
        {stripeStatus.connected && (
          <div className="bg-gradient-to-br from-violet-50/70 to-indigo-50/40 rounded-2xl border border-violet-100 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">
                  Compte Stripe Actif
                </span>
                {stripeStatus.stripe_connect_account_id && (
                  <div className="font-mono text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    ID Compte : <span className="bg-white px-2 py-0.5 rounded border border-violet-200 text-violet-900">{stripeStatus.stripe_connect_account_id}</span>
                  </div>
                )}
                {stripeStatus.stripe_publishable_key && (
                  <p className="text-xs font-mono text-slate-500 truncate max-w-md">
                    Clé publique : {stripeStatus.stripe_publishable_key}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleDisconnectStripe}
                disabled={disconnectingStripe}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 border border-rose-200 bg-white hover:bg-rose-50 transition-all shadow-2xs self-start sm:self-auto disabled:opacity-50"
              >
                <Unlink size={15} />
                {disconnectingStripe ? "Déconnexion..." : "Déconnecter ce compte Stripe"}
              </button>
            </div>
          </div>
        )}

        {/* ACTION PRINCIPALE : BOUTON STRIPE CONNECT OAUTH */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap size={16} className="text-violet-600" />
                Connexion via Stripe Connect OAuth (Recommandé)
              </h3>
              <p className="text-xs text-slate-500 max-w-xl">
                En cliquant sur le bouton ci-dessous, vous serez redirigé sur le site sécurisé de Stripe pour vous connecter en 1 clic.
              </p>
            </div>

            <a
              href="/api/admin/stripe/connect/authorize"
              className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0 text-center ${
                hasClientId
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                  : "bg-slate-800 text-white hover:bg-slate-900"
              }`}
            >
              <CreditCard size={18} />
              {stripeStatus.connected ? "Reconnecter avec Stripe OAuth" : "Lier mon compte Stripe"}
              <ExternalLink size={14} className="opacity-80" />
            </a>
          </div>

          {/* Saisie du Client ID si pas encore configuré */}
          <div className="pt-4 border-t border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <HelpCircle size={16} className="text-violet-600" />
              <span>Étape 1 : Renseigner votre Client ID Stripe Connect (STRIPE_CLIENT_ID)</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pour activer la connexion OAuth Stripe, copiez votre <strong>Client ID</strong> (format <code>ca_...</code>) depuis votre dashboard Stripe dans{" "}
              <a
                href="https://dashboard.stripe.com/settings/connect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-700 font-extrabold underline inline-flex items-center gap-1"
              >
                Paramètres Stripe Connect <ExternalLink size={11} />
              </a> :
            </p>

            <form onSubmit={handleSaveClientId} className="flex flex-col sm:flex-row gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200">
              <input
                type="text"
                placeholder="ca_123456789ABCXYZ..."
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-violet-600"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={savingClientId}
                className="!bg-violet-600 hover:!bg-violet-700 font-bold shrink-0"
              >
                Enregistrer Client ID <ArrowRight size={14} />
              </Button>
            </form>
          </div>
        </div>

        {/* SAISIE MANUELLE DES CLÉS API (ALTERNATIVE) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowManualConfig(!showManualConfig)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors underline"
          >
            <Key size={14} className="text-slate-500" />
            {showManualConfig ? "Masquer la saisie manuelle des clés API" : "Ou configurer manuellement vos clés API Stripe (Secret & Publishable)"}
          </button>

          {showManualConfig && (
            <form onSubmit={handleSaveStripeKeys} className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <p className="text-xs text-slate-500">
                Vous pouvez saisir directement vos clés de développement ou de production si vous préférez ne pas utiliser Stripe Connect OAuth.
                Récupérez-les sur votre{" "}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                >
                  Dashboard Stripe <ExternalLink size={10} />
                </a>.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Clé secrète (Secret Key - sk_...)
                  </label>
                  <div className="relative">
                    <input
                      type={showSecretKey ? "text" : "password"}
                      placeholder={stripeStatus.stripe_secret_key_preview || "sk_test_..."}
                      value={stripeKeys.stripe_secret_key}
                      onChange={(e) =>
                        setStripeKeys({ ...stripeKeys, stripe_secret_key: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono pr-10 focus:border-violet-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showSecretKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Clé publique (Publishable Key - pk_...)
                  </label>
                  <div className="relative">
                    <input
                      type={showPublicKey ? "text" : "password"}
                      placeholder={stripeStatus.stripe_publishable_key || "pk_test_..."}
                      value={stripeKeys.stripe_publishable_key}
                      onChange={(e) =>
                        setStripeKeys({ ...stripeKeys, stripe_publishable_key: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono pr-10 focus:border-violet-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPublicKey(!showPublicKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPublicKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={savingStripeKeys}
                  className="!bg-slate-900 font-bold"
                >
                  <Save size={15} /> Enregistrer les clés manuellement
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* SECTION PARAMÈTRES GÉNÉRAUX BOUTIQUE */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        {/* Section 1: Informations Générales */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Settings size={18} className="text-emerald-600" /> Informations Générales
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nom officiel de la boutique *
              </label>
              <input
                type="text"
                required
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-extrabold focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Courriel de notification Admin *
              </label>
              <input
                type="email"
                required
                value={settings.store_email}
                onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Frais de Livraison (13$ de base) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Truck size={18} className="text-emerald-600" /> Tarification Livraison (Canada)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Frais de livraison de base ($ CAD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.flat_shipping_rate}
                onChange={(e) => setSettings({ ...settings, flat_shipping_rate: e.target.value })}
                placeholder="13.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-extrabold focus:border-emerald-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Tarif par défaut appliqué au panier.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Seuil de livraison gratuite ($ CAD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                placeholder="75.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-extrabold focus:border-emerald-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Gratuit pour toute commande supérieure ou égale à ce montant.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Favicon & Logo */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ImageIcon size={18} className="text-emerald-600" /> Icône du site (Favicon)
          </h3>

          <ImageUploader
            label="Téléverser l'icône favicon (.ico, .png)"
            value={settings.favicon_url}
            onChange={(url) => setSettings({ ...settings, favicon_url: url })}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={saving} className="!bg-emerald-600 font-bold">
            <Save size={18} /> Enregistrer les paramètres généraux
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Chargement des paramètres...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
