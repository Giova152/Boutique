import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Truck, Package, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { supabase } from '../lib/supabase';
import { getTranslation } from '../data/translations';
import { sendOrderEmail, sendConfirmationEmail } from '../services/emailService';
import { validateCheckoutForm, sanitizeInput } from '../utils/validation';
import PaymentMethods from '../components/payment/PaymentMethods';
import '../components/payment/PaymentMethods.css';
import '../components/payment/CheckoutStyles.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, discount, shipping, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { addOrder, updateStock, products } = useAdmin();
  const t = (key) => getTranslation(language, key);
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name?.split(' ')[0] || profile?.full_name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || profile?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    address: profile?.address || '',
    city: profile?.city || '',
    province: profile?.province || 'Québec',
    postalCode: profile?.postal_code || '',
    phone: profile?.phone || ''
  });

  useEffect(() => {
    if (profile && !shippingInfo.address) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: profile.full_name?.split(' ')[0] || prev.firstName,
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || prev.lastName,
        address: profile.address || prev.address,
        city: profile.city || prev.city,
        province: profile.province || prev.province,
        postalCode: profile.postal_code || prev.postalCode,
        phone: profile.phone || prev.phone
      }));
    }
  }, [profile]);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === 'email' ? value : sanitizeInput(value);
    setShippingInfo({ ...shippingInfo, [name]: sanitized });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateStep1 = () => {
    const validation = validateCheckoutForm(shippingInfo);
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
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

      const orderResult = await addOrder(orderData);
      if (!orderResult?.success) {
        throw new Error('Erreur lors de la création de la commande');
      }

      if (user) {
        await updateProfile({
          full_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          phone: shippingInfo.phone,
          city: shippingInfo.city,
          address: shippingInfo.address,
          province: shippingInfo.province,
          postal_code: shippingInfo.postalCode
        });
      }

      await Promise.all(cart.map(async item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await updateStock(item.id, product.inStock - item.quantity);
        }
      }));

      sendOrderEmail(orderData);
      sendConfirmationEmail(shippingInfo.email, orderData);

      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error('Checkout error:', error);
      addToast(error.message || 'Erreur lors de la commande', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user?.id) return;
    await supabase.from('profiles').upsert({
      id: user.id,
      ...updates,
      updated_at: new Date().toISOString()
    });
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
                    <input type="text" name="firstName" value={shippingInfo.firstName} onChange={handleShippingChange} className={formErrors.firstName ? 'error' : ''} />
                    {formErrors.firstName && <span className="error-text">{formErrors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input type="text" name="lastName" value={shippingInfo.lastName} onChange={handleShippingChange} className={formErrors.lastName ? 'error' : ''} />
                    {formErrors.lastName && <span className="error-text">{formErrors.lastName}</span>}
                  </div>
                  <div className="form-group full">
                    <label>Email</label>
                    <input type="email" name="email" value={shippingInfo.email} onChange={handleShippingChange} className={formErrors.email ? 'error' : ''} />
                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                  </div>
                  <div className="form-group full">
                    <label>Téléphone</label>
                    <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleShippingChange} className={formErrors.phone ? 'error' : ''} placeholder="514-123-4567" />
                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                  </div>
                  <div className="form-group full">
                    <label>Adresse</label>
                    <input type="text" name="address" value={shippingInfo.address} onChange={handleShippingChange} className={formErrors.address ? 'error' : ''} />
                    {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                  </div>
                  <div className="form-group">
                    <label>Ville</label>
                    <input type="text" name="city" value={shippingInfo.city} onChange={handleShippingChange} className={formErrors.city ? 'error' : ''} />
                    {formErrors.city && <span className="error-text">{formErrors.city}</span>}
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
                    <input type="text" name="postalCode" value={shippingInfo.postalCode} onChange={handleShippingChange} className={formErrors.postalCode ? 'error' : ''} placeholder="H1H 1H1" />
                    {formErrors.postalCode && <span className="error-text">{formErrors.postalCode}</span>}
                  </div>
                </div>
                <button className="btn-primary" onClick={() => validateStep1() && setStep(2)}>Continuer</button>
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
                  cartItems={cart}
                  customerEmail={shippingInfo.email}
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