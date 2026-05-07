import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { products as localProducts } from '../data/products';

const ReviewsContext = createContext();

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addReview(productId, userId, userName, rating, title, comment) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        product_id: productId,
        user_id: userId,
        user_name: userName,
        rating,
        title,
        comment,
        verified_purchase: false
      }])
      .select()
      .single();
    
    if (data) {
      setReviews(prev => [data, ...prev]);
      
      const product = localProducts.find(p => p.id === parseInt(productId));
      if (product) {
        const productReviews = reviews.filter(r => r.product_id === productId);
        const avgRating = productReviews.length > 0 
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
          : rating;
        
        await supabase
          .from('products')
          .update({
            rating: avgRating.toFixed(1),
            reviews: productReviews.length + 1
          })
          .eq('id', productId);
      }
      
      return { success: true };
    }
    
    return { success: false, error };
  }

  async function deleteReview(reviewId, userId) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);
    
    if (!error) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    }
    
    return !error;
  }

  function getProductReviews(productId) {
    return reviews.filter(r => r.product_id === productId.toString());
  }

  function getProductRating(productId) {
    const productReviews = getProductReviews(productId);
    if (productReviews.length === 0) return null;
    const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    return { average: avg, count: productReviews.length };
  }

  function getRatingDistribution(productId) {
    const productReviews = getProductReviews(productId);
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(r => {
      if (dist[r.rating]) dist[r.rating]++;
    });
    return dist;
  }

  return (
    <ReviewsContext.Provider value={{
      reviews,
      loading,
      addReview,
      deleteReview,
      getProductReviews,
      getProductRating,
      getRatingDistribution,
      refreshReviews: loadReviews
    }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export const useReviews = () => useContext(ReviewsContext);
