import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, discount, shipping, total, promoCode, applyPromoCode } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const handlePromo = () => {
    const result = applyPromoCode(promoInput);
    setPromoMessage(result.message);
  };

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="container empty-cart">
          <h2>Votre panier est vide</h2>
          <p>Découvrir nos produits</p>
          <Link to="/boutique" className="btn-primary">Aller à la boutique</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        <h1>Mon Panier</h1>
        
        <div className="cart-layout">
          <div className="cart-items-section">
            {cart.map(item => (
              <div key={item.id} className="cart-item-card">
                <img src={item.images[0]} alt={item.name} />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">{item.price.toFixed(2)} $</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={16} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></button>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <p className="item-total">{(item.price * item.quantity).toFixed(2)} $</p>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary-card">
            <h3>Résumé de commande</h3>
            
            <div className="promo-section">
              <input
                type="text"
                placeholder="Code promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              />
              <button onClick={handlePromo}>Appliquer</button>
            </div>
            {promoMessage && <p className="promo-msg">{promoMessage}</p>}
            {promoCode && <p className="promo-applied">Code "{promoCode}" appliqué</p>}

            <div className="summary-lines">
              <div className="summary-line"><span>Sous-total</span><span>{subtotal.toFixed(2)} $</span></div>
              {discount > 0 && <div className="summary-line discount"><span>Réduction</span><span>-{discount.toFixed(2)} $</span></div>}
              <div className="summary-line"><span>Livraison</span><span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} $`}</span></div>
              <div className="summary-line total"><span>Total</span><span>{total.toFixed(2)} $</span></div>
            </div>

            <Link to="/checkout" className="btn-primary btn-checkout">Passer à la caisse</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}