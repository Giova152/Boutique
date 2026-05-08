import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Tag, ShoppingCart, BarChart3, Plus, Trash2, Edit3,
  Search, Check, X, Upload, TrendingUp, Users, DollarSign, Package as PackageIcon, Truck, FileText, Shield, LogOut, Download, Printer, Calendar, TrendingDown, Bell, Settings, Eye, EyeOff, Loader2, Star
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { downloadInvoice, printInvoice } from '../utils/invoice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { ADMIN_EMAILS, isAdminEmail } from '../config/adminConfig';

function StockAlertsTable() {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [alertsRes, productsRes] = await Promise.all([
      supabase.from('stock_alerts').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name')
    ]);
    if (alertsRes.data) setAlerts(alertsRes.data);
    if (productsRes.data) setProducts(productsRes.data);
  }

  async function deleteAlert(id) {
    await supabase.from('stock_alerts').delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Email</th>
              <th>Active</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => {
              const product = products.find(p => p.id === alert.product_id || p.id === String(alert.product_id));
              return (
                <tr key={alert.id}>
                  <td>{product?.name || alert.product_id}</td>
                  <td>{alert.email}</td>
                  <td>{alert.active ? '✓' : '✗'}</td>
                  <td>{new Date(alert.created_at).toLocaleDateString('fr-CA')}</td>
                  <td>
                    <button className="btn-icon" onClick={() => deleteAlert(alert.id)} title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {alerts.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>Aucune alerte de stock</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onSave, addToast }) {
  const [stripeKey, setStripeKey] = useState(settings.stripePublishableKey || '');
  const [paypalId, setPaypalId] = useState(settings.paypalClientId || '');
  const [paypalSecret, setPaypalSecret] = useState('');
  const [showStripe, setShowStripe] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paypalTesting, setPaypalTesting] = useState(false);
  const [paypalVerified, setPaypalVerified] = useState(false);

  const isStripeConnected = !!stripeKey;
  const isPayPalConnected = !!paypalId;

  const saveAll = async () => {
    setSaving(true);
    const result = await onSave({
      stripe_publishable_key: stripeKey.trim(),
      paypal_client_id: paypalId.trim(),
      paypal_client_secret: paypalSecret.trim(),
      paypal_verified: paypalVerified
    });
    setSaving(false);
    if (result.success) {
      addToast('Paramètres sauvegardés!', 'success');
    } else {
      addToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  return (
    <div className="settings-panel">
      <h2 style={{ marginBottom: 24 }}>Passerelles de Paiement</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: 32, fontSize: 15 }}>
        Connectez vos comptes Stripe et PayPal pour accepter les paiements sur votre boutique.
      </p>

      <div className="gateway-cards">
        <div className="gateway-card">
          <div className="gateway-header">
            <div className="gateway-logo stripe-logo">
              <svg viewBox="0 0 60 25" width="60" height="25">
                <path fill="#635BFF" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.27 4.06-.7v2.94c-1.12.52-2.74.86-4.76.86-4.1 0-6.6-2.37-6.6-6.54 0-3.73 2.28-6.62 6.04-6.62 3.54 0 5.78 2.46 5.78 6.26 0 .74-.08 1.32-.17 1.25zm-4.98-9.08c-1.4 0-2.36.96-2.62 2.44h5.12c-.1-1.3-.94-2.44-2.5-2.44zM41.06 7.8c-1.4 0-2.36.96-2.62 2.44h5.12c-.1-1.3-.94-2.44-2.5-2.44zM32.92 13.8V6.4c0-.94-.08-1.74-.2-2.44h3.28c.08.7.12 1.42.12 2.14v7.7h2.62V7.8c0-.94-.08-1.74-.2-2.44h3.28c-.12.7-.2 1.5-.2 2.44v10.2h2.62v-2.94c.66.52 1.64.94 2.96.94 4.1 0 6.6-3.42 6.6-7.7s-2.5-7.7-6.6-7.7c-1.32 0-2.3.42-2.96.94V3.1H42.3c.12-.7.2-1.5.2-2.44s-.08-1.74-.2-2.44h-6.56c-.12.7-.2 1.5-.2 2.44v10.7h-2.62zM21.5 20.2V6.7c0-.94-.08-1.74-.2-2.44h3.28c-.12.7-.2 1.5-.2 2.44v5.8l5.44-5.8h4.18l-5.72 6.1 6.1 8.6h-4.44l-4.42-6.32-1.62 1.56v4.76H21.5zM12.06 6.4c-1.4 0-2.36.96-2.62 2.44h5.12c-.1-1.3-.94-2.44-2.5-2.44zM3.82 20.2V3.1H1.2V.66h8.06v2.44H5.44v15.1H3.82z"/>
              </svg>
            </div>
            <div className="gateway-info">
              <h3>Stripe</h3>
              <p>Paiements par carte de crédit</p>
            </div>
            <div className={`gateway-status ${isStripeConnected ? 'connected' : 'disconnected'}`}>
              {isStripeConnected ? (
                <>
                  <span className="status-dot connected-dot" /> Connecté
                </>
              ) : (
                <>
                  <span className="status-dot" /> Non connecté
                </>
              )}
            </div>
          </div>

          {isStripeConnected ? (
            <div className="gateway-connected-state">
              <div className="gateway-key-display">
                <label>Votre clé Stripe</label>
                <div className="input-with-toggle">
                  <input
                    type={showStripe ? 'text' : 'password'}
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    className="form-input"
                    readOnly
                  />
                  <button type="button" className="toggle-visibility" onClick={() => setShowStripe(!showStripe)}>
                    {showStripe ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="gateway-actions">
                <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="btn-outline-sm">
                  Gérer sur Stripe
                </a>
                <button className="btn-disconnect" onClick={() => setStripeKey('')}>
                  Déconnecter
                </button>
              </div>
            </div>
          ) : (
            <div className="gateway-connect-state">
              <p className="gateway-desc">
                Acceptez les paiements par carte de crédit (Visa, Mastercard, American Express) sur votre boutique.
              </p>
              <div className="gateway-buttons">
                <a
                  href="https://dashboard.stripe.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-connect-stripe"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.89 8.12l-1.73 1.06c-.42-.83-1.21-1.4-2.16-1.4-.95 0-1.74.57-2.16 1.4l-1.73-1.06c-.7-.43-1.5-.66-2.35-.66-1.7 0-3.2.88-4.05 2.18l1.73 1.06c.34-.76.97-1.24 1.73-1.24.77 0 1.41.49 1.73 1.24l1.73 1.06c-.85 1.3-2.35 2.18-4.05 2.18s-3.2-.88-4.05-2.18l-1.73 1.06c.85 1.3 2.35 2.18 4.05 2.18s3.2-.88 4.05-2.18l1.73-1.06c.34.76.97 1.24 1.73 1.24.77 0 1.41-.49 1.73-1.24l1.73-1.06c.85 1.3 2.35 2.18 4.05 2.18s3.2-.88 4.05-2.18l-1.73-1.06c-.85-1.3-2.35-2.18-4.05-2.18-.85 0-1.65.23-2.35.66z"/>
                  </svg>
                  Créer un compte Stripe
                </a>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-sm"
                >
                  J'ai déjà un compte
                </a>
              </div>
              <div className="gateway-key-section">
                <label>Collez votre clé Stripe ici :</label>
                <div className="input-with-toggle">
                  <input
                    type={showStripe ? 'text' : 'password'}
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    placeholder="pk_live_..."
                    className="form-input"
                  />
                  <button type="button" className="toggle-visibility" onClick={() => setShowStripe(!showStripe)}>
                    {showStripe ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="gateway-card">
          <div className="gateway-header">
            <div className="gateway-logo paypal-logo">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#003087">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
              </svg>
            </div>
            <div className="gateway-info">
              <h3>PayPal</h3>
              <p>Paiements avec son compte PayPal</p>
            </div>
            <div className={`gateway-status ${isPayPalConnected ? 'connected' : 'disconnected'}`}>
              {isPayPalConnected ? (
                <>
                  <span className="status-dot connected-dot" /> Connecté
                </>
              ) : (
                <>
                  <span className="status-dot" /> Non connecté
                </>
              )}
            </div>
          </div>

          {isPayPalConnected && paypalVerified ? (
            <div className="gateway-connected-state">
              <div className="gateway-key-display">
                <label>Votre Client ID PayPal</label>
                <div className="input-with-toggle">
                  <input
                    type={showPaypal ? 'text' : 'password'}
                    value={paypalId}
                    onChange={(e) => setPaypalId(e.target.value)}
                    className="form-input"
                    readOnly
                  />
                  <button type="button" className="toggle-visibility" onClick={() => setShowPaypal(!showPaypal)}>
                    {showPaypal ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="gateway-verified">
                <CheckCircle size={16} />
                PayPal vérifié - Vos clients peuvent payer avec PayPal
              </div>
              <div className="gateway-actions">
                <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="btn-outline-sm">
                  Gérer sur PayPal
                </a>
                <button className="btn-disconnect" onClick={() => { setPaypalId(''); setPaypalVerified(false); }}>
                  Déconnecter
                </button>
              </div>
            </div>
          ) : (
            <div className="gateway-connect-state">
              <p className="gateway-desc">
                Pour accepter les paiements PayPal, créez une application sur le Developer Dashboard de PayPal.
              </p>

              <div className="oauth-steps-compact">
                <div className="oauth-step">
                  <span className="step-n">1</span>
                  <span>
                    Allez sur <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer">
                      developer.paypal.com
                    </a> → <strong>My Apps & Credentials</strong> → <strong>Create App</strong>
                  </span>
                </div>
                <div className="oauth-step">
                  <span className="step-n">2</span>
                  <span>
                    Copiez le <strong>Client ID</strong> et <strong>Client Secret</strong> de votre app
                  </span>
                </div>
                <div className="oauth-step">
                  <span className="step-n">3</span>
                  <span>
                    Collez-les ci-dessous et cliquez sur <strong>Connecter PayPal</strong>
                  </span>
                </div>
              </div>

              <div className="gateway-key-section">
                <label>Client ID PayPal</label>
                <input
                  type={showPaypal ? 'text' : 'password'}
                  value={paypalId}
                  onChange={(e) => { setPaypalId(e.target.value); setPaypalVerified(false); }}
                  placeholder="Ex: AbcDeFgHiJkLmNoPqRsTuVwXyZ1234567890"
                  className="form-input"
                />
              </div>

              <div className="gateway-key-section">
                <label>Client Secret PayPal</label>
                <input
                  type={showPaypal ? 'text' : 'password'}
                  value={paypalSecret}
                  onChange={(e) => setPaypalSecret(e.target.value)}
                  placeholder="Ex: EFGHIJKLMNOPQRSTUVWXYZabcdefghijk"
                  className="form-input"
                />
                <button type="button" className="toggle-visibility-inline" onClick={() => setShowPaypal(!showPaypal)}>
                  {showPaypal ? <EyeOff size={14} /> : <Eye size={14} />} {showPaypal ? 'Masquer' : 'Afficher'}
                </button>
              </div>

              <button
                className="btn-connect-paypal-full"
                onClick={async () => {
                  if (!paypalId || !paypalSecret) {
                    addToast('Entrez le Client ID et le Client Secret', 'error');
                    return;
                  }
                  setPaypalTesting(true);
                  try {
                    const returnUrl = `${window.location.origin}/admin/paypal-callback?client_id=${encodeURIComponent(paypalId)}`;
                    window.location.href = `https://www.paypal.com/connect?client_id=${encodeURIComponent(paypalId)}&response_type=code&scope=openid+profile+email+address+https%3A%2F%2Furi.paypal.com%2Fservices%2Fpaypalattributes&redirect_uri=${encodeURIComponent(returnUrl)}`;
                  } catch (err) {
                    addToast('Erreur de connexion PayPal', 'error');
                    setPaypalTesting(false);
                  }
                }}
                disabled={paypalTesting}
              >
                {paypalTesting ? (
                  <><Loader2 size={18} className="spin" /> Redirection vers PayPal...</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                    </svg>
                    Connecter avec PayPal
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {(stripeKey || paypalId) && (
        <button className="btn-save-gateway" onClick={saveAll} disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      )}

      <h2 style={{ marginTop: 32, marginBottom: 24 }}>Popup de sortie</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: 32, fontSize: 15 }}>
        Configurez le code promo affiché aux visiteurs qui quitteront votre site.
      </p>
      <div className="gateway-card">
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Code promo</label>
            <input
              type="text"
              value={settings.exitPopupCode || 'VEGEDERM10'}
              onChange={(e) => onSave({ exit_popup_code: e.target.value.toUpperCase(), exit_popup_discount: settings.exitPopupDiscount })}
              placeholder="VEGEDERM10"
              className="form-input"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Réduction (%)</label>
            <input
              type="number"
              value={settings.exitPopupDiscount || 10}
              onChange={(e) => onSave({ exit_popup_code: settings.exitPopupCode, exit_popup_discount: parseInt(e.target.value) || 10 })}
              className="form-input"
              style={{ width: 100 }}
            />
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-light)' }}>
            ⟳ Les changements sont saves automatiquement
          </p>
        </div>
      </div>

      <style>{`
        .settings-panel { max-width: 800px; }
        .gateway-cards { display: flex; flex-direction: column; gap: 24px; }
        .gateway-card {
          background: white;
          border: 2px solid #eee;
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .gateway-card:hover { border-color: #ddd; }
        .gateway-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
        }
        .gateway-logo {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stripe-logo { background: #f6f5ff; }
        .paypal-logo { background: #f0f7ff; }
        .gateway-info { flex: 1; }
        .gateway-info h3 { margin: 0 0 4px; font-size: 18px; }
        .gateway-info p { margin: 0; color: var(--text-light); font-size: 14px; }
        .gateway-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        .gateway-status.disconnected { background: #fff3e0; color: #e65100; }
        .gateway-status.connected { background: #e8f5e9; color: #2e7d32; }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e65100;
        }
        .status-dot.connected-dot { background: #2e7d32; }
        .gateway-connected-state,
        .gateway-connect-state {
          padding: 24px;
        }
        .gateway-key-display { margin-bottom: 16px; }
        .gateway-key-display label,
        .gateway-key-section label {
          display: block;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 8px;
          color: var(--text-light);
        }
        .gateway-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .gateway-buttons { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .btn-connect-stripe,
        .btn-connect-paypal {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .btn-connect-stripe {
          background: #635BFF;
          color: white;
        }
        .btn-connect-stripe:hover { background: #4B44D9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,91,255,0.3); }
        .btn-connect-paypal {
          background: #0070BA;
          color: white;
        }
        .btn-connect-paypal:hover { background: #005f9e; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,112,186,0.3); }
        .btn-outline-sm {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: 2px solid #ddd;
          border-radius: 8px;
          color: var(--text);
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
        }
        .btn-outline-sm:hover { border-color: var(--primary); color: var(--primary); }
        .btn-disconnect {
          padding: 10px 18px;
          border: 2px solid #ffebee;
          border-radius: 8px;
          background: transparent;
          color: #c62828;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-disconnect:hover { background: #ffebee; }
        .gateway-desc {
          color: var(--text-light);
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 20px;
        }
        .gateway-key-section { margin-top: 16px; }
        .input-with-toggle { display: flex; gap: 8px; }
        .input-with-toggle input { flex: 1; }
        .toggle-visibility {
          padding: 0 12px;
          background: var(--bg-light);
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: var(--text-light);
        }
        .toggle-visibility:hover { color: var(--primary); }
        .form-input {
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
        }
        .form-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(29,78,56,0.1); }
        .btn-save-gateway {
          margin-top: 32px;
          padding: 16px 40px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-save-gateway:hover { background: #163d2d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(29,78,56,0.25); }
        .btn-save-gateway:disabled { opacity: 0.6; cursor: not-allowed; }
        .gateway-verified {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .oauth-steps-compact {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .oauth-step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 13px;
          color: var(--text-light);
          line-height: 1.5;
        }
        .oauth-step a {
          color: var(--primary);
          text-decoration: none;
        }
        .oauth-step a:hover { text-decoration: underline; }
        .step-n {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .gateway-key-section {
          margin-bottom: 16px;
        }
        .gateway-key-section label {
          display: block;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 8px;
          color: var(--text);
        }
        .toggle-visibility-inline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 13px;
          cursor: pointer;
          margin-top: 6px;
          padding: 0;
        }
        .toggle-visibility-inline:hover { color: var(--primary); }
        .btn-connect-paypal-full {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: #0070BA;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }
        .btn-connect-paypal-full:hover:not(:disabled) {
          background: #005f9e;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,112,186,0.35);
        }
        .btn-connect-paypal-full:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function AdminContent() {
  const fileInputRef = useRef(null);
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [customerSort, setCustomerSort] = useState('spent');
  const [customerSortDir, setCustomerSortDir] = useState('desc');

  const adminCtx = useAdmin();
  const products = adminCtx?.products || [];
  const orders = adminCtx?.orders || [];
  const promoCodes = adminCtx?.promoCodes || {};
  const getStats = adminCtx?.getStats || (() => ({}));
  const getCustomers = adminCtx?.getCustomers || (() => []);
  const updateStock = adminCtx?.updateStock || (() => {});
  const deleteProduct = adminCtx?.deleteProduct || (() => {});
  const deletePromoCode = adminCtx?.deletePromoCode || (() => {});
  const updateOrderStatus = adminCtx?.updateOrderStatus || (() => {});
  const downloadPDF = adminCtx?.downloadPDF || (() => {});
  const downloadInvoice = adminCtx?.downloadInvoice || (() => {});
  const addProduct = adminCtx?.addProduct || (() => {});
  const updateProduct = adminCtx?.updateProduct || (() => {});
  const addPromoCode = adminCtx?.addPromoCode || (() => {});
  const seedProducts = adminCtx?.seedProducts || (() => {});
  const settings = adminCtx?.settings || { stripePublishableKey: '', paypalClientId: '' };
  const saveSettings = adminCtx?.saveSettings || (() => {});

  const [activeTab, setActiveTab] = useState('products');

  const [productForm, setProductForm] = useState({
    name: '', price: '', description: '', inStock: 25,
    category: 'cremes', image: '', isNew: false, isBestseller: false,
    isPromo: false, promoPrice: ''
  });

  const [promoForm, setPromoForm] = useState({
    code: '', type: 'percentage', value: 10, description: ''
  });
  
  const [orderFilter, setOrderFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleLogout = async () => {
    localStorage.removeItem('adminLoginTime');
    await supabase.auth.signOut();
    window.location.href = '/admin';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCustomers = [...getCustomers()].sort((a, b) => {
    let comparison = 0;
    if (customerSort === 'spent') {
      comparison = a.totalSpent - b.totalSpent;
    } else if (customerSort === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (customerSort === 'date') {
      comparison = new Date(a.lastOrder || 0) - new Date(b.lastOrder || 0);
    } else if (customerSort === 'orders') {
      comparison = a.orderCount - b.orderCount;
    }
    return customerSortDir === 'desc' ? -comparison : comparison;
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setProductForm({ ...productForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      addToast('Veuillez remplir le nom et le prix', 'error');
      return;
    }

    if (!productForm.name.trim()) {
      addToast('Le nom du produit est requis', 'error');
      return;
    }
    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      addToast('Le prix du produit est requis', 'error');
      return;
    }
    if (!productForm.description.trim()) {
      addToast('La description du produit est requise', 'error');
      return;
    }

    const finalImage = imagePreview || productForm.image;
    if (!finalImage) {
      addToast('Veuillez ajouter une image pour le produit', 'error');
      return;
    }

    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      in_stock: parseInt(productForm.inStock) || 0,
      category: productForm.category,
      is_new: productForm.isNew || false,
      is_bestseller: productForm.isBestseller || false,
      is_promo: productForm.isPromo || false,
      promo_price: productForm.promoPrice ? parseFloat(productForm.promoPrice) : null,
      image: finalImage,
    };
    
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        addToast('Produit modifié avec succès', 'success');
      } else {
        const result = await addProduct({
          ...productData,
          rating: 4.5,
          reviews: 0,
          benefits: [],
          ingredients: '',
          usage: ''
        });
        console.log('Add product result:', result);
        if (result.success) {
          addToast('Produit ajouté avec succès', 'success');
        } else {
          addToast('Erreur: ' + (result.error || 'inconnue'), 'error');
        }
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setImagePreview('');
      setProductForm({ name: '', price: '', description: '', inStock: 25, category: 'cremes', image: '', isNew: false, isBestseller: false, isPromo: false, promoPrice: '' });
    } catch (err) {
      addToast('Erreur: ' + err.message, 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setImagePreview('');
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      inStock: product.inStock,
      category: product.category,
      image: product.images?.[0] || '',
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      isPromo: product.isPromo || false,
      promoPrice: product.promoPrice || ''
    });
    setShowProductForm(true);
  };

  const handleAddPromo = () => {
    if (promoForm.code && promoForm.value > 0) {
      addPromoCode(promoForm.code.toUpperCase(), promoForm.type, parseFloat(promoForm.value), promoForm.description);
      setPromoForm({ code: '', type: 'percentage', value: 10, description: '' });
    }
  };

  const tabs = [
    { id: 'products', label: 'Produits', icon: Package, count: products.length },
    { id: 'promos', label: 'Promos', icon: Tag, count: Object.keys(promoCodes).length },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart, count: orders.length },
    { id: 'reviews', label: 'Avis', icon: Star },
    { id: 'customers', label: 'Clients', icon: Users, count: getCustomers().length },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'alerts', label: 'Alertes Stock', icon: Bell },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const stats = getStats();
  const customers = getCustomers();

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel - VEGEDERM</h1>
          <div className="admin-header-actions">
            <Link to="/" className="btn-secondary">
              Voir boutique
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <div className="admin-content">
            <div className="admin-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                <Plus size={18} /> Ajouter produit
              </button>
              {products.length === 0 && (
                <button className="btn-secondary" onClick={async () => { await seedProducts(); addToast('Produits initialisés!', 'success'); }}>
                  <PackageIcon size={18} /> Initialiser produits
                </button>
              )}
            </div>

            {showProductForm && (
              <div className="product-form-modal" onClick={() => setShowProductForm(false)}>
                <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{editingProduct ? 'Modifier' : 'Ajouter'} produit</h3>
                    <button className="modal-close" onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setImagePreview('');
                      setProductForm({ name: '', price: '', description: '', inStock: 25, category: 'cremes', image: '', isNew: false, isBestseller: false, isPromo: false, promoPrice: '' });
                    }}>
                      <X size={24} />
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nom du produit</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        placeholder="Nom"
                      />
                    </div>
                    <div className="form-group">
                      <label>Prix ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        value={productForm.inStock}
                        onChange={(e) => setProductForm({...productForm, inStock: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Catégorie</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      >
                        <option value="beurre-karite">Beurre de Karité Brut</option>
                        <option value="gamme-enfants">Gamme Enfants</option>
                        <option value="exfoliants">Nos Exfoliants</option>
                        <option value="corps">Produits Corps</option>
                        <option value="savons">Nos Savons</option>
                        <option value="pieds">Soins des Pieds</option>
                        <option value="capillaires">Soins Capillaires</option>
                        <option value="eczema">Eczéma & Psoriasis</option>
                        <option value="cremes">Crèmes</option>
                        <option value="serums">Sérums</option>
                        <option value="nettoyants">Nettoyants</option>
                        <option value="masques">Masques</option>
                      </select>
                    </div>
                    <div className="form-group full">
                      <label>Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        placeholder="Description du produit"
                      />
                    </div>
                    <div className="form-group full">
                      <label>Image du produit</label>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="product-image-input"
                      />
                      <div 
                        className="image-upload-area"
                        onClick={() => document.getElementById('product-image-input').click()}
                        style={{
                          border: '2px dashed #ddd',
                          borderRadius: '12px',
                          padding: '24px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: imagePreview ? 'none' : '#fafafa',
                          minHeight: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px'
                        }}
                      >
                        {imagePreview ? (
                          <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
                            <img 
                              src={imagePreview} 
                              alt="Aperçu" 
                              style={{ 
                                width: '100%', 
                                height: '120px', 
                                objectFit: 'cover', 
                                borderRadius: '8px' 
                              }} 
                            />
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImagePreview('');
                                setProductForm({...productForm, image: ''});
                              }}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload size={32} style={{ color: '#999' }} />
                            <span style={{ color: '#666' }}>Cliquez pour télécharger une image</span>
                            <span style={{ color: '#999', fontSize: '12px' }}>ou</span>
                            <input
                              type="text"
                              value={productForm.image}
                              onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                              placeholder="Coller URL image..."
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px'
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="form-group full">
                      <div className="toggle-group">
                        <label className={`toggle-label ${productForm.isNew ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={productForm.isNew}
                            onChange={(e) => setProductForm({...productForm, isNew: e.target.checked})}
                          />
                          <span className="toggle-switch"></span>
                          <span className="toggle-text">Nouveau</span>
                        </label>
                        
                        <label className={`toggle-label ${productForm.isBestseller ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={productForm.isBestseller}
                            onChange={(e) => setProductForm({...productForm, isBestseller: e.target.checked})}
                          />
                          <span className="toggle-switch"></span>
                          <span className="toggle-text">Best-seller</span>
                        </label>
                        
                        <label className={`toggle-label ${productForm.isPromo ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={productForm.isPromo}
                            onChange={(e) => setProductForm({...productForm, isPromo: e.target.checked, promoPrice: e.target.checked ? productForm.promoPrice : ''})}
                          />
                          <span className="toggle-switch"></span>
                          <span className="toggle-text">En promo</span>
                        </label>
                      </div>
                    </div>
                    
                    {productForm.isPromo && (
                      <div className="form-group">
                        <label>Prix promo ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.promoPrice}
                          onChange={(e) => setProductForm({...productForm, promoPrice: e.target.value})}
                          placeholder="Prix réduit"
                          style={{ 
                            padding: '12px 16px',
                            border: '2px solid #1d4e38',
                            borderRadius: '10px',
                            fontSize: '15px',
                            width: '100%'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button"
                      className="btn-cancel" 
                      onClick={() => { 
                        setShowProductForm(false); 
                        setEditingProduct(null);
                        setImagePreview('');
                        setProductForm({ name: '', price: '', description: '', inStock: 25, category: 'cremes', image: '', isNew: false, isBestseller: false, isPromo: false, promoPrice: '' });
                      }}
                    >
                      Annuler
                    </button>
                    <button className="btn-primary" onClick={handleSaveProduct}>
                      {editingProduct ? 'Modifier le produit' : 'Ajouter le produit'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td className="product-cell">
                        <img src={product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/100'} alt={product.name} />
                        <span>{product.name}</span>
                      </td>
                      <td>{product.price.toFixed(2)} $</td>
                      <td>
                        <div className="stock-control">
                          <button onClick={() => updateStock(product.id, Math.max(0, product.inStock - 1), product.inStock)}>-</button>
                          <span>{product.inStock}</span>
                          <button onClick={() => updateStock(product.id, product.inStock + 1, product.inStock)}>+</button>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, price: product.price, description: product.description, inStock: product.in_stock, category: product.category, image: product.image || (product.images && product.images[0]) || '', isNew: product.is_new, isBestseller: product.is_bestseller, isPromo: product.is_promo, promoPrice: product.promo_price || '' }); setShowProductForm(true); }}>
                            <Edit3 size={16} />
                          </button>
                          {!product.is_fixed && (
                            <button className="btn-icon delete" onClick={() => deleteProduct(product.id)}>
                              <Trash2 size={16} />
                            </button>
                          )}
                          {product.is_fixed && (
                            <span className="fixed-badge" title="Produit par défaut">★</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="admin-content">
            <div className="promo-form">
              <h3>Ajouter un code promo</h3>
              <div className="promo-inputs">
                <input
                  type="text"
                  placeholder="Code (ex: SPECIAL10)"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                />
                <select
                  value={promoForm.type}
                  onChange={(e) => setPromoForm({...promoForm, type: e.target.value})}
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="shipping">Livraison gratuite</option>
                  <option value="fixed">Montant fixe ($)</option>
                </select>
                <input
                  type="number"
                  placeholder="Valeur"
                  value={promoForm.value}
                  onChange={(e) => setPromoForm({...promoForm, value: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                />
                <button className="btn-primary" onClick={handleAddPromo}>
                  <Plus size={18} /> Ajouter
                </button>
              </div>
            </div>

            <div className="promos-list">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Valeur</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(promoCodes).map(([code, promo]) => (
                    <tr key={code}>
                      <td><code className="promo-code">{code}</code></td>
                      <td>{promo.type === 'percentage' ? '%' : promo.type === 'shipping' ? 'Livraison' : '$'}</td>
                      <td>{promo.type === 'percentage' || promo.type === 'fixed' ? promo.value : '-'}</td>
                      <td>{promo.description}</td>
                      <td>
                        <button className="btn-icon delete" onClick={() => deletePromoCode(code)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-content">
            <div className="orders-filters">
              <button 
                className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`}
                onClick={() => setOrderFilter('all')}
              >
                Toutes ({orders.length})
              </button>
              <button 
                className={`filter-btn ${orderFilter === 'en cours' ? 'active' : ''}`}
                onClick={() => setOrderFilter('en cours')}
              >
                En attente ({orders.filter(o => o.status === 'en cours').length})
              </button>
              <button 
                className={`filter-btn ${orderFilter === 'confirmée' ? 'active' : ''}`}
                onClick={() => setOrderFilter('confirmée')}
              >
                Confirmées ({orders.filter(o => o.status === 'confirmée').length})
              </button>
              <button 
                className={`filter-btn ${orderFilter === 'expéditée' ? 'active' : ''}`}
                onClick={() => setOrderFilter('expéditée')}
              >
                Expéditées ({orders.filter(o => o.status === 'expéditée').length})
              </button>
              <button 
                className={`filter-btn ${orderFilter === 'livrée' ? 'active' : ''}`}
                onClick={() => setOrderFilter('livrée')}
              >
                Livrées ({orders.filter(o => o.status === 'livrée').length})
              </button>
              <button 
                className={`filter-btn ${orderFilter === 'avis donnée' ? 'active' : ''}`}
                onClick={() => setOrderFilter('avis donnée')}
              >
                Avis ({orders.filter(o => o.status === 'avis donnée').length})
              </button>
            </div>

            <div className="orders-list">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <PackageIcon size={48} />
                  <p>Aucune commande</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Date</th>
                      <th>Commande</th>
                      <th>Client</th>
                      <th>Produits</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).map(order => (
                      <React.Fragment key={order.id}>
                        <tr>
                          <td>
                            <button 
                              className="btn-expand"
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                              {expandedOrder === order.id ? '−' : '+'}
                            </button>
                          </td>
                          <td>{order.date ? new Date(order.date).toLocaleDateString('fr-CA') : '-'}</td>
                          <td>{order.id}</td>
                          <td>{order.customer?.firstName} {order.customer?.lastName}<br/><small>{order.customer?.email}</small></td>
                          <td>{order.items?.length || 0} produit(s)</td>
                          <td>{parseFloat(order.total).toFixed(2)} $</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <div className="order-actions">
                              {order.status === 'en cours' && (
                                <button
                                  className="btn-primary btn-sm"
                                  onClick={() => updateOrderStatus(order.id, 'confirmée')}
                                >
                                  <Check size={16} /> Confirmer
                                </button>
                              )}
                              {order.status === 'confirmée' && (
                                <button
                                  className="btn-primary btn-sm"
                                  onClick={() => updateOrderStatus(order.id, 'expéditée')}
                                >
                                  <Truck size={16} /> Expédier
                                </button>
                              )}
                              {order.status === 'expéditée' && (
                                <button
                                  className="btn-primary btn-sm btn-success"
                                  onClick={() => updateOrderStatus(order.id, 'livrée')}
                                >
                                  <Check size={16} /> Livrée
                                </button>
                              )}
                              <div className="invoice-actions" style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                <button
                                  className="btn-secondary btn-sm"
                                  onClick={() => downloadInvoice(order)}
                                  title="Télécharger PDF"
                                >
                                  <Download size={14} />
                                </button>
                                <button
                                  className="btn-secondary btn-sm"
                                  onClick={() => printInvoice(order)}
                                  title="Imprimer"
                                >
                                  <Printer size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {expandedOrder === order.id && (
                          <tr className="order-details">
                            <td colSpan="8">
                              <div className="order-details-content">
                                <h4>Détails de la commande</h4>
                                <div className="order-products">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="order-product-item">
                                      <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} />
                                      <div>
                                        <strong>{item.name}</strong>
                                        <span>Qté: {item.quantity} × {parseFloat(item.price).toFixed(2)} $</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="order-summary">
                                  <p>Sous-total: {parseFloat(order.subtotal || 0).toFixed(2)} $</p>
                                  {order.promo_code && <p>Code promo: {order.promo_code}</p>}
                                  {order.discount > 0 && <p>Réduction: -{parseFloat(order.discount).toFixed(2)} $</p>}
                                  <p>Livraison: {parseFloat(order.shipping || 0).toFixed(2)} $</p>
                                  <p><strong>Total: {parseFloat(order.total).toFixed(2)} $</strong></p>
                                </div>
                                <div className="order-delivery-info">
                                  <p><strong>Adresse de livraison:</strong></p>
                                  <p>{order.customer?.address}, {order.customer?.city}, {order.customer?.province} {order.customer?.postalCode}</p>
                                  <p>Téléphone: {order.customer?.phone || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="admin-content">
            <h2>Avis Clients</h2>
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="empty-state">
                  <Star size={48} />
                  <p>Aucun avis pour le moment</p>
                </div>
              ) : (
                <div className="reviews-grid">
                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-stars">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={16} fill={s <= review.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                          ))}
                        </div>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString('fr-CA')}
                        </span>
                      </div>
                      <h4>{review.title}</h4>
                      <p>{review.comment}</p>
                      <div className="review-meta">
                        <span>{review.user_name}</span>
                        {review.verified_purchase && (
                          <span className="verified-badge">Achat vérifié</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="admin-content">
            <div className="filter-bar">
              <span>Trier par:</span>
              <button 
                className={`filter-btn ${customerSort === 'spent' ? 'active' : ''}`}
                onClick={() => { setCustomerSort('spent'); setCustomerSortDir(customerSort === 'spent' && customerSortDir === 'desc' ? 'asc' : 'desc'); }}
              >
                Total dépensé {customerSort === 'spent' && (customerSortDir === 'desc' ? '↓' : '↑')}
              </button>
              <button 
                className={`filter-btn ${customerSort === 'orders' ? 'active' : ''}`}
                onClick={() => { setCustomerSort('orders'); setCustomerSortDir(customerSort === 'orders' && customerSortDir === 'desc' ? 'asc' : 'desc'); }}
              >
                Nb commandes {customerSort === 'orders' && (customerSortDir === 'desc' ? '↓' : '↑')}
              </button>
              <button 
                className={`filter-btn ${customerSort === 'name' ? 'active' : ''}`}
                onClick={() => { setCustomerSort('name'); setCustomerSortDir(customerSort === 'name' && customerSortDir === 'asc' ? 'desc' : 'asc'); }}
              >
                Nom {customerSort === 'name' && (customerSortDir === 'desc' ? '↓' : '↑')}
              </button>
              <button 
                className={`filter-btn ${customerSort === 'date' ? 'active' : ''}`}
                onClick={() => { setCustomerSort('date'); setCustomerSortDir(customerSort === 'date' && customerSortDir === 'desc' ? 'asc' : 'desc'); }}
              >
                Dernière commande {customerSort === 'date' && (customerSortDir === 'desc' ? '↓' : '↑')}
              </button>
            </div>
            
            <div className="customers-list">
              {sortedCustomers.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>Aucun client</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Email</th>
                      <th>Commandes</th>
                      <th>Total dépensé</th>
                      <th>Dernière commande</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCustomers.map(customer => (
                      <tr key={customer.email}>
                        <td className="customer-name">{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.orderCount}</td>
                        <td className="customer-spent">{customer.totalSpent.toFixed(2)} $</td>
                        <td>{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString('fr-CA') : '-'}</td>
                        <td>
                          <div className="customer-actions">
                            <button className="btn-text" onClick={() => downloadPDF(customer.orders[customer.orders.length - 1])}>
                              <FileText size={14} /> Dernière facture
                            </button>
                            <button className="btn-text" onClick={() => customer.orders.forEach(order => downloadPDF(order))}>
                              <FileText size={14} /> Toutes factures
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="admin-content">
            <h2>Alertes de Stock</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
              Clients enregistrés pour être notifiés quand un produit revient en stock.
            </p>
            <StockAlertsTable />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="admin-content">
            <SettingsPanel settings={settings} onSave={saveSettings} addToast={addToast} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="admin-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><Eye /></div>
                <div className="stat-info">
                  <span className="stat-label">Aujourd'hui</span>
                  <span className="stat-value">{stats.todayVisits}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><TrendingUp /></div>
                <div className="stat-info">
                  <span className="stat-label">Ce mois</span>
                  <span className="stat-value">{stats.monthVisits}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Users /></div>
                <div className="stat-info">
                  <span className="stat-label">Total visites</span>
                  <span className="stat-value">{stats.totalVisits}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><ShoppingCart /></div>
                <div className="stat-info">
                  <span className="stat-label">Commandes</span>
                  <span className="stat-value">{stats.totalOrders}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><DollarSign /></div>
                <div className="stat-info">
                  <span className="stat-label">Revenus</span>
                  <span className="stat-value">{stats.totalRevenue.toFixed(2)} $</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Package /></div>
                <div className="stat-info">
                  <span className="stat-label">Produits</span>
                  <span className="stat-value">{products.length}</span>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <h3><Calendar size={20} /> Analytiques détaillées</h3>
              
              <div className="charts-grid">
                {/* Commandes par mois */}
                <div className="chart-card">
                  <h4>Commandes par mois</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.monthlyOrders || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#666" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                        <Tooltip 
                          contentStyle={{ borderRadius: 8, border: '1px solid #eee' }}
                          formatter={(value) => [`${value} commandes`, 'Total']}
                        />
                        <Bar dataKey="orders" fill="#1d4e38" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenus par mois */}
                <div className="chart-card">
                  <h4>Revenus mensuels ($)</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={stats.monthlyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#666" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#666" tickFormatter={(v) => `${v}$`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: 8, border: '1px solid #eee' }}
                          formatter={(value) => [`${value.toFixed(2)} $`, 'Revenus']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#c9a86c" fill="#c9a86c" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statut des commandes */}
                <div className="chart-card">
                  <h4>Statut des commandes</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'En cours', value: orders.filter(o => o.status === 'en cours').length, color: '#f39c12' },
                            { name: 'Confirmées', value: orders.filter(o => o.status === 'confirmée').length, color: '#3498db' },
                            { name: 'Expédiées', value: orders.filter(o => o.status === 'expéditée').length, color: '#9b59b6' },
                            { name: 'Livrées', value: orders.filter(o => o.status === 'livrée').length, color: '#27ae60' }
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'En cours', value: orders.filter(o => o.status === 'en cours').length, color: '#f39c12' },
                            { name: 'Confirmées', value: orders.filter(o => o.status === 'confirmée').length, color: '#3498db' },
                            { name: 'Expédiées', value: orders.filter(o => o.status === 'expéditée').length, color: '#9b59b6' },
                            { name: 'Livrées', value: orders.filter(o => o.status === 'livrée').length, color: '#27ae60' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top 5 produits */}
                <div className="chart-card">
                  <h4>Top 5 Bestsellers</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.topProducts || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#666" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} stroke="#666" />
                        <Tooltip 
                          contentStyle={{ borderRadius: 8, border: '1px solid #eee' }}
                          formatter={(value) => [`${value} ventes`, 'Ventes']}
                        />
                        <Bar dataKey="sales" fill="#1d4e38" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Visites quotidiennes */}
                <div className="chart-card chart-full">
                  <h4>Visites quotidiennes (30 derniers jours)</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={stats.dailyChart || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#666" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                        <Tooltip 
                          contentStyle={{ borderRadius: 8, border: '1px solid #eee' }}
                          formatter={(value) => [`${value} visites`, 'Total']}
                        />
                        <Line type="monotone" dataKey="visits" stroke="#1d4e38" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check session - super simple
  useEffect(() => {
    async function checkAuth() {
      try {
        // Step 1: Check localStorage first (faster)
        const savedTime = localStorage.getItem('adminLoginTime');
        const savedEmail = localStorage.getItem('adminEmail');
        
        // Step 2: Try Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        const isValidSession = session?.user && ADMIN_EMAILS.includes(session.user.email?.toLowerCase());
        const isValidLocal = savedTime && savedEmail && 
          ADMIN_EMAILS.includes(savedEmail.toLowerCase()) &&
          (Date.now() - parseInt(savedTime)) < (7 * 24 * 60 * 60 * 1000);
        
        if (isValidSession || isValidLocal) {
          // Restore or keep session
          if (session?.user) {
            localStorage.setItem('adminLoginTime', Date.now().toString());
            localStorage.setItem('adminEmail', session.user.email.toLowerCase());
          }
          setLoginEmail(session?.user?.email?.toLowerCase() || savedEmail);
          setIsAdmin(true);
        } else {
          // Clear everything on invalid
          localStorage.removeItem('adminLoginTime');
          localStorage.removeItem('adminEmail');
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
      setLoading(false);
    }

    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const email = loginEmail.toLowerCase().trim();
    
    if (!ADMIN_EMAILS.includes(email)) {
      setLoginError('Email non autorisé pour l\'accès administrateur');
      setIsLoggingIn(false);
      return;
    }

    // Simple login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: loginPassword
    });

    if (error) {
      setLoginError(error.message);
      setIsLoggingIn(false);
      return;
    }

    if (data.user) {
      // Save session
      localStorage.setItem('adminLoginTime', Date.now().toString());
      localStorage.setItem('adminEmail', email);
      setIsAdmin(true);
      addToast('Connexion admin réussie !', 'success');
    }
    setIsLoggingIn(false);
  };

  if (loading) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-box">
            <h1>Chargement...</h1>
          </div>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-container">
          <motion.div 
            className="admin-login-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="admin-login-header">
              <div className="admin-logo">
                <Shield size={32} />
                <span>Admin</span>
              </div>
              <h1>Connexion Administrateur</h1>
              <p>Accès restreint au panel VEGEDERM</p>
            </div>
            <form onSubmit={handleLogin} className="admin-login-form">
              {loginError && <div className="error-message">{loginError}</div>}
              <div className="form-group">
                <label>Email administrateur</label>
                <input
                  type="email"
                  placeholder="admin@vegederm.com"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={isLoggingIn}>
                {isLoggingIn ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    );
  }

  return <AdminContent />;
}