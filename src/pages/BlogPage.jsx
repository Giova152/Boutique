import { Link } from 'react-router-dom';
import { Clock, Calendar, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const articles = [
  {
    id: 1,
    slug: 'bienfaits-beurre-karite',
    title: 'Les Bienfaits Incomparables du Beurre de Karité',
    excerpt: 'Découvrez pourquoi le beurre de karité est l\'ingrédient star de nos cosmétiques naturels.',
    image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=600',
    category: 'Ingrédients',
    readTime: '5 min',
    date: '2026-04-15',
    featured: true
  },
  {
    id: 2,
    slug: 'routine-soin-peaux-sensibles',
    title: 'Ma Routine Complète pour Peaux Sensibles',
    excerpt: 'Voici mes conseils pour prendre soin des peaux réactives au quotidien.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
    category: 'Conseils',
    readTime: '7 min',
    date: '2026-04-10',
    featured: false
  },
  {
    id: 3,
    slug: 'eczema-naturel',
    title: 'Soulager l\'Eczéma Naturellement',
    excerpt: 'Des solutions douces et efficaces pour calmer les poussées d\'eczéma.',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600',
    category: 'Santé',
    readTime: '6 min',
    date: '2026-04-05',
    featured: false
  },
  {
    id: 4,
    slug: 'cheveux-enfants-naturels',
    title: 'Les Soins Capillaires Naturels pour Enfants',
    excerpt: 'Comment prendre soin des cheveux de vos enfants avec des produits doux.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600',
    category: 'Enfants',
    readTime: '4 min',
    date: '2026-03-28',
    featured: false
  },
  {
    id: 5,
    slug: 'ingredient-vegan-cosmetique',
    title: '5 Ingrédients Vegan à Connaître',
    excerpt: 'Les ingrédients naturels qui remplacent les produits animaux dans vos cosmétiques.',
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b07?w=600',
    category: 'Ingredients',
    readTime: '5 min',
    date: '2026-03-20',
    featured: false
  },
  {
    id: 6,
    slug: 'exfoliation-naturelle',
    title: 'Exfoliation : Pourquoi et Comment ?',
    excerpt: 'Guide complet pour éliminer les cellules mortes sans agresser la peau.',
    image: 'https://images.unsplash.com/photo-1608248541500-248993a7a5a5?w=600',
    category: 'Conseils',
    readTime: '6 min',
    date: '2026-03-15',
    featured: false
  }
];

function BlogCard({ article, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/blog/${article.slug}`} className="blog-card">
        <div className="blog-image">
          <img src={article.image} alt={article.title} />
          <span className="blog-category">{article.category}</span>
          {article.featured && <span className="featured-badge">À la une</span>}
        </div>
        <div className="blog-content">
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
          <div className="blog-meta">
            <span><Calendar size={14} /> {new Date(article.date).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })}</span>
            <span><Clock size={14} /> {article.readTime}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPage() {
  const featuredArticle = articles.find(a => a.featured);
  const otherArticles = articles.filter(a => !a.featured);

  return (
    <main className="blog-page">
      <div className="container">
        <div className="blog-header">
          <h1>Blog VEGEDERM</h1>
          <p>Conseils, ingrédients et beautés naturelles</p>
        </div>

        {featuredArticle && (
          <div className="featured-section">
            <motion.div 
              className="featured-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="featured-image">
                <img src={featuredArticle.image} alt={featuredArticle.title} />
                <span className="featured-label">À la une</span>
              </div>
              <div className="featured-content">
                <span className="blog-category">{featuredArticle.category}</span>
                <h2>{featuredArticle.title}</h2>
                <p>{featuredArticle.excerpt}</p>
                <div className="blog-meta">
                  <span><Calendar size={14} /> {new Date(featuredArticle.date).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span><Clock size={14} /> {featuredArticle.readTime}</span>
                </div>
                <Link to={`/blog/${featuredArticle.slug}`} className="read-more">
                  Lire l'article <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        <div className="articles-grid">
          {otherArticles.map((article, index) => (
            <BlogCard key={article.id} article={article} index={index} />
          ))}
        </div>
      </div>

      <style>{`
        .blog-page {
          padding: 120px 0 80px;
          min-height: 100vh;
          background: #f8f5f0;
        }
        
        .blog-header {
          text-align: center;
          margin-bottom: 48px;
        }
        
        .blog-header h1 {
          font-size: 40px;
          color: var(--primary);
          margin-bottom: 12px;
        }
        
        .blog-header p {
          color: var(--text-secondary);
          font-size: 18px;
        }
        
        .featured-section {
          margin-bottom: 48px;
        }
        
        .featured-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        .featured-image {
          position: relative;
          height: 400px;
        }
        
        .featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .featured-label {
          position: absolute;
          top: 20px;
          left: 20px;
          padding: 6px 16px;
          background: var(--accent);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .featured-content {
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .featured-content h2 {
          font-size: 28px;
          color: var(--primary);
          margin-bottom: 16px;
          line-height: 1.3;
        }
        
        .featured-content p {
          color: var(--text-secondary);
          margin-bottom: 24px;
          line-height: 1.7;
        }
        
        .blog-category {
          display: inline-block;
          padding: 4px 12px;
          background: var(--secondary);
          color: var(--primary);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .blog-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .blog-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-light);
        }
        
        .read-more {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: var(--primary);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          width: fit-content;
          transition: all 0.3s ease;
        }
        
        .read-more:hover {
          background: var(--primary-light);
          transform: translateX(4px);
        }
        
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        .blog-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
        }
        
        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }
        
        .blog-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        
        .blog-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .blog-card:hover .blog-image img {
          transform: scale(1.05);
        }
        
        .blog-image .blog-category {
          position: absolute;
          bottom: 12px;
          left: 12px;
        }
        
        .featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 12px;
          background: var(--primary);
          color: white;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .blog-content {
          padding: 24px;
        }
        
        .blog-content h3 {
          font-size: 18px;
          margin-bottom: 12px;
          line-height: 1.4;
          color: var(--primary);
        }
        
        .blog-content p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
        }
        
        @media (max-width: 1024px) {
          .featured-card {
            grid-template-columns: 1fr;
          }
          
          .featured-image {
            height: 250px;
          }
          
          .featured-content {
            padding: 32px;
          }
          
          .articles-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 600px) {
          .articles-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
