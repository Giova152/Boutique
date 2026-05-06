import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, Tag, ShoppingCart, BarChart3, Plus, Trash2, Edit3, 
  Search, ChevronDown, ChevronUp, Check, X, Eye, RefreshCw,
  TrendingUp, Users, DollarSign, Package as PackageIcon
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    products, promoCodes, orders, getStats,
    addProduct, updateProduct, deleteProduct, updateStock,
    addPromoCode, deletePromoCode, updateOrderStatus
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '', price: '', description: '', inStock: 25,
    category: 'cremes', image: '', isNew: false, isBestseller: false
  });

  const [promoForm, setPromoForm] = useState({
    code: '', type: 'percentage', value: 10, description: ''
  });

  const stats = getStats();
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...productForm,
        price: parseFloat(productForm.price),
        inStock: parseInt(productForm.inStock),
        images: productForm.image ? [productForm.image] : products.find(p => p.id === editingProduct.id)?.images || []
      });
    } else {
      addProduct({
        ...productForm,
        price: parseFloat(productForm.price),
        inStock: parseInt(productForm.inStock),
        images: productForm.image ? [productForm.image] : ['https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400'],
        rating: 4.5,
        reviews: 0,
        benefits: [],
        ingredients: '',
        usage: ''
      });
    }
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({ name: '', price: '', description: '', inStock: 25, category: 'cremes', image: '', isNew: false, isBestseller: false });
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
    { id: 'stats', label: 'Stats', icon: BarChart3 }
  ];

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel - VEGEDERM</h1>
          <Link to="/" className="btn-secondary">Voir boutique</Link>
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
            </div>

            {showProductForm && (
              <div className="product-form-modal">
                <div className="form-modal-content">
                  <h3>{editingProduct ? 'Modifier' : 'Ajouter'} produit</h3>
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
                        <option value="cremes">Crèmes</option>
                        <option value="serums">Sérums</option>
                        <option value="nettoyants">Nettoyants</option>
                        <option value="masques">Masques</option>
                        <option value="beurre-karite">Beurre de Karité</option>
                        <option value="gamme-enfants">Gamme Enfants</option>
                        <option value="exfoliants">Exfoliants</option>
                        <option value="corps">Corps</option>
                        <option value="savons">Savons</option>
                        <option value="pieds">Pieds</option>
                        <option value="capillaires">Capillaires</option>
                        <option value="eczema">Eczéma</option>
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
                      <label>Image URL</label>
                      <input
                        type="text"
                        value={productForm.image}
                        onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={productForm.isNew}
                          onChange={(e) => setProductForm({...productForm, isNew: e.target.checked})}
                        />
                        Nouveau
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={productForm.isBestseller}
                          onChange={(e) => setProductForm({...productForm, isBestseller: e.target.checked})}
                        />
                        Best-seller
                      </label>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={() => { setShowProductForm(false); setEditingProduct(null); }}>Annuler</button>
                    <button className="btn-primary" onClick={handleSaveProduct}>Enregistrer</button>
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
                        <img src={product.images[0]} alt={product.name} />
                        <span>{product.name}</span>
                      </td>
                      <td>{product.price.toFixed(2)} $</td>
                      <td>
                        <div className="stock-control">
                          <button onClick={() => updateStock(product.id, product.inStock - 1)}>-</button>
                          <span>{product.inStock}</span>
                          <button onClick={() => updateStock(product.id, product.inStock + 1)}>+</button>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, price: product.price, description: product.description, inStock: product.inStock, category: product.category, image: product.images[0], isNew: product.isNew, isBestseller: product.isBestseller }); setShowProductForm(true); }}>
                            <Edit3 size={16} />
                          </button>
                          <button className="btn-icon delete" onClick={() => deleteProduct(product.id)}>
                            <Trash2 size={16} />
                          </button>
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
              <button className="filter-btn active">Toutes ({orders.length})</button>
              <button className="filter-btn">En attente ({orders.filter(o => o.status === 'en cours').length})</button>
              <button className="filter-btn">Validées ({orders.filter(o => o.status === 'validée').length})</button>
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
                      <th>Commande</th>
                      <th>Client</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer?.firstName} {order.customer?.lastName}</td>
                        <td>{order.total?.toFixed(2)} $</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.status === 'en cours' && (
                            <button
                              className="btn-primary btn-sm"
                              onClick={() => updateOrderStatus(order.id, 'validée')}
                            >
                              <Check size={16} /> Valider
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
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
          </div>
        )}
      </div>
    </main>
  );
}