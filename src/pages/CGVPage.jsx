import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import SEO from '../components/layout/SEO';

export default function CGVPage() {
  return (
    <main className="legal-page">
      <SEO
        title="Conditions Générales de Vente"
        description="Conditions générales de vente VEGEDERM. Consultez nos conditions pour les achats en ligne au Canada."
        path="/cgv"
      />
      <div className="container">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Retour à l'accueil
        </Link>
        
        <div className="legal-header">
          <FileText size={48} />
          <h1>Conditions Générales de Vente</h1>
        </div>
        
        <div className="legal-content">
          <section>
            <h2>1. Objet</h2>
            <p>Les présentes Conditions Générales de Vente (CGV) ont pour objet de définir les modalités de vente entre VEGEDERM et ses clients, concernant les produits de cosmétique naturelle proposés sur le site vegederm.com</p>
          </section>

          <section>
            <h2>2. Société</h2>
            <p>
              <strong>VEGEDERM</strong><br />
              Email: zoumcosmo@gmail.com<br />
              Téléphone: +1 514-264-5963<br />
              Montréal, Québec, Canada
            </p>
          </section>

          <section>
            <h2>3. Produits</h2>
            <p>Les produits proposés à la vente sont des cosmétiques biologiques et naturels. Les descriptifs sont disponibles sur chaque fiche produit. Les photographies sont non contractuelles.</p>
          </section>

          <section>
            <h2>4. Prix</h2>
            <p>Les prix sont indiqués en dollars canadiens (CAD) et incluent la taxe de vente du Québec (TPS + TVQ). Les frais de livraison sont ajoutés au moment du paiement.</p>
          </section>

          <section>
            <h2>5. Commande</h2>
            <p>La commande est passée en ligne via le panier. Une confirmation par email est envoyée après validation du paiement. VEGEDERM se réserve le droit de refuser toute commande pour motif légitime.</p>
          </section>

          <section>
            <h2>6. Paiement</h2>
            <p>Le paiement s'effectue par carte de crédit (Stripe) ou PayPal. Les transactions sont sécurisées. Aucun paiement en espèces n'est accepté en ligne.</p>
          </section>

          <section>
            <h2>7. Livraison</h2>
            <p>
              <strong>Standard:</strong> 3-5 jours ouvrables - 9.99$<br />
              <strong>Express:</strong> 1-2 jours ouvrables - 19.99$<br />
              Livraison gratuite pour toute commande de 75$ et plus.
            </p>
          </section>

          <section>
            <h2>8. Politique de retour</h2>
            <p>Les produits esthétiques ne peuvent être retournés pour des raisons d'hygiène, sauf défaut de fabrication. Toute réclamation doit être faite dans les 48 heures suivant la réception.</p>
          </section>

          <section>
            <h2>9. Propriété intellectuelle</h2>
            <p>Tous les éléments du site vegederm.com sont protégés par les droits de propriété intellectuelle. Toute reproduction est interdite sans autorisation écrite.</p>
          </section>

          <section>
            <h2>10. Responsabilité</h2>
            <p>VEGEDERM s'efforce de fournir des informations exactes. Cependant, des erreurs peuvent survenir. La responsabilité de VEGEDERM est limitée au montant de la commande.</p>
          </section>

          <section>
            <h2>11. Litiges</h2>
            <p>En cas de litige, les parties s'efforceront de trouver une solution à l'amiable. À défaut, les tribunaux du Québec seront seuls compétents.</p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>Pour toute question concernant ces CGV, contactez-nous à: zoumcosmo@gmail.com</p>
          </section>

          <p className="last-update">Dernière mise à jour: Mai 2026</p>
        </div>
      </div>
    </main>
  );
}