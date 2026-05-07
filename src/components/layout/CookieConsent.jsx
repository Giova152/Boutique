import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      padding: '20px',
      zIndex: 1000,
      animation: 'slideUp 0.4s ease'
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <p style={{ flex: 1, fontSize: 14, color: 'var(--text)', minWidth: 280 }}>
          Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{' '}
          <Link to="/confidentialite" style={{ color: 'var(--primary)' }}>politique de confidentialité</Link>.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={decline}
            style={{
              padding: '10px 20px',
              border: '2px solid var(--primary)',
              background: 'transparent',
              color: 'var(--primary)',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Refuser
          </button>
          <button
            onClick={accept}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
