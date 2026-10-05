/*
# Create initial schema for men's clothing e-commerce

1. New Tables
- `categories` — product categories (T-Shirts, Shirts, Jeans, etc.)
- `products` — products with price, discount, brand, fabric, flags, images
- `product_variants` — color variants per product
- `variant_sizes` — size + stock per variant (the inventory model)
- `orders` — customer orders placed via website
- `order_items` — line items per order
- `shop_settings` — singleton store configuration

2. Security
- Enable RLS on all tables.
- anon can READ: categories, products, product_variants, variant_sizes, shop_settings
- anon can INSERT: orders, order_items
- authenticated (admin) has full CRUD on all tables
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  discount_price numeric(10,2),
  brand text,
  fabric text,
  is_featured boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_new_arrival boolean NOT NULL DEFAULT false,
  is_on_sale boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);

-- Product Variants (color-level)
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color text NOT NULL,
  color_hex text DEFAULT '#000000',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_variants" ON product_variants;
CREATE POLICY "anon_select_variants" ON product_variants FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_variants" ON product_variants;
CREATE POLICY "auth_insert_variants" ON product_variants FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_variants" ON product_variants;
CREATE POLICY "auth_update_variants" ON product_variants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_variants" ON product_variants;
CREATE POLICY "auth_delete_variants" ON product_variants FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- Variant Sizes (product -> color -> size -> stock)
CREATE TABLE IF NOT EXISTS variant_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  size text NOT NULL,
  stock int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE variant_sizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_variant_sizes" ON variant_sizes;
CREATE POLICY "anon_select_variant_sizes" ON variant_sizes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_variant_sizes" ON variant_sizes;
CREATE POLICY "auth_insert_variant_sizes" ON variant_sizes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_variant_sizes" ON variant_sizes;
CREATE POLICY "auth_update_variant_sizes" ON variant_sizes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_variant_sizes" ON variant_sizes;
CREATE POLICY "auth_delete_variant_sizes" ON variant_sizes FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_variant_sizes_variant ON variant_sizes(variant_id);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text,
  landmark text,
  delivery_method text NOT NULL DEFAULT 'Delivery',
  notes text,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_quantity int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_orders" ON orders;
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  sku text,
  size text,
  color text,
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  line_total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_order_items" ON order_items;
CREATE POLICY "auth_update_order_items" ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_order_items" ON order_items;
CREATE POLICY "auth_delete_order_items" ON order_items FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Shop Settings (singleton: id=1)
CREATE TABLE IF NOT EXISTS shop_settings (
  id int PRIMARY KEY DEFAULT 1,
  shop_name text NOT NULL DEFAULT 'Urban Gent',
  logo_url text,
  whatsapp_number text NOT NULL DEFAULT '919876543210',
  phone_number text DEFAULT '919876543210',
  address text DEFAULT '',
  maps_link text DEFAULT '',
  opening_hours text DEFAULT 'Mon-Sun: 10 AM - 9 PM',
  social_links jsonb NOT NULL DEFAULT '{"instagram":"","facebook":"","twitter":""}'::jsonb,
  delivery_info text DEFAULT 'Free local delivery within 5 km. Same-day delivery available.',
  pickup_info text DEFAULT 'Store pickup available during business hours.',
  hero_headline text NOT NULL DEFAULT 'Upgrade Your Everyday Style',
  hero_subtext text NOT NULL DEFAULT 'Premium men''s fashion at affordable prices. Browse our latest collection and order instantly via WhatsApp.',
  hero_image_url text,
  offers_enabled boolean NOT NULL DEFAULT true,
  offers_text text NOT NULL DEFAULT 'Flat 20% OFF on all T-Shirts',
  trust_points jsonb NOT NULL DEFAULT '["Latest Men''s Fashion","Affordable Prices","Local & Trusted Store","Easy WhatsApp Ordering","Fast Local Delivery / Store Pickup"]'::jsonb,
  low_stock_threshold int NOT NULL DEFAULT 5,
  CONSTRAINT singleton_shop_settings CHECK (id = 1)
);

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_shop_settings" ON shop_settings;
CREATE POLICY "anon_select_shop_settings" ON shop_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_shop_settings" ON shop_settings;
CREATE POLICY "auth_update_shop_settings" ON shop_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_insert_shop_settings" ON shop_settings;
CREATE POLICY "auth_insert_shop_settings" ON shop_settings FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO shop_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_updated ON categories;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_variant_sizes_updated ON variant_sizes;
CREATE TRIGGER trg_variant_sizes_updated BEFORE UPDATE ON variant_sizes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
