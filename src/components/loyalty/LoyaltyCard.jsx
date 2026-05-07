import { Award, Gift, Crown, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { useLoyalty } from '../../contexts/LoyaltyContext';
import { motion } from 'framer-motion';

const tierIcons = {
  bronze: Award,
  silver: Award,
  gold: Crown,
  platinum: Star
};

const tierColors = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2'
};

export default function LoyaltyCard() {
  const { userPoints, tier, totalEarned, getTierBenefits, getPointsToNextTier } = useLoyalty();
  const benefits = getTierBenefits(tier);
  const { nextTier, pointsNeeded } = getPointsToNextTier();
  const TierIcon = tierIcons[tier];

  const tierProgress = {
    bronze: Math.min(100, (totalEarned / 500) * 100),
    silver: Math.min(100, ((totalEarned - 500) / 1500) * 100),
    gold: Math.min(100, ((totalEarned - 2000) / 3000) * 100),
    platinum: 100
  };

  return (
    <motion.div 
      className="loyalty-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="tier-header" style={{ background: tierColors[tier] }}>
        <TierIcon size={32} />
        <div className="tier-info">
          <span className="tier-label">Membre {tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
          <span className="tier-points">{userPoints.toLocaleString()} points</span>
        </div>
      </div>

      <div className="loyalty-body">
        <div className="points-section">
          <div className="points-total">
            <TrendingUp size={20} />
            <span>Total gagné:</span>
            <strong>{totalEarned.toLocaleString()}</strong>
          </div>
          
          {pointsNeeded > 0 && nextTier !== 'max' && (
            <div className="next-tier-progress">
              <div className="progress-header">
                <span>Prochain: {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}</span>
                <span>{pointsNeeded} points restants</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${100 - (pointsNeeded / 500) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="benefits-section">
          <h4><Gift size={18} /> Vos avantages</h4>
          <ul className="benefits-list">
            <li className={benefits.discount > 0 ? 'active' : ''}>
              <span className="benefit-icon">{benefits.discount > 0 ? '✓' : '×'}</span>
              <span>{benefits.discount > 0 ? `${benefits.discount}%` : '0%'} de réduction</span>
            </li>
            <li className={benefits.freeShipping ? 'active' : ''}>
              <span className="benefit-icon">{benefits.freeShipping ? '✓' : '×'}</span>
              <span>Livraison gratuite</span>
            </li>
            <li className={benefits.birthday ? 'active' : ''}>
              <span className="benefit-icon">{benefits.birthday ? '✓' : '×'}</span>
              <span>Cadeau d'anniversaire</span>
            </li>
            {benefits.priority && (
              <li className="active">
                <span className="benefit-icon">✓</span>
                <span>Support prioritaire</span>
              </li>
            )}
          </ul>
        </div>

        <div className="earn-info">
          <h4>Comment gagner?</h4>
          <div className="earn-grid">
            <div className="earn-item">
              <span className="earn-points">10</span>
              <span className="earn-desc">points par 1$ dépensé</span>
            </div>
            <div className="earn-item">
              <span className="earn-points">50</span>
              <span className="earn-desc">points pour un avis</span>
            </div>
            <div className="earn-item">
              <span className="earn-points">100</span>
              <span className="earn-desc">points pour un anniversaire</span>
            </div>
          </div>
        </div>

        <a href="#loyalty-details" className="learn-more">
          En savoir plus <ChevronRight size={16} />
        </a>
      </div>

      <style>{`
        .loyalty-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        .tier-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          color: white;
        }
        
        .tier-info {
          display: flex;
          flex-direction: column;
        }
        
        .tier-label {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .tier-points {
          font-size: 28px;
          font-weight: bold;
        }
        
        .loyalty-body {
          padding: 24px;
        }
        
        .points-section {
          margin-bottom: 24px;
        }
        
        .points-total {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: var(--text-secondary);
        }
        
        .points-total strong {
          color: var(--primary);
          margin-left: auto;
        }
        
        .next-tier-progress {
          background: #f8f5f0;
          padding: 16px;
          border-radius: 12px;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
        }
        
        .progress-track {
          height: 8px;
          background: #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 4px;
          transition: width 0.3s;
        }
        
        .benefits-section {
          margin-bottom: 24px;
        }
        
        .benefits-section h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 16px;
        }
        
        .benefits-list {
          list-style: none;
        }
        
        .benefits-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          color: var(--text-light);
        }
        
        .benefits-list li.active {
          color: var(--text-primary);
        }
        
        .benefit-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          background: #ddd;
          color: #999;
        }
        
        .benefits-list li.active .benefit-icon {
          background: var(--success);
          color: white;
        }
        
        .earn-info h4 {
          font-size: 14px;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }
        
        .earn-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        
        .earn-item {
          text-align: center;
          padding: 12px;
          background: #f8f5f0;
          border-radius: 8px;
        }
        
        .earn-points {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: var(--primary);
        }
        
        .earn-desc {
          font-size: 11px;
          color: var(--text-light);
        }
        
        .learn-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          color: var(--primary);
          font-weight: 600;
          text-decoration: none;
          margin-top: 16px;
        }
      `}</style>
    </motion.div>
  );
}
