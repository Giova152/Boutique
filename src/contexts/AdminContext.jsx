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
      .filter(o => o.status === 'validée')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    return { todayVisits, monthVisits, totalVisits, totalOrders, totalRevenue };
  };

  return (
    <AdminContext.Provider value={{
      products,
      promoCodes,
      orders,
      stats,
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