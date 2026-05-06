import { createContext, useContext, useState, useEffect } from 'react';
import { promoCodes } from '../data/config';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('natura_cart');
    return saved ? JSON.parse(saved) : [];
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
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [...prev, { ...product, quantity: newQuantity }];
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