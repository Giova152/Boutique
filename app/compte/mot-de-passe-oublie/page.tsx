"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import Button from "@/app/components/ui/Button";
import { KeyRound, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "Votre mot de passe a été réinitialisé avec succès !");
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Une erreur est survenue lors de la réinitialisation.");
      }
    } catch {
      setError("Erreur serveur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200 flex items-center justify-center mx-auto shadow-sm">
              <KeyRound size={28} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Réinitialiser le mot de passe
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Espace de secours pour administrateurs et clients.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-900 font-bold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-primary-50 border border-primary-200 p-4 rounded-xl text-xs text-primary-900 font-bold space-y-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-primary-700">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
              <Link
                href="/compte/connexion"
                className="inline-block mt-2 text-primary-700 underline font-bold"
              >
                Se connecter maintenant →
              </Link>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fp-email" className="label">Adresse courriel du compte *</label>
                <input
                  id="fp-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="midogiova@gmail.com"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="fp-password" className="label">Nouveau mot de passe *</label>
                <input
                  id="fp-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="fp-confirm" className="label">Confirmer le nouveau mot de passe *</label>
                <input
                  id="fp-confirm"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="input"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="font-bold"
              >
                Réinitialiser mon mot de passe <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </form>
          )}

          <div className="pt-4 text-center border-t border-slate-100">
            <Link
              href="/compte/connexion"
              className="text-xs text-slate-600 font-bold hover:text-slate-900 inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Retour à la page de connexion
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
