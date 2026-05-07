import { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Heart, ShoppingBag } from 'lucide-react';
import { categories, skinTypes, needs, products as localProducts } from '../data/products';
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

  const products = localProducts.map(p => ({
    ...p,
    isBestseller: p.isBestseller,
    isNew: p.isNew,
    isPromo: p.isPromo || false,
    inStock: p.inStock
  }));

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  const [filters, setFilters] = useState({
    category: '',
    skinType: [],
    need: [],
    promo: false
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

    if (filters.promo) {
      result = result.filter(product => product.isPromo);
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [filters, searchQuery, sortBy]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      if (type === 'category') return { ...prev, category: prev.category === value ? '' : value };
      return prev;
    });
  };

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
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-badge">100% Naturel</div>
          <h1>Notre Boutique</h1>
          <p className="header-subtitle">{products.length} produits naturels</p>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{products.filter(p => p.isBestseller).length}</span>
              <span className="stat-label">Bestsellers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{products.filter(p => p.isNew).length}</span>
              <span className="stat-label">Nouveautés</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{products.filter(p => p.isPromo).length}</span>
              <span className="stat-label">Promotions</span>
            </div>
          </div>
        </motion.div>

        <div className="boutique-toolbar">
          <div className="search-products">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="default">Tri par défaut</option>
            <option value="price-asc">Prix: croissant</option>
            <option value="price-desc">Prix: décroissant</option>
          </select>
        </div>

        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="product-card">
                <div className="product-image">
                  <img src={product.images[0]} alt={product.name} />
                  {product.isNew && <span className="badge badge-new">Nouveau</span>}
                  {product.isBestseller && <span className="badge badge-bestseller">Bestseller</span>}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">{product.price.toFixed(2)} $</p>
                  <button onClick={() => handleAddToCart(product)}>Ajouter au panier</button>
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