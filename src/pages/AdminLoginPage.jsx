import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { storeConfig } from '../data/config';

const ADMIN_EMAILS = ['zoumcosmo@gmail.com', 'midogiova@gmail.com'];

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setError('Email non autorisé pour l\'accès administrateur');
      setIsLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      addToast('Connexion admin réussie !', 'success');
      navigate('/admin');
    }
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
            <div className="admin-badge">
              <Shield size={24} />
              <span>Administration</span>
            </div>
            <h1>Connexion Admin</h1>
            <p className="login-subtitle">
              Accédez au panel d'administration de {storeConfig.name}
            </p>
          </div>

          <div className="login-form-card admin-login-card">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>Email administrateur</label>
                <div className="input-with-icon">
                  <Lock size={18} />
                  <input
                    type="email"
                    placeholder="zoumcosmo@gmail.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <div className="input-with-icon">
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              <button 
                type="submit" 
                className="btn-primary btn-login"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>ou</span>
            </div>

            <div className="switch-mode">
              <p>
                Retour client ?
                <Link to="/login"> Se connecter ici</Link>
              </p>
            </div>
          </div>

          <p className="login-back-home">
            <Link to="/">← Retour à l'accueil</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}