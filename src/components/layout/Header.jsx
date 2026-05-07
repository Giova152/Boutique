import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCartDrawer } from '../../contexts/CartDrawerContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../data/translations';
import { useAdmin } from '../../contexts/AdminContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useAdmin();
  const promoCode = settings?.exitPopupCode || 'VEGEDERM10';
  const promoDiscount = settings?.exitPopupDiscount || 10;
  const [promoBannerOpen, setPromoBannerOpen] = useState(() => {
    const saved = localStorage.getItem('promoBannerClosed');
    return saved !== 'true';
  });
  
  const handleClosePromo = () => {
    setPromoBannerOpen(false);
    localStorage.setItem('promoBannerClosed', 'true');
  };
  
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { openCart } = useCartDrawer();
  const { language } = useLanguage();
  const location = useLocation();

  const t = (key) => getTranslation(language, key);

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/boutique', label: 'VEGEDERM' },
    { path: '/a-propos', label: t('about') },
    { path: '/contact', label: t('contact') }
  ];

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {promoBannerOpen && (
        <div className="promo-banner">
          <div className="promo-banner-content">
            <span>🎉</span>
            <span>{t('useCode')} <strong>{promoCode}</strong> {t('forDiscount')} -{promoDiscount}%</span>
            <Link to="/boutique?promo=true" className="promo-link">{t('seePromos')}</Link>
          </div>
          <button className="promo-banner-close" onClick={handleClosePromo} title="Fermer">
            <span style={{ fontSize: '16px' }}>×</span>
          </button>
        </div>
      )}
      <header className="header">
        <div className="navbar">
          <button 
            type="button" 
            className="menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="logo-link">
            <span className="logo-text">Bio Detox Minceur</span>
          </Link>
          
          <nav className="nav-pills">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link-pill ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-link-inner">{link.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="header-actions">
            <Link 
              to={isAuthenticated ? '/profile' : '/login'} 
              className="account-btn"
              aria-label="Compte"
            >
              <User size={20} />
            </Link>
            <Link 
              to="/wishlist" 
              className="account-btn"
              aria-label="Favoris"
            >
              <Heart size={20} />
              {wishlistCount > 0 && <span className="wishlist-badge">{wishlistCount}</span>}
            </Link>
            <button 
              type="button" 
              className="cart-btn"
              onClick={openCart}
              aria-label="Panier"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}