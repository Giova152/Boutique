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
    }
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
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .company { font-size: 24px; font-weight: bold; color: #1d4e38; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 18px; font-weight: bold; }
    .invoice-date { color: #666; }
    .customer { margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #1d4e38; color: white; }
    .totals { text-align: right; margin-top: 20px; }
    .total-row { font-size: 18px; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">VEGEDERM</div>
    <div class="invoice-info">
      <div class="invoice-number">Facture ${order.id}</div>
      <div class="invoice-date">Date: ${new Date(order.date).toLocaleDateString('fr-CA')}</div>
      <div>Status: ${order.status}</div>
    </div>
  </div>
  
  <div class="customer">
    <strong>Client:</strong><br>
    ${order.customer?.firstName} ${order.customer?.lastName}<br>
    ${order.customer?.email}<br>
    ${order.customer?.phone}<br>
    ${order.customer?.address}<br>
    ${order.customer?.city}, ${order.customer?.province} ${order.customer?.postalCode}
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Produit</th>
        <th>Qté</th>
        <th>Prix</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items?.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${parseFloat(item.price).toFixed(2)} $</td>
          <td>${(parseFloat(item.price) * item.quantity).toFixed(2)} $</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <div>Sous-total: ${parseFloat(order.subtotal).toFixed(2)} $</div>
    ${order.discount > 0 ? `<div>Réduction: -${parseFloat(order.discount).toFixed(2)} $</div>` : ''}
    <div>Livraison: ${parseFloat(order.shipping).toFixed(2)} $</div>
    <div class="total-row">Total: ${parseFloat(order.total).toFixed(2)} $</div>
  </div>
  
  <div class="footer">
    <p>VEGEDERM - Cosmétiques Naturels & Bio</p>
    <p>zoumcosmo@gmail.com</p>
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