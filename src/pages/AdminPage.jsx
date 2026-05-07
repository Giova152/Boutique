import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Tag, ShoppingCart, BarChart3, Plus, Trash2, Edit3,
  Search, Check, X, Upload, TrendingUp, Users, DollarSign, Package as PackageIcon, Truck, FileText, Shield, LogOut, Download, Printer, Calendar, TrendingDown
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { downloadInvoice, printInvoice } from '../utils/invoice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { ADMIN_EMAILS, isAdminEmail } from '../config/adminConfig';

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
    { id: 'customers', label: 'Clients', icon: Users, count: getCustomers().length },
    { id: 'stats', label: 'Stats', icon: BarChart3 }
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
                          <button onClick={() => updateStock(product.id, product.inStock - 1)}>-</button>
                          <span>{product.inStock}</span>
                          <button onClick={() => updateStock(product.id, product.inStock + 1)}>+</button>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, price: product.price, description: product.description, inStock: product.inStock, category: product.category, image: product.image || (product.images && product.images[0]) || '', isNew: product.is_new, isBestseller: product.is_bestseller, isPromo: product.is_promo, promoPrice: product.promo_price || '' }); setShowProductForm(true); }}>
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

  // Check session expiry (48 hours)
  useEffect(() => {
    const loginTime = localStorage.getItem('adminLoginTime');
    if (loginTime) {
      const expiryTime = 48 * 60 * 60 * 1000; // 48 hours in ms
      if (Date.now() - parseInt(loginTime) > expiryTime) {
        localStorage.removeItem('adminLoginTime');
        setIsAdmin(false);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    if (!ADMIN_EMAILS.includes(loginEmail.toLowerCase())) {
      setLoginError('Email non autorisé pour l\'accès administrateur');
      setIsLoggingIn(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail.toLowerCase(),
      password: loginPassword
    });

    if (authError) {
      setLoginError(authError.message);
      setIsLoggingIn(false);
      return;
    }

    if (data.user) {
      // Stocker le temps de connexion (48h d'expiration)
      localStorage.setItem('adminLoginTime', Date.now().toString());
      setIsAdmin(true);
      setIsLoggingIn(false);
    }
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