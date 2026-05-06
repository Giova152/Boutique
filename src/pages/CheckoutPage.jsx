import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Truck, Package, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { getTranslation } from '../data/translations';
import { sendOrderEmail } from '../services/emailService';
import PaymentMethods from '../components/payment/PaymentMethods';
import '../components/payment/PaymentMethods.css';
import '../components/payment/CheckoutStyles.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, discount, shipping, total, clearCart } = useCart();
  const { addOrder, user } = useAuth();
  const { language } = useLanguage();
  const { orders, updateStock } = useAdmin();
  const t = (key) => getTranslation(language, key);
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    province: 'Québec',
    postalCode: '',
    phone: ''
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentSuccess = () => {
    setIsProcessing(true);
    const orderData = {
      items: cart,
      customer: shippingInfo,
      shippingMethod,
      paymentMethod,
      subtotal,
      discount,
      shipping: shippingMethod === 'express' ? 19.99 : 9.99,
      total
    };
    addOrder(orderData);
    
    cart.forEach(item => {
      updateStock(item.id, item.inStock - item.quantity);
    });
    
    sendOrderEmail(orderData);
    setOrderComplete(true);
    setIsProcessing(false);
    clearCart();
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <main className="checkout-page">
        <div className="container empty-cart">
          <h2>{t('emptyCart') || 'Votre panier est vide'}</h2>
          <p>{t('addProductsFirst') || 'Ajoutez des produits avant de passer à la caisse'}</p>
          <button onClick={() => navigate('/boutique')} className="btn-primary">Aller à la boutique</button>
        </div>
      </main>
    );
  }

  if (orderComplete) {
    return (
      <main className="checkout-page">
        <div className="container order-confirmation">
          <div className="confirmation-icon"><Check size={48} /></div>
          <h2>{t('orderComplete') || 'Merci pour votre commande !'}</h2>
          <p>{t('orderSuccess') || 'Votre commande a été enregistrée avec succès.'}</p>
          <p>{t('confirmationEmail') || 'Un email de confirmation vous a été envoyé'} à {shippingInfo.email}</p>
          <button onClick={() => navigate('/')} className="btn-primary">{t('backToHome') || 'Retour à l\'accueil'}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="container">
        <h1>{t('checkoutTitle')}</h1>

        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-icon"><Package size={20} /></div>
            <span>{t('information')}</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-icon"><Truck size={20} /></div>
            <span>{t('shipping')}</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-icon"><CreditCard size={20} /></div>
            <span>{t('payment')}</span>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form">
            {step === 1 && (
              <div className="form-step">
                <h2>{t('shippingInfo')}</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input type="text" name="firstName" value={shippingInfo.firstName} onChange={handleShippingChange} />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input type="text" name="lastName" value={shippingInfo.lastName} onChange={handleShippingChange} />
                  </div>
                  <div className="form-group full">
                    <label>Email</label>
                    <input type="email" name="email" value={shippingInfo.email} onChange={handleShippingChange} />
                  </div>
                  <div className="form-group full">
                    <label>Adresse</label>
                    <input type="text" name="address" value={shippingInfo.address} onChange={handleShippingChange} />
                  </div>
                  <div className="form-group">
                    <label>Ville</label>
                    <input type="text" name="city" value={shippingInfo.city} onChange={handleShippingChange} />
                  </div>
                  <div className="form-group">
                    <label>Province</label>
                    <select name="province" value={shippingInfo.province} onChange={handleShippingChange}>
                      <option>Québec</option>
                      <option>Ontario</option>
                      <option>Colombie-Britannique</option>
                      <option>Alberta</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Code postal</label>
                    <input type="text" name="postalCode" value={shippingInfo.postalCode} onChange={handleShippingChange} />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleShippingChange} />
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setStep(2)}>Continuer</button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <h2>Mode de livraison</h2>
                <div className="shipping-options">
                  <label className={`shipping-option ${shippingMethod === 'standard' ? 'selected' : ''}`}>
                    <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                    <div className="option-content">
                      <span className="option-title">Standard</span>
                      <span className="option-desc">3-5 jours ouvrables</span>
                    </div>
                    <span className="option-price">9.99 $</span>
                  </label>
                  <label className={`shipping-option ${shippingMethod === 'express' ? 'selected' : ''}`}>
                    <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                    <div className="option-content">
                      <span className="option-title">Express</span>
                      <span className="option-desc">1-2 jours ouvrables</span>
                    </div>
                    <span className="option-price">19.99 $</span>
                  </label>
                </div>
                <div className="form-buttons">
                  <button className="btn-secondary" onClick={() => setStep(1)}>Retour</button>
                  <button className="btn-primary" onClick={() => setStep(3)}>Continuer</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <PaymentMethods 
                  total={total}
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  onPaymentSuccess={handlePaymentSuccess}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
                <div className="form-buttons">
                  <button className="btn-secondary" onClick={() => setStep(2)} disabled={isProcessing}>Retour</button>
                </div>
              </div>
            )}
          </div>

          <aside className="order-summary">
            <h3>{t('orderSummary') || 'Récapitulatif'}</h3>
            <div className="summary-items">
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.images[0]} alt={item.name} />
                  <div>
                    <span>{item.name}</span>
                    <span>{t('quantity') || 'Qté'}: {item.quantity}</span>
                  </div>
                  <span>{(item.price * item.quantity).toFixed(2)} $</span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row"><span>{t('subtotal')}</span><span>{subtotal.toFixed(2)} $</span></div>
              {discount > 0 && <div className="summary-row"><span>{t('discount')}</span><span>-{discount.toFixed(2)} $</span></div>}
              <div className="summary-row"><span>{t('shipping')}</span><span>{(shippingMethod === 'express' ? 19.99 : shipping).toFixed(2)} $</span></div>
              <div className="summary-row total"><span>{t('total')}</span><span>{(subtotal - discount + (shippingMethod === 'express' ? 19.99 : shipping)).toFixed(2)} $</span></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}