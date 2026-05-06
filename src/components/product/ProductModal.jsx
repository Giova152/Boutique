import { useState } from 'react';
import { X, Heart, Minus, Plus, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../data/translations';

export default function ProductModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        <div className="product-modal-grid">
          <div className="product-modal-image">
            <img src={product.images[0]} alt={product.name} />
          </div>
          
          <div className="product-modal-info">
            <div className="badges">
              {product.isNew && <span className="badge badge-new">{t('nouveau')}</span>}
              {product.isBestseller && <span className="badge badge-bestseller">{t('bestseller')}</span>}
            </div>
            
            <h2 className="product-title">{product.name}</h2>
            
            <div className="product-rating">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} fill={i <= product.rating ? '#c9a86c' : 'none'} stroke="#c9a86c" />
              ))}
              <span>{product.rating} ({product.reviews} avis)</span>
            </div>
            
            <p className="product-price-lg">{product.price.toFixed(2)} $</p>
            
            <p className="product-desc">{product.description}</p>
            
            <div className="product-section">
              <h4>Bienfaits</h4>
              <ul className="benefits-list">
                {product.benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
              </ul>
            </div>
            
            <div className="product-section">
              <h4>Ingrédients</h4>
              <p>{product.ingredients}</p>
            </div>
            
            <div className="product-section">
              <h4>Utilisation</h4>
              <p>{product.usage}</p>
            </div>
            
            <div className="product-actions-modal">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}><Plus size={16} /></button>
              </div>
              <button className="btn-primary" onClick={() => { addToCart(product, quantity); onClose(); }}>
                Ajouter au panier
              </button>
              <button className={`btn-secondary wishlist-btn-modal ${inWishlist ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
                <Heart size={20} fill={inWishlist ? '#1d4e38' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}