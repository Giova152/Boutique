import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAILS, isAdminEmail } from '../config/adminConfig';

const AuthContext = createContext();

const USER_SESSION_DURATION = 24 * 60 * 60 * 1000;
const ADMIN_SESSION_DURATION = 48 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(null);

  const isAdminEmailCheck = (email) => isAdminEmail(email);

  const getSessionDuration = (email) => {
    return isAdminEmailCheck(email) ? ADMIN_SESSION_DURATION : USER_SESSION_DURATION;
  };

  const isSessionValid = (loginTime, email) => {
    if (!loginTime) return false;
    const duration = getSessionDuration(email);
    return Date.now() - parseInt(loginTime) < duration;
  };

  const saveSession = (email) => {
    const loginTime = Date.now();
    const duration = getSessionDuration(email);
    localStorage.setItem('userLoginTime', loginTime.toString());
    localStorage.setItem('userLoginExpiry', (loginTime + duration).toString());
    localStorage.setItem('userEmail', email);
  };

  const handleEmailConfirmation = useCallback(async () => {
    const hash = window.location.hash;
    if (hash.includes('confirmation=')) {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session?.user) {
          if (data.session.user.email_confirmed_at) {
            setEmailConfirmed(true);
            setConfirmationMessage({
              type: 'success',
              title: 'Email confirmé !',
              text: 'Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.'
            });
            saveSession(data.session.user.email);
            await loadUserData(data.session.user);
          }
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        setConfirmationMessage({
          type: 'error',
          title: 'Erreur de confirmation',
          text: 'Le lien de confirmation est invalide ou a expiré. Veuillez demander un nouveau lien.'
        });
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    checkUser();
    handleEmailConfirmation();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email_confirmed_at);

      if (event === 'SIGNED_IN' && session?.user) {
        const isConfirmed = !!session.user.email_confirmed_at;
        setEmailConfirmed(isConfirmed);

        if (isConfirmed) {
          saveSession(session.user.email);
          await loadUserData(session.user);
        } else {
          setConfirmationMessage({
            type: 'info',
            title: 'Email non confirmé',
            text: 'Veuillez vérifier votre boîte email et cliquer sur le lien de confirmation pour activer votre compte.'
          });
        }
      } else if (event === 'SIGNED_OUT') {
        clearSession();
      } else if (event === 'USER_UPDATED') {
        if (session?.user?.email_confirmed_at) {
          setEmailConfirmed(true);
          saveSession(session.user.email);
          await loadUserData(session.user);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [handleEmailConfirmation]);

  const clearSession = () => {
    localStorage.removeItem('userLoginTime');
    localStorage.removeItem('userLoginExpiry');
    localStorage.removeItem('userEmail');
    setUser(null);
    setProfile(null);
    setOrders([]);
    setEmailConfirmed(false);
  };

  async function checkUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const isConfirmed = !!session.user.email_confirmed_at;
      setEmailConfirmed(isConfirmed);

      if (!isConfirmed) {
        setConfirmationMessage({
          type: 'info',
          title: 'Email non confirmé',
          text: 'Veuillez vérifier votre boîte email et cliquer sur le lien de confirmation.'
        });
        setLoading(false);
        return;
      }

      const loginTime = localStorage.getItem('userLoginTime');
      const savedEmail = localStorage.getItem('userEmail');

      if (!isSessionValid(loginTime, savedEmail)) {
        clearSession();
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      await loadUserData(session.user);

    } catch (err) {
      console.error('Erreur checkUser:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserData(userData) {
    setUser({ id: userData.id, email: userData.email });

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setUser(prev => ({ ...prev, name: profileData.full_name }));
    }

    const { data: userOrders } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (userOrders) {
      setOrders(userOrders);
    }
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (data.user) {
      if (data.user.email_confirmed_at === null) {
        await supabase.auth.signOut();
        clearSession();
        return {
          success: false,
          message: 'Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.'
        };
      }

      setEmailConfirmed(true);
      saveSession(data.user.email);
      await loadUserData(data.user);

      return { success: true };
    }
  };

  const register = async (name, email, password, extraData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/profile`
        }
      });

      if (error) {
        console.error('Register error:', error);
        return { success: false, message: error.message };
      }

      console.log('Register response:', data);

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          phone: extraData.phone || null,
          city: extraData.city || null,
          updated_at: new Date().toISOString()
        }).then(({ error: profileError }) => {
          if (profileError) console.error('Profile upsert error:', profileError);
        });

        if (data.user.email_confirmed_at) {
          setEmailConfirmed(true);
          saveSession(data.user.email);
          await loadUserData(data.user);
          return { success: true };
        }

        return {
          success: true,
          needsConfirmation: true,
          message: 'Un email de confirmation a été envoyé. Cliquez sur le lien pour activer votre compte.'
        };
      }

      return {
        success: true,
        needsConfirmation: true,
        message: 'Un email de confirmation a été envoyé. Cliquez sur le lien pour activer votre compte.'
      };
    } catch (err) {
      console.error('Register catch error:', err);
      return { success: false, message: 'Erreur lors de l\'inscription. Veuillez réessayer.' };
    }
  };

  const logout = async () => {
    clearSession();
    await supabase.auth.signOut();
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

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `CMD-${timestamp}-${randomPart}`.toUpperCase();
  };

  const addOrder = async (order) => {
    try {
      const newOrder = {
        ...order,
        id: generateOrderId(),
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

      if (error) {
        console.error('Add order error:', error);
        return { success: false, error: error.message };
      }

      if (data && data[0]) {
        setOrders(prev => [data[0], ...prev]);
        return { success: true, orderId: data[0].id };
      }

      return { success: true };
    } catch (err) {
      console.error('Add order catch error:', err);
      return { success: false, error: err.message };
    }
  };

  const refreshSession = () => {
    if (user?.email) {
      saveSession(user.email);
    }
  };

  const clearConfirmationMessage = () => {
    setConfirmationMessage(null);
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
      addOrder,
      refreshSession,
      isAdmin: user ? isAdminEmailCheck(user.email) : false,
      sessionExpiry: localStorage.getItem('userLoginExpiry'),
      emailConfirmed,
      confirmationMessage,
      clearConfirmationMessage
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
