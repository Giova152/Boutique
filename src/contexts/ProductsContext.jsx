import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_PRODUCTS = [
  { id: '1', name: 'Beurre de Karité Pur', price: 18.99, category: 'beurre-karite', isBestseller: true, images: ['https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400'], inStock: 50, rating: 4.8, reviews: 124 },
  { id: '2', name: 'Crème Hydratante Éclat', price: 24.99, category: 'cremes', isBestseller: true, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'], inStock: 35, rating: 4.6, reviews: 89 },
  { id: '3', name: 'Savon Artisanal au Karité', price: 8.99, category: 'savons', isPromo: true, promoPrice: 6.99, images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'], inStock: 100, rating: 4.5, reviews: 156 },
  { id: '4', name: 'Baume Corps Ultra-Riche', price: 29.99, category: 'corps', isBestseller: true, images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400'], inStock: 45, rating: 4.9, reviews: 156 }
];

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const formatted = data.map(p => ({
            ...p,
            images: p.image ? [p.image] : [],
            isBestseller: p.is_bestseller || false,
            isNew: p.is_new || false,
            isPromo: p.is_promo || false,
            inStock: p.in_stock || 0,
            promoPrice: p.promo_price || null
          }));
          setProducts(formatted);
        }
        setLoading(false);
      });
  }, []);

  return (
    <ProductsContext.Provider value={{
      products,
      loading,
      getProductById: (id) => products.find(p => p.id === id),
      getProductsByCategory: (category) => products.filter(p => p.category === category)
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);