import { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Heart, ShoppingBag } from 'lucide-react';
import { products, categories, skinTypes, needs } from '../data/products';
import ProductModal from '../components/product/ProductModal';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../data/translations';

export default function BoutiquePage() {
  const [searchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    skinType: [],
    need: [],
    promo: searchParams.get('promo') === 'true'
  });

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter(product => product.category === filters.category);
    }
    if (filters.skinType.length > 0) {
      result = result.filter(product => 
        filters.skinType.some(st => product.skinTypes?.includes(st))
      );
    }
    if (filters.need.length > 0) {
      result = result.filter(product => 
        filters.need.some(n => product.needs?.includes(n))
      );
    }

    if (filters.promo) {
      result = result.filter(product => product.isBestseller || product.isNew);
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [filters, searchQuery, sortBy]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      if (type === 'category') return { ...prev, category: prev.category === value ? '' : value };
      const arr = prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value];
      return { ...prev, [type]: arr };
    });
  };

  const clearFilters = () => setFilters({ category: '', skinType: [], need: [] });

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
    addToast(isAdded ? `${product.name} ajouté aux favoris` : `${product.name} retiré des favoris`, 'success');
  };

  const activeFiltersCount = [
    filters.category,
    ...filters.skinType,
    ...filters.need
  ].filter(Boolean).length;

  return (
    <main className="boutique-page">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Notre Boutique</h1>
          <p>Découvrez notre collection de {products.length} produits naturels</p>
        </motion.div>

        <div className="boutique-toolbar">
          <div className="search-products">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={18} />
              </button>
            )}
          </div>
          
          <div className="toolbar-right">
            <button className="filter-btn" onClick={() => setMobileFiltersOpen(true)}>
              <Filter size={18} />
              Filtres
              {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
            </button>
            
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="default">Tri par défaut</option>
              <option value="price-asc">Prix: croissant</option>
              <option value="price-desc">Prix: décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          <span>{filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}</span>
          {activeFiltersCount > 0 && (
            <button className="clear-filters-link" onClick={clearFilters}>
              Effacer tous les filtres
            </button>
          )}
        </div>

        <div className="boutique-layout">
          <aside className={`filters-sidebar ${mobileFiltersOpen ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filtres</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="filter-section">
              <h4>Catégories</h4>
              {categories.map(cat => (
                <label key={cat.id} className="filter-checkbox">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === cat.id}
                    onChange={() => handleFilterChange('category', cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h4>Type de peau</h4>
              {skinTypes.map(type => (
                <label key={type.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.skinType.includes(type.id)}
                    onChange={() => handleFilterChange('skinType', type.id)}
                  />
                  <span>{type.name}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h4>Besoin</h4>
              {needs.map(need => (
                <label key={need.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.need.includes(need.id)}
                    onChange={() => handleFilterChange('need', need.id)}
                  />
                  <span>{need.name}</span>
                </label>
              ))}
            </div>

            {activeFiltersCount > 0 && (
              <button className="clear-filters" onClick={clearFilters}>
                Effacer les filtres
              </button>
            )}
          </aside>

          <div className="products-section">
            <AnimatePresence mode="wait">
              {filteredProducts.length === 0 ? (
                <motion.div 
                  className="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3>Aucun produit trouvé</h3>
                  <p>Essayez avec d'autres filtres ou termes de recherche</p>
                  <button className="btn-primary" onClick={clearFilters}>
                    Réinitialiser les filtres
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  className="products-grid"
                  initial={{ opacity: 1 }}
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard 
                        product={product} 
                        onQuickView={() => setQuickViewProduct(product)}
                        onAddToCart={() => handleAddToCart(product)}
                        onWishlist={(e) => handleWishlist(product, e)}
                        isInWishlist={isInWishlist(product.id)}
                        t={t}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {mobileFiltersOpen && <div className="overlay" onClick={() => setMobileFiltersOpen(false)} />}

      {quickViewProduct && (
        <ProductModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </main>
  );
}

function ProductCard({ product, onQuickView, onAddToCart, onWishlist, isInWishlist, t }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image">
        <img src={product.images[0]} alt={product.name} />
        {product.isNew && <span className="badge badge-new">{t('nouveau')}</span>}
        {product.isBestseller && <span className="badge badge-bestseller">{t('bestseller')}</span>}
        
        <button 
          className={`wishlist-card-btn ${isInWishlist ? 'active' : ''}`}
          onClick={onWishlist}
          title={isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart size={20} fill={isInWishlist ? 'white' : 'none'} />
        </button>
        
        <motion.div 
          className="product-actions"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        >
          <button className="quick-view-btn" onClick={onQuickView}>
            Voir détails
          </button>
          <button className="add-cart-btn" onClick={onAddToCart}>
            <ShoppingBag size={14} /> Ajouter
          </button>
        </motion.div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
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