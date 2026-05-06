import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout, orders } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <main className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <div className="profile-info">
            <h1>Bienvenue, {user.name}</h1>
            <p>{user.email}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Déconnexion
          </button>
        </div>

        <div className="profile-tabs">
          <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <Package size={20} /> Mes commandes
          </button>
          <button className={`tab ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
            <MapPin size={20} /> Mes adresses
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Mes commandes</h2>
              {orders.length === 0 ? (
                <div className="empty-orders">
                  <p>Vous n'avez pas encore passé de commande.</p>
                  <Link to="/boutique" className="btn-primary">Découvrir la boutique</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">{order.id}</span>
                        <span className="order-status">{order.status}</span>
                      </div>
                      <div className="order-items">
                        {order.items?.slice(0, 2).map(item => (
                          <span key={item.id}>{item.name} x{item.quantity}</span>
                        ))}
                        {order.items?.length > 2 && <span>... +{order.items.length - 2} autres</span>}
                      </div>
                      <div className="order-total">
                        <span>Total: {order.total?.toFixed(2)} $</span>
                        <span>{new Date(order.date).toLocaleDateString('fr-CA')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="addresses-section">
              <h2>Mes adresses</h2>
              {user.addresses?.length === 0 ? (
                <p className="empty-addresses">Vous n'avez pas d'adresse enregistrée.</p>
              ) : (
                <div className="addresses-list">
                  {user.addresses?.map(addr => (
                    <div key={addr.id} className="address-card">
                      <p>{addr.address}</p>
                      <p>{addr.city}, {addr.province} {addr.postalCode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}