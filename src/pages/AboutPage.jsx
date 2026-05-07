import { motion } from 'framer-motion';
import { Leaf, Heart, Globe, Award, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>À propos de Vegederm</h1>
            <p className="hero-subtitle">L'excellence du naturel pour votre peau depuis 2018</p>
          </motion.div>
        </div>
      </section>

      <section className="about-story">
        <div className="container">
          <div className="story-grid">
            <motion.div
              className="story-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-tag">Notre Histoire</span>
              <h2>Une passion pour la beauté naturelle</h2>
              <p>
                Fondée au Canada en 2018, <strong>VEGEDERM</strong> est née d'une vision simple:
                proposer des cosmétiques efficaces qui respectent à la fois votre peau et l'environnement.
              </p>
              <p>
                Nous sélectionnez rigoureusement des ingrédients biologiques provenant de producteurs
                locaux et engagés dans une démarche durable. Chaque formule est développée avec des
                dermatologues pour garantir une tolérance optimale sur tous types de peau.
              </p>
              <p>
                Notre engagement: vous offrir le meilleur de la nature, sans compromis sur l'efficacité
                ni sur la qualité.
              </p>
            </motion.div>

            <motion.div
              className="story-images"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="story-image-main">
                <img
                  src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600"
                  alt="Produits naturels"
                />
              </div>
              <div className="story-image-secondary">
                <img
                  src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300"
                  alt="Crème naturelle"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Nos Valeurs</span>
            <h2>Ce qui nous anime</h2>
          </motion.div>

          <div className="values-grid">
            <motion.div
              className="value-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="value-icon">
                <Leaf size={32} />
              </div>
              <h3>100% Naturel</h3>
              <p>Tous nos ingrédients sont certifiés biologiques et proviennent de sources renouvelables.</p>
            </motion.div>

            <motion.div
              className="value-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="value-icon">
                <Heart size={32} />
              </div>
              <h3>Bienveillance</h3>
              <p>Des formules douces, testées dermatologiquement, adaptées aux peaux sensibles.</p>
            </motion.div>

            <motion.div
              className="value-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="value-icon">
                <Globe size={32} />
              </div>
              <h3>Éco-responsable</h3>
              <p>Emballages recyclés, production neutre en carbone et ingredients locaux.</p>
            </motion.div>

            <motion.div
              className="value-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="value-icon">
                <Award size={32} />
              </div>
              <h3>Excellence</h3>
              <p> Qualité premium avec des résultats visibles et durables pour votre peau.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles size={40} />
            <h2>Découvrez notre collection</h2>
            <p>Parcourez nos produits naturels et trouvez celui qui convient à votre peau.</p>
            <a href="/boutique" className="btn-primary">Découvrir la boutique</a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}