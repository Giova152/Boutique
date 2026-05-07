import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Phone, MapPin, UserCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { storeConfig } from '../data/config';
import { supabase } from '../lib/supabase';
import SEO from '../components/layout/SEO';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.city) {
          addToast('Veuillez remplir tous les champs obligatoires', 'error');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          addToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
          setIsLoading(false);
          return;
        }

        const fullName = `${formData.firstName} ${formData.lastName}`;
        const result = await register(fullName, formData.email, formData.password, {
          phone: formData.phone,
          city: formData.city
        });

        if (result.success) {
          if (result.needsConfirmation) {
            setRegistrationSuccess(true);
            addToast(result.message || 'Compte créé ! Vérifiez votre email pour confirmer.', 'success');
          } else {
            addToast('Compte créé et connecté !', 'success');
            navigate('/profile');
          }
        } else {
          addToast(result.message || 'Erreur lors de l\'inscription', 'error');
        }
      } else if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          addToast('Connexion réussie !', 'success');
          navigate('/profile');
        } else {
          addToast(result.message || 'Email ou mot de passe incorrect', 'error');
        }
      } else if (mode === 'forgot') {
        if (!formData.email) {
          addToast('Veuillez entrer votre email', 'error');
          setIsLoading(false);
          return;
        }
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
            redirectTo: `${window.location.origin}/profile`
          });
          if (error) {
            addToast(error.message || 'Erreur lors de l\'envoi', 'error');
          } else {
            addToast('Un lien de réinitialisation a été envoyé à ' + formData.email, 'success');
            setMode('login');
          }
        } catch (err) {
          addToast('Une erreur est survenue', 'error');
        }
      }
    } catch (err) {
      addToast('Une erreur est survenue. Veuillez réessayer.', 'error');
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      city: ''
    });
    setRegistrationSuccess(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <main className="login-page">
      <SEO
        title={language === 'fr' ? 'Connexion' : 'Sign In'}
        path="/login"
      />
      <div className="login-background">
        <div className="login-pattern"></div>
      </div>

      <div className="container">
        <motion.div
          className="login-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-header-section">
            <h1>
              {mode === 'login' && 'Connexion'}
              {mode === 'register' && 'Créer un compte'}
              {mode === 'forgot' && 'Mot de passe oublié'}
            </h1>
            <p className="login-subtitle">
              {mode === 'login' && `Bienvenue chez ${storeConfig.name}`}
              {mode === 'register' && `Rejoignez ${storeConfig.name}`}
              {mode === 'forgot' && 'Entrez votre email pour recevoir un lien de réinitialisation'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {registrationSuccess && mode === 'register' ? (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="registration-success-card"
              >
                <div className="success-icon">
                  <Mail size={48} />
                </div>
                <h2>Email de confirmation envoyé !</h2>
                <p>Nous avons envoyé un lien de confirmation à <strong>{formData.email}</strong></p>
                <p className="instructions">
                  <CheckCircle size={16} /> Cliquez sur le lien dans l'email pour activer votre compte
                </p>
                <p className="instructions">
                  <AlertCircle size={16} /> Vérifiez aussi vos spams si vous ne voyez pas l'email
                </p>
                <div className="success-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setRegistrationSuccess(false);
                      setMode('login');
                      setFormData(prev => ({ ...prev, password: '' }));
                    }}
                  >
                    Se connecter après confirmation
                  </button>
                </div>
                <p className="resend-info">
                  Vous n'avez pas reçu l'email ? <button
                    type="button"
                    className="link-btn"
                    onClick={async () => {
                      try {
                        await supabase.auth.resend({
                          type: 'signup',
                          email: formData.email
                        });
                        addToast('Email de confirmation renvoyé !', 'success');
                      } catch (err) {
                        addToast('Erreur lors de l\'envoi', 'error');
                      }
                    }}
                  >
                    Renvoyer l'email
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="login-form-card"
              >
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {mode === 'register' && (
                      <motion.div
                        key="register-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="form-group">
                            <label>Prénom *</label>
                            <div className="input-with-icon">
                              <UserCircle size={18} />
                              <input
                                type="text"
                                placeholder="Prénom"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Nom *</label>
                            <div className="input-with-icon">
                              <User size={18} />
                              <input
                                type="text"
                                placeholder="Nom"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Téléphone *</label>
                          <div className="input-with-icon">
                            <Phone size={18} />
                            <input
                              type="tel"
                              placeholder="(514) 555-1234"
                              value={formData.phone}
                              onChange={(e) => handleChange('phone', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Ville *</label>
                          <div className="input-with-icon">
                            <MapPin size={18} />
                            <input
                              type="text"
                              placeholder="Montréal"
                              value={formData.city}
                              onChange={(e) => handleChange('city', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                          Les informations de livraison (adresse complète) pourront être ajoutées après l'inscription ou lors de votre première commande.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="form-group">
                    <label>Email *</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {(mode === 'login' || mode === 'register') && (
                    <div className="form-group">
                      <label>Mot de passe *</label>
                      <div className="input-with-icon">
                        <Lock size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {mode === 'register' && (
                        <small style={{ color: '#888' }}>Minimum 6 caractères</small>
                      )}
                    </div>
                  )}

                  {mode === 'login' && (
                    <div className="forgot-password">
                      <button type="button" onClick={() => switchMode('forgot')}>
                        Mot de passe oublié ?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary btn-login"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="spin" /> Chargement...
                      </>
                    ) : (
                      <>
                        {mode === 'login' && 'Me connecter'}
                        {mode === 'register' && 'Créer mon compte'}
                        {mode === 'forgot' && 'Envoyer le lien'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                {mode !== 'forgot' && (
                  <>
                    <div className="login-divider">
                      <span>ou</span>
                    </div>

                    <div className="switch-mode">
                      <p>
                        {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
                        <button
                          type="button"
                          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                        >
                          {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
                        </button>
                      </p>
                    </div>
                  </>
                )}

                {mode === 'forgot' && (
                  <div className="back-to-login">
                    <button type="button" onClick={() => switchMode('login')}>
                      <ArrowLeft size={16} /> Retour à la connexion
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="login-back-home">
            <button type="button" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
              ← Retour à l'accueil
            </button>
          </p>
        </motion.div>
      </div>

      <style>{`
        .registration-success-card {
          background: white;
          padding: 40px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .registration-success-card .success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d4e38, #2d7a54);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
        }
        .registration-success-card h2 {
          color: #1d4e38;
          margin-bottom: 16px;
          font-size: 24px;
        }
        .registration-success-card p {
          color: #666;
          margin-bottom: 12px;
        }
        .registration-success-card .instructions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #888;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .registration-success-card .success-actions {
          margin: 24px 0;
        }
        .registration-success-card .resend-info {
          font-size: 13px;
          color: #888;
        }
        .registration-success-card .link-btn {
          background: none;
          border: none;
          color: #1d4e38;
          text-decoration: underline;
          cursor: pointer;
          font-size: 13px;
        }
        .registration-success-card .link-btn:hover {
          color: #2d7a54;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
