import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sendStatusUpdateEmail, sendStockRestockEmail } from '../services/emailService';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promoCodes, setPromoCodes] = useState({});
  const [stats, setStats] = useState({ visits: [], dailyVisits: {} });
  const [settings, setSettings] = useState({
    stripePublishableKey: '',
    paypalClientId: '',
    exitPopupCode: 'VEGEDERM10',
    exitPopupDiscount: 10,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadSettings();

    // Subscribe to real-time product changes
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Product change detected:', payload);
        if (payload.eventType === 'INSERT') {
          setProducts(prev => [...prev, { 
            ...payload.new, 
            images: payload.new.image ? [payload.new.image] : [],
            isBestseller: payload.new.is_bestseller,
            isNew: payload.new.is_new,
            inStock: payload.new.in_stock,
            promoPrice: payload.new.promo_price
          }]);
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p => 
            p.id === payload.new.id ? { 
              ...p, 
              ...payload.new,
              images: payload.new.image ? [payload.new.image] : [],
              isBestseller: payload.new.is_bestseller,
              isNew: payload.new.is_new,
              inStock: payload.new.in_stock,
              promoPrice: payload.new.promo_price
            } : p
          ));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, []);

  async function loadData() {
    try {
      const [productsRes, ordersRes, promoRes, statsRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').order('date', { ascending: false }),
        supabase.from('promo_codes').select('*'),
        supabase.from('stats').select('*').eq('id', 1).single()
      ]);

      if (productsRes.data && productsRes.data.length > 0) {
        console.log('Products loaded:', productsRes.data.length);
        const productsWithImages = productsRes.data.map(p => ({
          ...p,
          images: p.image ? [p.image] : [],
          isBestseller: p.is_bestseller,
          isNew: p.is_new,
          isPromo: p.is_promo,
          inStock: p.in_stock,
          promoPrice: p.promo_price
        }));
        setProducts(productsWithImages);
      } else {
        console.log('No products found, seeding default products...');
        await seedProducts();
      }
      if (ordersRes.data) setOrders(ordersRes.data);
      if (promoRes.data) {
        const codes = {};
        promoRes.data.forEach(p => codes[p.code] = p);
        setPromoCodes(codes);
      }
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
      // Try seeding on error
      try {
        const { data: checkProducts } = await supabase.from('products').select('*');
        if (!checkProducts || checkProducts.length === 0) {
          await seedProducts();
        }
      } catch (e) {
        console.error('Seed failed:', e);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const { data } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
      if (data) {
        setSettings({
          stripePublishableKey: data.stripe_publishable_key || '',
          paypalClientId: data.paypal_client_id || '',
          exitPopupCode: data.exit_popup_code || 'VEGEDERM10',
          exitPopupDiscount: data.exit_popup_discount || 10,
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }

  async function saveSettings(newSettings) {
    try {
      await supabase.from('admin_settings').upsert({
        id: 1,
        ...newSettings,
        updated_at: new Date().toISOString()
      });
      setSettings(prev => ({ ...prev, ...newSettings }));
      return { success: true };
    } catch (err) {
      console.error('Error saving settings:', err);
      return { success: false, error: err.message };
    }
  }

  async function seedProducts() {
    console.log('Seeding products...');
    const defaultProducts = [
      {
        name: 'Beurre de Karité Pur',
        category: 'beurre-karite',
        price: 18.99,
        description: 'Beurre de karité 100% naturel, riche en vitamines et acids gras essentiels. Parfait pour hydrater et nourrir la peau.',
        in_stock: 50,
        image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400',
        is_new: true,
        is_bestseller: true,
        is_promo: false,
        rating: 4.8,
        reviews: 124,
        benefits: ['Hydratation intense', 'Réparateur cutané', 'Anti-âge naturel'],
        ingredients: 'Beurre de karité brut 100%',
        usage: 'Appliquer sur le corps après la douche'
      },
      {
        name: 'Crème Hydratante Éclat',
        category: 'cremes',
        price: 24.99,
        description: 'Crème hydratante légère et non grasse pour tous types de peau. Elle pénètre rapidement et procure une hydratation durable.',
        in_stock: 35,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        is_new: false,
        is_bestseller: true,
        is_promo: false,
        rating: 4.6,
        reviews: 89,
        benefits: ['Hydratation 24h', 'Texture légère', 'Non comédogène'],
        ingredients: 'Eau de rose, glycérine végétale, beurre de karité',
        usage: 'Appliquer matin et soir sur visage et cou'
      },
      {
        name: 'Savon Artisanal au Karité',
        category: 'savons',
        price: 8.99,
        description: 'Savon artisanal enrichi au beurre de karité et aux huiles essentielles. Idéal pour les peaux sensibles.',
        in_stock: 100,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        is_new: false,
        is_bestseller: false,
        is_promo: true,
        promo_price: 6.99,
        rating: 4.5,
        reviews: 156,
        benefits: ['Doux pour la peau', 'Sans sulfate', 'Parfum naturel'],
        ingredients: 'Beurre de karité, huile d\'olive, huile de coco',
        usage: 'Pour le corps et le visage'
      },
      {
        name: 'Lotion Corps Nutrition',
        category: 'corps',
        price: 22.99,
        description: 'Lotion corporelle ultra-nourrissante pour les peaux très sèches. Texture riche qui laisse la peau douce et silky.',
        in_stock: 28,
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400',
        is_new: true,
        is_bestseller: false,
        is_promo: false,
        rating: 4.7,
        reviews: 67,
        benefits: ['Nutrition profonde', 'Texture onctueuse', 'Absorption rapide'],
        ingredients: 'Beurre de karité, huile d\'amande douce, vitamine E',
        usage: 'Masser sur tout le corps matin et soir'
      },
      {
        name: 'Crème Réparatrice Éczéma',
        category: 'eczema',
        price: 29.99,
        description: 'Crème apaisante специально conçue pour les peaux atopiques, psoriasis et eczéma. Soulage les démangeaisons.',
        in_stock: 20,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        is_new: false,
        is_bestseller: true,
        is_promo: false,
        rating: 4.9,
        reviews: 203,
        benefits: ['Apaise les irritations', 'Répare la barrière cutanée', 'Soulage les démangeaisons'],
        ingredients: 'Beurre de karité, avoine colloïdale, allantoïne',
        usage: 'Appliquer 2-3 fois par jour sur les zones affectées'
      },
      {
        name: 'Shampooing Réparateur',
        category: 'capillaires',
        price: 16.99,
        description: 'Shampooing doux sans sulfate qui répare et renforce les cheveux secs et cassants.',
        in_stock: 45,
        image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400',
        is_new: false,
        is_bestseller: false,
        is_promo: false,
        rating: 4.4,
        reviews: 78,
        benefits: ['Sans sulfate', 'Réparateur', 'Cheveux brillants'],
        ingredients: 'Beurre de karité, protéines de soja, miel',
        usage: 'Masser le cuir chevelu, rincer, répéter'
      },
      {
        name: 'Crème Pieds Ultra-Nourrissante',
        category: 'pieds',
        price: 14.99,
        description: 'Crème spécifique pour les pieds secs et fendillés. Texture riche mais non collante.',
        in_stock: 40,
        image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b07?w=400',
        is_new: false,
        is_bestseller: true,
        is_promo: false,
        rating: 4.7,
        reviews: 112,
        benefits: ['Élimine les-callosités', 'Hydrate en profondeur', 'Sensation immédiate'],
        ingredients: 'Beurre de karité, urée 10%, huile de ricin',
        usage: 'Appliquer sur pieds propres, masser jusqu\'à absorption'
      },
      {
        name: 'Gommage Corporel Douceur',
        category: 'exfoliants',
        price: 19.99,
        description: 'Gommage naturel aux粒 de sucre et huile de karité. Élimine les cellules mortes en douceur.',
        in_stock: 32,
        image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400',
        is_new: true,
        is_bestseller: false,
        is_promo: true,
        promo_price: 15.99,
        rating: 4.5,
        reviews: 54,
        benefits: ['Exfoliation douce', 'Peau douce et brillante', '100% naturel'],
        ingredients: 'Sucre glace, beurre de karité, huile d\'amande',
        usage: 'Masser sur peau humide, rincer'
      },
      {
        name: 'Crème Solaire SPF 50',
        category: 'cremes',
        price: 24.99,
        description: 'Écran solaire mineral SPF 50, water-resistant, pour protéger la peau des UVA/UVB.',
        in_stock: 25,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        is_new: false,
        is_bestseller: false,
        is_promo: false,
        rating: 4.6,
        reviews: 45,
        benefits: ['Mineral', 'Water-resistant', 'Sans nanoparticles'],
        ingredients: 'Oxyde de zinc, beurre de karité, vitamine E',
        usage: 'Appliquer 15 min avant exposition, renouveler toutes les 2h'
      },
      {
        name: 'Gel Douche Crémeux',
        category: 'savons',
        price: 12.99,
        description: 'Gel douche crémeux sans savon, respecte le film hydrolipidique de la peau.',
        in_stock: 60,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        is_new: false,
        is_bestseller: false,
        is_promo: false,
        rating: 4.3,
        reviews: 92,
        benefits: ['Sans savons', 'pH neutre', 'Familial'],
        ingredients: 'Basis surfactants doux, beurre de karité, glycérine',
        usage: 'Sous la douche, faire mousser sur le corps'
      }
    ];

    for (const product of defaultProducts) {
      const { error } = await supabase.from('products').insert([product]);
      if (error) {
        console.error('Error inserting product:', error);
      }
    }
    console.log('Default products seeded');
    
    // Wait a moment and reload
    await new Promise(r => setTimeout(r, 500));
    
    // Reload products after seeding
    const { data: newProducts } = await supabase.from('products').select('*');
    console.log('Reloaded products:', newProducts?.length);
    if (newProducts && newProducts.length > 0) {
      const productsWithImages = newProducts.map(p => ({
        ...p,
        images: p.image ? [p.image] : [],
        isBestseller: p.is_bestseller,
        isNew: p.is_new,
        isPromo: p.is_promo,
        inStock: p.in_stock,
        promoPrice: p.promo_price
      }));
      setProducts(productsWithImages);
    }
  }

  const reloadProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) {
      const productsWithImages = data.map(p => ({
        ...p,
        images: p.image ? [p.image] : [],
        isBestseller: p.is_bestseller,
        isNew: p.is_new,
        isPromo: p.is_promo,
        inStock: p.in_stock,
        promoPrice: p.promo_price
      }));
      setProducts(productsWithImages);
    }
  }

  const addProduct = async (product) => {
    // Remove fields that shouldn't be sent
    const cleanProduct = { ...product };
    delete cleanProduct.id;
    delete cleanProduct.created_at;
    delete cleanProduct.updated_at;
    
    console.log('Adding product:', cleanProduct);
    const { data, error } = await supabase.from('products').insert([cleanProduct]).select();
    console.log('Add result - data:', data, 'error:', error);
    if (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
    if (data && data[0]) {
      const newProduct = { ...data[0], images: data[0].image ? [data[0].image] : [] };
      console.log('New product added:', newProduct);
      setProducts(prev => [...prev, newProduct]);
    }
    return { success: true };
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

  const updateStock = async (id, newStock, oldStock) => {
    await supabase.from('products').update({ in_stock: newStock }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, in_stock: newStock } : p));

    if (oldStock === 0 && newStock > 0) {
      const { data: alerts } = await supabase
        .from('stock_alerts')
        .select('*')
        .eq('product_id', id.toString())
        .eq('active', true);

      const product = products.find(p => p.id === id);

      if (alerts && alerts.length > 0 && product) {
        for (const alert of alerts) {
          if (alert.email) {
            await sendStockRestockEmail(alert.email, product);
          }
        }

        await supabase.from('stock_alerts').update({ active: false }).eq('product_id', id.toString());
      }
    }
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
    const order = orders.find(o => o.id === orderId);
    const updates = { status };
    const now = new Date().toISOString();
    
    if (status === 'expéditée') updates.shipped_at = now;
    if (status === 'livrée') updates.delivered_at = now;
    
    // Add to status history
    const statusHistory = order?.status_history || [];
    statusHistory.push({
      status,
      timestamp: now,
      adminNote: ''
    });
    updates.status_history = statusHistory;
    
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      
      // Send email notification to customer
      if (order?.customer?.email) {
        sendStatusUpdateEmail(order.customer.email, order, status);
      }
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
    const thisMonth = new Date().toISOString().split('0,7');
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    
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
    
    // Monthly orders data
    const monthlyOrdersMap = {};
    const monthlyRevenueMap = {};
    orders.forEach(order => {
      const month = new Date(order.date).toISOString().slice(0, 7);
      const monthName = new Date(order.date).toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' });
      monthlyOrdersMap[month] = monthlyOrdersMap[month] || { month: monthName, orders: 0 };
      monthlyOrdersMap[month].orders++;
      monthlyRevenueMap[month] = monthlyRevenueMap[month] || { month: monthName, revenue: 0 };
      monthlyRevenueMap[month].revenue += parseFloat(order.total) || 0;
    });
    const monthlyOrders = Object.values(monthlyOrdersMap).slice(-6);
    const monthlyRevenue = Object.values(monthlyRevenueMap).slice(-6);
    
    // Top products
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));
    
    // Daily chart (last 30 days)
    const dailyChart = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dateLabel = date.toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });
      dailyChart.push({ date: dateLabel, visits: dailyVisits[dateStr] || 0 });
    }
    
    return { 
      todayVisits, 
      monthVisits, 
      totalVisits, 
      totalOrders, 
      totalRevenue,
      monthlyOrders,
      monthlyRevenue,
      topProducts,
      dailyChart
    };
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
      getStats,
      seedProducts,
      reloadProducts,
      settings,
      saveSettings
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);