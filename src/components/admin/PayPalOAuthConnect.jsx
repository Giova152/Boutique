import { useState } from 'react';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PayPalOAuthConnect({ clientId, secret, onConnected, onDisconnected }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const isConfigured = clientId && secret;

  const handleConnect = () => {
    if (!isConfigured) {
      setError('Entrez d\'abord le Client ID et le Secret PayPal');
      return;
    }

    setIsConnecting(true);
    setError('');

    const returnUrl = `${window.location.origin}/admin/paypal-callback`;
    const authUrl = `https://www.paypal.com/connect?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=openid+profile+email+address+https%3A%2F%2Furi.paypal.com%2Fservices%2Fpaypalattributes&redirect_uri=${encodeURIComponent(returnUrl)}`;

    window.location.href = authUrl;
  };

  return (
    <div className="paypal-oauth-connect">
      <div className="oauth-info">
        <h4>Connexion PayPal OAuth</h4>
        <p>
          Pour activer les paiements PayPal, vous devez créer une application PayPal et connecter votre compte.
        </p>

        <div className="oauth-steps">
          <div className="step">
            <span className="step-num">1</span>
            <div>
              <strong>Créer une app PayPal</strong>
              <p>
                Allez sur{' '}
                <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer">
                  developer.paypal.com
                  <ExternalLink size={12} />
                </a>{' '}
                → <strong>My Apps & Credentials</strong> → <strong>Create App</strong>
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <div>
              <strong>Configurer l'app</strong>
              <p>
                Choisissez <strong>Merchant</strong> ou <strong>Standard</strong>.
                Ajoutez cette URL comme <strong>Return URL</strong> :
              </p>
              <code className="return-url">{window.location.origin}/admin/paypal-callback</code>
            </div>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <div>
              <strong>Copier les identifiants</strong>
              <p>Copiez le <strong>Client ID</strong> et le <strong>Client Secret</strong> depuis le dashboard PayPal.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">4</span>
            <div>
              <strong>Coller et Connecter</strong>
              <p>Entrez vos identifiants ci-dessous et cliquez sur le bouton vert.</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="oauth-error">
          <XCircle size={16} /> {error}
        </div>
      )}

      <button
        className="btn-connect-paypal-oauth"
        onClick={handleConnect}
        disabled={isConnecting || !isConfigured}
      >
        {isConnecting ? (
          <>
            <Loader2 size={18} className="spin" /> Redirection vers PayPal...
          </>
        ) : onConnected ? (
          <>
            <CheckCircle size={18} /> PayPal Connecté
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
            </svg>
            Connecter avec PayPal
          </>
        )}
      </button>

      {onConnected && (
        <button
          className="btn-disconnect-paypal"
          onClick={onDisconnected}
        >
          Déconnecter PayPal
        </button>
      )}

      <style>{`
        .paypal-oauth-connect {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 24px;
          margin-top: 20px;
        }
        .oauth-info h4 {
          margin: 0 0 12px;
          font-size: 16px;
          color: var(--text);
        }
        .oauth-info > p {
          margin: 0 0 20px;
          color: var(--text-light);
          font-size: 14px;
          line-height: 1.5;
        }
        .oauth-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        .step {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .step strong {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .step p {
          margin: 0;
          font-size: 13px;
          color: var(--text-light);
          line-height: 1.5;
        }
        .step a {
          color: var(--primary);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .step a:hover { text-decoration: underline; }
        .return-url {
          display: block;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          color: var(--primary);
          margin-top: 6px;
          word-break: break-all;
          font-family: monospace;
        }
        .oauth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .btn-connect-paypal-oauth {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px 24px;
          background: #0070BA;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-connect-paypal-oauth:hover:not(:disabled) {
          background: #005f9e;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,112,186,0.3);
        }
        .btn-connect-paypal-oauth:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-disconnect-paypal {
          display: block;
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          background: transparent;
          border: 2px solid #ffebee;
          border-radius: 8px;
          color: #c62828;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-disconnect-paypal:hover {
          background: #ffebee;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
