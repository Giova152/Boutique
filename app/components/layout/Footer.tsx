import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            V
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-white block leading-none">
              VEGEDERM BIO COSMECEUTIQUES
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              Soins Bio & Cosmétiques Botaniques • Québec, Canada 🇨🇦
            </span>
          </div>
        </div>

        {/* Canada Shipping Badge */}
        <div className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3.5 py-1 rounded-full text-xs font-bold">
          🇨🇦 Expédition Exclusive Canada
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500 font-medium">
          <p>© 2026 VEGEDERM BIO COSMECEUTIQUES Canada Inc. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
