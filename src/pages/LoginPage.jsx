import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { storeConfig } from '../data/config';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // login, register, forgot
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'register') {
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          addToast('Compte créé ! Veuillez confirmer votre email.', 'success');
          navigate('/profile');
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
        addToast('Un lien de réinitialisation a été envoyé à ' + formData.email, 'success');
        setMode('login');
      }
    } catch (err) {
      addToast('Une erreur est survenue', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFormData({ ...formData, name: '' });
  };

  return (
    <main className="login-page">
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
            <Link to="/" className="login-logo">{storeConfig.name}</Link>
            <h1>
              {mode === 'login' && 'Connexion'}
              {mode === 'register' && 'Créer un compte'}
              {mode === 'forgot' && 'Mot de passe oublié'}
            </h1>
            <p className="login-subtitle">
              {mode === 'login' && `Bienvenue chez ${storeConfig.name}`}
              {mode === 'register' && `Rejoignez ${storeConfig.name} pour une expérience personnalisée`}
              {mode === 'forgot' && 'Entrez votre email pour recevoir un lien de réinitialisation'}
            </p>
          </div>

          <div className="login-form-card">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="form-group"
                  >
                    <label>Nom complet</label>
                    <div className="input-with-icon">
                      <User size={18} />
                      <input
                        type="text"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required={mode === 'register'}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="form-group">
                <label>Email</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {(mode === 'login' || mode === 'register') && (
                <div className="form-group">
                  <label>Mot de passe</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={mode !== 'forgot'}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                  <span className="loading-spinner"></span>
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
          </div>

          <p className="login-back-home">
            <Link to="/">← Retour à l'accueil</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}