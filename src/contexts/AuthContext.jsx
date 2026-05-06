import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('natura_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('natura_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('natura_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('natura_user');
    }
    setIsAuthenticated(!!user);
  }, [user]);

  useEffect(() => {
    localStorage.setItem('natura_orders', JSON.stringify(orders));
  }, [orders]);

  const login = (email, password) => {
    const mockUser = {
      id: 1,
      email,
      name: email.split('@')[0],
      addresses: []
    };
    setUser(mockUser);
    return { success: true };
  };

  const register = (name, email, password) => {
    const newUser = {
      id: Date.now(),
      email,
      name,
      addresses: []
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const addOrder = (order) => {
    setOrders(prev => [{
      ...order,
      id: `CMD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'en cours'
    }, ...prev]);
  };

  const addAddress = (address) => {
    setUser(prev => prev ? {
      ...prev,
      addresses: [...prev.addresses, { ...address, id: Date.now() }]
    } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      orders,
      login,
      register,
      logout,
      addOrder,
      addAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);