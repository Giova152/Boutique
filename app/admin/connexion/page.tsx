"use client";

import React, { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("unified", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Accès refusé. Identifiants administrateur invalides.");
      setLoading(false);
    } else {
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;

      if (role === "admin" || role === "superadmin") {
        window.location.href = "/admin";
      } else {
        setError("🛑 Cet accès est strictement réservé aux administrateurs. Votre compte est un compte acheteur.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Panneau d'Administration
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Connexion sécurisée réservée aux administrateurs de la boutique VEGEDERM.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-700 font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Courriel Administrateur</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vegederm.ca"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="!bg-emerald-600 font-bold">
            Accéder à l'Admin <ArrowRight size={16} />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <a href="/compte/connexion" className="text-xs text-emerald-700 font-bold hover:underline">
            Vous êtes acheteur ? Se connecter à l'Espace Client
          </a>
        </div>
      </div>
    </div>
  );
}
