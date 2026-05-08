import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Leaf, Shield, Truck, Award, ChevronRight, X, CheckCircle } from 'lucide-react';
import { categories, DEFAULT_PRODUCTS } from '../data/products';
import { useAdmin } from '../contexts/AdminContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import { supabase } from '../lib/supabase';
import SEO from '../components/layout/SEO';
import ProductModal from '../components/product/ProductModal';

const categoryImages = {
  'beurre-karite': 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400',
  'gamme-enfants': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
  'exfoliants': 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400',
  'corps': 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400',
  'savons': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
  'pieds': 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b07?w=400',
  'capillaires': 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400',
  'eczema': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
};

const testimonials = {
  fr: [
    { name: 'Sophie M.', text: 'Produits exceptionnels, ma peau n\'a jamais été aussi belle!', rating: 5 },
    { name: 'Marie L.', text: 'Je recommande fortement. Qualité professionnelle.', rating: 5 },
    { name: 'Julie R.', text: 'Livraison rapide et produits naturels, exactement ce que je cherchais.', rating: 5 }
  ],
  en: [
    { name: 'Sophie M.', text: 'Exceptional products, my skin has never been this beautiful!', rating: 5 },
    { name: 'Marie L.', text: 'Highly recommend. Professional quality.', rating: 5 },
    { name: 'Julie R.', text: 'Fast delivery and natural products, exactly what I was looking for.', rating: 5 }
  ]
};

export default function HomePage() {
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [exitPopupOpen, setExitPopupOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const { products, settings } = useAdmin();
  const exitPopupCode = settings?.exitPopupCode || 'VEGEDERM10';
  const exitPopupDiscount = settings?.exitPopupDiscount || 10;
  
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !localStorage.getItem('exitPopupShown')) {
        setExitPopupOpen(true);
        localStorage.setItem('exitPopupShown', 'true');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);
  
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

const bestsellers = (products || []).filter(p => p.isBestseller).slice(0, 4);
  const newProducts = (products || []).filter(p => p.isNew).slice(0, 4);
  const currentTestimonials = testimonials[language] || testimonials.fr;
  
  const displayProducts = (products && products.length > 0) ? products : DEFAULT_PRODUCTS;
  const displayBestsellers = bestsellers.length > 0 ? bestsellers : DEFAULT_PRODUCTS.filter(p => p.isBestseller);
  const displayNew = newProducts.length > 0 ? newProducts : DEFAULT_PRODUCTS.filter(p => p.isNew);

  return (
    <main className="home-page">
      <SEO path="/" />
      <AnimatePresence>
        {exitPopupOpen && (
          <motion.div 
            className="exit-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExitPopupOpen(false)}
          >
            <motion.div 
              className="exit-popup"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="popup-close" onClick={() => setExitPopupOpen(false)}>
                <X size={20} />
              </button>
              <div className="popup-image">
                <img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300" alt="Special Offer" />
              </div>
              <div className="popup-content">
                <h3>{language === 'fr' ? 'Attendez!' : 'Wait!'}</h3>
                <p>{language === 'fr' ? 'Ne partez pas sans votre code promo!' : "Don't leave without your promo code!"}</p>
                <div className="popup-code">
                  <span>{exitPopupCode}</span>
                  <span className="popup-discount">-{exitPopupDiscount}%</span>
                </div>
                <Link to="/boutique" className="btn-primary" onClick={() => setExitPopupOpen(false)}>
                  {language === 'fr' ? 'Découvrir la boutique' : 'Discover the shop'}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <section className="hero">
        <div className="container hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Leaf size={16} /> {t('natural')}
            </motion.span>
            <h1>{t('heroTitle')}</h1>
            <p className="hero-subtitle">{t('heroSubtitle')}</p>
            <div className="hero-actions">
              <Link to="/boutique" className="btn-primary btn-lg">
                {t('discover')} <ArrowRight size={20} />
              </Link>
              <Link to="/boutique?promo=true" className="btn-outline">
                {t('seePromos')}
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">20+</span>
                <span className="stat-label">{t('products')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">{t('natural')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.9</span>
                <span className="stat-label">{t('rating')}</span>
              </div>
            </div>
          </motion.div>
          <motion.div 
            className="hero-image-stack"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="hero-img-main">
              <img src="https://i.pinimg.com/736x/3c/af/2e/3caf2eafb319283e400ad40c7429b7bc.jpg" alt="Product" />
            </div>
            <div className="hero-img-floating">
              <img src="https://i.pinimg.com/736x/3c/af/2e/3caf2eafb319283e400ad40c7429b7bc.jpg" alt="Serum" />
              <div className="floating-badge">{t('nouveau')}</div>
            </div>
          </motion.div>
        </div>
        <div className="scroll-indicator">
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronRight size={24} style={{ transform: 'rotate(90deg)' }} />
          </motion.div>
        </div>
      </section>

      <section className="trust-badges-section">
        <div className="container">
          <div className="trust-badges">
            <motion.div 
              className="trust-badge"
              whileHover={{ scale: 1.05 }}
            >
              <Leaf size={28} />
              <div>
                <h4>{t('natural')}</h4>
                <p>{t('ingredientsPremiumDesc')}</p>
              </div>
            </motion.div>
            <motion.div 
              className="trust-badge"
              whileHover={{ scale: 1.05 }}
            >
              <Shield size={28} />
              <div>
                <h4>{t('testedDermo')}</h4>
                <p>{t('sensitive')}</p>
              </div>
            </motion.div>
            <motion.div 
              className="trust-badge"
              whileHover={{ scale: 1.05 }}
            >
              <Truck size={28} />
              <div>
                <h4>Livraison gratuite</h4>
                <p>Commandes de 75$ et plus</p>
              </div>
            </motion.div>
            <motion.div 
              className="trust-badge"
              whileHover={{ scale: 1.05 }}
            >
              <Award size={28} />
              <div>
                <h4>Canada</h4>
                <p>{t('carbonNeutral')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="categories-showcase">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>{t('exploreCategories')}</h2>
          </motion.div>
          <div className="categories-showcase-grid">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={`/boutique?category=${cat.id}`} 
                  className={`category-showcase-card ${index === 0 ? 'featured' : ''}`}
                >
                  <div className="category-img">
                    <img src={categoryImages[cat.id] || categoryImages['beurre-karite']} alt={cat.name} />
                    <div className="category-overlay"></div>
                  </div>
                  <div className="category-content">
                    <h3>{cat.name}</h3>
                    <span className="category-link">
                      {t('discoverCategory')} <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bestsellers-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-title-group">
              <h2>{t('bestsellers')}</h2>
              <span className="section-badge">★ {t('popular')}</span>
            </div>
          </motion.div>
          <div className="products-showcase-grid">
            {displayBestsellers.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductShowcaseCard 
                  product={product} 
                  onQuickView={() => setQuickViewProduct(product)}
                  onAddToCart={() => addToCart(product)}
                  t={t}
                />
              </motion.div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/boutique" className="btn-link">
              {t('viewAll')} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="new-arrivals-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-title-group">
              <h2>{t('newArrivals')}</h2>
              <span className="section-badge badge-new">{t('nouveau')}</span>
            </div>
          </motion.div>
          <div className="products-showcase-grid">
            {displayNew.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductShowcaseCard 
                  product={product} 
                  onQuickView={() => setQuickViewProduct(product)}
                  onAddToCart={() => addToCart(product)}
                  t={t}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="features-detailed">
        <div className="container">
          <div className="features-detailed-grid">
            <motion.div 
              className="feature-detailed-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon">
                <Leaf size={32} />
              </div>
              <h3>{t('ingredientsPremium')}</h3>
              <p>{t('ingredientsPremiumDesc')}</p>
              <ul>
                <li>{t('noParabens')}</li>
                <li>{t('noSilicone')}</li>
                <li>{t('vegan')}</li>
              </ul>
            </motion.div>
            <motion.div 
              className="feature-detailed-card featured"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>{t('dermatologue')}</h3>
              <p>{t('dermatologueDesc')}</p>
              <ul>
                <li>{t('testedDermo')}</li>
                <li>{t('sensitive')}</li>
                <li>{t('hypoallergenic')}</li>
              </ul>
            </motion.div>
            <motion.div 
              className="feature-detailed-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="feature-icon">
                <Award size={32} />
              </div>
              <h3>{t('environmental')}</h3>
              <p>{t('environmentalDesc')}</p>
              <ul>
                <li>{t('recyclable')}</li>
                <li>{t('carbonNeutral')}</li>
                <li>{t('local')}</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>{t('testimonials')}</h2>
          </motion.div>
          <div className="testimonials-grid">
            {currentTestimonials.map((testimonial, index) => (
              motion.div && <motion.div 
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#c9a86c" stroke="#c9a86c" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <span className="testimonial-author">- {testimonial.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="container">
          <motion.div 
            className="newsletter-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>{t('newsletter')}</h2>
            <p>{t('newsletterSub')}</p>
            {newsletterSubmitted ? (
              <div className="newsletter-success">
                <CheckCircle size={24} />
                <p>{language === 'fr' ? 'Merci pour votre inscription!' : 'Thanks for subscribing!'}</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newsletterEmail) return;
                try {
                  await supabase.from('newsletter_subscribers').upsert(
                    { email: newsletterEmail, subscribed: true },
                    { onConflict: 'email' }
                  );
                  setNewsletterSubmitted(true);
                } catch (err) {
                  console.error('Newsletter error:', err);
                }
              }} className="newsletter-form">
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary">{t('subscribe')}</button>
              </form>
            )}
            <p className="newsletter-note">{t('newsletterNote')}</p>
          </motion.div>
        </div>
      </section>

      {quickViewProduct && (
        <ProductModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </main>
  );
}

function ProductShowcaseCard({ product, onQuickView, onAddToCart, t }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="product-showcase-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-showcase-image">
        <img src={product.images[0]} alt={product.name} />
        {product.isNew && <span className="badge badge-new">{t('nouveau')}</span>}
        {product.isBestseller && <span className="badge badge-bestseller">{t('bestseller')}</span>}
        
        <motion.div 
          className="product-showcase-actions"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        >
          <button className="action-btn" onClick={onQuickView}>
            {t('quickView')}
          </button>
          <button className="action-btn primary" onClick={onAddToCart}>
            {t('addToCart')}
          </button>
        </motion.div>
      </div>
      
      <div className="product-showcase-info">
        <h3>{product.name}</h3>
        <div className="product-showcase-rating">
          <Star size={14} fill="#c9a86c" stroke="#c9a86c" />
          <span>{product.rating}</span>
          <span className="reviews">({product.reviews})</span>
        </div>
        <div className="product-showcase-price">
          <span className="price">{product.price.toFixed(2)} $</span>
        </div>
      </div>
    </div>
  );
}