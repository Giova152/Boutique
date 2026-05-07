import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { paymentConfig } from '../data/paymentConfig';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { sendOrderEmail } from '../services/emailService';
import SEO from '../components/layout/SEO';

const stripePromise = loadStripe(paymentConfig.stripe.publishableKey);

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder, updateStock, products } = useAdmin();
  
  const [status, setStatus] = useState('processing');
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');
    
    if (redirectStatus === 'succeeded') {
      processSuccessfulOrder();
    } else if (paymentIntentClientSecret) {
      verifyPayment(paymentIntentClientSecret);
    } else {
      setStatus('error');
    }
  }, [searchParams]);
  
  async function verifyPayment(clientSecret) {
    try {
      const stripe = await stripePromise;
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        processSuccessfulOrder();
      } else {
        setStatus('pending');
      }
    } catch (e) {
      console.error('Verify error:', e);
      setStatus('error');
    }
  }
  
  async function processSuccessfulOrder() {
    const storedOrder = localStorage.getItem('pendingOrder');
    if (storedOrder) {
      try {
        const orderData = JSON.parse(storedOrder);
        addOrder(orderData);
        
        orderData.items.forEach(item => {
          const product = products.find(p => p.id === item.id);
          if (product) {
            updateStock(item.id, product.inStock - item.quantity, product.inStock);
          }
        });
        
        sendOrderEmail(orderData);
        localStorage.removeItem('pendingOrder');
        clearCart();
        setStatus('success');
      } catch (e) {
        console.error('Process error:', e);
        setStatus('error');
      }
    } else {
      setStatus('success');
    }
  }
  
  if (status === 'processing' || status === 'pending') {
    return (
      <main className="checkout-page">
        <div className="container order-confirmation">
          <Loader2 className="spin" size={48} />
          <h2>Vérification du paiement...</h2>
          <p>Veuillez patienter</p>
        </div>
      </main>
    );
  }
  
  if (status === 'error') {
    return (
      <main className="checkout-page">
        <div className="container order-confirmation">
          <AlertCircle size={48} className="text-danger" />
          <h2>Erreur de paiement</h2>
          <p>Le paiement n'a pas pu être vérifié. Veuillez contacter le support.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Retour à l'accueil</button>
        </div>
      </main>
    );
  }
  
  return (
    <main className="checkout-page">
      <SEO
        title="Confirmation de commande"
        description="Votre commande VEGEDERM a été confirmée. Merci pour votre confiance!"
        path="/order-confirmation"
      />
      <div className="container order-confirmation">
        <div className="confirmation-icon"><CheckCircle size={48} /></div>
        <Package size={48} />
        <h2>Merci pour votre commande!</h2>
        <p>Votre commande a été enregistrée avec succès.</p>
        <p>Un email de confirmation vous a été envoyé.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Retour à l'accueil</button>
      </div>
    </main>
  );
}