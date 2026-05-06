import { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';
import { promoCodes as initialPromoCodes } from '../data/config';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('vegederm_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [promoCodes, setPromoCodes] = useState(() => {
    const saved = localStorage.getItem('vegederm_promos');
    return saved ? JSON.parse(saved) : initialPromoCodes;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('vegederm_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('vegederm_stats');
    return saved ? JSON.parse(saved) : { visits: [], dailyVisits: {} };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (o.status === 'expéditée' && o.shippedAt) {
          const shippedDate = new Date(o.shippedAt);
          const now = new Date();
          const hoursSinceShipped = Math.floor((now - shippedDate) / (1000 * 60 * 60));
          if (hoursSinceShipped >= 24) {
            return { ...o, status: 'livrée' };
          }
        }
        return o;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('vegederm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vegederm_promos', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('vegederm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vegederm_stats', JSON.stringify(stats));
  }, [stats]);

  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateStock = (id, quantity) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, inStock: Math.max(0, quantity) } : p
    ));
  };

  const addPromoCode = (code, type, value, description) => {
    setPromoCodes(prev => ({
      ...prev,
      [code]: { type, value, description }
    }));
  };

  const deletePromoCode = (code) => {
    setPromoCodes(prev => {
      const newCodes = { ...prev };
      delete newCodes[code];
      return newCodes;
    });
};

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status };
        if (status === 'expéditée') {
          updated.shippedAt = new Date().toISOString();
        }
        if (status === 'livrée') {
          updated.deliveredAt = new Date().toISOString();
        }
        return updated;
      }
      return o;
    }));
  };

  const confirmDelivery = (orderId) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'livrée', deliveredAt: new Date().toISOString() } : o
    ));
  };

  const addOrder = (order) => {
    setOrders(prev => [{
      ...order,
      id: `CMD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'en cours'
    }, ...prev]);
  };

  const recordVisit = () => {
    const today = new Date().toISOString().split('T')[0];
    setStats(prev => ({
      ...prev,
      visits: [...(prev.visits || []), new Date().toISOString()],
      dailyVisits: {
        ...prev.dailyVisits,
        [today]: (prev.dailyVisits[today] || 0) + 1
      }
    }));
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    const visits = stats.visits || [];
    const dailyVisits = stats.dailyVisits || {};
    
    const todayVisits = dailyVisits[today] || 0;
    const monthVisits = Object.entries(dailyVisits)
      .filter(([date]) => date.startsWith(thisMonth))
      .reduce((sum, [, count]) => sum + count, 0);
    const totalVisits = visits.length;
    
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== 'en cours')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
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
        customerMap[email].totalSpent += order.total || 0;
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
          <td>${item.price.toFixed(2)} $</td>
          <td>${(item.price * item.quantity).toFixed(2)} $</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <div>Sous-total: ${order.subtotal?.toFixed(2)} $</div>
    ${order.discount > 0 ? `<div>Réduction: -${order.discount.toFixed(2)} $</div>` : ''}
    <div>Livraison: ${order.shipping?.toFixed(2)} $</div>
    <div class="total-row">Total: ${order.total?.toFixed(2)} $</div>
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
      promoCodes,
      orders,
      stats,
      getCustomers,
      generateInvoice,
      downloadInvoice,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      addPromoCode,
      deletePromoCode,
      updateOrderStatus,
      confirmDelivery,
      addOrder,
      recordVisit,
      getStats
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);