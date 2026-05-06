import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, subtotal, discount, shipping, total, promoCode, applyPromoCode } = useCart();
  const { addToast } = useToast();
  const [promoInput, setPromoInput] = useState(promoCode);

  const handlePromo = () => {
    const result = applyPromoCode(promoInput);
    addToast(result.message, result.success ? 'success' : 'error');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="drawer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="drawer-header">
          <h2>Mon Panier</h2>
          <button onClick={onClose} className="drawer-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="drawer-content">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={64} strokeWidth={1} />
              <h3>Votre panier est vide</h3>
              <p>Découvrir nos produits</p>
              <Link to="/boutique" className="btn-primary" onClick={onClose}>
                Découvrir la boutique
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    className="cart-item"
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <img src={item.images[0]} alt={item.name} />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">{item.price.toFixed(2)} $</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="promo-code">
                <input
                  type="text"
                  placeholder="Code promo"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                />
                <button onClick={handlePromo}>Appliquer</button>
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} $</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Réduction</span>
                    <span>-{discount.toFixed(2)} $</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} $`}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{total.toFixed(2)} $</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary btn-checkout"
                onClick={onClose}
              >
                Passer à la caisse
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}