import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { paymentConfig } from '../../data/paymentConfig';

const stripePromise = loadStripe(paymentConfig.stripe.publishableKey);

export default function PaymentMethods({ 
  total, 
  paymentMethod, 
  onPaymentMethodChange, 
  onPaymentSuccess,
  isProcessing,
  setIsProcessing,
  cartItems = [],
  customerEmail = ''
}) {
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);

  const isStripeConfigured = paymentConfig.stripe.publishableKey?.startsWith('pk_live');

  useEffect(() => {
    if (!total || total <= 0 || !isStripeConfigured) return;
    
    const initStripe = async () => {
      try {
        const stripeInstance = await stripePromise;
        if (!stripeInstance) return;
        setStripe(stripeInstance);

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            email: customerEmail
          })
        });
        
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          
          const elementsInstance = stripeInstance.elements({
            clientSecret: data.clientSecret,
            appearance: {
              theme: 'stripe',
              variables: { colorPrimary: '#2d5a27' },
            },
          });
          
          setElements(elementsInstance);
          
          const paymentEl = elementsInstance.create('payment');
          paymentEl.mount('#payment-element');
        }
      } catch (err) {
        console.error('Init error:', err);
      }
    };
    
    initStripe();
  }, [total, customerEmail, isStripeConfigured]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !clientSecret) {
      onPaymentSuccess();
      return;
    }

    const orderData = {
      items: cartItems,
      customer: { email: customerEmail },
      timestamp: Date.now()
    };
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    
    setIsProcessing(true);
    setError('');

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/order-confirmation',
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      onPaymentSuccess();
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentMethod === 'paypal') {
    return (
      <div className="payment-methods">
        <h2>Moyen de paiement</h2>
        <p className="payment-note payment-note-demo">
          <AlertCircle size={14} /> PayPal non configuré. Utilisez Stripe.
        </p>
        <button 
          type="button" 
          className="btn-primary"
          onClick={() => onPaymentMethodChange('stripe')}
        >
          Passer à Stripe
        </button>
      </div>
    );
  }

  return (
    <div className="payment-methods">
      <h2>Moyen de paiement</h2>
      
      <div className="payment-options">
        <label className="payment-option selected">
          <img src="https://img.icons8.com/?size=30&id=aMTIdm5CdddP&format=png&color=000000" alt="Carte" className="payment-icon-img" />
          <span>Carte de crédit</span>
          <span className="payment-desc">Paiement sécurisé Stripe</span>
        </label>
      </div>

      <div className="stripe-elements-form">
        <div className="stripe-info">
          {isStripeConfigured ? (
            <>
              <CheckCircle size={18} className="text-success" />
              <span>Paiement sécurisé par Stripe</span>
            </>
          ) : (
            <>
              <AlertCircle size={18} className="text-warning" />
              <span>Mode démo</span>
            </>
          )}
        </div>
        
        <div id="payment-element" className="payment-element-container">
          {!clientSecret && isStripeConfigured && (
            <p className="payment-note">Chargement du formulaire...</p>
          )}
        </div>
        
        {error && (
          <p className="payment-error">
            <AlertCircle size={14} /> {error}
          </p>
        )}
        
        <button 
          type="submit" 
          className="btn-primary btn-stripe-pay"
          onClick={handleSubmit}
          disabled={isProcessing || !clientSecret}
        >
          {isProcessing ? <Loader2 className="spin" size={18} /> : null}
          Payer {total.toFixed(2)} CAD$
        </button>
      </div>
    </div>
  );
}