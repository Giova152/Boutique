import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AbandonedCartContext = createContext();

export function AbandonedCartProvider({ children }) {
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [currentCart, setCurrentCart] = useState([]);

  useEffect(() => {
    loadCart();
    checkForAbandonedCarts();
  }, []);

  function loadCart() {
    const saved = localStorage.getItem('natura_cart');
    if (saved) {
      setCurrentCart(JSON.parse(saved));
    }
  }

  function saveCart(items) {
    localStorage.setItem('natura_cart', JSON.stringify(items));
    localStorage.setItem('cart_abandoned_at', Date.now().toString());
    setCurrentCart(items);
  }

  async function checkForAbandonedCarts() {
    const abandonedAt = localStorage.getItem('cart_abandoned_at');
    if (!abandonedAt) return;

    const cart = JSON.parse(localStorage.getItem('natura_cart') || '[]');
    if (cart.length === 0) {
      const timeDiff = Date.now() - parseInt(abandonedAt);
      const oneHour = 60 * 60 * 1000;
      const oneDay = 24 * 60 * 60 * 1000;

      if (timeDiff >= oneHour && timeDiff < oneDay) {
        setAbandonedCarts([{ items: cart, abandonedAt }]);
      }
    }
  }

  async function sendAbandonedCartEmail(email, cartData) {
    const itemsList = cartData.map(item => 
      `• ${item.name} x${item.quantity} - ${item.price.toFixed(2)}$`
    ).join('\n');

    const total = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const emailContent = `
Bonjour! 🌿

Nous avons remarqué que vous avez laissé des articles dans votre panier...

Votre panier:
${itemsList}

Total: ${total.toFixed(2)}$

Ne vous inquiétez pas, nous les avons gardés pour vous!

Rendez-vous sur VEGEDERM pour finaliser votre commande et profiter de vos produits naturels préférés.

À très bientôt!
L'équipe VEGEDERM 🌿
    `.trim();

    const formData = new FormData();
    formData.append('email', email);
    formData.append('subject', 'Votre panier VEGEDERM vous attend!');
    formData.append('message', emailContent);

    try {
      await fetch('https://formspree.io/f/xqvdewp', {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  function clearAbandonedCart() {
    setAbandonedCarts([]);
    localStorage.removeItem('cart_abandoned_at');
  }

  return (
    <AbandonedCartContext.Provider value={{
      currentCart,
      saveCart,
      abandonedCarts,
      sendAbandonedCartEmail,
      clearAbandonedCart,
      hasAbandonedCart: abandonedCarts.length > 0
    }}>
      {children}
    </AbandonedCartContext.Provider>
  );
}

export const useAbandonedCart = () => useContext(AbandonedCartContext);
