"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import StarRating from "@/app/components/ui/StarRating";
import Button from "@/app/components/ui/Button";
import ProductCard, { ProductType } from "@/app/components/ui/ProductCard";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  Leaf,
  Plus,
  Minus,
  Check,
  MessageSquare,
  Sparkles,
  Award,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<ProductType & {
    ingredients?: string;
    instructions?: string;
    benefits?: string;
    reviews?: any[];
  } | null>(null);

  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "ingredients" | "benefits" | "usage">("desc");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (res.ok) {
        setProduct(data);
        let imgs = ["/images/products/lumiere-noire.png"];
        try {
          imgs = JSON.parse(data.images);
        } catch {}
        setSelectedImage(imgs[0] || "/images/products/lumiere-noire.png");

        // Fetch related products
        const relRes = await fetch("/api/products");
        const relData = await relRes.json();
        if (Array.isArray(relData)) {
          setRelatedProducts(relData.filter((p: ProductType) => p.id !== data.id).slice(0, 3));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="h-96 skeleton rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 skeleton rounded" />
              <div className="h-4 w-1/3 skeleton rounded" />
              <div className="h-24 w-full skeleton rounded" />
              <div className="h-12 w-full skeleton rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Produit introuvable</h1>
          <p className="text-sm text-slate-500">La pommade demandée n'existe pas ou a été retirée.</p>
          <Link href="/">
            <Button variant="primary" size="md">
              Retourner au catalogue
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  let imagesList: string[] = [];
  try {
    imagesList = JSON.parse(product.images);
  } catch {
    imagesList = [selectedImage];
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: selectedImage,
        slug: product.slug,
        stock: product.stock,
      });
    }
    setAdded(true);
    showToast(`${quantity} x "${product.name}" ajouté au panier !`, "success");
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-slate-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Accueil
          </Link>
          <ChevronRight size={14} className="text-slate-300" />
          {product.category && (
            <>
              <Link
                href={`/?category=${product.category.slug}`}
                className="hover:text-emerald-600 transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight size={14} className="text-slate-300" />
            </>
          )}
          <span className="text-slate-900 truncate font-extrabold">{product.name}</span>
        </div>
      </nav>

      {/* Main Product Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100/70 border border-slate-200 group">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-108 cursor-zoom-in"
                priority
              />
              <span className="absolute top-4 left-4 bg-slate-950 text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-800 shadow-md">
                🌿 100% Botanique & Bio
              </span>
            </div>

            {/* Thumbnail selector */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-emerald-600 shadow-md scale-105"
                        : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col space-y-6">
            {/* Category & Title */}
            <div>
              {product.category && (
                <span className="text-xs font-extrabold tracking-widest text-emerald-600 uppercase block mb-1.5">
                  {product.category.name}
                </span>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating & Stock status */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <StarRating rating={product.avgRating} reviewsCount={product.reviewCount} size={18} />
              <div>
                {product.stock > 5 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> En stock ({product.stock} dispo)
                  </span>
                ) : product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Stock limité ({product.stock} restants)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    Épuisé
                  </span>
                )}
              </div>
            </div>

            {/* Price CAD */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-slate-900">{product.price.toFixed(2)} $</span>
              <span className="text-xs font-extrabold text-slate-500 uppercase">CAD</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                Taxes incluses à la caisse
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Quantity Selector + Add to Cart */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-800">Quantité :</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-slate-700 hover:bg-slate-200 transition-colors rounded-l-xl"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 font-extrabold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2.5 text-slate-700 hover:bg-slate-200 transition-colors rounded-r-xl"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className={added ? "!bg-slate-900" : ""}
              >
                {added ? (
                  <>
                    <Check size={18} /> Ajouté au panier !
                  </>
                ) : product.stock <= 0 ? (
                  "Épuisé"
                ) : (
                  <>
                    <Sparkles size={18} /> Ajouter au panier ({(product.price * quantity).toFixed(2)} $ CAD)
                  </>
                )}
              </Button>
            </div>

            {/* Canada Shipping Guarantee Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold">
                <Truck size={18} className="text-emerald-700" />
                <span>🇨🇦 Expédition Express Canada Uniquement</span>
              </div>
              <p className="text-emerald-800 leading-relaxed font-medium">
                Expédié depuis notre laboratoire au Québec sous 24h à 48h. Retours gratuits sous 30 jours.
              </p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs text-slate-600 font-bold">
              <div className="flex flex-col items-center gap-1">
                <Leaf size={20} className="text-emerald-600" />
                <span>100% Botanique</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={20} className="text-emerald-600" />
                <span>Sans Parabènes</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Award size={20} className="text-emerald-600" />
                <span>Fabriqué au Québec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Description, Ingredients, Benefits, Usage */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex border-b border-slate-200 overflow-x-auto gap-8">
            <button
              onClick={() => setActiveTab("desc")}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "desc"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Description détaillée
            </button>
            <button
              onClick={() => setActiveTab("ingredients")}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "ingredients"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Ingrédients & Composition
            </button>
            <button
              onClick={() => setActiveTab("usage")}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "usage"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Conseils d'utilisation
            </button>
            <button
              onClick={() => setActiveTab("benefits")}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "benefits"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Bénéfices constatés
            </button>
          </div>

          <div className="text-sm text-slate-800 leading-relaxed pt-2 font-medium">
            {activeTab === "desc" && (
              <div className="space-y-3">
                <p>{product.description}</p>
                <p>
                  Chaque pot de pommade est conçu à partir d'ingrédients botaniques sélectionnés avec soin pour garantir une qualité irréprochable et un respect optimal de la peau et des cheveux.
                </p>
              </div>
            )}
            {activeTab === "ingredients" && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">Formule botaniquement active :</h4>
                <p className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 font-bold">
                  {product.ingredients || "Formulation confidentielle 100% bio et naturelle."}
                </p>
              </div>
            )}
            {activeTab === "usage" && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">Comment appliquer la pommade :</h4>
                <p className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-slate-900 font-semibold">
                  {product.instructions || "Prélever une petite quantité, chauffer entre les paumes et appliquer délicatement."}
                </p>
              </div>
            )}
            {activeTab === "benefits" && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">Résultats & Bénéfices :</h4>
                <p className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 font-bold">
                  {product.benefits || "Hydratation profonde et protection contre les agressions extérieures."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-emerald-600" size={22} /> Avis Clients Vérifiés
            </h3>
            <span className="text-xs text-slate-600 font-bold">
              Note moyenne : <strong className="text-slate-900">{product.avgRating.toFixed(1)} / 5</strong> ({product.reviewCount} avis)
            </span>
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4 divide-y divide-slate-100">
              {product.reviews.map((rev: any) => (
                <div key={rev.id} className="pt-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{rev.authorName}</span>
                    <StarRating rating={rev.rating} size={14} />
                  </div>
                  <p className="text-xs text-slate-700 italic font-medium">"{rev.comment}"</p>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    {new Date(rev.createdAt).toLocaleDateString("fr-CA")} • Achat vérifié Canada
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic font-medium">
              Soyez le premier à donner votre avis sur cette pommade !
            </p>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Vous aimerez aussi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
