import { createContext, useContext, useState, useEffect } from 'react';
import { promoCodes } from '../data/config';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('natura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [promoCode, setPromoCode] = useState(() => {
    return localStorage.getItem('natura_promo') || '';
  });
  const [promoApplied, setPromoApplied] = useState(null);

  useEffect(() => {
    localStorage.setItem('natura_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (promoCode && promoCodes[promoCode]) {
      setPromoApplied(promoCodes[promoCode]);
    } else {
      setPromoApplied(null);
    }
    localStorage.setItem('natura_promo', promoCode);
  }, [promoCode]);

  useEffect(() => {
    if (cart.length > 0) {
      validateCartStock();
    }
  }, []);

  const validateCartStock = async () => {
    try {
      const productIds = cart.map(item => item.id);
      const { data: products } = await supabase
        .from('products')
        .select('id, in_stock, name')
        .in('id', productIds);

      if (products) {
        setCart(prev => prev.map(item => {
          const serverProduct = products.find(p => p.id === item.id);
          if (serverProduct) {
            const availableStock = serverProduct.in_stock || 0;
            if (availableStock === 0) {
              console.warn(`Produit "${item.name}" n'est plus disponible`);
            } else if (item.quantity > availableStock) {
              console.warn(`Quantité de "${item.name}" ajustée (stock: ${availableStock})`);
              return { ...item, quantity: Math.min(item.quantity, availableStock) };
            }
            return { ...item, inStock: availableStock };
          }
          return item;
        }));
      }
    } catch (err) {
      console.error('Erreur validation stock:', err);
    }
  };

  const addToCart = (product, quantity = 1) => {
    if (product.inStock === 0) {
      return { success: false, message: 'Produit en rupture de stock' };
    }
    const availableStock = product.inStock || 999;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      let newQuantity = quantity;
      if (existing) {
        newQuantity = existing.quantity + quantity;
        if (newQuantity > 20) {
          newQuantity = 20;
        }
        if (newQuantity > availableStock) {
          newQuantity = availableStock;
        }
      }
      if (newQuantity > 20) {
        newQuantity = 20;
      }
      if (newQuantity > availableStock) {
        newQuantity = availableStock;
      }
      const productWithStock = { ...product, quantity: newQuantity, inStock: availableStock - newQuantity };
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? productWithStock
            : item
        );
      }
      return [...prev, productWithStock];
    });
    return { success: true };
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setPromoApplied(null);
  };

  const applyPromoCode = (code) => {
    if (promoCodes[code]) {
      setPromoCode(code);
      return { success: true, message: promoCodes[code].description };
    }
    return { success: false, message: 'Code promo invalide' };
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoApplied?.type === 'percentage'
    ? subtotal * (promoApplied.value / 100)
    : 0;
  const shipping = promoApplied?.type === 'shipping' ? 0 : (subtotal > 75 ? 0 : 9.99);
  const total = subtotal - discount + shipping;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyPromoCode,
      promoCode,
      promoApplied,
      subtotal,
      discount,
      shipping,
      total,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);