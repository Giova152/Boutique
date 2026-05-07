import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCartDrawer } from '../../contexts/CartDrawerContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../data/translations';
import { useAdmin } from '../../contexts/AdminContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { products } = useAdmin();

  const t = (key) => getTranslation(language, key);

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/boutique', label: t('boutique') },
    { path: '/programme', label: 'Programme' },
    { path: '/contact', label: t('contact') }
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

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
            <X size={16} />
          </button>
        </div>
      )}
      <header className="header">
        <div className="navbar">
          <button 
            type="button" 
            className="menu-btn md:hidden text-primary" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/" className="logo-link absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0">
            <span className="logo-text">Bio Detox Minceur</span>
          </Link>
          
          <nav className="nav-pills hidden md:flex">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link-pill ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="header-actions">
            <Link 
              to={isAuthenticated ? '/profile' : '/login'} 
              className="hidden md:inline-flex h-10 w-10 items-center justify-center transition-opacity text-primary hover:opacity-60"
              aria-label="Compte"
            >
              <User className="h-5 w-5" />
            </Link>
            <button 
              type="button" 
              className="relative inline-flex h-10 w-10 items-center justify-center transition-opacity text-primary hover:opacity-60"
              onClick={openCart}
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
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