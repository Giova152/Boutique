import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import DynamicFavicon from "@/app/components/layout/DynamicFavicon";

export const metadata: Metadata = {
  title: "VEGEDERM BIO COSMECEUTIQUES — Soins Botaniques & Pommades d'Exception",
  description:
    "Maison canadienne spécialisée en pommades bio-cosméceutiques, savons artisanaux, soins de pieds, soins capillaires et traitements apaisants excémas & psoriasis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="antialiased bg-slate-50 text-slate-900 font-sans selection:bg-primary-500 selection:text-white">
        <DynamicFavicon />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
