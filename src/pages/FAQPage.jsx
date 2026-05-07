import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SEO from '../components/layout/SEO';

const faqs = [
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'Nous offrons la livraison standard (3-5 jours ouvrés) pour 9.99$ et la livraison express (1-2 jours ouvrés) pour 19.99$. La livraison est gratuite pour toute commande de 75$ et plus. Les commandes sont expédiées dans les 24-48 heures suivant la confirmation du paiement.'
  },
  {
    q: 'Comment retourner un produit ?',
    a: 'Vous disposez de 30 jours à compter de la réception pour retourner un produit. Le produit doit être non ouvert et dans son emballage d\'origine. Contactez-nous à zoumcosmo@gmail.com pour obtenir un numéro de retour. Les frais de retour sont à votre charge sauf en cas de produit défectueux.'
  },
  {
    q: 'Vos produits sont-ils testés dermatologiquement ?',
    a: 'Oui, tous nos produits sont formulés et testés sous contrôle dermatologique. Ils sont adaptés aux peaux sensibles et ne contiennent pas de parabènes, silicones ni autres ingrédients agressifs.'
  },
  {
    q: 'Proposez-vous la livraison internationale ?',
    a: 'Actuellement, nous expédions uniquement au Canada. Nous travaillons à étendre nos services à l\'international prochainement.'
  },
  {
    q: 'Comment utiliser mon code promo ?',
    a: 'Entrez votre code promo dans le champ prévu à cet effet dans votre panier ou lors du checkout. Le code sera appliqué automatiquement et la réduction s\'affichera dans le résumé de votre commande.'
  },
  {
    q: 'Comment fonctionne le programme de fidélité ?',
    a: 'À chaque achat, vous accumulatez des points de fidélité (1 point par dollar dépensé). Ces points peuvent être échangés contre des réductions sur vos prochaines commandes. Votre statut évolue également : Bronze, Argent, Or, Platine avec des avantages croissants.'
  },
  {
    q: 'Mes données personnelles sont-elles sécurisées ?',
    a: 'Absolument. Nous utilisons le chiffrement SSL pour toutes les transactions et ne partageons jamais vos données avec des tiers à des fins marketing. Vous pouvez à tout moment demander la suppression de vos données conformément à la loi 25 du Québec.'
  },
  {
    q: 'Comment contacter le service client ?',
    a: 'Vous pouvez nous contacter par email à zoumcosmo@gmail.com, par téléphone au +1 514-264-5963, ou via le formulaire de contact sur notre page Contact. Nous répondons généralement sous 24-48 heures.'
  },
  {
    q: 'Vos ingrédients sont-ils certifiés biologiques ?',
    a: 'Oui, nous privilégions les ingrédients certifiés biologiques et provenants de producteurs locaux canadiens engagés dans une démarche durable. Notre engagement environnemental est au cœur de notre philosophie.'
  },
  {
    q: 'Comment suivre ma commande ?',
    a: 'Une fois votre commande expédiée, vous recevrez un email de confirmation avec un numéro de suivi. Vous pouvez également suivre votre commande depuis votre espace client dans la section "Mes commandes".'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <main className="faq-page">
      <SEO
        title="FAQ"
        description="Questions fréquentes sur VEGEDERM : livraison, retours, programme fidélité, ingrédients et plus."
        path="/faq"
      />
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Questions Fréquentes</h1>
          <p>Trouvez rapidement les réponses à vos questions</p>
        </motion.div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className={`faq-item ${openIndex === i ? 'open' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button className="faq-question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span>{faq.q}</span>
                <ChevronDown size={20} className={`faq-icon ${openIndex === i ? 'rotated' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="faq-contact">
          <h3>Vous n'avez pas trouvé votre réponse ?</h3>
          <a href="/contact" className="btn-primary">Contactez-nous</a>
        </div>
      </div>

      <style>{`
        .faq-page { padding: 60px 0; }
        .faq-list { max-width: 800px; margin: 0 auto; }
        .faq-item {
          border-bottom: 1px solid #eee;
          margin-bottom: 0;
        }
        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          text-align: left;
          gap: 16px;
        }
        .faq-icon { transition: transform 0.3s; flex-shrink: 0; color: var(--primary); }
        .faq-icon.rotated { transform: rotate(180deg); }
        .faq-answer {
          padding: 0 0 20px;
          color: var(--text-light);
          font-size: 15px;
          line-height: 1.7;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .faq-contact {
          text-align: center;
          margin-top: 60px;
          padding: 40px;
          background: var(--bg-light);
          border-radius: 16px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .faq-contact h3 { margin-bottom: 16px; font-size: 20px; }
      `}</style>
    </main>
  );
}
