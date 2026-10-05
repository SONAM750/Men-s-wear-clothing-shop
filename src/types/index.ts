export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  category_id: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  brand: string | null;
  fabric: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  is_active: boolean;
  images: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  color_hex: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface VariantSize {
  id: string;
  variant_id: string;
  size: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithDetails extends Product {
  category?: Category | null;
  variants?: ProductVariantWithSizes[];
}

export interface ProductVariantWithSizes extends ProductVariant {
  sizes?: VariantSize[];
}

export interface CartItem {
  product_id: string;
  variant_id: string;
  variant_size_id: string;
  product_name: string;
  sku: string | null;
  image_url: string;
  price: number;
  size: string;
  color: string;
  color_hex: string;
  quantity: number;
  max_stock: number;
}

export interface ShopSettings {
  id: number;
  shop_name: string;
  logo_url: string | null;
  whatsapp_number: string;
  phone_number: string;
  address: string;
  maps_link: string;
  opening_hours: string;
  social_links: { instagram: string; facebook: string; twitter: string };
  delivery_info: string;
  pickup_info: string;
  hero_headline: string;
  hero_subtext: string;
  hero_image_url: string | null;
  offers_enabled: boolean;
  offers_text: string;
  trust_points: string[];
  low_stock_threshold: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string | null;
  landmark: string | null;
  delivery_method: string;
  notes: string | null;
  total_amount: number;
  total_quantity: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  line_total: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items?: OrderItem[];
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Completed'
  | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'New',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Completed',
  'Cancelled',
];
