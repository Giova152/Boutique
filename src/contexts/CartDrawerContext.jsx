import { createContext, useContext, useState } from 'react';

const CartDrawerContext = createContext();

export function CartDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  return (
    <CartDrawerContext.Provider value={{ isOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export const useCartDrawer = () => useContext(CartDrawerContext);