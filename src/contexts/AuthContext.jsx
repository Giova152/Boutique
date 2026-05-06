import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { storeConfig } from '../data/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { user: supabaseUser } = session;
        setUser({ id: supabaseUser.id, email: supabaseUser.email });
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          setUser(prev => ({ ...prev, name: profileData.full_name }));
        }
        
        const { data: userOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('customer->>email', supabaseUser.email)
          .order('date', { ascending: false });
        
        if (userOrders) setOrders(userOrders);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) return { success: false, message: error.message };
    
    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      setUser({ id: data.user.id, email: data.user.email, name: profileData?.full_name });
      setProfile(profileData);
      
      const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer->>email', email)
        .order('date', { ascending: false });
      
      if (userOrders) setOrders(userOrders);
      
      return { success: true };
    }
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    
    if (error) return { success: false, message: error.message };
    
    if (data.user) {
      setUser({ id: data.user.id, email, name });
      return { success: true };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOrders([]);
  };

  const updateProfile = async (updates) => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (!error) {
      setProfile(prev => ({ ...prev, ...updates }));
      setUser(prev => ({ ...prev, name: updates.full_name || prev.name }));
    }
  };

  const addOrder = async (order) => {
    const newOrder = {
      ...order,
      id: `CMD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'en cours',
      customer: {
        ...order.customer,
        email: user?.email || order.customer.email
      }
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select();
    
    if (!error && data) {
      setOrders(prev => [data[0], ...prev]);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      orders,
      loading,
      login,
      register,
      logout,
      updateProfile,
      addOrder
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);