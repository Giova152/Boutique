-- Script pour créer les tables VEGEDERM dans Supabase
-- Copiez ce code et collez-le dans le SQL Editor de Supabase

-- Table produits
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  in_stock INTEGER DEFAULT 25,
  image TEXT,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_promo BOOLEAN DEFAULT false,
  promo_price DECIMAL(10,2),
  benefits TEXT[],
  ingredients TEXT,
  usage TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table commandes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'en cours',
  status_history JSONB DEFAULT '[]',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2),
  total DECIMAL(10,2),
  promo_code TEXT,
  shipping_method TEXT,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table codes promo
CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ
);

-- Table stats
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  visits TIMESTAMPTZ[] DEFAULT '{}',
  daily_visits JSONB DEFAULT '{}'
);

-- Activer RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Politique d'accès public (lecture seule) pour produits
CREATE POLICY "Tout le monde peut lire products" ON products FOR SELECT USING (true);

-- Politique admin stricte (admins peuvent modifier)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email IN ('zoumcosmo@gmail.com', 'midogiova@gmail.com')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Politiques pour products
CREATE POLICY "Admin peut insérer products" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin peut mettre à jour products" ON products FOR UPDATE USING (is_admin());
CREATE POLICY "Admin peut supprimer products" ON products FOR DELETE USING (is_admin());

-- Politiques pour orders - INSERT public (tout le monde peut commander)
CREATE POLICY "Tout le monde peut créer orders" ON orders FOR INSERT WITH CHECK (true);

-- Politiques pour orders - lecture selon client
CREATE POLICY "Clients peuvent lire leurs orders" ON orders FOR SELECT
  USING (
    is_admin()
    OR (customer->>'email') = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Politiques pour orders - UPDATE admin seulement
CREATE POLICY "Admin peut mettre à jour orders" ON orders FOR UPDATE USING (is_admin());
CREATE POLICY "Admin peut supprimer orders" ON orders FOR DELETE USING (is_admin());

-- Politiques pour promo_codes
CREATE POLICY "Tout le monde peut lire promo_codes" ON promo_codes FOR SELECT USING (active = true OR is_admin());
CREATE POLICY "Admin peut gérer promo_codes" ON promo_codes FOR ALL USING (is_admin());

-- Politiques pour stats
CREATE POLICY "Tout le monde peut lire stats" ON stats FOR SELECT USING (true);
CREATE POLICY "Anon peut incrémenter stats" ON stats FOR UPDATE USING (true);

-- Insérer données initiales
INSERT INTO stats (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Activer realtime
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Table avis produits
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table alertes stock
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  email TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table programme fidelite
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table transactions fidelite
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table paramètres admin (clés API)
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  stripe_publishable_key TEXT,
  paypal_client_id TEXT,
  paypal_client_secret TEXT,
  paypal_verified BOOLEAN DEFAULT false,
  paypal_access_token TEXT,
  paypal_token_expiry INTEGER,
  paypal_token_issued TIMESTAMPTZ,
  paypal_mode TEXT DEFAULT 'sandbox',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Migration: add PayPal OAuth columns to existing admin_settings table
DO $$ BEGIN
  ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS paypal_client_secret TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS paypal_verified BOOLEAN DEFAULT false;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS paypal_access_token TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS paypal_token_expiry INTEGER;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS paypal_token_issued TIMESTAMPTZ;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS paypal_mode TEXT DEFAULT 'sandbox';
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS exit_popup_code TEXT DEFAULT 'VEGEDERM10';
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS exit_popup_discount INTEGER DEFAULT 10;
EXCEPTION WHEN others THEN NULL;
END $$;
CREATE POLICY "Tout le monde peut lire clés API" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Admins peuvent modifier paramètres" ON admin_settings FOR UPDATE USING (true);
CREATE POLICY "Admins peuvent insérer paramètres" ON admin_settings FOR INSERT WITH CHECK (true);

-- Table newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table messages support
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table comparaisons produits
CREATE TABLE IF NOT EXISTS product_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  product_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS sur nouvelles tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Politiques d'accès
CREATE POLICY "Tout le monde peut lire reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Utilisateurs peuvent créer reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilisateurs peuvent modifier leurs reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Tout le monde peut lire stock_alerts" ON stock_alerts FOR SELECT USING (true);
CREATE POLICY "Tout le monde peut créer alertes" ON stock_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins peuvent supprimer alertes" ON stock_alerts FOR DELETE USING (true);

CREATE POLICY "Utilisateurs peuvent lire loyalty" ON loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Système peut créer loyalty" ON loyalty_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Utilisateurs peuvent modifier loyalty" ON loyalty_points FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent lire transactions" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Système peut créer transactions" ON loyalty_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Tout le monde peut utiliser comparaisons" ON product_comparisons FOR ALL USING (true);

CREATE POLICY "Tout le monde peut s'inscrire newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Tout le monde peut voir newsletter" ON newsletter_subscribers FOR SELECT USING (true);

CREATE POLICY "Admins peuvent lire messages" ON support_messages FOR SELECT USING (true);
CREATE POLICY "Tout le monde peut envoyer message" ON support_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins peuvent modifier messages" ON support_messages FOR UPDATE USING (true);

-- Fonction pour calculer le statut fidelite
CREATE OR REPLACE FUNCTION calculate_loyalty_tier(total_points INTEGER)
RETURNS TEXT AS $$
  SELECT CASE
    WHEN total_points >= 5000 THEN 'platinum'
    WHEN total_points >= 2000 THEN 'gold'
    WHEN total_points >= 500 THEN 'silver'
    ELSE 'bronze'
  END;
$$ LANGUAGE sql;

-- Table articles blog
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image TEXT,
  category TEXT,
  author TEXT,
  read_time INTEGER DEFAULT 5,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table messages support
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_name TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Politiques blog et support
CREATE POLICY "Tout le monde peut lire articles" ON blog_articles FOR SELECT USING (published = true);
CREATE POLICY "Admins peuvent gérer articles" ON blog_articles FOR ALL USING (is_admin());

CREATE POLICY "Utilisateurs peuvent envoyer messages" ON support_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Utilisateurs peuvent voir leurs messages" ON support_messages FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admins peuvent gérer messages" ON support_messages FOR ALL USING (is_admin());

-- Insérer articles de blog
INSERT INTO blog_articles (slug, title, excerpt, image, category, read_time, featured) VALUES
('bienfaits-beurre-karite', 'Les Bienfaits Incomparables du Beurre de Karité', 'Découvrez pourquoi le beurre de karité est l''ingrédient star de nos cosmétiques naturels.', 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=600', 'Ingrédients', 5, true),
('routine-soin-peaux-sensibles', 'Ma Routine Complète pour Peaux Sensibles', 'Voici mes conseils pour prendre soin des peaux réactives au quotidien.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', 'Conseils', 7, false),
('eczema-naturel', 'Soulager l''Eczéma Naturellement', 'Des solutions douces et efficaces pour calmer les poussées d''eczéma.', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600', 'Santé', 6, false)
ON CONFLICT (slug) DO NOTHING;