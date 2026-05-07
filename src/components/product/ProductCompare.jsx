import { useState, useEffect } from 'react';
import { X, Plus, Scale, Check, Cross, Star } from 'lucide-react';
import { products as localProducts } from '../../data/products';

export default function ProductCompare() {
  const [compareList, setCompareList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('compareList');
    if (saved) setCompareList(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product) => {
    if (compareList.length >= 4) {
      alert('Maximum 4 produits à comparer');
      return;
    }
    if (compareList.find(p => p.id === product.id)) {
      return;
    }
    setCompareList([...compareList, product]);
  };

  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter(p => p.id !== productId));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (productId) => compareList.some(p => p.id === productId);

  const comparisonCriteria = [
    { key: 'price', label: 'Prix', format: v => `${v.toFixed(2)} $` },
    { key: 'rating', label: 'Note', format: v => `${v} / 5` },
    { key: 'reviews', label: 'Avis', format: v => v },
    { key: 'inStock', label: 'Stock', format: v => v > 0 ? `${v} en stock` : 'Rupture' },
    { key: 'category', label: 'Catégorie', format: v => v },
  ];

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} fill={i < count ? '#c9a86c' : 'none'} stroke="#c9a86c" />
    ));
  };

  const getComparisonValue = (product, key) => {
    const value = product[key];
    if (key === 'rating') {
      return renderStars(Math.round(value));
    }
    const criterion = comparisonCriteria.find(c => c.key === key);
    return criterion?.format ? criterion.format(value) : value;
  };

  const getBestValue = (key) => {
    if (key === 'price') {
      return Math.min(...compareList.map(p => p.price));
    }
    if (key === 'rating') {
      return Math.max(...compareList.map(p => p.rating));
    }
    if (key === 'reviews') {
      return Math.max(...compareList.map(p => p.reviews));
    }
    if (key === 'inStock') {
      return Math.max(...compareList.map(p => p.inStock));
    }
    return null;
  };

  const isBestValue = (product, key) => {
    const best = getBestValue(key);
    if (best === null) return false;
    if (key === 'price') return product.price === best;
    if (key === 'rating') return product.rating === best;
    if (key === 'reviews') return product.reviews === best;
    if (key === 'inStock') return product.inStock === best;
    return false;
  };

  return (
    <>
      <div className="compare-toggle" onClick={() => setIsOpen(true)}>
        <Scale size={20} />
        <span>Comparer ({compareList.length})</span>
        {compareList.length > 0 && <span className="compare-badge">{compareList.length}</span>}
      </div>

      {isOpen && (
        <div className="compare-overlay" onClick={() => setIsOpen(false)}>
          <div className="compare-modal" onClick={e => e.stopPropagation()}>
            <div className="compare-header">
              <h2><Scale size={24} /> Comparaison de produits</h2>
              <button className="compare-close" onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {compareList.length < 2 ? (
              <div className="compare-empty">
                <Scale size={48} />
                <p>Ajoutez au moins 2 produits pour comparer</p>
                <p className="compare-hint">Cliquez sur l'icône ⚖️ dans les produits</p>
              </div>
            ) : (
              <>
                <div className="compare-actions">
                  <button onClick={clearCompare} className="btn-clear">
                    <X size={16} /> Tout effacer
                  </button>
                </div>

                <div className="compare-table-wrapper">
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th className="criteria-col">Critères</th>
                        {compareList.map(product => (
                          <th key={product.id} className="product-col">
                            <button 
                              className="remove-product"
                              onClick={() => removeFromCompare(product.id)}
                            >
                              <X size={16} />
                            </button>
                            <img src={product.images[0]} alt={product.name} />
                            <h4>{product.name}</h4>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonCriteria.map(criterion => (
                        <tr key={criterion.key}>
                          <td className="criteria-label">{criterion.label}</td>
                          {compareList.map(product => (
                            <td 
                              key={product.id}
                              className={isBestValue(product, criterion.key) ? 'best-value' : ''}
                            >
                              {getComparisonValue(product, criterion.key)}
                              {isBestValue(product, criterion.key) && (
                                <span className="best-badge">✓ Meilleur</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td className="criteria-label">Avantages</td>
                        {compareList.map(product => (
                          <td key={product.id}>
                            <ul className="benefits-list">
                              {product.benefits?.slice(0, 3).map((b, i) => (
                                <li key={i}><Check size={12} /> {b}</li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="criteria-label">Actions</td>
                        {compareList.map(product => (
                          <td key={product.id}>
                            <a href={`/boutique/${product.id}`} className="btn-view">
                              Voir détails
                            </a>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .compare-toggle {
          position: fixed;
          bottom: 100px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--primary);
          color: white;
          border-radius: 30px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(29, 78, 56, 0.3);
          z-index: 100;
          transition: all 0.3s ease;
        }
        
        .compare-toggle:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(29, 78, 56, 0.4);
        }
        
        .compare-badge {
          background: var(--accent);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .compare-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .compare-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .compare-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: var(--primary);
          color: white;
        }
        
        .compare-header h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
        }
        
        .compare-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .compare-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: var(--text-light);
          text-align: center;
        }
        
        .compare-empty svg {
          margin-bottom: 20px;
          opacity: 0.5;
        }
        
        .compare-hint {
          font-size: 13px;
          margin-top: 8px;
        }
        
        .compare-actions {
          padding: 16px 24px;
          border-bottom: 1px solid #eee;
        }
        
        .btn-clear {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-secondary);
        }
        
        .compare-table-wrapper {
          flex: 1;
          overflow: auto;
          padding: 24px;
        }
        
        .compare-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        
        .compare-table th,
        .compare-table td {
          padding: 16px;
          border: 1px solid #eee;
          text-align: center;
          vertical-align: middle;
        }
        
        .criteria-col {
          background: #f8f5f0;
          font-weight: 600;
          text-align: left !important;
          width: 150px;
        }
        
        .product-col {
          background: white;
          position: relative;
          min-width: 200px;
        }
        
        .product-col img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 12px;
        }
        
        .product-col h4 {
          font-size: 14px;
          line-height: 1.4;
        }
        
        .remove-product {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: #ddd;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .best-value {
          background: rgba(39, 174, 96, 0.1);
          font-weight: 600;
        }
        
        .best-badge {
          display: block;
          font-size: 11px;
          color: var(--success);
          margin-top: 4px;
        }
        
        .benefits-list {
          list-style: none;
          text-align: left;
        }
        
        .benefits-list li {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          padding: 4px 0;
        }
        
        .benefits-list li svg {
          color: var(--success);
          flex-shrink: 0;
        }
        
        .btn-view {
          display: inline-block;
          padding: 10px 20px;
          background: var(--primary);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
