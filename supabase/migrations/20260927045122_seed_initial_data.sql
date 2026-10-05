/*
# Seed initial categories and products with variant data

Creates 6 categories and 10+ products with color variants and size-level stock.
Uses real Pexels image URLs for photography.
*/

-- Categories
INSERT INTO categories (name, slug, image_url, is_active, sort_order) VALUES
('T-Shirts', 't-shirts', 'https://images.pexels.com/photos/3290886/pexels-photo-3290886.jpeg?auto=compress&cs=tinysrgb&h=400', true, 1),
('Shirts', 'shirts', 'https://images.pexels.com/photos/4443831/pexels-photo-4443831.jpeg?auto=compress&cs=tinysrgb&h=400', true, 2),
('Jeans', 'jeans', 'https://images.pexels.com/photos/28938765/pexels-photo-28938765.jpeg?auto=compress&cs=tinysrgb&h=400', true, 3),
('Trousers', 'trousers', 'https://images.pexels.com/photos/27584193/pexels-photo-27584193.jpeg?auto=compress&cs=tinysrgb&h=400', true, 4),
('Lowers', 'lowers', 'https://images.pexels.com/photos/9499128/pexels-photo-9499128.jpeg?auto=compress&cs=tinysrgb&h=400', true, 5),
('Other Men''s Wear', 'other-mens-wear', 'https://images.pexels.com/photos/3944693/pexels-photo-3944693.jpeg?auto=compress&cs=tinysrgb&h=400', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Helper: get category id by slug
DO $$
DECLARE
  v_ts uuid; v_shirts uuid; v_jeans uuid; v_trousers uuid; v_lowers uuid; v_other uuid;
  v_prod uuid; v_var uuid;
BEGIN
  SELECT id INTO v_ts FROM categories WHERE slug = 't-shirts';
  SELECT id INTO v_shirts FROM categories WHERE slug = 'shirts';
  SELECT id INTO v_jeans FROM categories WHERE slug = 'jeans';
  SELECT id INTO v_trousers FROM categories WHERE slug = 'trousers';
  SELECT id INTO v_lowers FROM categories WHERE slug = 'lowers';
  SELECT id INTO v_other FROM categories WHERE slug = 'other-mens-wear';

  -- Product 1: Premium Cotton T-Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Premium Cotton T-Shirt', 'TS-001', v_ts, 'Soft premium cotton t-shirt with a relaxed fit. Perfect for everyday wear.', 799, 699, 'Urban Co.', '100% Cotton', true, true, false, true, true,
    '["https://images.pexels.com/photos/3290886/pexels-photo-3290886.jpeg?auto=compress&cs=tinysrgb&h=600","https://images.pexels.com/photos/12781928/pexels-photo-12781928.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 5), (v_var, 'M', 10), (v_var, 'L', 8), (v_var, 'XL', 0);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'White', '#f5f5f5', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 4), (v_var, 'M', 7), (v_var, 'L', 3), (v_var, 'XL', 2);

  -- Product 2: Oversized Graphic Tee
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Oversized Graphic Tee', 'TS-002', v_ts, 'Trendy oversized t-shirt with street-style graphic print.', 899, NULL, 'Street Wear', 'Cotton Blend', true, false, true, false, true,
    '["https://images.pexels.com/photos/14798947/pexels-photo-14798947.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 6), (v_var, 'L', 4), (v_var, 'XL', 3), (v_var, 'XXL', 2);

  -- Product 3: Classic White Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Classic White Shirt', 'SH-001', v_shirts, 'Timeless white formal shirt in breathable cotton. Versatile for office and occasions.', 1299, 999, 'Formal House', 'Cotton Poplin', true, true, false, true, true,
    '["https://images.pexels.com/photos/7905889/pexels-photo-7905889.jpeg?auto=compress&cs=tinysrgb&h=600","https://images.pexels.com/photos/36104301/pexels-photo-36104301.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'White', '#f5f5f5', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 3), (v_var, 'M', 8), (v_var, 'L', 6), (v_var, 'XL', 4);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Blue', '#3b5998', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 5), (v_var, 'L', 3), (v_var, 'XL', 2);

  -- Product 4: Casual Check Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Casual Check Shirt', 'SH-002', v_shirts, 'Smart casual check shirt for weekend outings. Roll-up sleeves for a relaxed look.', 1099, NULL, 'Weekend Co.', 'Cotton Blend', false, false, true, false, true,
    '["https://images.pexels.com/photos/4443831/pexels-photo-4443831.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Blue', '#4a6fa5', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 7), (v_var, 'L', 5), (v_var, 'XL', 3);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Red', '#a03030', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 4), (v_var, 'L', 2), (v_var, 'XL', 0);

  -- Product 5: Slim Fit Blue Jeans
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Slim Fit Blue Jeans', 'JN-001', v_jeans, 'Classic slim-fit denim jeans with stretch comfort. Perfect for everyday styling.', 1499, 1199, 'Denim Lab', 'Stretch Denim', true, true, false, true, true,
    '["https://images.pexels.com/photos/28938765/pexels-photo-28938765.jpeg?auto=compress&cs=tinysrgb&h=600","https://images.pexels.com/photos/31988321/pexels-photo-31988321.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Blue', '#2b4c7e', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 4), (v_var, '32', 8), (v_var, '34', 6), (v_var, '36', 3);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 2), (v_var, '32', 5), (v_var, '34', 4), (v_var, '36', 0);

  -- Product 6: Denim Jacket
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Classic Denim Jacket', 'JN-002', v_jeans, 'Iconic denim jacket that goes with everything. A wardrobe essential.', 1899, NULL, 'Denim Lab', 'Cotton Denim', false, true, true, false, true,
    '["https://images.pexels.com/photos/2229712/pexels-photo-2229712.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Blue', '#3a6ea5', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 5), (v_var, 'L', 4), (v_var, 'XL', 3);

  -- Product 7: Cotton Chinos
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Cotton Chinos', 'TR-001', v_trousers, 'Comfortable cotton chinos for smart-casual occasions. Tailored fit.', 1199, 899, 'Urban Co.', 'Cotton Twill', true, false, false, true, true,
    '["https://images.pexels.com/photos/27584193/pexels-photo-27584193.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Beige', '#d4b896', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 3), (v_var, '32', 6), (v_var, '34', 4), (v_var, '36', 2);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Olive', '#6b7c3a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 2), (v_var, '32', 4), (v_var, '34', 3), (v_var, '36', 1);

  -- Product 8: Formal Trousers
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Formal Trousers', 'TR-002', v_trousers, 'Sharp formal trousers for office and events. Wrinkle-resistant fabric.', 1399, NULL, 'Formal House', 'Polyester Blend', false, false, true, false, true,
    '["https://images.pexels.com/photos/9464625/pexels-photo-9464625.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 4), (v_var, '32', 7), (v_var, '34', 5), (v_var, '36', 3);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Grey', '#6b6b6b', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '32', 5), (v_var, '34', 3), (v_var, '36', 2);

  -- Product 9: Cotton Joggers
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Cotton Joggers', 'LW-001', v_lowers, 'Comfortable cotton joggers for casual wear and workouts. Elastic waistband.', 799, 599, 'Street Wear', 'Cotton Fleece', true, true, false, true, true,
    '["https://images.pexels.com/photos/9499128/pexels-photo-9499128.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 6), (v_var, 'M', 10), (v_var, 'L', 8), (v_var, 'XL', 5);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Grey', '#8a8a8a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 4), (v_var, 'L', 3), (v_var, 'XL', 2);

  -- Product 10: Track Pants
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Sporty Track Pants', 'LW-002', v_lowers, 'Lightweight track pants for active lifestyle. Quick-dry fabric.', 699, NULL, 'Street Wear', 'Polyester', false, false, true, false, true,
    '["https://images.pexels.com/photos/15868727/pexels-photo-15868727.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Navy', '#1a2b5e', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 8), (v_var, 'L', 6), (v_var, 'XL', 4);

  -- Product 11: Casual Hoodie
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Casual Hoodie', 'OT-001', v_other, 'Soft fleece-lined hoodie for cool weather. Kangaroo pocket and drawstring hood.', 1099, 849, 'Urban Co.', 'Cotton Fleece', true, false, true, true, true,
    '["https://images.pexels.com/photos/8706237/pexels-photo-8706237.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 5), (v_var, 'L', 4), (v_var, 'XL', 3);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Olive', '#6b7c3a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 3), (v_var, 'L', 2), (v_var, 'XL', 0);

  -- Product 12: Crew Neck Sweatshirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Crew Neck Sweatshirt', 'OT-002', v_other, 'Minimalist crew neck sweatshirt for layering. Soft brushed interior.', 999, NULL, 'Weekend Co.', 'Cotton Blend', false, true, false, false, true,
    '["https://images.pexels.com/photos/17858295/pexels-photo-17858295.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'White', '#f5f5f5', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 4), (v_var, 'M', 6), (v_var, 'L', 4), (v_var, 'XL', 3);
END $$;
