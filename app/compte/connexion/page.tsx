"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import Button from "@/app/components/ui/Button";
import { User, ArrowRight, KeyRound, MailCheck, CheckCircle2, ShieldCheck } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GESTION DE LA CONNEXION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await signIn("unified", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Identifiants incorrects. Veuillez vérifier votre adresse courriel et votre mot de passe.");
      setLoading(false);
    } else {
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;

      if (role === "admin" || role === "superadmin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/compte/commandes";
      }
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÉTAPE 1 : ENVOI DU CODE DE CONFIRMATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Veuillez remplir votre nom, courriel et mot de passe.");
      return;
    }

    setSendingCode(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-code",
          name,
          email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCodeSent(true);
        setSuccessMsg(data.message || "Code de confirmation envoyé ! Consultez vos courriels.");
      } else {
        setError(data.error || "Erreur lors de l'envoi du code.");
      }
    } catch {
      setError("Erreur serveur lors de l'envoi du code.");
    } finally {
      setSendingCode(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÉTAPE 2 : VÉRIFICATION DU CODE ET INSCRIPTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setError("Veuillez saisir le code de confirmation à 6 chiffres.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-and-register",
          name,
          email,
          password,
          code: verificationCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "Compte validé avec succès ! Connexion en cours...");
        
        // Auto-connexion du nouveau client
        setTimeout(async () => {
          const loginRes = await signIn("unified", {
            email,
            password,
            redirect: false,
          });

          if (!loginRes?.error) {
            window.location.href = "/compte/commandes";
          } else {
            setIsLogin(true);
            setCodeSent(false);
          }
        }, 1200);
      } else {
        setError(data.error || "Erreur de validation du code.");
      }
    } catch {
      setError("Erreur serveur lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full px-4 sm:px-6 py-14 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-card">
              <User size={28} aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              {isLogin ? "Connexion à votre espace" : "Créer un compte client"}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              {isLogin
                ? "Connectez-vous pour suivre vos commandes et gérer vos achats."
                : "Inscrivez-vous et validez votre adresse courriel via un code de vérification."}
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 font-bold text-center">
              {error}
            </div>
          )}

          {/* Message de succès */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORMULAIRE CONNEXION */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="label">Adresse courriel *</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.courriel@example.ca"
                  className="input font-semibold"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="login-password" className="label mb-0">Mot de passe *</label>
                  <Link
                    href="/compte/mot-de-passe-oublie"
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input font-mono"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="!bg-emerald-600 font-bold">
                Se connecter <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </form>
          ) : (
            /* FORMULAIRE INSCRIPTION AVEC VÉRIFICATION PAR CODE */
            <div className="space-y-4">
              {!codeSent ? (
                /* ÉTAPE 1 : NOM, EMAIL, MOT DE PASSE */
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label htmlFor="register-name" className="label">Votre Nom complet *</label>
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jean Tremblay"
                      className="input font-bold"
                    />
                  </div>

                  <div>
                    <label htmlFor="register-email" className="label">Adresse courriel *</label>
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean.tremblay@example.ca"
                      className="input font-semibold"
                    />
                  </div>

                  <div>
                    <label htmlFor="register-password" className="label">Choisissez un mot de passe *</label>
                    <input
                      id="register-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe sécurisé"
                      className="input font-mono"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={sendingCode}
                    className="!bg-emerald-600 font-bold"
                  >
                    <MailCheck size={18} /> Recevoir mon code de confirmation
                  </Button>
                </form>
              ) : (
                /* ÉTAPE 2 : CODE DE CONFIRMATION À 6 CHIFFRES */
                <form onSubmit={handleVerifyAndRegister} className="space-y-4 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Étape de validation</span>
                    <p className="text-xs text-slate-600">
                      Entrez le code à 6 chiffres reçu à <strong>{email}</strong> :
                    </p>
                  </div>

                  <div>
                    <label htmlFor="verification-code" className="block text-xs font-extrabold text-slate-900 mb-1 text-center">
                      Code de confirmation (6 chiffres) *
                    </label>
                    <input
                      id="verification-code"
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full text-center text-2xl font-mono font-extrabold tracking-widest px-4 py-3 rounded-xl border border-emerald-400 bg-white text-emerald-950 focus:border-emerald-600 focus:outline-none shadow-inner"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    className="!bg-emerald-600 font-bold"
                  >
                    <KeyRound size={18} /> Valider le code &amp; Créer mon compte
                  </Button>

                  <button
                    type="button"
                    onClick={() => setCodeSent(false)}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 underline pt-1"
                  >
                    Renvoyer un code ou corriger l'adresse courriel
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setCodeSent(false);
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire avec validation par courriel"
                : "Déjà un compte ? Se connecter à mon espace"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}