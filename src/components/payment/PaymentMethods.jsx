import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CreditCard, Loader2 } from 'lucide-react';
import { paymentConfig } from '../../data/paymentConfig';

const stripePromise = paymentConfig.stripe.publishableKey 
  ? loadStripe(paymentConfig.stripe.publishableKey)
  : null;

export default function PaymentMethods({ 
  total, 
  paymentMethod, 
  onPaymentMethodChange, 
  onPaymentSuccess,
  isProcessing,
  setIsProcessing
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleStripeSubmit = async (e) => {
    e.preventDefault();
    if (!stripePromise) {
      onPaymentSuccess();
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 1500);
  };

  const handlePayPalApprove = async (data, actions) => {
    setIsProcessing(true);
    try {
      await actions.order.capture();
      setIsProcessing(false);
      onPaymentSuccess();
    } catch (error) {
      setIsProcessing(false);
      console.error('PayPal error:', error);
    }
  };

  const isStripeConfigured = paymentConfig.stripe.publishableKey !== '';
  const isPayPalConfigured = paymentConfig.paypal.clientId !== '';

  return (
    <div className="payment-methods">
      <h2>Moyen de paiement</h2>
      
      <div className="payment-options">
        <label className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            name="payment" 
            checked={paymentMethod === 'stripe'} 
            onChange={() => onPaymentMethodChange('stripe')}
          />
          <img src="https://img.icons8.com/?size=30&id=aMTIdm5CdddP&format=png&color=000000" alt="Carte" className="payment-icon-img" />
          <span>Carte de crédit</span>
          <span className="payment-desc">Paiement sécurisé</span>
        </label>

        <label className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            name="payment" 
            checked={paymentMethod === 'paypal'} 
            onChange={() => onPaymentMethodChange('paypal')} 
          />
          <img src="https://img.icons8.com/?size=30&id=13611&format=png&color=000000" alt="PayPal" className="payment-icon-img" />
          <span>PayPal</span>
          <span className="payment-desc">Paiement rapide</span>
        </label>
      </div>

      {paymentMethod === 'stripe' && (
        <form onSubmit={handleStripeSubmit} className="card-form">
          <div className="form-group">
            <label>Numéro de carte</label>
            <input 
              type="text" 
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Expiration</label>
              <input 
                type="text" 
                placeholder="MM/AA"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
              />
            </div>
            <div className="form-group">
              <label>CVC</label>
              <input 
                type="text" 
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                required
              />
            </div>
          </div>
          {!isStripeConfigured && (
            <p className="payment-note payment-note-demo">
              <CreditCard size={14} /> Mode démo - Pas de vrai paiement
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={isProcessing}>
            {isProcessing ? <Loader2 className="spin" size={18} /> : null}
            Payer {total.toFixed(2)} $
          </button>
        </form>
      )}

      {paymentMethod === 'paypal' && isPayPalConfigured && (
        <div className="paypal-container">
          <PayPalScriptProvider 
            options={{ 
              clientId: paymentConfig.paypal.clientId,
              currency: 'CAD'
            }}
          >
            <PayPalButtons
              style={{ layout: 'vertical' }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: { value: total.toFixed(2) }
                  }]
                });
              }}
              onApprove={handlePayPalApprove}
            />
          </PayPalScriptProvider>
        </div>
      )}
    </div>
  );
}