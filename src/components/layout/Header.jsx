import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, Globe } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCartDrawer } from '../../contexts/CartDrawerContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../data/translations';
import { products } from '../../data/products';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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

  const t = (key) => getTranslation(language, key);

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/boutique', label: t('boutique') },
    { path: '/a-propos', label: t('about') },
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
            <span>{t('useCode')} <strong>VEGEDERM10</strong> {t('forDiscount')}</span>
            <Link to="/boutique?promo=true" className="promo-link">{t('seePromos')}</Link>
          </div>
          <button className="promo-banner-close" onClick={handleClosePromo} title="Fermer">
            <X size={16} />
          </button>
        </div>
      )}
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">VEGEDERM</Link>

          <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-icons">
            {location.pathname === '/' && (
              <button className="language-toggle" onClick={toggleLanguage} title={language === 'fr' ? 'Switch to English' : 'Passer en français'}>
                <Globe size={20} />
                <span className="lang-code">{language.toUpperCase()}</span>
              </button>
            )}
            <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="icon-btn">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </Link>
            <button className="icon-btn" onClick={openCart}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>
            <Link to={isAuthenticated ? '/profile' : '/login'} className="icon-btn">
              <User size={20} />
            </Link>
            <Link to="/admin-login" className="icon-btn admin-link" title="Admin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </Link>
            <button className="icon-btn mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-bar">
            <div className="container">
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  style={{ paddingRight: searchResults.length > 0 ? '120px' : '20px' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    style={{
                      position: 'absolute',
                      right: searchResults.length > 0 ? '90px' : '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
                {searchResults.length > 0 && (
                  <button
                    onClick={() => navigate('/boutique')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Voir tout
                  </button>
                )}
                {searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    marginTop: '8px',
                    overflow: 'hidden',
                    zIndex: 100
                  }}>
                    {searchResults.map(product => (
                      <Link
                        key={product.id}
                        to="/boutique"
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderBottom: '1px solid #eee',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{product.name}</div>
                          <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>{product.price.toFixed(2)} $</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}