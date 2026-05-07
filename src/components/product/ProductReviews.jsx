import { useState } from 'react';
import { Star, ThumbsUp, AlertCircle, Send } from 'lucide-react';
import { useReviews } from '../../contexts/ReviewsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function ProductReviews({ productId }) {
  const { getProductReviews, getProductRating, getRatingDistribution, addReview } = useReviews();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  const reviews = getProductReviews(productId);
  const ratingInfo = getProductRating(productId);
  const distribution = getRatingDistribution(productId);
  const totalReviews = reviews.length;

  const filteredReviews = filterRating > 0 
    ? reviews.filter(r => r.rating === filterRating)
    : reviews;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      addToast('Veuillez vous connecter pour laisser un avis', 'error');
      return;
    }

    const result = await addReview(
      productId,
      user.id,
      user.name || user.email,
      formData.rating,
      formData.title,
      formData.comment
    );

    if (result.success) {
      addToast('Merci pour votre avis!', 'success');
      setShowForm(false);
      setFormData({ rating: 5, title: '', comment: '' });
    } else {
      addToast('Erreur lors de l\'envoi', 'error');
    }
  };

  const renderStars = (count, max = 5) => {
    return Array.from({ length: max }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < count ? '#c9a86c' : 'none'}
        stroke={i < count ? '#c9a86c' : '#ddd'}
      />
    ));
  };

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h3>Avis clients ({totalReviews})</h3>
        {user && !showForm && (
          <button className="btn-review" onClick={() => setShowForm(true)}>
            <Send size={16} /> Laisser un avis
          </button>
        )}
      </div>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Votre note</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={star <= formData.rating ? 'active' : ''}
                >
                  <Star size={24} fill={star <= formData.rating ? '#c9a86c' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Titre (optionnel)</label>
            <input
              type="text"
              placeholder="Résumé de votre expérience"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Votre avis</label>
            <textarea
              placeholder="Partagez votre expérience avec ce produit..."
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-submit">
              <Send size={16} /> Envoyer
            </button>
          </div>
        </form>
      )}

      {ratingInfo && (
        <div className="rating-summary">
          <div className="rating-overview">
            <span className="rating-big">{ratingInfo.average.toFixed(1)}</span>
            <div className="rating-stars">{renderStars(Math.round(ratingInfo.average))}</div>
            <span className="rating-count">{totalReviews} avis</span>
          </div>
          
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(star => (
              <div 
                key={star} 
                className={`rating-bar ${filterRating === star ? 'active' : ''}`}
                onClick={() => setFilterRating(filterRating === star ? 0 : star)}
              >
                <span className="bar-label">{star} ★</span>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${totalReviews > 0 ? (distribution[star] / totalReviews) * 100 : 0}%` }}
                  />
                </div>
                <span className="bar-count">{distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <div className="no-reviews">
            <AlertCircle size={32} />
            <p>Aucun avis pour le moment. Soyez le premier!</p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-author">
                  <div className="author-avatar">
                    {review.user_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <span className="author-name">{review.user_name}</span>
                    {review.verified_purchase && (
                      <span className="verified-badge">✓ Achat vérifié</span>
                    )}
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {review.title && <h4 className="review-title">{review.title}</h4>}
              <p className="review-comment">{review.comment}</p>
              
              <div className="review-footer">
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString('fr-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button className="helpful-btn">
                  <ThumbsUp size={14} /> Utile
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .product-reviews {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid #eee;
        }
        
        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .reviews-header h3 {
          font-size: 22px;
          color: var(--primary);
        }
        
        .btn-review {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .review-form {
          background: #f8f5f0;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .review-form .form-group {
          margin-bottom: 16px;
        }
        
        .review-form label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }
        
        .rating-selector {
          display: flex;
          gap: 8px;
        }
        
        .rating-selector button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          transition: transform 0.2s;
        }
        
        .rating-selector button:hover {
          transform: scale(1.1);
        }
        
        .review-form input,
        .review-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .review-form input:focus,
        .review-form textarea:focus {
          border-color: var(--primary);
          outline: none;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .btn-cancel {
          padding: 10px 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .btn-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .rating-summary {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 32px;
          padding: 24px;
          background: #f8f5f0;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .rating-overview {
          text-align: center;
        }
        
        .rating-big {
          font-size: 48px;
          font-weight: bold;
          color: var(--primary);
        }
        
        .rating-stars {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin: 8px 0;
        }
        
        .rating-count {
          font-size: 14px;
          color: var(--text-light);
        }
        
        .rating-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .rating-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .rating-bar:hover,
        .rating-bar.active {
          background: rgba(29, 78, 56, 0.1);
        }
        
        .bar-label {
          width: 30px;
          font-size: 13px;
        }
        
        .bar-track {
          flex: 1;
          height: 8px;
          background: #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .bar-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 4px;
          transition: width 0.3s;
        }
        
        .bar-count {
          width: 30px;
          text-align: right;
          font-size: 13px;
          color: var(--text-light);
        }
        
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .no-reviews {
          text-align: center;
          padding: 40px;
          color: var(--text-light);
        }
        
        .no-reviews svg {
          margin-bottom: 12px;
          opacity: 0.5;
        }
        
        .review-card {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 12px;
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .review-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .author-avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        .author-name {
          font-weight: 600;
          display: block;
        }
        
        .verified-badge {
          font-size: 12px;
          color: var(--success);
        }
        
        .review-title {
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .review-comment {
          color: var(--text-secondary);
          line-height: 1.6;
        }
        
        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }
        
        .review-date {
          font-size: 13px;
          color: var(--text-light);
        }
        
        .helpful-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .rating-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
