"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@pommades.ca");
  const [password, setPassword] = useState("Admin2024!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("admin", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Accès refusé. Identifiants administrateur invalides.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-900 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-primary-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Panneau d'Administration
          </h1>
          <p className="text-xs text-gray-500">
            Connexion sécurisée réservée aux administrateurs de la boutique.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-600 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Administrateur</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Accéder à l'Admin <ArrowRight size={16} />
          </Button>
        </form>

        <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-gray-500 space-y-1">
          <p className="font-bold text-gray-700">Identifiants Admin Démo :</p>
          <p>Email : <code className="text-gray-900 font-bold">admin@pommades.ca</code></p>
          <p>Mot de passe : <code className="text-gray-900 font-bold">Admin2024!</code></p>
        </div>
      </div>
    </div>
  );
}
