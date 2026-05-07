import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { storeConfig } from '../../data/config';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">{storeConfig.name}</Link>
            <p className="footer-desc">{storeConfig.description}</p>
            <div className="social-links">
              <a href={storeConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link">
                <img src="https://img.icons8.com/?size=30&id=118497&format=png&color=000000" alt="Facebook" />
              </a>
              <a href={storeConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
                <img src="https://img.icons8.com/?size=30&id=Xy10Jcu1L2Su&format=png&color=000000" alt="Instagram" />
              </a>
              <a href={storeConfig.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="social-link">
                <img src="https://img.icons8.com/?size=30&id=118640&format=png&color=000000" alt="TikTok" />
              </a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Navigation</h4>
              <ul>
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/boutique">Boutique</Link></li>
                <li><Link to="/a-propos">À propos</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Catégories</h4>
              <ul>
                <li><Link to="/boutique?category=beurre-karite">Beurre de Karité</Link></li>
                <li><Link to="/boutique?category=gamme-enfants">Gamme Enfants</Link></li>
                <li><Link to="/boutique?category=exfoliants">Exfoliants</Link></li>
                <li><Link to="/boutique?category=corps">Corps</Link></li>
                <li><Link to="/boutique?category=savons">Savons</Link></li>
                <li><Link to="/boutique?category=pieds">Soins des Pieds</Link></li>
                <li><Link to="/boutique?category=capillaires">Capillaires</Link></li>
                <li><Link to="/boutique?category=eczema">Eczéma & Psoriasis</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="footer-contact-list">
                <li>
                  <MapPin size={16} />
                  <span>{storeConfig.address}</span>
                </li>
                <li>
                  <Phone size={16} />
                  <a href={`tel:${storeConfig.phone}`}>{storeConfig.phone}</a>
                </li>
                <li>
                  <Mail size={16} />
                  <a href={`mailto:${storeConfig.email}`}>{storeConfig.email}</a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Aide</h4>
              <ul>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/cgv">CGV</Link></li>
                <li><Link to="/confidentialite">Confidentialité</Link></li>
                <li><Link to="/mentions-legales">Mentions légales</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {storeConfig.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}