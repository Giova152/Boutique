import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
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
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const getProductById = (id) => products.find(p => p.id === id);

  const getProductsByCategory = (category) =>
    products.filter(p => p.category === category);

  return (
    <ProductsContext.Provider value={{
      products,
      loading,
      getProductById,
      getProductsByCategory,
      reload: loadProducts
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
