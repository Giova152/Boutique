import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import SEO from '../components/layout/SEO';

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <SEO
        title="Politique de confidentialité"
        description="Politique de confidentialité VEGEDERM. Comment nous protégeons vos données personnelles."
        path="/confidentialite"
      />
      <div className="container">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Retour à l'accueil
        </Link>
        
        <div className="legal-header">
          <Shield size={48} />
          <h1>Politique de Confidentialité</h1>
        </div>
        
        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>La présente Politique de Confidentialité décrit comment VEGEDERM collecte, utilise et protège vos données personnelles conformément à la Loi sur la protection des renseignements personnels dans le secteur privé (Québec) et la Loi sur la protection des renseignements personnels et les documents électroniques (Canada).</p>
          </section>

          <section>
            <h2>2. Responsable du traitement</h2>
            <p>
              <strong>VEGEDERM</strong><br />
              Email: zoumcosmo@gmail.com<br />
              Téléphone: +1 514-264-5963
            </p>
          </section>

          <section>
            <h2>3. Données collectées</h2>
            <p>Nous collectons les données suivantes:</p>
            <ul>
              <li><strong>Informations de compte:</strong> Nom, email, numéro de téléphone</li>
              <li><strong>Adresse de livraison:</strong> Adresse complète pour la livraison</li>
              <li><strong>Historique de commandes:</strong> Produits commandés, dates, montants</li>
              <li><strong>Données de navigation:</strong> Adresse IP, type de navigateur, pages visitées (via cookies)</li>
            </ul>
          </section>

          <section>
            <h2>4. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour:</p>
            <ul>
              <li>Traiter et livrer vos commandes</li>
              <li>Vous informer de l'état de vos commandes</li>
              <li>Répondre à vos questions et demandes</li>
              <li>Améliorer notre site et nos services</li>
              <li>Vous envoyer des offres promotionnelles (si vous y consentez)</li>
            </ul>
          </section>

          <section>
            <h2>5. Base légale</h2>
            <p>Le traitement de vos données repose sur:</p>
            <ul>
              <li><strong>Exécution du contrat:</strong> Pour le traitement des commandes</li>
              <li><strong>Consentement:</strong> Pour les communications marketing</li>
              <li><strong>Intérêt légitime:</strong> Pour l'analyse et l'amélioration de nos services</li>
            </ul>
          </section>

          <section>
            <h2>6. Conservation des données</h2>
            <p>Vos données sont conservées:</p>
            <ul>
              <li><strong>Données de commande:</strong> 7 ans (exigences comptables)</li>
              <li><strong>Compte client:</strong> Durée de vie du compte + 2 ans après dernière activité</li>
              <li><strong>Données marketing:</strong> Jusqu'au retrait du consentement</li>
            </ul>
          </section>

          <section>
            <h2>7. Partage des données</h2>
            <p>Vos données peuvent être partagées avec:</p>
            <ul>
              <li><strong>Prestataires de paiement:</strong> Stripe, PayPal (traitement des paiements)</li>
              <li><strong>Services de livraison:</strong> Pour la livraison des commandes</li>
              <li><strong>Hébergement:</strong> Pour le stockage des données</li>
            </ul>
            <p>Nous ne vendons pas vos données personnelles à des tiers.</p>
          </section>

          <section>
            <h2>8. Sécurité</h2>
            <p>Nous mettons en œuvre des mesures de sécurité appropriées:</p>
            <ul>
              <li>Connexion chiffrée (SSL/TLS)</li>
              <li>Accès restreint aux données</li>
              <li>Sauvegardes régulières</li>
              <li>Monitoring des systèmes</li>
            </ul>
          </section>

          <section>
            <h2>9. Vos droits</h2>
            <p>Vous disposez des droits suivants:</p>
            <ul>
              <li><strong>Accès:</strong> Obtenir une copie de vos données</li>
              <li><strong>Rectification:</strong> Corriger des données inexactes</li>
              <li><strong>Effacement:</strong> Demander la suppression de vos données</li>
              <li><strong>Portabilité:</strong> Recevoir vos données dans un format structuré</li>
              <li><strong>Opposition:</strong> Vous opposer au traitement</li>
              <li><strong>Retrait du consentement:</strong> Retirer votre consentement à tout moment</li>
            </ul>
            <p>Pour exercer ces droits, contactez-nous à: zoumcosmo@gmail.com</p>
          </section>

          <section>
            <h2>10. Cookies</h2>
            <p>Notre site utilise des cookies pour:</p>
            <ul>
              <li><strong>Cookies essentiels:</strong> Fonctionnement du site (panier, connexion)</li>
              <li><strong>Cookies analytiques:</strong> Statistiques de visite (Google Analytics)</li>
              <li><strong>Cookies marketing:</strong> Publicités personnalisées</li>
            </ul>
            <p>Vous pouvez gérer vos préférences via les paramètres de votre navigateur.</p>
          </section>

          <section>
            <h2>11. Mineurs</h2>
            <p>Notre site est destiné aux personnes de 18 ans et plus. Nous ne collectons pas délibérément de données personnelles de mineurs.</p>
          </section>

          <section>
            <h2>12. Modifications</h2>
            <p>Cette politique peut être modifiée à tout moment. En cas de modification substantielle, nous vous en informerons par email.</p>
          </section>

          <section>
            <h2>13. Contact</h2>
            <p>Pour toute question concernant cette politique, contactez-nous à: zoumcosmo@gmail.com</p>
          </section>

          <p className="last-update">Dernière mise à jour: Mai 2026</p>
        </div>
      </div>
    </main>
  );
}