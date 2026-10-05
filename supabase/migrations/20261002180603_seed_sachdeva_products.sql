/*
# Seed Sachdeva Mens Wear products

Replaces all products with realistic men's wear items based on the Instagram screenshots.
Products include shirts (casual, oversized, check), T-shirts, jeans, trousers, lowers, and combo offers.
Prices based on Instagram posts: shirts ~₹450-₹499, jeans ~₹1050, combo ~₹999.
*/

DO $$
DECLARE
  v_shirts uuid; v_ts uuid; v_jeans uuid; v_trousers uuid; v_lowers uuid; v_new uuid; v_combo uuid;
  v_prod uuid; v_var uuid;
BEGIN
  SELECT id INTO v_shirts FROM categories WHERE slug = 'shirts';
  SELECT id INTO v_ts FROM categories WHERE slug = 't-shirts';
  SELECT id INTO v_jeans FROM categories WHERE slug = 'jeans';
  SELECT id INTO v_trousers FROM categories WHERE slug = 'trousers';
  SELECT id INTO v_lowers FROM categories WHERE slug = 'lowers';
  SELECT id INTO v_new FROM categories WHERE slug = 'new-arrivals';
  SELECT id INTO v_combo FROM categories WHERE slug = 'combo-offers';

  -- 1. Classic Casual Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Classic Casual Shirt', 'SMW-SH01', v_shirts, 'Comfortable everyday shirt with a relaxed, modern fit. Perfect for daily wear.', 499, NULL, NULL, NULL, true, true, false, false, true,
    '["https://images.pexels.com/photos/4443831/pexels-photo-4443831.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Blue', '#3a6ea5', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 5), (v_var, 'M', 10), (v_var, 'L', 8), (v_var, 'XL', 4);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'White', '#f5f5f5', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 6), (v_var, 'L', 4), (v_var, 'XL', 3);

  -- 2. Oversized Casual Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Oversized Casual Shirt', 'SMW-SH02', v_shirts, 'Trendy oversized shirt designed for an easy, relaxed casual look.', 450, NULL, NULL, NULL, true, false, true, false, true,
    '["https://images.pexels.com/photos/10952730/pexels-photo-10952730.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 7), (v_var, 'L', 5), (v_var, 'XL', 4), (v_var, 'XXL', 2);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Olive', '#6b7c3a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'L', 3), (v_var, 'XL', 2);

  -- 3. Checked Casual Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Checked Casual Shirt', 'SMW-SH03', v_shirts, 'Smart check pattern shirt for a stylish casual look. Great for outings and everyday wear.', 499, NULL, NULL, NULL, false, true, false, false, true,
    '["https://images.pexels.com/photos/3944693/pexels-photo-3944693.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 3)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Red', '#a03030', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 6), (v_var, 'L', 4), (v_var, 'XL', 3);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Blue', '#4a6fa5', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 5), (v_var, 'L', 3), (v_var, 'XL', 0);

  -- 4. Everyday Solid Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Everyday Solid Shirt', 'SMW-SH04', v_shirts, 'Classic solid color shirt for everyday wear. Clean, simple and versatile.', 499, NULL, NULL, NULL, false, false, true, false, true,
    '["https://images.pexels.com/photos/7905889/pexels-photo-7905889.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 4)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'White', '#f5f5f5', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 4), (v_var, 'M', 8), (v_var, 'L', 6), (v_var, 'XL', 3);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Sky Blue', '#87b5d8', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 5), (v_var, 'L', 4), (v_var, 'XL', 2);

  -- 5. Relaxed Fit T-Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Relaxed Fit T-Shirt', 'SMW-TS01', v_ts, 'Soft, comfortable t-shirt with a relaxed fit. An everyday essential.', 299, NULL, NULL, NULL, true, true, false, false, true,
    '["https://images.pexels.com/photos/3290886/pexels-photo-3290886.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 8), (v_var, 'M', 12), (v_var, 'L', 10), (v_var, 'XL', 5);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'White', '#f5f5f5', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 7), (v_var, 'L', 5), (v_var, 'XL', 3);

  -- 6. Printed T-Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Printed T-Shirt', 'SMW-TS02', v_ts, 'Trendy printed t-shirt for a stylish casual look.', 349, NULL, NULL, NULL, false, false, true, false, true,
    '["https://images.pexels.com/photos/14798947/pexels-photo-14798947.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 6), (v_var, 'L', 4), (v_var, 'XL', 3);

  -- 7. Classic Denim Jeans
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Classic Denim Jeans', 'SMW-JN01', v_jeans, 'Classic denim jeans for everyday styling. Comfortable fit with a timeless look.', 1050, NULL, NULL, NULL, true, true, false, false, true,
    '["https://images.pexels.com/photos/28938765/pexels-photo-28938765.jpeg?auto=compress&cs=tinysrgb&h=600","https://images.pexels.com/photos/31988321/pexels-photo-31988321.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Blue', '#2b4c7e', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 5), (v_var, '32', 8), (v_var, '34', 6), (v_var, '36', 3);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 3), (v_var, '32', 5), (v_var, '34', 4), (v_var, '36', 0);

  -- 8. Relaxed Fit Jeans
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Relaxed Fit Jeans', 'SMW-JN02', v_jeans, 'Comfortable relaxed-fit jeans for everyday casual wear.', 1050, NULL, NULL, NULL, false, false, true, false, true,
    '["https://images.pexels.com/photos/2229712/pexels-photo-2229712.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 2)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Light Blue', '#6b8fb5', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 4), (v_var, '32', 6), (v_var, '34', 4), (v_var, '36', 2);

  -- 9. Cotton Chinos
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Cotton Chinos', 'SMW-TR01', v_trousers, 'Comfortable cotton chinos for smart-casual occasions. Easy to style for any look.', 799, NULL, NULL, NULL, false, false, true, false, true,
    '["https://images.pexels.com/photos/27584193/pexels-photo-27584193.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Beige', '#d4b896', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '30', 3), (v_var, '32', 5), (v_var, '34', 4), (v_var, '36', 2);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, '32', 4), (v_var, '34', 3), (v_var, '36', 1);

  -- 10. Casual Lower
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Casual Lower', 'SMW-LW01', v_lowers, 'Comfortable casual lower for everyday wear and relaxation.', 399, NULL, NULL, NULL, true, false, false, false, true,
    '["https://images.pexels.com/photos/9499128/pexels-photo-9499128.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'S', 6), (v_var, 'M', 10), (v_var, 'L', 8), (v_var, 'XL', 4);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Grey', '#8a8a8a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 5), (v_var, 'L', 3), (v_var, 'XL', 2);

  -- 11. Men's Combo Offer (Shirt + T-Shirt)
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Shirt + T-Shirt Combo', 'SMW-CB01', v_combo, 'Combo offer: one casual shirt plus one t-shirt. Style more, save more.', 999, NULL, NULL, NULL, true, true, true, false, true,
    '["https://images.pexels.com/photos/3944693/pexels-photo-3944693.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Assorted', '#4a6fa5', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 10), (v_var, 'L', 8), (v_var, 'XL', 5);

  -- 12. New Arrival: Baggy Fit Shirt
  INSERT INTO products (name, sku, category_id, description, price, discount_price, brand, fabric, is_featured, is_best_seller, is_new_arrival, is_on_sale, is_active, images, sort_order)
  VALUES ('Baggy Fit Casual Shirt', 'SMW-NA01', v_new, 'Trendy baggy fit shirt for a relaxed, stylish look. A fresh arrival at Sachdeva Mens Wear.', 450, NULL, NULL, NULL, false, false, true, false, true,
    '["https://images.pexels.com/photos/10952730/pexels-photo-10952730.jpeg?auto=compress&cs=tinysrgb&h=600"]'::jsonb, 1)
  RETURNING id INTO v_prod;
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Cream', '#e8dcc8', 1) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'M', 5), (v_var, 'L', 4), (v_var, 'XL', 3);
  INSERT INTO product_variants (product_id, color, color_hex, sort_order) VALUES (v_prod, 'Black', '#1a1a1a', 2) RETURNING id INTO v_var;
  INSERT INTO variant_sizes (variant_id, size, stock) VALUES (v_var, 'L', 3), (v_var, 'XL', 2);

END $$;
