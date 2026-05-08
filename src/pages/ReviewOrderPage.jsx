import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Package } from 'lucide-react';
import SEO from '../components/layout/SEO';
import { supabase } from '../lib/supabase';

export default function ReviewOrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
    setOrder(data);
    setLoading(false);
  }

  const handleRating = (productId, rating) => {
    setReviews(prev => ({ ...prev, [productId]: rating }));
  };

  const handleSubmit = async (productId, productName, e) => {
    e.preventDefault();
    const comment = e.target.comment?.value || '';
    const title = e.target.title?.value || '';
    const rating = reviews[productId];

    if (!rating) return;

    await supabase.from('reviews').insert([{
      product_id: productId,
      order_id: orderId,
      user_id: order?.customer?.email || 'guest',
      user_name: order?.customer?.firstName || 'Client',
      rating,
      title,
      comment,
      verified_purchase: true
    }]);

    const productIds = order.items?.map(i => i.productId || i.id) || [];
    const reviewed = Object.keys(reviews);
    const allReviewed = productIds.every(pid => pid && reviewed.includes(pid));

    if (allReviewed) {
      await supabase.from('orders').update({ status: 'avis donnée' }).eq('id', orderId);
    }

    setSubmitted(true);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div className="loading-spinner"></div>
    </div>;
  }

  if (!order) {
    return (
      <main style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1>Commande introuvable</h1>
        <Link to="/" style={{ color: 'var(--primary)' }}>Retour à l'accueil</Link>
      </main>
    );
  }

  const productIds = order.items?.map(i => i.productId || i.id) || [];

  return (
    <main style={{ minHeight: '70vh', padding: '40px 20px 60px' }}>
      <SEO title="Donner votre avis" path={`/review/${orderId}`} />
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Package size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Merci pour votre commande!</h1>
          <p style={{ color: 'var(--text-light)' }}>Évaluez les produits reçus</p>
        </div>

        {productIds.map((productId, idx) => {
          if (!productId) return null;
          const item = order.items[idx];
          
          return (
            <div key={idx} style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '24px', 
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ marginBottom: '16px' }}>{item?.name || 'Produit'}</h3>
              
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(productId, star)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: star <= (reviews[productId] || 0) ? '#f59e0b' : '#d1d5db'
                    }}
                  >
                    <Star size={32} fill={star <= (reviews[productId] || 0) ? '#f59e0b' : 'none'} />
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => handleSubmit(productId, item?.name, e)}>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Titre (optionnel)"
                  style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '2px solid #e5e7eb', borderRadius: '12px' }}
                />
                <textarea 
                  name="comment" 
                  placeholder="Votre expérience (optionnel)"
                  rows={3}
                  style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '2px solid #e5e7eb', borderRadius: '12px' }}
                />
                <button 
                  type="submit" 
                  disabled={!reviews[productId] || submitted}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: reviews[productId] ? 'var(--primary)' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: reviews[productId] ? 'pointer' : 'not-allowed'
                  }}
                >
                  Soumettre
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </main>
  );
}