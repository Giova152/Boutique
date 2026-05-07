import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const LoyaltyContext = createContext();

export function LoyaltyProvider({ children }) {
  const [userPoints, setUserPoints] = useState(0);
  const [tier, setTier] = useState('bronze');
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadPoints(session.user.id);
      }
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPoints(userId) {
    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        setUserPoints(data.points);
        setTier(data.tier);
        setTotalEarned(data.total_earned);
        setTotalRedeemed(data.total_redeemed);
      }
      
      const { data: txns } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (txns) setTransactions(txns);
    } catch (err) {
      console.error('Error loading points:', err);
    }
  }

  async function addPoints(userId, points, description, orderId = null) {
    const type = 'earn';
    
    const { data: existing } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existing) {
      const newTotal = existing.total_earned + points;
      const newPoints = existing.points + points;
      const newTier = calculateTier(newTotal);
      
      await supabase
        .from('loyalty_points')
        .update({
          points: newPoints,
          total_earned: newTotal,
          tier: newTier
        })
        .eq('user_id', userId);
      
      setUserPoints(newPoints);
      setTier(newTier);
      setTotalEarned(newTotal);
    } else {
      const newTier = calculateTier(points);
      await supabase
        .from('loyalty_points')
        .insert([{
          user_id: userId,
          points,
          total_earned: points,
          total_redeemed: 0,
          tier: newTier
        }]);
      
      setUserPoints(points);
      setTier(newTier);
      setTotalEarned(points);
    }
    
    await supabase
      .from('loyalty_transactions')
      .insert([{
        user_id: userId,
        type,
        points,
        description,
        order_id: orderId
      }]);
  }

  async function redeemPoints(userId, points) {
    if (userPoints < points) return { success: false, message: 'Points insuffisants' };
    
    const { data: existing } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!existing) return { success: false, message: 'Compte non trouvé' };
    
    const newPoints = existing.points - points;
    const newRedeemed = existing.total_redeemed + points;
    
    await supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        total_redeemed: newRedeemed
      })
      .eq('user_id', userId);
    
    await supabase
      .from('loyalty_transactions')
      .insert([{
        user_id: userId,
        type: 'redeem',
        points: -points,
        description: `Échange de ${points} points`
      }]);
    
    setUserPoints(newPoints);
    setTotalRedeemed(newRedeemed);
    
    return { success: true };
  }

  function calculateTier(totalPoints) {
    if (totalPoints >= 5000) return 'platinum';
    if (totalPoints >= 2000) return 'gold';
    if (totalPoints >= 500) return 'silver';
    return 'bronze';
  }

  function getTierBenefits(tierName) {
    const benefits = {
      bronze: { discount: 0, freeShipping: false, birthday: false },
      silver: { discount: 5, freeShipping: false, birthday: true },
      gold: { discount: 10, freeShipping: true, birthday: true },
      platinum: { discount: 15, freeShipping: true, birthday: true, priority: true }
    };
    return benefits[tierName] || benefits.bronze;
  }

  function getPointsToNextTier() {
    const thresholds = { bronze: 500, silver: 2000, gold: 5000 };
    const current = totalEarned;
    for (const [tierName, threshold] of Object.entries(thresholds)) {
      if (current < threshold) {
        return { nextTier: tierName, pointsNeeded: threshold - current };
      }
    }
    return { nextTier: 'max', pointsNeeded: 0 };
  }

  return (
    <LoyaltyContext.Provider value={{
      userPoints,
      tier,
      totalEarned,
      totalRedeemed,
      transactions,
      loading,
      addPoints,
      redeemPoints,
      getTierBenefits,
      getPointsToNextTier,
      refreshPoints: () => user && loadPoints(user.id)
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export const useLoyalty = () => useContext(LoyaltyContext);
