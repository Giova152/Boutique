import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import SEO from '../components/layout/SEO';

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <SEO
        title="Page introuvable"
        description="La page que vous recherchez n'existe pas."
        path="/404"
      />
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-number">404</div>
          <h1>Page introuvable</h1>
          <p>Désolée, la page que vous recherchez n'existe pas ou a été déplacée.</p>
          <div className="not-found-actions">
            <Link to="/" className="btn-primary">
              <Home size={18} /> Retour à l'accueil
            </Link>
            <Link to="/boutique" className="btn-secondary">
              <Search size={18} /> Voir la boutique
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        .not-found-page {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }
        .not-found-content {
          text-align: center;
          max-width: 500px;
        }
        .not-found-number {
          font-size: 120px;
          font-weight: 900;
          color: var(--primary);
          line-height: 1;
          opacity: 0.15;
          margin-bottom: -30px;
        }
        .not-found-content h1 {
          font-size: 28px;
          margin-bottom: 12px;
          color: var(--text);
        }
        .not-found-content p {
          color: var(--text-light);
          margin-bottom: 32px;
          font-size: 16px;
        }
        .not-found-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .not-found-actions .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: white;
          color: var(--primary);
          border: 2px solid var(--primary);
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .not-found-actions .btn-secondary:hover {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </main>
  );
}
