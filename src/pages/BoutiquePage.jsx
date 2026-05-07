import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Heart, ShoppingBag } from 'lucide-react';
import ProductModal from '../components/product/ProductModal';
import SEO from '../components/layout/SEO';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../contexts/ProductsContext';
import { getTranslation } from '../data/translations';

export default function BoutiquePage() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const { products: dbProducts } = useProducts();
  
  const defaultProducts = [
    { id: '1', name: 'Beurre de Karité Pur', price: 24.99, description: 'Pur beurre de karité bio', category: 'beurre-karite', isBestseller: true, images: ['https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400'], inStock: 50, rating: 4.9, reviews: 128 },
    { id: '2', name: 'Crème Hydratante Enfants', price: 18.99, description: 'Pour les peau sensibles', category: 'gamme-enfants', isNew: true, images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400'], inStock: 35, rating: 4.8, reviews: 64 },
    { id: '3', name: 'Savon Noir Africain', price: 12.99, description: 'Nettoyant naturel', category: 'savons', isBestseller: true, images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'], inStock: 100, rating: 4.7, reviews: 89 },
    { id: '4', name: 'Baume Corps Ultra-Riche', price: 29.99, description: 'Hydratation intense', category: 'corps', isBestseller: true, images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400'], inStock: 45, rating: 4.9, reviews: 156 },
    { id: '5', name: 'Gommage Corps', price: 16.99, description: 'Exfoliant doux', category: 'exfoliants', isNew: true, images: ['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400'], inStock: 40, rating: 4.6, reviews: 72 },
    { id: '6', name: 'Crème Pieds Réparatrice', price: 22.99, description: 'Pour pieds secs', category: 'pieds', images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b38b07?w=400'], inStock: 28, rating: 4.8, reviews: 95 },
    { id: '7', name: 'Shampoing Doux', price: 14.99, description: 'Pour cheveux secs', category: 'capillaires', images: ['https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400'], inStock: 32, rating: 4.5, reviews: 48 },
    { id: '8', name: 'Crème Eczéma', price: 26.99, description: 'Pour peau atopique', category: 'eczema', isPromo: true, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'], inStock: 20, rating: 4.9, reviews: 210 }
  ];
  
  const products = (dbProducts && dbProducts.length > 0) ? dbProducts : defaultProducts;

  const dynamicCategories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    const unique = [...new Set(cats)];
    if (unique.length === 0) {
      return [
        { id: 'beurre-karite', name: 'Beurre de Karité' },
        { id: 'gamme-enfants', name: 'Gamme Enfants' },
        { id: 'exfoliants', name: 'Exfoliants' },
        { id: 'corps', name: 'Corps' },
        { id: 'savons', name: 'Savons' },
        { id: 'pieds', name: 'Pieds' },
        { id: 'capillaires', name: 'Capillaires' },
        { id: 'eczema', name: 'Eczéma' }
      ];
    }
    return unique.sort().map(cat => ({ id: cat, name: cat }));
  }, [products]);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: '',
    skinType: [],
    need: [],
    promo: false
  });

  const filteredProducts = useMemo(() => {
    let result = products || [];

    if (searchQuery) {
      result = result.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter(product => product.category === filters.category);
    }

    if (filters.promo) {
      result = result.filter(product => product.isPromo);
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, filters, searchQuery, sortBy]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      if (type === 'category') return { ...prev, category: prev.category === value ? '' : value };
      return prev;
    });
  };

  useEffect(() => {
    if (searchParams.get('promo') === 'true') {
      setFilters(prev => ({ ...prev, promo: true }));
    }
  }, [searchParams]);

  const clearFilters = () => setFilters({ category: '', skinType: [], need: [], promo: false });

  const handleAddToCart = (product) => {
    addToCart(product);
    addToast(`${product.name} ajouté au panier`, 'success');
  };

  const handleWishlist = (product, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Veuillez vous connecter pour ajouter aux favoris', 'info');
      navigate('/login');
      return;
    }
    toggleWishlist(product);
    const isAdded = !isInWishlist(product.id);
    addToast(isAdded ? `${product.name} ajouté aux favoris` : `${product.name} retiré des favoris}`, 'success');
  };

  return (
    <main className="boutique-page">
      <SEO
        title={language === 'fr' ? 'Boutique' : 'Shop'}
        description={language === 'fr' ? 'Découvrez nos cosmétiques naturels et biologiques. Beurre de karité, soins pour enfants, exfoliants et plus.' : 'Discover our natural and organic cosmetics. Shea butter, kids care, exfoliants and more.'}
        path="/boutique"
      />
      <div className="container">
        <div className="boutique-simple-header">
          <div className="boutique-title-row">
            <h1>{t('ourBoutique')}</h1>
            <span className="products-count">{filteredProducts.length} {t('productsCount')}</span>
          </div>
          <div className="boutique-filters-row">
            <div className="search-products">
              <Search size={18} />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="default">{t('sortDefault')}</option>
              <option value="price-asc">{t('sortPriceAsc')}</option>
              <option value="price-desc">{t('sortPriceDesc')}</option>
            </select>
            <button
              className={`cat-filter-btn promo-filter-btn ${filters.promo ? 'active' : ''}`}
              onClick={() => handleFilterChange('promo', !filters.promo)}
            >
              🔥 {language === 'fr' ? 'En promo' : 'On Sale'}
            </button>
          </div>
          <div className="category-filters">
            <button
              className={`cat-filter-btn ${filters.category === '' ? 'active' : ''}`}
              onClick={() => handleFilterChange('category', '')}
            >
              {language === 'fr' ? 'Tous' : 'All'}
            </button>
            {dynamicCategories.map(cat => (
              <button
                key={cat.id}
                className={`cat-filter-btn ${filters.category === cat.id ? 'active' : ''}`}
                onClick={() => handleFilterChange('category', cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div 
                className="product-card"
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.product-actions').style.opacity = '1';
                  e.currentTarget.querySelector('.product-actions').style.transform = 'translateY(0)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.product-actions').style.opacity = '0';
                  e.currentTarget.querySelector('.product-actions').style.transform = 'translateY(100%)';
                }}
              >
                <div className="product-image">
                  <img src={product.images[0]} alt={product.name} loading="lazy" decoding="async" />
                  <button 
                    className={`wishlist-btn-product ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={(e) => handleWishlist(product, e)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      transform: 'scale(1)',
                      zIndex: 2
                    }}
                  >
                    <Heart 
                      size={18} 
                      fill={isInWishlist(product.id) ? '#c45c5c' : 'none'} 
                      color={isInWishlist(product.id) ? '#c45c5c' : '#5a5a5a'} 
                    />
                  </button>
                  {product.isNew && <span className="badge badge-new">Nouveau</span>}
                  {product.isBestseller && <span className="badge badge-bestseller">Bestseller</span>}
                  <div 
                    className="product-actions"
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      padding: '16px',
                      display: 'flex',
                      gap: '10px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                      opacity: 0,
                      transform: 'translateY(100%)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <button 
                      className="quick-view-btn"
                      onClick={() => setQuickViewProduct(product)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'white',
                        color: '#1d4e38',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                      }}
                    >
                      Voir détails
                    </button>
                    <button 
                      className="add-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: '#1d4e38',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                      }}
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <span className="product-stock">
                    {(product.inStock || 0) > 10 ? (
                      <span className="stock-in">En stock</span>
                    ) : (product.inStock || 0) > 0 ? (
                      <span className="stock-low">Plus que {product.inStock}!</span>
                    ) : (
                      <span className="stock-out">Rupture</span>
                    )}
                  </span>
                  <h3>{product.name}</h3>
                  <p className="product-price">
                    {product.isPromo && product.promoPrice ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                          {parseFloat(product.price).toFixed(2)} $
                        </span>
                        <span style={{ color: '#e53935' }}>
                          {parseFloat(product.promoPrice).toFixed(2)} $
                        </span>
                      </>
                    ) : (
                      parseFloat(product.price || 0).toFixed(2) + ' $'
                    )}
                  </p>
                  <button
                    onClick={() => {
                      const cartProduct = {
                        ...product,
                        price: product.isPromo && product.promoPrice ? product.promoPrice : product.price
                      };
                      handleAddToCart(cartProduct);
                    }}
                    disabled={(product.inStock || 0) === 0}
                    className={(product.inStock || 0) === 0 ? 'btn-disabled' : ''}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '8px',
                      background: (product.inStock || 0) === 0 ? '#ccc' : '#1d4e38',
                      color: 'white',
                      fontWeight: 600,
                      cursor: (product.inStock || 0) === 0 ? 'not-allowed' : 'pointer',
                      marginTop: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {(product.inStock || 0) === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {quickViewProduct && (
        <ProductModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </main>
  );
}