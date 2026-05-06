import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { storeConfig } from '../data/config';
import { sanitizeInput, validateEmail } from '../utils/validation';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitizeInput(value) });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (formData.name.length < 2) newErrors.name = 'Nom invalide';
    if (!validateEmail(formData.email)) newErrors.email = 'Email invalide';
    if (formData.message.length < 10) newErrors.message = 'Message trop court';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitted(true);
  };

  return (
    <main className="contact-page">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Contactez-nous</h1>
          <p className="page-subtitle">Nous sommes là pour répondre à toutes vos questions</p>
        </motion.div>

        <div className="contact-wrapper">
          <motion.div 
            className="contact-info-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Nos coordonnées</h2>
            <p className="contact-intro">N'hésitez pas à nous contacter pour toute question sur nos produits ou commandes.</p>
            
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-card-icon">
                  <MapPin size={24} />
                </div>
                <div className="contact-card-content">
                  <h3>Adresse</h3>
                  <p>{storeConfig.address}</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-card-icon">
                  <Phone size={24} />
                </div>
                <div className="contact-card-content">
                  <h3>Téléphone</h3>
                  <p>{storeConfig.phone}</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-card-icon">
                  <Mail size={24} />
                </div>
                <div className="contact-card-content">
                  <h3>Email</h3>
                  <p>{storeConfig.email}</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-card-icon">
                  <Clock size={24} />
                </div>
                <div className="contact-card-content">
                  <h3>Horaires</h3>
                  <p>Lun - Ven: {storeConfig.hours.weekdays}<br />Sam: {storeConfig.hours.saturday}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="contact-form-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="form-card">
              {submitted ? (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h3>Message envoyé !</h3>
                  <p>Merci de nous avoir contactés. Notre équipe vous répondra sous 24-48 heures.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-secondary">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <h2>Envoyez-nous un message</h2>
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label>Nom complet</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name} 
                        onChange={handleChange}
                        required 
                        placeholder="Votre nom"
                        className={errors.name ? 'error' : ''}
                      />
                      {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email} 
                        onChange={handleChange}
                        required 
                        placeholder="votre@email.com"
                        className={errors.email ? 'error' : ''}
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea 
                        name="message"
                        rows={5} 
                        value={formData.message} 
                        onChange={handleChange}
                        required 
                        placeholder="Comment pouvons-nous vous aider?"
                        className={errors.message ? 'error' : ''}
                      />
                      {errors.message && <span className="error-text">{errors.message}</span>}
                    </div>
                    <button type="submit" className="btn-primary btn-submit">
                      <Send size={18} /> Envoyer le message
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}