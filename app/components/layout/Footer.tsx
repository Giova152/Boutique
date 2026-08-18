import Link from "next/link";
import { Heart, Mail, MapPin, Phone, Leaf, ShieldCheck, Truck, CreditCard } from "lucide-react";

const navigation = [
  { label: "Boutique", href: "/" },
  { label: "Mon Panier", href: "/panier" },
  { label: "Mon Compte", href: "/compte/connexion" },
  { label: "Mes Commandes", href: "/compte/commandes" },
  { label: "Espace Admin", href: "/admin" },
];

const trustBadges = [
  { icon: Leaf, label: "100% Naturel & Bio" },
  { icon: ShieldCheck, label: "Sans Parabènes" },
  { icon: Truck, label: "Livraison Canada" },
  { icon: CreditCard, label: "Paiement Sécurisé" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group" aria-label="VEGEDERM BIO COSMECEUTIQUES - Accueil">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:bg-primary-600 transition-colors" aria-hidden="true">
                V
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-white block leading-none">
                  VEGEDERM
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-1">
                  Bio Cosméceutiques
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs">
              Maison canadienne spécialisée en pommades bio-cosméceutiques, savons artisanaux
              et soins botaniques d&apos;exception.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Navigation</h3>
            <ul className="space-y-2.5">
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Nos Engagements</h3>
            <ul className="space-y-3">
              {trustBadges.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Icon size={16} className="text-primary-500 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-primary-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Québec, Canada 🇨🇦</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary-500 shrink-0" aria-hidden="true" />
                <a href="mailto:contact@vegederm.ca" className="hover:text-primary-400 transition-colors">
                  contact@vegederm.ca
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary-500 shrink-0" aria-hidden="true" />
                <span>514-000-0000</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-slate-500 font-medium">
            © 2026 VEGEDERM BIO COSMECEUTIQUES Canada Inc. Tous droits réservés.
          </p>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            Fait avec <Heart size={12} className="text-primary-500 fill-primary-500" aria-hidden="true" /> au Québec
          </p>
        </div>
      </div>
    </footer>
  );
}