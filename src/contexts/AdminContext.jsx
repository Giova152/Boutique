import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promoCodes, setPromoCodes] = useState({});
  const [stats, setStats] = useState({ visits: [], dailyVisits: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsRes, ordersRes, promoRes, statsRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').order('date', { ascending: false }),
        supabase.from('promo_codes').select('*'),
        supabase.from('stats').select('*').eq('id', 1).single()
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (promoRes.data) {
        const codes = {};
        promoRes.data.forEach(p => codes[p.code] = p);
        setPromoCodes(codes);
      }
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  }

  const addProduct = async (product) => {
    const newProduct = { ...product, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (!error && data) {
      setProducts(prev => [...prev, data[0]]);
    }
    return { success: !error };
  };

  const updateProduct = async (id, updates) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return { success: true };
    }
    return { success: false, error };
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateStock = async (id, inStock) => {
    await supabase.from('products').update({ in_stock: inStock }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, in_stock: inStock } : p));
  };

  const addPromoCode = async (code, type, value, description) => {
    const { error } = await supabase.from('promo_codes').insert([{ code, type, value, description }]);
    if (!error) {
      setPromoCodes(prev => ({ ...prev, [code]: { code, type, value, description } }));
    }
  };

  const deletePromoCode = async (code) => {
    const { error } = await supabase.from('promo_codes').delete().eq('code', code);
    if (!error) {
      const newCodes = { ...promoCodes };
      delete newCodes[code];
      setPromoCodes(newCodes);
    }
  };

  const addOrder = async (order) => {
    const newOrder = { ...order, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('orders').insert([newOrder]).select();
    if (!error && data) {
      setOrders(prev => [data[0], ...prev]);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const updates = { status };
    if (status === 'expéditée') updates.shipped_at = new Date().toISOString();
    if (status === 'livrée') updates.delivered_at = new Date().toISOString();
    
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    }
  };

  const recordVisit = async () => {
    const today = new Date().toISOString().split('T')[0];
    const currentStats = stats;
    const newVisits = [...(currentStats.visits || []), new Date().toISOString()];
    const newDailyVisits = {
      ...(currentStats.daily_visits || {}),
      [today]: (currentStats.daily_visits?.[today] || 0) + 1
    };
    
    await supabase.from('stats').update({
      visits: newVisits,
      daily_visits: newDailyVisits
    }).eq('id', 1);
    
    setStats({ ...currentStats, visits: newVisits, daily_visits: newDailyVisits });
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    const visits = stats.visits || [];
    const dailyVisits = stats.daily_visits || {};
    
    const todayVisits = dailyVisits[today] || 0;
    const monthVisits = Object.entries(dailyVisits)
      .filter(([date]) => date.startsWith(thisMonth))
      .reduce((sum, [, count]) => sum + count, 0);
    const totalVisits = visits.length;
    
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== 'en cours')
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    
    return { todayVisits, monthVisits, totalVisits, totalOrders, totalRevenue };
  };

  const getCustomers = () => {
    const customerMap = {};
    
    orders
      .filter(o => o.customer?.email)
      .forEach(order => {
        const email = order.customer.email;
        if (!customerMap[email]) {
          customerMap[email] = {
            email,
            name: `${order.customer.firstName} ${order.customer.lastName}`,
            phone: order.customer.phone,
            address: order.customer.address,
            orders: [],
            totalSpent: 0,
            orderCount: 0,
            lastOrder: null
          };
        }
        customerMap[email].orders.push(order);
        customerMap[email].totalSpent += parseFloat(order.total) || 0;
        customerMap[email].orderCount += 1;
        if (!customerMap[email].lastOrder || new Date(order.date) > new Date(customerMap[email].lastOrder)) {
          customerMap[email].lastOrder = order.date;
        }
      });

    return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  };

  const generateInvoice = (order) => {
    const itemsList = order.items?.map(item => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${parseFloat(item.price).toFixed(2)} $</td>
        <td style="text-align:right">${(parseFloat(item.price) * item.quantity).toFixed(2)} $</td>
      </tr>
    `).join('') || '';

    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${order.id} - VEGEDERM</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #1d4e38; }
    .logo { font-size: 32px; font-weight: bold; color: #1d4e38; }
    .logo span { color: #c9a86c; }
    .invoice-info { text-align: right; }
    .invoice-num { font-size: 20px; font-weight: bold; color: #1d4e38; }
    .invoice-date { color: #666; margin-top: 5px; }
    .invoice-status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-top: 5px; }
    .status-livrée { background: #28a745; color: white; }
    .status-expéditée { background: #007bff; color: white; }
    .status-validée { background: #ffc107; color: #333; }
    .status-en-cours { background: #6c757d; color: white; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 14px; font-weight: bold; color: #1d4e38; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .client-box { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    .client-name { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
    .client-info { color: #666; line-height: 1.8; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1d4e38; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 15px 12px; border-bottom: 1px solid #eee; }
    .totals { margin-top: 30px; }
    .totals-row { display: flex; justify-content: flex-end; padding: 8px 0; }
    .totals-label { width: 150px; text-align: right; color: #666; }
    .totals-value { width: 100px; text-align: right; font-weight: bold; }
    .totals-row.total { border-top: 2px solid #1d4e38; padding-top: 12px; margin-top: 8px; }
    .totals-row.total .totals-value { font-size: 18px; color: #1d4e38; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
    .footer-contact { margin-bottom: 5px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">VEGE<span>DERM</span></div>
    <div class="invoice-info">
      <div class="invoice-num">Facture #${order.id}</div>
      <div class="invoice-date">Date: ${new Date(order.date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <span class="invoice-status status-${order.status}">${order.status}</span>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Informations Client</div>
    <div class="client-box">
      <div class="client-name">${order.customer?.firstName} ${order.customer?.lastName}</div>
      <div class="client-info">
        ${order.customer?.email}<br>
        ${order.customer?.phone}<br>
        ${order.customer?.address}<br>
        ${order.customer?.city}, ${order.customer?.province} ${order.customer?.postalCode}
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Produits</div>
    <table>
      <thead>
        <tr>
          <th>Produit</th>
          <th style="text-align:center">Qté</th>
          <th style="text-align:right">Prix</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList}
      </tbody>
    </table>
  </div>
  
  <div class="totals">
    <div class="totals-row">
      <div class="totals-label">Sous-total:</div>
      <div class="totals-value">${parseFloat(order.subtotal || 0).toFixed(2)} $</div>
    </div>
    ${order.discount > 0 ? `
    <div class="totals-row">
      <div class="totals-label">Réduction:</div>
      <div class="totals-value" style="color:#28a745">-${parseFloat(order.discount).toFixed(2)} $</div>
    </div>` : ''}
    <div class="totals-row">
      <div class="totals-label">Livraison:</div>
      <div class="totals-value">${parseFloat(order.shipping || 0).toFixed(2)} $</div>
    </div>
    <div class="totals-row total">
      <div class="totals-label">Total:</div>
      <div class="totals-value">${parseFloat(order.total || 0).toFixed(2)} $</div>
    </div>
  </div>
  
  <div class="footer">
    <div class="footer-contact">VEGEDERM - Cosmétiques Naturels & Bio</div>
    <div class="footer-contact">zoumcosmo@gmail.com | +1 514-264-5963</div>
    <div>Merci pour votre confiance!</div>
  </div>
</body>
</html>
    `;
    return invoiceHTML;
  };

  const downloadInvoice = (order) => {
    const invoiceHTML = generateInvoice(order);
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facture-${order.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (order) => {
    const invoiceHTML = generateInvoice(order);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <AdminContext.Provider value={{
      products,
      orders,
      promoCodes,
      stats,
      loading,
      getCustomers,
      generateInvoice,
      downloadInvoice,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      addPromoCode,
      deletePromoCode,
      addOrder,
      updateOrderStatus,
      recordVisit,
      getStats
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);