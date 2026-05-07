import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

export default function PaymentMethods({
  total,
  paymentMethod,
  onPaymentMethodChange,
  onPaymentSuccess,
  isProcessing,
  setIsProcessing,
  cartItems = [],
  customerEmail = '',
  orderId = ''
}) {
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);

  const isStripeConfigured = STRIPE_KEY && (STRIPE_KEY.startsWith('pk_live') || STRIPE_KEY.startsWith('pk_test'));

  useEffect(() => {
    if (!total || total <= 0) return;

    const initStripe = async () => {
      if (!isStripeConfigured || !stripePromise) {
        return;
      }

      try {
        const stripeInstance = await stripePromise;
        if (!stripeInstance) return;
        setStripe(stripeInstance);

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            currency: 'cad',
            customerEmail,
            orderId
          })
        });

        const data = await response.json();

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);

          const elementsInstance = stripeInstance.elements({
            clientSecret: data.clientSecret,
            appearance: {
              theme: 'stripe',
              variables: { colorPrimary: '#1d4e38' },
            },
          });

          setElements(elementsInstance);

          const paymentEl = elementsInstance.create('payment');
          paymentEl.mount('#payment-element');
        } else if (data.error) {
          console.error('API Error:', data.error);
        }
      } catch (err) {
        console.error('Init error:', err);
      }
    };

    initStripe();
  }, [total, customerEmail, orderId, isStripeConfigured]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !clientSecret) {
      onPaymentSuccess();
      return;
    }

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
              <span>Mode démo - Configurez Stripe pour accepter les paiements</span>
            </>
          )}
        </div>

        <div id="payment-element" className="payment-element-container">
          {!clientSecret && isStripeConfigured && (
            <div className="loading-payment">
              <Loader2 className="spin" size={24} />
              <p>Chargement du formulaire de paiement...</p>
            </div>
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
          disabled={isProcessing || (isStripeConfigured && !clientSecret)}
        >
          {isProcessing ? (
            <><Loader2 className="spin" size={18} /> Traitement...</>
          ) : (
            <>Payer {total.toFixed(2)} CAD$</>
          )}
        </button>
      </div>
    </div>
  );
}
