"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import Button from "@/app/components/ui/Button";
import { User, ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
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
    } else {
      setError("Compte créé avec succès ! Connectez-vous avec vos identifiants.");
      setIsLogin(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full px-4 sm:px-6 py-14 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200 flex items-center justify-center mx-auto shadow-card">
              <User size={28} aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              {isLogin ? "Connexion à votre espace" : "Créer un compte"}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Espace sécurisé pour clients et administrateurs.
            </p>
          </div>

          {error && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 font-bold text-center" role="status">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="register-name" className="label">Nom complet *</label>
                <input
                  id="register-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Tremblay"
                  className="input"
                />
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="label">Adresse courriel *</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.courriel@example.ca"
                className="input"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-password" className="label mb-0">Mot de passe *</label>
                <Link
                  href="/compte/mot-de-passe-oublie"
                  className="text-[11px] font-bold text-primary-700 hover:underline"
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
                className="input"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="font-bold">
              {isLogin ? "Se connecter" : "S'inscrire"} <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-primary-700 font-bold hover:underline"
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire gratuitement"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}