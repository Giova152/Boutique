"use client";

import React, { useState, useEffect, use, useCallback } from "react";
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

  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

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
        setReviewsList(data.reviews || []);
        let imgs = ["/images/products/lumiere-noire.png"];
        try {
          imgs = JSON.parse(data.images);
        } catch {}
        setSelectedImage(imgs[0] || "/images/products/lumiere-noire.png");

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
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
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
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-slate-900">Produit introuvable</h1>
          <p className="text-sm text-slate-500">La pommade demandée n&apos;existe pas ou a été retirée.</p>
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
    showToast(`${quantity} x "${product.name}" ajouté(s) au panier !`, "success");
    setTimeout(() => setAdded(false), 1800);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          authorName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Avis publié avec succès !", "success");
        setReviewsList([data, ...reviewsList]);
        setReviewName("");
        setReviewComment("");
        setReviewRating(5);
        setShowReviewForm(false);
      } else {
        showToast(data.error || "Erreur de soumission de l'avis", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <nav className="bg-white border-b border-slate-200 py-3.5" aria-label="Fil d'Ariane">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Accueil
          </Link>
          <ChevronRight size={14} className="text-slate-300 shrink-0" aria-hidden="true" />
          {product.category && (
            <>
              <Link
                href={`/?category=${product.category.slug}`}
                className="hover:text-primary-600 transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight size={14} className="text-slate-300 shrink-0" aria-hidden="true" />
            </>
          )}
          <span className="text-slate-900 truncate font-extrabold">{product.name}</span>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 bg-white p-4 sm:p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-card">
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100/70 border border-slate-200 group">
              <Image
                src={selectedImage}
                unoptimized
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05] cursor-zoom-in"
                priority
              />
              <span className="absolute top-4 left-4 bg-slate-950 text-primary-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-800 shadow-md">
                <span className="flex items-center gap-1.5">
                  <Leaf size={13} aria-hidden="true" /> 100% Botanique & Bio
                </span>
              </span>
            </div>

            {imagesList.length > 1 && (
              <div className="flex items-center gap-3">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    aria-label={`Voir l'image ${idx + 1}`}
                    className={`relative w-16 sm:w-20 h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-primary-500 shadow-md scale-105"
                        : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} unoptimized alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {product.category && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-extrabold uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <StarRating rating={product.avgRating} reviewsCount={product.reviewCount} size={18} />
                <span className="text-xs text-slate-400 font-bold" aria-hidden="true">•</span>
                <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
                  <ShieldCheck size={16} className="text-primary-500 shrink-0" aria-hidden="true" />
                  {product.stock > 0
                    ? `Stock disponible (${product.stock} unités)`
                    : "Actuellement épuisé"}
                </span>
              </div>

              <div className="py-3 border-y border-slate-100 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {product.price.toFixed(2)} $ <span className="text-xs text-slate-500 font-normal">CAD</span>
                </span>
                <span className="text-xs text-primary-700 font-bold bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
                  Taxes incluses • Livraison au Canada
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-2xl p-1 bg-slate-50 self-start">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold shadow-xs"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <span className="w-12 text-center text-sm font-extrabold text-slate-900" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold shadow-xs"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="font-bold py-4 text-base shadow-lg"
                >
                  {added ? (
                    <>
                      <Check size={20} aria-hidden="true" /> Ajouté au panier ({quantity})
                    </>
                  ) : (
                    `Ajouter au panier • ${(product.price * quantity).toFixed(2)} $ CAD`
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <Truck size={18} className="text-primary-500 shrink-0" aria-hidden="true" />
                  <span>Livraison rapide partout au Canada</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <Leaf size={18} className="text-primary-500 shrink-0" aria-hidden="true" />
                  <span>Formule artisanale 100% naturelle</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 lg:p-10 shadow-card space-y-6">
          <div className="flex items-center gap-5 sm:gap-6 border-b border-slate-200 overflow-x-auto" role="tablist">
            {([
              ["desc", "Description détaillée"],
              ["ingredients", "Ingrédients botaniques"],
              ["usage", "Conseils d'utilisation"],
              ["benefits", "Bénéfices constatés"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="text-sm text-slate-800 leading-relaxed pt-2 font-medium">
            {activeTab === "desc" && (
              <div className="space-y-3">
                <p>{product.description}</p>
                <p>
                  Chaque pot de pommade est conçu à partir d&apos;ingrédients botaniques sélectionnés avec soin pour garantir une qualité irréprochable et un respect optimal de la peau et des cheveux.
                </p>
              </div>
            )}
            {activeTab === "ingredients" && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">Formule botaniquement active :</h4>
                <p className="bg-primary-50 border border-primary-200 p-4 rounded-xl text-primary-950 font-bold">
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
                <p className="bg-primary-50 border border-primary-200 p-4 rounded-xl text-primary-950 font-bold">
                  {product.benefits || "Hydratation profonde et protection contre les agressions extérieures."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 lg:p-10 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="text-primary-500" size={22} aria-hidden="true" /> Avis Clients Vérifiés
              </h3>
              <span className="text-xs text-slate-600 font-bold">
                Note moyenne : <strong className="text-slate-900">{product.avgRating.toFixed(1)} / 5</strong> ({reviewsList.length} avis)
              </span>
            </div>

            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              size="md"
              className="font-bold self-start sm:self-auto"
            >
              {showReviewForm ? "Fermer le formulaire" : "Laisser un avis client"}
            </Button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-inner">
              <h4 className="font-bold text-sm text-slate-900">Partagez votre expérience sur cette pommade :</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="review-name" className="label">Votre Nom / Prénom *</label>
                  <input
                    id="review-name"
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Ex: Sophie Gagnon"
                    className="input"
                  />
                </div>

                <div>
                  <span className="label">Votre Note *</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                        className={`text-2xl transition-transform hover:scale-125 ${
                          star <= reviewRating ? "text-amber-400" : "text-slate-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      ({reviewRating} / 5 étoiles)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="review-comment" className="label">Votre commentaire *</label>
                <textarea
                  id="review-comment"
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Décrivez l'effet sur votre peau ou vos cheveux, la texture, le parfum..."
                  className="input"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submittingReview}
                className="font-bold"
              >
                Publier mon avis
              </Button>
            </form>
          )}

          {reviewsList && reviewsList.length > 0 ? (
            <div className="space-y-4 divide-y divide-slate-100">
              {reviewsList.map((rev: any) => (
                <div key={rev.id} className="pt-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{rev.authorName}</span>
                    <StarRating rating={rev.rating} size={14} />
                  </div>
                  <p className="text-xs text-slate-700 italic font-medium">&quot;{rev.comment}&quot;</p>
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