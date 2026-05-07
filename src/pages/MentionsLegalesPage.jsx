import { motion } from 'framer-motion';
import SEO from '../components/layout/SEO';

export default function MentionsLegalesPage() {
  return (
    <main className="mentions-page">
      <SEO
        title="Mentions légales"
        description="Mentions légales VEGEDERM - Informations sur l'éditeur, l'hébergement et la propriété intellectuelle."
        path="/mentions-legales"
      />
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Mentions Légales</h1>
          <p>Dernière mise à jour : Mai 2026</p>
        </motion.div>

        <div className="mentions-content">
          <section>
            <h2>1. Éditeur du site</h2>
            <p>
              <strong>VEGEDERM Cosmétiques Naturels & Bio</strong><br />
              Adresse : 123 Rue de la Nature, Montréal, QC H2X 1A1<br />
              Email : zoumcosmo@gmail.com<br />
              Téléphone : +1 514-264-5963<br />
              Numéro d'entreprise (NEQ) : En cours d'enregistrement
            </p>
          </section>

          <section>
            <h2>2. Directeur de la publication</h2>
            <p>Le directeur de la publication est VEGEDERM Cosmetics Inc.</p>
          </section>

          <section>
            <h2>3. Hébergement</h2>
            <p>
              Le site est hébergé par Vercel Inc.<br />
              440 N Wolfe Rd, Sunnyvale, CA 94085, États-Unis
            </p>
          </section>

          <section>
            <h2>4. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu présent sur le site vegederm.ca (textes, images, logos, graphismes, vidéos) est protégé par le droit d'auteur. Toute reproduction, représentation, modification ou adaptation, totale ou partielle, est interdite sans l'autorisation écrite préalable de VEGEDERM. Toute violation de ces droits expose le contrevenant à des poursuites judiciaires.
            </p>
          </section>

          <section>
            <h2>5. Protection des données personnelles</h2>
            <p>
              Conformément à la Loi 25 (Loi sur la protection des renseignements personnels dans le secteur privé) du Québec, VEGEDERM s'engage à protéger vos données personnelles. Les informations collectées lors de vos achats (nom, adresse, email, téléphone) sont utilisées exclusivement pour le traitement de vos commandes et ne sont jamais vendues à des tiers.<br /><br />
              Vous disposez à tout moment d'un droit d'accès, de rectification et de suppression de vos données en nous contactant à zoumcosmo@gmail.com.
            </p>
          </section>

          <section>
            <h2>6. Cookies</h2>
            <p>
              Notre site utilise des cookies pour améliorer votre expérience de navigation, analyser le trafic et personnaliser le contenu. Les cookies essentiels au fonctionnement du site sont activés par défaut. Vous pouvez désactiver les cookies non essentiels dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2>7. Limitation de responsabilité</h2>
            <p>
              VEGEDERM ne peut être tenu responsable des dommages résultant de l'utilisation du site, notamment en cas d'indisponibilité temporaire, d'erreurs techniques ou de contenu extérieur. Les liens hypertextes présents sur le site vers d'autres ressources internet sont fournis à titre informatif ; VEGEDERM décline toute responsabilité quant à leur contenu.
            </p>
          </section>

          <section>
            <h2>8. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit applicable dans la province de Québec, Canada. Tout litigerelatif à l'utilisation du site sera soumis à la compétenceexclusive des tribunaux du Québec.
            </p>
          </section>

          <section>
            <h2>9. Contact</h2>
            <p>
              Pour toute question concernant ces mentions légales, contactez-nous :<br />
              Email : zoumcosmo@gmail.com<br />
              Téléphone : +1 514-264-5963
            </p>
          </section>
        </div>
      </div>

      <style>{`
        .mentions-page { padding: 60px 0; }
        .mentions-content { max-width: 800px; margin: 0 auto; }
        .mentions-content section { margin-bottom: 40px; }
        .mentions-content h2 {
          font-size: 20px;
          color: var(--primary);
          margin-bottom: 12px;
          font-weight: 700;
        }
        .mentions-content p {
          color: var(--text-light);
          line-height: 1.8;
          font-size: 15px;
        }
      `}</style>
    </main>
  );
}
