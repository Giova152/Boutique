import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_PRODUCTS } from '../data/products';

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