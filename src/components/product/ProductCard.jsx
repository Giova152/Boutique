import { useState } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../data/translations';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showButtons, setShowButtons] = useState(false);
  const inWishlist = isInWishlist(product.id);
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  return (
    <div
      className="product-card"
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <div className="product-image">
        <img src={product.images[0]} alt={product.name} />
        <button
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={() => toggleWishlist(product)}
        >
          <Heart size={18} fill={inWishlist ? '#1d4e38' : 'none'} />
        </button>
        {product.isNew && <span className="badge badge-new">{t('nouveau')}</span>}
        {product.isBestseller && <span className="badge badge-bestseller">{t('bestseller')}</span>}
        {showButtons && (
          <div className="product-actions">
            <button className="quick-view-btn" onClick={() => onQuickView?.(product)}>
              <Eye size={18} /> {t('quickView')}
            </button>
            <button className="add-cart-btn" onClick={() => addToCart(product)}>
              <ShoppingBag size={18} /> {t('addToCart')}
            </button>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          {'★'.repeat(Math.floor(product.rating))}
          {'☆'.repeat(5 - Math.floor(product.rating))}
          <span>({product.reviews})</span>
        </div>
        <p className="product-price">{product.price.toFixed(2)} $</p>
      </div>
    </div>
  );
}