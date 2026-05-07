import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { getTranslation } from '../data/translations';
import SEO from '../components/layout/SEO';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, discount, shipping, total, promoCode, applyPromoCode } = useCart();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const handlePromo = () => {
    const result = applyPromoCode(promoInput);
    setPromoMessage(result.message);
  };

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <SEO
          title={language === 'fr' ? 'Panier' : 'Cart'}
          path="/cart"
        />
        <div className="container empty-cart">
          <h2>{t('cartEmpty')}</h2>
          <p>{t('discoverShop')}</p>
          <Link to="/boutique" className="btn-primary">{language === 'fr' ? 'Aller à la boutique' : 'Go to Shop'}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <SEO
        title={language === 'fr' ? 'Panier' : 'Cart'}
        path="/cart"
      />
      <div className="container">
        <h1>{t('myCart')}</h1>
        
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
            <h3>{language === 'fr' ? 'Résumé de commande' : 'Order Summary'}</h3>
            
            <div className="promo-section">
              <input
                type="text"
                placeholder={t('promoCode')}
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              />
              <button onClick={handlePromo}>{t('apply')}</button>
            </div>
            {promoMessage && <p className="promo-msg">{promoMessage}</p>}
            {promoCode && <p className="promo-applied">{language === 'fr' ? `Code "${promoCode}" appliqué` : `Code "${promoCode}" applied`}</p>}

            <div className="summary-lines">
              <div className="summary-line"><span>{t('subtotal')}</span><span>{subtotal.toFixed(2)} $</span></div>
              {discount > 0 && <div className="summary-line discount"><span>{t('discount')}</span><span>-{discount.toFixed(2)} $</span></div>}
              <div className="summary-line"><span>{t('shipping')}</span><span>{shipping === 0 ? t('free') : `${shipping.toFixed(2)} $`}</span></div>
              <div className="summary-line total"><span>{t('total')}</span><span>{total.toFixed(2)} $</span></div>
            </div>

            <Link to="/checkout" className="btn-primary btn-checkout">{t('checkout')}</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}