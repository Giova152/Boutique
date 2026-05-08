import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/layout/SEO';

export default function WishlistPage() {
  const { language } = useLanguage();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (product) => {
    addToCart(product);
    addToast(`${product.name} ajouté au panier`, 'success');
  };

  if (wishlist.length === 0) {
    return (
      <main className="wishlist-page">
        <SEO
          title={language === 'fr' ? 'Favoris' : 'Wishlist'}
          path="/wishlist"
        />
        <div className="container">
          <motion.div 
            className="empty-wishlist"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">
              <Heart size={64} strokeWidth={1} />
            </div>
            <h2>Votre wishlist est vide</h2>
            <p>Ajoutez vos produits préférés pour les retrouver facilement</p>
            <Link to="/boutique" className="btn-primary">
              Découvrir la boutique <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="container">
        <motion.div 
          className="wishlist-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Ma Wishlist</h1>
          <p className="wishlist-count">{wishlist.length} produit{wishlist.length !== 1 ? 's' : ''} enregistré{wishlist.length !== 1 ? 's' : ''}</p>
        </motion.div>

        <motion.div 
          className="wishlist-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {wishlist.map((product, index) => (
              <motion.div
                key={product.id}
                className="wishlist-item"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="wishlist-item-image">
                  <img src={product.images[0]} alt={product.name} />
                  <button 
                    className="remove-wishlist-btn"
                    onClick={() => {
                      removeFromWishlist(product.id);
                      addToast('Retiré de la wishlist', 'info');
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="wishlist-item-info">
                  <h3>{product.name}</h3>
                  <div className="wishlist-item-rating">
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                    <span>({product.reviews})</span>
                  </div>
                  <p className="wishlist-price">{product.price.toFixed(2)} $</p>
                  
                  <div className="wishlist-actions">
                    <button 
                      className="btn-primary btn-sm"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingBag size={16} />
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="wishlist-footer">
          <Link to="/boutique" className="btn-secondary">
            <ArrowRight size={18} />
            Continuer mes achats
          </Link>
        </div>
      </div>
    </main>
  );
}