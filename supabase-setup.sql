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
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2),
  total DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table codes promo
CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  description TEXT
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

-- Politique d'accès public (lecture seule)
CREATE POLICY "Tout le monde peut lire products" ON products FOR SELECT USING (true);
CREATE POLICY "Tout le monde peut lire orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Tout le monde peut lire promo_codes" ON promo_codes FOR SELECT USING (true);
CREATE POLICY "Tout le monde peut lire stats" ON stats FOR SELECT USING (true);

-- Politique admin stricte (admins peuvent modifier)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('zoumcosmo@gmail.com', 'midogiova@gmail.com')
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Admin peut modifier products" ON products FOR ALL USING (is_admin());
CREATE POLICY "Admin peut modifier orders" ON orders FOR ALL USING (is_admin());
CREATE POLICY "Admin peut modifier promo_codes" ON promo_codes FOR ALL USING (is_admin());
CREATE POLICY "Admin peut modifier stats" ON stats FOR ALL USING (is_admin());

-- Insérer données initiales
INSERT INTO stats (id) VALUES (1);

-- Activer realtime (optionnel)
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;