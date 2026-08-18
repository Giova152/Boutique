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
  const [email, setEmail] = useState("admin@pommades.ca");
  const [password, setPassword] = useState("Admin2024!");
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
        // Fetch updated session to check role & auto-redirect
        const session = await getSession();
        const role = (session?.user as { role?: string })?.role;

        if (role === "admin" || role === "superadmin") {
          router.push("/admin");
        } else {
          router.push("/compte/commandes");
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

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <User size={28} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              {isLogin ? "Connexion à votre espace" : "Créer un compte"}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Espace sécurisé pour clients et administrateurs.
            </p>
          </div>

          {error && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Tremblay"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Adresse courriel *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.courriel@example.ca"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-emerald-600 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Mot de passe *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-emerald-600 focus:outline-none font-semibold"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="!bg-emerald-600 hover:!bg-emerald-700 font-bold">
              {isLogin ? "Se connecter" : "S'inscrire"} <ArrowRight size={16} />
            </Button>
          </form>

          {/* Quick Demo Credentials Guide */}
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-900">💡 Identifiants de test (Auto-Redirection) :</p>
            
            <div className="pt-1 space-y-1">
              <p className="font-bold text-emerald-800 flex items-center gap-1">
                <ShieldCheck size={14} /> Compte Admin (Redirige vers /admin) :
              </p>
              <p className="pl-5 text-[11px]">Email : <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded font-bold border border-slate-200">admin@pommades.ca</code></p>
              <p className="pl-5 text-[11px]">MDP : <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded font-bold border border-slate-200">Admin2024!</code></p>
            </div>

            <div className="pt-1 space-y-1 border-t border-slate-200">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <User size={14} /> Compte Client (Redirige vers Espace Client) :
              </p>
              <p className="pl-5 text-[11px]">Email : <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded font-bold border border-slate-200">jean.tremblay@example.ca</code></p>
              <p className="pl-5 text-[11px]">MDP : <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded font-bold border border-slate-200">Client2024!</code></p>
            </div>
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-emerald-700 font-bold hover:underline"
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
