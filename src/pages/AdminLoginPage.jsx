import { useState, useEffect } from 'react';
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Admin login check:', session?.user?.email);
      if (session?.user && ADMIN_EMAILS.includes(session.user.email?.toLowerCase())) {
        navigate('/admin');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user && ADMIN_EMAILS.includes(session.user.email?.toLowerCase())) {
        navigate('/admin');
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

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
      window.location.href = '/admin';
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-container">
        <motion.div 
          className="admin-login-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="admin-login-header">
            <div className="admin-logo">
              <Shield size={32} />
              <span>Admin</span>
            </div>
            <h1>Connexion Administrateur</h1>
            <p>Accès restreint au panel VEGEDERM</p>
          </div>

          <div className="admin-login-form">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>Email administrateur</label>
                <input
                  type="email"
                  placeholder="admin@vegederm.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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