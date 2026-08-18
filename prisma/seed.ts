import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "file:./dev.db";
const adapter = (connectionString.startsWith("postgresql://") || connectionString.startsWith("postgres://"))
  ? new PrismaPg({ connectionString })
  : new PrismaBetterSqlite3({ url: "file:./dev.db" });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Vegederm Bio Cosméceutiques database from WooCommerce data...");

  // Clear existing
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.storeSettings.deleteMany();

  // Create Categories from screenshot
  const catCorps = await prisma.category.create({
    data: {
      name: "NOS PRODUITS POUR LE CORPS",
      slug: "nos-produits-pour-le-corps",
      description: "Baumes, beurres rares et huiles bio-cosméceutiques précieuses pour le corps.",
    },
  });

  const catSavons = await prisma.category.create({
    data: {
      name: "NOS SAVONS",
      slug: "nos-savons",
      description: "Savons artisanaux biologiques aux huiles précieuses et extraits botaniques.",
    },
  });

  const catPieds = await prisma.category.create({
    data: {
      name: "NOS SOINS DE PIEDS",
      slug: "nos-soins-de-pieds",
      description: "Soin intense baume pommade réparateur pour pieds secs et crevassés.",
    },
  });

  const catCapillaires = await prisma.category.create({
    data: {
      name: "SOINS CAPILLAIRES",
      slug: "soins-capillaires",
      description: "Pommades et huiles capillaires fortifiantes pour cheveux.",
    },
  });

  const catEczema = await prisma.category.create({
    data: {
      name: "SOINS POUR EXCÉMAS & PSORIASS",
      slug: "soins-pour-excemas-psoriass",
      description: "Formules apaisantes spécialisées pour peaux atopiques, excémas et psoriasis.",
    },
  });

  // Create Real Vegederm Products from WooCommerce Screenshots
  await prisma.product.createMany({
    data: [
      {
        name: "Huile_Précieuse BK13",
        slug: "huile-precieuse-bk13",
        description: "Huile corporelle précieuse bio-cosméceutique nourrissante aux huiles végétales rares.",
        price: 45.00,
        images: JSON.stringify(["/images/products/vegederm-savon.png"]),
        categoryId: catCorps.id,
        stock: 25,
        ingredients: "Huile d'argan, Huile de jojoba, Vitamine E, Huiles essentielles rares.",
        instructions: "Appliquer quelques gouttes sur peau propre et masser délicatement.",
        benefits: "Hydratation intense 24h, adoucit et régénère le tissu cutané.",
        status: "active",
        featured: true,
        avgRating: 4.9,
        reviewCount: 38,
      },
      {
        name: "BK_BRUT VRAC",
        slug: "bk-brut-vrac",
        description: "Beurre végétal brut pur formulé pour le corps et apaisant pour excémas et psoriasis.",
        price: 45.00,
        images: JSON.stringify(["/images/products/vegederm-eczema.png"]),
        categoryId: catCorps.id,
        stock: 30,
        ingredients: "Beurre de karité brut bio 100% naturel non raffiné.",
        instructions: "Faire fondre une noisette entre les paumes et appliquer sur les zones très sèches.",
        benefits: "Soulage immédiatement les rougeurs, tiraillements et desquamations.",
        status: "active",
        featured: true,
        avgRating: 5.0,
        reviewCount: 54,
      },
      {
        name: "Savon_Menthe poivrée",
        slug: "savon-menthe-poivree",
        description: "Savon surgras artisanal à la menthe poivrée rafraîchissante et purifiante.",
        price: 12.00,
        images: JSON.stringify(["/images/products/vegederm-savon.png"]),
        categoryId: catSavons.id,
        stock: 60,
        ingredients: "Huile d'olive bio, Huile de coco, Huile essentielle de menthe poivrée.",
        instructions: "Faire mousser sous l'eau et rincer.",
        benefits: "Effet coup de frais dynamisant, nettoie en profondeur.",
        status: "active",
        featured: false,
        avgRating: 4.8,
        reviewCount: 29,
      },
      {
        name: "Savon aux chocolat",
        slug: "savon-aux-chocolat",
        description: "Savon gourmand artisanal enrichi au pur beurre de cacao bio.",
        price: 12.00,
        images: JSON.stringify(["/images/products/vegederm-savon.png"]),
        categoryId: catSavons.id,
        stock: 40,
        ingredients: "Beurre de cacao bio, Poudre de cacao pure, Huile d'amande douce.",
        instructions: "Utiliser quotidiennement pour le corps et les mains.",
        benefits: "Laisse la peau douce, souple et subtilement parfumée.",
        status: "active",
        featured: false,
        avgRating: 4.9,
        reviewCount: 22,
      },
      {
        name: "BK_Brut Nature",
        slug: "bk-brut-nature",
        description: "Baume corporel neutre bio sans parfum ajouté pour peaux ultra-sensibles.",
        price: 25.00,
        images: JSON.stringify(["/images/products/miel-dore.png"]),
        categoryId: catCorps.id,
        stock: 35,
        ingredients: "Beurre de karité bio, Huile de jojoba, Vitamine E.",
        instructions: "Appliquer sur peau propre matin et soir.",
        benefits: "Hypoallergénique, restaure le film hydrolipidique naturel.",
        status: "active",
        featured: true,
        avgRating: 4.8,
        reviewCount: 31,
      },
      {
        name: "BK_Lavande",
        slug: "bk-lavande",
        description: "Baume pommade apaisant infusé à l'huile essentielle de lavande vraie.",
        price: 27.00,
        images: JSON.stringify(["/images/products/rose-velours.png"]),
        categoryId: catCorps.id,
        stock: 28,
        ingredients: "Beurre de karité, Huile essentielle de lavande bio, Huile d'amande douce.",
        instructions: "Masser le corps le soir avant de se coucher.",
        benefits: "Soin relaxant anti-stress et réparateur nocturne.",
        status: "active",
        featured: true,
        avgRating: 5.0,
        reviewCount: 41,
      },
      {
        name: "Savon de Voyage _ Agrumes",
        slug: "savon-de-voyage-agrumes",
        description: "Savon artisanal compact aux extraits d'agrumes tonifiants.",
        price: 12.00,
        images: JSON.stringify(["/images/products/vegederm-savon.png"]),
        categoryId: catSavons.id,
        stock: 50,
        ingredients: "Huile de coco, Essence d'orange douce, Citron bio, Huile d'olive.",
        instructions: "Pratique pour les déplacements et voyages.",
        benefits: "Parfum pétillant rafraîchissant.",
        status: "active",
        featured: false,
        avgRating: 4.7,
        reviewCount: 18,
      },
      {
        name: "Huile Capillaire",
        slug: "huile-capillaire",
        description: "Soin huile fortifiante et réparatrice pour cheveux et cuir chevelu.",
        price: 15.00,
        images: JSON.stringify(["/images/products/lumiere-noire.png"]),
        categoryId: catCapillaires.id,
        stock: 45,
        ingredients: "Huile de ricin bio, Huile d'argan, Protéines de soie, Essence de cèdre.",
        instructions: "Appliquer en bain d'huile avant le shampooing ou quelques gouttes sur les pointes.",
        benefits: "Nourrit les cheveux, stimule la pousse et prévient les fourches.",
        status: "active",
        featured: true,
        avgRating: 4.9,
        reviewCount: 62,
      },
      {
        name: "BK_JASMIN",
        slug: "bk-jasmin",
        description: "Baume corporel précieux parfumé aux fleurs de jasmin sauvage.",
        price: 27.00,
        images: JSON.stringify(["/images/products/eclat-naturel.png"]),
        categoryId: catCorps.id,
        stock: 20,
        ingredients: "Beurre de mangue bio, Extrait de jasmin précieux, Huile de marula.",
        instructions: "Masser sur une peau sèche ou légèrement humide.",
        benefits: "Fini satiné velouté au parfum captivant.",
        status: "active",
        featured: true,
        avgRating: 4.9,
        reviewCount: 37,
      },
      {
        name: "BK_Vanille",
        slug: "bk-vanille",
        description: "Baume pommade gourmand à l'extrait naturel de gousse de vanille de Madagascar.",
        price: 35.00,
        images: JSON.stringify(["/images/products/miel-dore.png"]),
        categoryId: catCorps.id,
        stock: 18,
        ingredients: "Beurre de karité bio, Extraits de vanille naturelle, Beurre de cacao.",
        instructions: "Appliquer généreusement sur le corps.",
        benefits: "Nourrit les peaux sèches et enveloppe d'une douceur gourmande.",
        status: "active",
        featured: true,
        avgRating: 5.0,
        reviewCount: 49,
      },
      {
        name: "VEGEDERM — Soin Baume des Pieds Réparateur",
        slug: "vegederm-soin-baume-des-pieds",
        description: "Baume pommade ultra-concentré pour talons et pieds secs.",
        price: 32.00,
        images: JSON.stringify(["/images/products/vegederm-pieds.png"]),
        categoryId: catPieds.id,
        stock: 25,
        ingredients: "Beurre de karité, Huile de ricin, Extrait de menthe poivrée.",
        instructions: "Masser chaque soir sur les talons et pieds propres.",
        benefits: "Répare les rugosités et crevasses.",
        status: "active",
        featured: true,
        avgRating: 5.0,
        reviewCount: 40,
      },
    ],
  });

  // Create Promo Codes
  await prisma.promoCode.create({
    data: {
      code: "VEGEDERM10",
      type: "percentage",
      value: 10,
      minPurchase: 30,
      active: true,
    },
  });

  await prisma.promoCode.create({
    data: {
      code: "CANADA15",
      type: "fixed",
      value: 15,
      minPurchase: 50,
      active: true,
    },
  });

  // Create Admin
  const adminPassword = await bcrypt.hash("Admin2024!", 10);
  await prisma.admin.create({
    data: {
      email: "admin@vegedermbiocosmeceutiques.com",
      name: "Admin Vegederm",
      passwordHash: adminPassword,
      role: "superadmin",
    },
  });

  // Store Settings (Default $13 CAD Shipping Rate)
  await prisma.storeSettings.createMany({
    data: [
      { key: "store_name", value: "VEGEDERM BIO COSMECEUTIQUES" },
      { key: "store_email", value: "contact@vegedermbiocosmeceutiques.com" },
      { key: "free_shipping_threshold", value: "75" },
      { key: "flat_shipping_rate", value: "13.00" }, // 13$ CAD shipping rate
      { key: "favicon_url", value: "/favicon.ico" },
    ],
  });

  console.log("Database seeded successfully with real Vegederm WooCommerce products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
