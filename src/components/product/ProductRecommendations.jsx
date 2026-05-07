import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Sparkles } from 'lucide-react';
import { useProducts } from '../../contexts/ProductsContext';
import { useLoyalty } from '../../contexts/LoyaltyContext';

export default function ProductRecommendations({ currentProductId, category, onAddToCart }) {
  const { products } = useProducts();
  const { userPoints, tier, getTierBenefits } = useLoyalty();
  const tierBenefits = getTierBenefits(tier);

  const currentProduct = products.find(p => p.id === currentProductId || p.id === String(currentProductId));

  const recommendations = useMemo(() => {
    let recs = products.filter(p => p.id !== currentProductId && p.id !== String(currentProductId));

    const sameCategory = recs.filter(p => p.category === category);
    const bestsellers = recs.filter(p => p.isBestseller);
    const related = recs.filter(p => 
      p.skinTypes?.some(s => currentProduct?.skinTypes?.includes(s))
    );

    const combined = [
      ...sameCategory.slice(0, 2),
      ...bestsellers.slice(0, 2),
      ...related.slice(0, 2)
    ].filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

    return combined.slice(0, 4);
  }, [currentProductId, category, products, currentProduct]);

  if (recommendations.length === 0) return null;

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <Sparkles size={24} />
        <h3>Vous aimerez aussi</h3>
      </div>

      {tierBenefits.discount > 0 && (
        <div className="loyalty-banner">
          <span>Votre fidélité mérite une récompense!</span>
          <strong>{tierBenefits.discount}% de réduction</strong>
        </div>
      )}

      <div className="recommendations-grid">
        {recommendations.map(product => (
          <Link 
            key={product.id} 
            to={`/boutique/${product.id}`}
            className="recommendation-card"
          >
            <div className="rec-image">
              <img src={product.images[0]} alt={product.name} />
              {product.isNew && <span className="badge badge-new">Nouveau</span>}
              {product.isBestseller && <span className="badge badge-bestseller">Bestseller</span>}
            </div>
            <div className="rec-info">
              <h4>{product.name}</h4>
              <div className="rec-rating">
                <Star size={12} fill="#c9a86c" stroke="#c9a86c" />
                <span>{product.rating} ({product.reviews})</span>
              </div>
              <div className="rec-price">
                <span className="price">{product.price.toFixed(2)} $</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .recommendations-section {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid #eee;
        }
        
        .recommendations-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          color: var(--primary);
        }
        
        .recommendations-header h3 {
          font-size: 22px;
        }
        
        .loyalty-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
        }
        
        .loyalty-banner strong {
          font-size: 18px;
        }
        
        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        .recommendation-card {
          text-decoration: none;
          color: inherit;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
        }
        
        .recommendation-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        
        .rec-image {
          position: relative;
          height: 180px;
          overflow: hidden;
        }
        
        .rec-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .recommendation-card:hover .rec-image img {
          transform: scale(1.05);
        }
        
        .rec-info {
          padding: 16px;
        }
        
        .rec-info h4 {
          font-size: 14px;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        
        .rec-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-light);
          margin-bottom: 8px;
        }
        
        .rec-price .price {
          font-weight: bold;
          color: var(--primary);
          font-size: 16px;
        }
        
        @media (max-width: 1024px) {
          .recommendations-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 600px) {
          .recommendations-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
