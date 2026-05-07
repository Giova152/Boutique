import { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

const StockAlertContext = createContext();

export function StockAlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  async function subscribeToStockAlert(productId, email) {
    const { data, error } = await supabase
      .from('stock_alerts')
      .insert([{
        product_id: productId.toString(),
        email,
        active: true
      }])
      .select()
      .single();
    
    if (data) {
      setAlerts(prev => [...prev, data]);
      return { success: true };
    }
    
    return { success: false, error };
  }

  async function unsubscribeFromAlert(productId, email) {
    const { error } = await supabase
      .from('stock_alerts')
      .update({ active: false })
      .eq('product_id', productId.toString())
      .eq('email', email);
    
    if (!error) {
      setAlerts(prev => prev.filter(a => a.product_id !== productId.toString() || a.email !== email));
    }
    
    return !error;
  }

  async function getUserAlerts(email) {
    const { data } = await supabase
      .from('stock_alerts')
      .select('*')
      .eq('email', email)
      .eq('active', true);
    
    if (data) setAlerts(data);
    return data || [];
  }

  function isSubscribed(productId, email) {
    return alerts.some(a => a.product_id === productId.toString() && a.email === email && a.active);
  }

  async function checkAndNotify(productId) {
    const { data: subscribers } = await supabase
      .from('stock_alerts')
      .select('*')
      .eq('product_id', productId.toString())
      .eq('active', true);
    
    return subscribers || [];
  }

  return (
    <StockAlertContext.Provider value={{
      alerts,
      subscribeToStockAlert,
      unsubscribeFromAlert,
      getUserAlerts,
      isSubscribed,
      checkAndNotify
    }}>
      {children}
    </StockAlertContext.Provider>
  );
}

export const useStockAlert = () => useContext(StockAlertContext);
