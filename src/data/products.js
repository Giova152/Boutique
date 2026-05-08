export const categories = [
  { id: 'beurre-karite', name: 'Beurre de Karité Brut', icon: 'karite', iconName: 'droplets' },
  { id: 'gamme-enfants', name: 'Gamme Enfants', icon: 'child', iconName: 'smile' },
  { id: 'exfoliants', name: 'Nos Exfoliants', icon: 'exfoliant', iconName: 'sparkles' },
  { id: 'corps', name: 'Produits Corps', icon: 'body', iconName: 'droplet' },
  { id: 'savons', name: 'Nos Savons', icon: 'soap', iconName: 'waves' },
  { id: 'pieds', name: 'Soins des Pieds', icon: 'feet', iconName: 'footprints' },
  { id: 'capillaires', name: 'Soins Capillaires', icon: 'hair', iconName: 'wind' },
  { id: 'eczema', name: 'Eczéma & Psoriasis', icon: 'skin', iconName: 'heart' }
];

export const skinTypes = [
  { id: 'normale', name: 'Normale' },
  { id: 'seche', name: 'Sèche' },
  { id: 'mixte', name: 'Mixte' },
  { id: 'sensible', name: 'Sensible' }
];

export const needs = [
  { id: 'hydration', name: 'Hydratation' },
  { id: 'apaisement', name: 'Apaisement' },
  { id: 'nutrition', name: 'Nutrition' },
  { id: 'exfoliation', name: 'Exfoliation' }
];

export const DEFAULT_PRODUCTS = [
  {
    id: '1',
    name: 'Beurre de Karité Pur',
    price: 18.99,
    category: 'beurre-karite',
    isBestseller: true,
    images: ['https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400'],
    inStock: 50,
    rating: 4.8,
    reviews: 124,
    description: 'Beurre de karité 100% naturel, riche en vitamines et acides gras essentiels.'
  },
  {
    id: '2',
    name: 'Crème Hydratante Éclat',
    price: 24.99,
    category: 'cremes',
    isBestseller: true,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
    inStock: 35,
    rating: 4.6,
    reviews: 89,
    description: 'Crème hydratante légère et non grasses pour tous types de peau.'
  },
  {
    id: '3',
    name: 'Savon Artisanal au Karité',
    price: 8.99,
    category: 'savons',
    isPromo: true,
    promoPrice: 6.99,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
    inStock: 100,
    rating: 4.5,
    reviews: 156,
    description: 'Savon artisanal enrichi au beurre de karité et aux huiles essentielles.'
  },
  {
    id: '4',
    name: 'Baume Corps Ultra-Riche',
    price: 29.99,
    category: 'corps',
    isBestseller: true,
    images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400'],
    inStock: 45,
    rating: 4.9,
    reviews: 156,
    description: 'Lotion corporelle ultra-nourrissante pour les peaux très sèches.'
  },
  {
    id: '5',
    name: 'Gommage Corporel Douceur',
    price: 19.99,
    category: 'exfoliants',
    isNew: true,
    images: ['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400'],
    inStock: 40,
    rating: 4.6,
    reviews: 72,
    description: 'Gommage naturel aux粒 de sucre et huile de karité.'
  },
  {
    id: '6',
    name: 'Crème Pieds Réparatrice',
    price: 22.99,
    category: 'pieds',
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b38b07?w=400'],
    inStock: 28,
    rating: 4.8,
    reviews: 95,
    description: 'Crème spécifique pour les pieds secs et fendillés.'
  },
  {
    id: '7',
    name: 'Shampooing Réparateur',
    price: 16.99,
    category: 'capillaires',
    images: ['https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400'],
    inStock: 32,
    rating: 4.5,
    reviews: 48,
    description: 'Shampooing doux sans sulfate qui répare et renforce les cheveux.'
  },
  {
    id: '8',
    name: 'Crème Réparatrice Éczéma',
    price: 26.99,
    category: 'eczema',
    isPromo: true,
    promoPrice: 22.99,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
    inStock: 20,
    rating: 4.9,
    reviews: 210,
    description: 'Crème apaisante conçue pour les peaux atopiques et sensibles.'
  }
];

export const products = DEFAULT_PRODUCTS;