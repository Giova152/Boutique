import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, MapPin, LogOut, Edit3, Save, X, ChevronRight, Clock, CheckCircle, Truck, Home, Eye, Download, Printer, AlertCircle, Mail, Loader2, Star, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { downloadInvoice, printInvoice } from '../utils/invoice';
import SEO from '../components/layout/SEO';

export default function ProfilePage() {
  const { user, profile, logout, updateProfile, emailConfirmed, confirmationMessage, clearConfirmationMessage } = useAuth();
  const { userPoints, tier, totalEarned, totalRedeemed, transactions } = useLoyalty();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    province: 'Québec',
    postal_code: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        province: profile.province || 'Québec',
        postal_code: profile.postal_code || ''
      });
    }
  }, [user, profile]);

  useEffect(() => {
    if (confirmationMessage) {
      if (confirmationMessage.type === 'success') {
        addToast(confirmationMessage.title + ': ' + confirmationMessage.text, 'success');
      } else if (confirmationMessage.type === 'error') {
        addToast(confirmationMessage.title + ': ' + confirmationMessage.text, 'error');
      }
    }
  }, [confirmationMessage]);

  async function loadOrders() {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });
      if (data) {
        const userOrders = data.filter(o => o.customer?.email === user?.email);
        setOrders(userOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    addToast('À bientôt !', 'success');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user?.id);

    if (!error) {
      await updateProfile(formData);
      setIsEditing(false);
      addToast('Profil mis à jour !', 'success');
    } else {
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    setSendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      if (error) throw error;
      addToast('Email de confirmation renvoyé ! Vérifiez votre boîte de réception.', 'success');
    } catch (err) {
      console.error('Resend error:', err);
      addToast('Erreur lors de l\'envoi de l\'email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = {
      'en cours': 0,
      'confirmée': 1,
      'expéditée': 2,
      'livrée': 3
    };
    return steps[status] ?? 0;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'en cours': { color: '#f39c12', bgColor: 'rgba(243, 156, 18, 0.1)', label: 'En cours de traitement' },
      'confirmée': { color: '#3498db', bgColor: 'rgba(52, 152, 219, 0.1)', label: 'Commande confirmée' },
      'expéditée': { color: '#9b59b6', bgColor: 'rgba(155, 89, 182, 0.1)', label: 'Expédiée' },
      'livrée': { color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.1)', label: 'Livrée' }
    };
    return configs[status] || configs['en cours'];
  };

  const getStatusIcon = (step, currentStep) => {
    if (step < currentStep) return <CheckCircle size={16} />;
    if (step === currentStep) return <Clock size={16} />;
    return <div className="step-circle"></div>;
  };

  if (!user) return null;

  return (
    <main className="profile-page">
      <SEO
        title={language === 'fr' ? 'Mon Compte' : 'My Account'}
        path="/profile"
      />
      <div className="container">
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!emailConfirmed && (
            <div className="email-warning-banner">
              <AlertCircle size={20} />
              <div className="warning-content">
                <strong>Email non confirmé</strong>
                <p>Veuillez confirmer votre email pour pouvoir passer des commandes. Vérifiez votre boîte de réception ou cliquez ci-dessous.</p>
              </div>
              <button
                className="btn-resend"
                onClick={handleResendConfirmation}
                disabled={sendingEmail}
              >
                {sendingEmail ? <Loader2 size={16} className="spin" /> : <Mail size={16} />}
                {sendingEmail ? 'Envoi...' : 'Renvoyer l\'email'}
              </button>
            </div>
          )}

          <div className="profile-header">
            <div className="profile-avatar">
              <User size={40} />
            </div>
            <div className="profile-info">
              <h1>{formData.full_name || user.name || 'Client'}</h1>
              <p className="profile-email">{user.email}</p>
              {emailConfirmed ? (
                <span className="email-verified">
                  <CheckCircle size={14} /> Email vérifié
                </span>
              ) : (
                <span className="email-not-verified">
                  <AlertCircle size={14} /> Email non vérifié
                </span>
              )}
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} /> Déconnexion
            </button>
          </div>

          <div className="profile-tabs">
            <button 
              className={`tab ${activeTab === 'orders' ? 'active' : ''}`} 
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} /> Commandes
              <span className="tab-badge">{orders.length}</span>
            </button>
            <button 
              className={`tab ${activeTab === 'info' ? 'active' : ''}`} 
              onClick={() => setActiveTab('info')}
            >
              <MapPin size={18} /> Livraison
            </button>
            <button 
              className={`tab ${activeTab === 'loyalty' ? 'active' : ''}`} 
              onClick={() => setActiveTab('loyalty')}
            >
              <Star size={18} /> Fidélité
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                className="tab-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {loading ? (
                  <div className="loading">Chargement...</div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <Package size={48} />
                    <p>Vous n'avez pas encore de commande</p>
                    <Link to="/boutique" className="btn-primary">Découvrir la boutique</Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div 
                        key={order.id} 
                        className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      >
                        <div className="order-header">
                          <div className="order-info">
                            <span className="order-id">Commande #{order.id}</span>
                            <span className="order-date">
                              {new Date(order.date).toLocaleDateString('fr-CA', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div 
                            className="order-status"
                            style={{ 
                              backgroundColor: getStatusConfig(order.status).bgColor,
                              color: getStatusConfig(order.status).color
                            }}
                          >
                            {getStatusConfig(order.status).label}
                          </div>
                        </div>

                        <div className="order-summary">
                          <div className="order-items-preview">
                            {order.items?.slice(0, 2).map((item, i) => (
                              <span key={i} className="item-tag">{item.name} x{item.quantity}</span>
                            ))}
                            {order.items?.length > 2 && (
                              <span className="more-items">+{order.items.length - 2} autres</span>
                            )}
                          </div>
                          <span className="order-total">{parseFloat(order.total).toFixed(2)} $</span>
                        </div>

                        <AnimatePresence>
                          {selectedOrder?.id === order.id && (
                            <motion.div 
                              className="order-details"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                            >
                              <div className="order-actions-client">
                                <button 
                                  className="btn-outline btn-sm"
                                  onClick={(e) => { e.stopPropagation(); downloadInvoice(order); }}
                                >
                                  <Download size={14} /> Facture
                                </button>
                                <button 
                                  className="btn-outline btn-sm"
                                  onClick={(e) => { e.stopPropagation(); printInvoice(order); }}
                                >
                                  <Printer size={14} /> Imprimer
                                </button>
                              </div>

                              <div className="order-timeline">
                                <h4>Suivi de commande</h4>
                                <div className="timeline-steps">
                                  <div className={`timeline-step ${getStatusStep(order.status) >= 0 ? 'active' : ''}`}>
                                    <div className="step-icon">{getStatusIcon(0, getStatusStep(order.status))}</div>
                                    <div className="step-info">
                                      <span className="step-title">En cours</span>
                                      <span className="step-time">Commande reçue</span>
                                    </div>
                                  </div>
                                  <div className={`timeline-step ${getStatusStep(order.status) >= 1 ? 'active' : ''}`}>
                                    <div className="step-icon">{getStatusIcon(1, getStatusStep(order.status))}</div>
                                    <div className="step-info">
                                      <span className="step-title">Confirmée</span>
                                      <span className="step-time">Paiement vérifié</span>
                                    </div>
                                  </div>
                                  <div className={`timeline-step ${getStatusStep(order.status) >= 2 ? 'active' : ''}`}>
                                    <div className="step-icon">{getStatusIcon(2, getStatusStep(order.status))}</div>
                                    <div className="step-info">
                                      <span className="step-title">Expéditée</span>
                                      <span className="step-time">{order.shipped_at ? `Le ${new Date(order.shipped_at).toLocaleDateString('fr-CA')}` : 'En attente'}</span>
                                    </div>
                                  </div>
                                  <div className={`timeline-step ${getStatusStep(order.status) >= 3 ? 'active' : ''}`}>
                                    <div className="step-icon">{getStatusIcon(3, getStatusStep(order.status))}</div>
                                    <div className="step-info">
                                      <span className="step-title">Livrée</span>
                                      <span className="step-time">{order.delivered_at ? `Le ${new Date(order.delivered_at).toLocaleDateString('fr-CA')}` : 'En attente'}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {order.status_history && order.status_history.length > 0 && (
                                  <div className="status-history">
                                    <h5>Historique</h5>
                                    {order.status_history.map((entry, idx) => (
                                      <div key={idx} className="history-entry">
                                        <span className="history-status">{entry.status}</span>
                                        <span className="history-date">
                                          {new Date(entry.timestamp).toLocaleString('fr-CA')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="order-shipping-info">
                                <h4><MapPin size={16} /> Adresse de livraison</h4>
                                <div className="shipping-address">
                                  <p>{order.customer?.full_name || order.customer?.name}</p>
                                  <p>{order.customer?.address}</p>
                                  <p>{order.customer?.city}, {order.customer?.province} {order.customer?.postal_code}</p>
                                  <p>{order.customer?.phone}</p>
                                </div>
                              </div>

                              <div className="order-items-list">
                                <h4>Articles commandés</h4>
                                {order.items?.map((item, i) => (
                                  <div key={i} className="order-item">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-qty">x{item.quantity}</span>
                                    <span className="item-price">{(item.price * item.quantity).toFixed(2)} $</span>
                                  </div>
                                ))}
                                <div className="order-totals">
                                  <div className="total-row">
                                    <span>Sous-total</span>
                                    <span>{parseFloat(order.subtotal).toFixed(2)} $</span>
                                  </div>
                                  {order.promo_code && (
                                    <div className="total-row">
                                      <span>Code promo</span>
                                      <span>{order.promo_code}</span>
                                    </div>
                                  )}
                                  {order.discount > 0 && (
                                    <div className="total-row discount">
                                      <span>Réduction</span>
                                      <span>-{parseFloat(order.discount).toFixed(2)} $</span>
                                    </div>
                                  )}
                                  <div className="total-row">
                                    <span>Livraison</span>
                                    <span>{parseFloat(order.shipping || 0).toFixed(2)} $</span>
                                  </div>
                                  <div className="total-row total">
                                    <span>Total</span>
                                    <span>{parseFloat(order.total).toFixed(2)} $</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="order-expand">
                          <Eye size={16} /> 
                          {selectedOrder?.id === order.id ? 'Masquer détails' : 'Voir détails'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'info' && (
              <motion.div 
                key="info"
                className="tab-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="info-header">
                  <h2>Informations de livraison</h2>
                  {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      <Edit3 size={16} /> Modifier
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                        <X size={16} /> Annuler
                      </button>
                      <button className="save-btn" onClick={handleSaveProfile}>
                        <Save size={16} /> Enregistrer
                      </button>
                    </div>
                  )}
                </div>

                <div className="info-form">
                  <div className="form-group">
                    <label>Nom complet</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Votre nom"
                    />
                  </div>

                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+1 514-000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Adresse</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="123 Rue..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Ville</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Montréal"
                      />
                    </div>
                    <div className="form-group">
                      <label>Province</label>
                      <select
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        disabled={!isEditing}
                      >
                        <option>Québec</option>
                        <option>Ontario</option>
                        <option>Colombie-Britannique</option>
                        <option>Alberta</option>
                        <option>Manitoba</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Code postal</label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        disabled={!isEditing}
                        placeholder="H2X 1A1"
                      />
                    </div>
                  </div>

                  <div className="saved-address-preview">
                    <h3><Home size={18} /> Adresse enregistrée</h3>
                    <p>{formData.full_name || 'Nom non défini'}</p>
                    <p>{formData.address || 'Adresse non définie'}</p>
                    <p>{formData.city || 'Ville non définie'}, {formData.province || 'Province'} {formData.postal_code || 'XXX XXX'}</p>
                    <p>{formData.phone || 'Téléphone non défini'}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'loyalty' && (
              <motion.div
                key="loyalty"
                className="tab-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="loyalty-overview">
                  <div className="loyalty-card">
                    <div className="loyalty-points">
                      <Gift size={32} />
                      <div>
                        <span className="points-number">{userPoints}</span>
                        <span className="points-label">points disponibles</span>
                      </div>
                    </div>
                    <div className={`loyalty-tier tier-${tier}`}>
                      <Star size={16} /> Statut {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </div>
                  </div>

                  <div className="loyalty-stats">
                    <div className="stat-item">
                      <span className="stat-value">{totalEarned}</span>
                      <span className="stat-label">Points gagnés</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{totalRedeemed}</span>
                      <span className="stat-label">Points échangés</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{totalEarned - totalRedeemed}</span>
                      <span className="stat-label">Solde</span>
                    </div>
                  </div>

                  <div className="loyalty-benefits">
                    <h4>Vos avantages {tier.charAt(0).toUpperCase() + tier.slice(1)}</h4>
                    <ul>
                      <li>1$ dépensé = 1 point fidélité</li>
                      <li>500 points = 5$ de réduction</li>
                      <li>Tier Bronze : accès au programme</li>
                      <li>Tier Argent (500 pts) : -5% sur vos commandes</li>
                      <li>Tier Or (2000 pts) : -10% + livraison gratuite</li>
                      <li>Tier Platine (5000 pts) : -15% + cadeau d'anniversaire</li>
                    </ul>
                  </div>

                  {transactions.length > 0 && (
                    <div className="loyalty-transactions">
                      <h4>Historique des points</h4>
                      {transactions.slice(0, 5).map(txn => (
                        <div key={txn.id} className="txn-row">
                          <div>
                            <span className="txn-desc">{txn.description}</span>
                            <span className="txn-date">{new Date(txn.created_at).toLocaleDateString('fr-CA')}</span>
                          </div>
                          <span className={`txn-points ${txn.type === 'earn' ? 'positive' : 'negative'}`}>
                            {txn.type === 'earn' ? '+' : '-'}{txn.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
