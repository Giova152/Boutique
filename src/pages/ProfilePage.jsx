import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, MapPin, LogOut, Edit3, Save, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

export default function ProfilePage() {
  const { user, profile, logout, updateProfile, orders: authOrders, addOrder } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
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

  async function loadOrders() {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer->>email', user?.email)
        .order('date', { ascending: false });
      if (data) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    addToast('À bientôt!', 'success');
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
      addToast('Profil mis à jour!', 'success');
    } else {
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'en cours': '#f39c12',
      'validée': '#27ae60',
      'expéditée': '#3498db',
      'livrée': '#8e44ad'
    };
    return colors[status] || '#95a5a6';
  };

  if (!user) return null;

  return (
    <main className="profile-page">
      <div className="container">
        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={40} />
            </div>
            <div className="profile-info">
              <h1>{formData.full_name || user.name || 'Client'}</h1>
              <p className="profile-email">{user.email}</p>
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
              <User size={18} /> Mon profil
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
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <span className="order-id">#{order.id}</span>
                          <span 
                            className="order-status" 
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="order-items">
                          {order.items?.slice(0, 3).map((item, i) => (
                            <span key={i} className="item-tag">{item.name} x{item.quantity}</span>
                          ))}
                          {order.items?.length > 3 && (
                            <span className="more-items">+{order.items.length - 3} autres</span>
                          )}
                        </div>
                        <div className="order-footer">
                          <span className="order-date">
                            {new Date(order.date).toLocaleDateString('fr-CA', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="order-total">{parseFloat(order.total).toFixed(2)} $</span>
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
                  <h2>Informations personnelles</h2>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}