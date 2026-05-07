import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

let stripePromise = null;
let cachedStripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
let cachedPaypalId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
let cachedPaypalMode = import.meta.env.VITE_PAYPAL_MODE || 'sandbox';

async function loadApiKeys() {
  try {
    const { data } = await supabase.from('admin_settings').select('stripe_publishable_key, paypal_client_id, paypal_verified, paypal_mode').eq('id', 1).single();
    if (data) {
      if (data.stripe_publishable_key) {
        cachedStripeKey = data.stripe_publishable_key;
        stripePromise = loadStripe(cachedStripeKey);
      }
      if (data.paypal_client_id && data.paypal_verified) {
        cachedPaypalId = data.paypal_client_id;
        cachedPaypalMode = data.paypal_mode || 'sandbox';
      }
    }
  } catch (err) {
    console.error('Error loading API keys:', err);
  }
}

loadApiKeys();

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
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalContainerRef = useRef(null);
  const paypalInitialized = useRef(false);

  const isStripeConfigured = cachedStripeKey && (cachedStripeKey.startsWith('pk_live') || cachedStripeKey.startsWith('pk_test'));
  const isPayPalConfigured = cachedPaypalId && cachedPaypalId !== 'undefined';

  useEffect(() => {
    if (!total || total <= 0) return;

    const initStripe = async () => {
      if (!isStripeConfigured || !stripePromise) return;

      try {
        const stripeInstance = await stripePromise;
        if (!stripeInstance) return;
        setStripe(stripeInstance);

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, currency: 'cad', customerEmail, orderId })
        });

        const data = await response.json();

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);

          const elementsInstance = stripeInstance.elements({
            clientSecret: data.clientSecret,
            appearance: { theme: 'stripe', variables: { colorPrimary: '#1d4e38' } },
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
  }, [total, customerEmail, orderId, isStripeConfigured]);

  useEffect(() => {
    if (paymentMethod !== 'paypal' || !isPayPalConfigured || paypalInitialized.current) return;

    const loadPayPal = () => {
      if (document.getElementById('paypal-sdk')) {
        setPaypalLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${cachedPaypalId}&currency=CAD&debug=false${cachedPaypalMode === 'sandbox' ? '&sandbox=true' : ''}`;
      script.onload = () => setPaypalLoaded(true);
      document.head.appendChild(script);
    };

    loadPayPal();
  }, [paymentMethod, isPayPalConfigured]);

  useEffect(() => {
    if (paymentMethod !== 'paypal' || !isPayPalConfigured || !paypalLoaded || paypalInitialized.current || !window.paypal || !paypalContainerRef.current) return;

    paypalInitialized.current = true;
    const container = paypalContainerRef.current;
    container.innerHTML = '';

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: `Commande VEGEDERM #${orderId}`,
            amount: { value: total.toFixed(2) }
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(() => {
          onPaymentSuccess();
        });
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        setError('Erreur PayPal. Veuillez réessayer.');
        setIsProcessing(false);
      },
      onCancel: () => {
        setError('Paiement annulé.');
        setIsProcessing(false);
      }
    }).render(container);
  }, [paymentMethod, paypalLoaded, total, orderId, isPayPalConfigured, onPaymentSuccess, setIsProcessing]);

  const handleStripeSubmit = async (e) => {
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

  const stripeActive = paymentMethod === 'stripe' || !paymentMethod;
  const paypalActive = paymentMethod === 'paypal';

  return (
    <div className="payment-methods">
      <h2>Moyen de paiement</h2>

      <div className="payment-options">
        <label
          className={`payment-option ${stripeActive ? 'selected' : ''}`}
          onClick={() => onPaymentMethodChange('stripe')}
        >
          <img src="https://img.icons8.com/?size=30&id=aMTIdm5CdddP&format=png&color=000000" alt="Carte" className="payment-icon-img" />
          <span>Carte de crédit</span>
          <span className="payment-desc">Stripe</span>
        </label>

        {isPayPalConfigured && (
          <label
            className={`payment-option ${paypalActive ? 'selected' : ''}`}
            onClick={() => onPaymentMethodChange('paypal')}
          >
            <svg className="payment-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="#003087">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.387 2.654-.186 5.718-3.656 6.787-1.564.48-3.32.576-5.024.576H10.12l-1.355 8.59h3.316a.641.641 0 0 0 .633-.54l.026-.17.5-3.185.032-.175a.641.641 0 0 1 .633-.54h.399c2.589 0 4.612-.539 5.609-1.8a3.21 3.21 0 0 0 .285-.575l.019.013z"/>
            </svg>
            <span>PayPal</span>
            <span className="payment-desc">Paiement rapide</span>
          </label>
        )}
      </div>

      {!isStripeConfigured && !isPayPalConfigured && (
        <p className="payment-note payment-note-demo">
          <AlertCircle size={14} /> Mode démo - Aucun moyen de paiement configuré. Les clics "Payer" passent automatiquement.
        </p>
      )}

      {stripeActive && (
        <div className="stripe-elements-form">
          <div className="stripe-info">
            {isStripeConfigured ? (
              <><CheckCircle size={18} className="text-success" /><span>Paiement sécurisé par Stripe</span></>
            ) : (
              <><AlertCircle size={18} className="text-warning" /><span>Mode démo - Configurez Stripe pour accepter les paiements</span></>
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
            <p className="payment-error"><AlertCircle size={14} /> {error}</p>
          )}

          <button
            type="submit"
            className="btn-primary btn-stripe-pay"
            onClick={handleStripeSubmit}
            disabled={isProcessing || (isStripeConfigured && !clientSecret)}
          >
            {isProcessing ? (
              <><Loader2 className="spin" size={18} /> Traitement...</>
            ) : (
              <>Payer {total.toFixed(2)} CAD$</>
            )}
          </button>
        </div>
      )}

      {paypalActive && (
        <div className="paypal-form">
          {!isPayPalConfigured ? (
            <p className="payment-note payment-note-demo">
              <AlertCircle size={14} /> PayPal non configuré. Ajoutez VITE_PAYPAL_CLIENT_ID dans votre fichier .env.
            </p>
          ) : (
            <>
              {!paypalLoaded && (
                <div className="loading-payment">
                  <Loader2 className="spin" size={24} />
                  <p>Chargement PayPal...</p>
                </div>
              )}
              <div ref={paypalContainerRef} className="paypal-buttons-container" />
            </>
          )}
          {error && <p className="payment-error"><AlertCircle size={14} /> {error}</p>}
        </div>
      )}
    </div>
  );
}
