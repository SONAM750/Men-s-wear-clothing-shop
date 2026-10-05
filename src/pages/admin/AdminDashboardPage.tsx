import { useEffect, useState } from 'react';
import { Package, AlertTriangle, XCircle, Tag, ShoppingCart, Clock, CheckCircle, TrendingUp, Boxes } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { formatPrice, formatDate, getTotalStock } from '@/lib/utils';
import type { Order, Product, ProductVariant, VariantSize, Category } from '@/types';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  totalCategories: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  estimatedSales: number;
}

export function AdminDashboardPage() {
  const { settings } = useShopSettings();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalCategories: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    estimatedSales: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; stock: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const lowStockThreshold = settings?.low_stock_threshold ?? 5;

      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      const products = (productsRes.data as Product[]) || [];
      const categories = (categoriesRes.data as Category[]) || [];
      const orders = (ordersRes.data as Order[]) || [];

      // Fetch all variant sizes for stock calculation
      const { data: variants } = await supabase.from('product_variants').select('*');
      const { data: sizes } = await supabase.from('variant_sizes').select('*');

      const variantList = (variants as ProductVariant[]) || [];
      const sizeList = (sizes as VariantSize[]) || [];

      let outOfStockCount = 0;
      let lowStockCount = 0;

      products.forEach((p) => {
        const productVariants = variantList.filter((v) => v.product_id === p.id);
        const productSizes = sizeList.filter((s) =>
          productVariants.some((v) => v.id === s.variant_id),
        );
        const totalStock = productSizes.reduce((sum, s) => sum + s.stock, 0);
        if (totalStock === 0) outOfStockCount++;
        else if (totalStock <= lowStockThreshold) lowStockCount++;
      });

      const today = new Date().toDateString();
      const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
      const pendingStatuses = ['New', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery'];
      const pending = orders.filter((o) => pendingStatuses.includes(o.status));
      const completed = orders.filter((o) => o.status === 'Completed');
      const estSales = completed.reduce((sum, o) => sum + Number(o.total_amount), 0);

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.is_active).length,
        outOfStock: outOfStockCount,
        lowStock: lowStockCount,
        totalCategories: categories.length,
        todayOrders: todayOrders.length,
        pendingOrders: pending.length,
        completedOrders: completed.length,
        estimatedSales: estSales,
      });

      setRecentOrders(orders.slice(0, 5));

      // Top products by stock (proxy for popular)
      const productStocks = products.map((p) => {
        const pVariants = variantList.filter((v) => v.product_id === p.id);
        const pSizes = sizeList.filter((s) => pVariants.some((v) => v.id === s.variant_id));
        return { name: p.name, stock: pSizes.reduce((sum, s) => sum + s.stock, 0) };
      }).sort((a, b) => b.stock - a.stock).slice(0, 5);
      setTopProducts(productStocks);

      setLoading(false);
    };

    fetchStats();
  }, [settings?.low_stock_threshold]);

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-primary-700 bg-primary-100' },
    { label: 'Active Products', value: stats.activeProducts, icon: Boxes, color: 'text-success-700 bg-success-100' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'text-error-700 bg-error-100' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-warning-700 bg-warning-100' },
    { label: 'Categories', value: stats.totalCategories, icon: Tag, color: 'text-accent-700 bg-accent-100' },
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingCart, color: 'text-primary-700 bg-primary-100' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-warning-700 bg-warning-100' },
    { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'text-success-700 bg-success-100' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-primary-900">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="h-8 w-8 skeleton rounded-lg mb-3" />
              <div className="h-6 w-16 skeleton mb-2" />
              <div className="h-4 w-24 skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary-900">Dashboard</h1>
        <p className="text-sm text-primary-500 mt-1">Overview of your store performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
              <p className="text-sm text-primary-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Estimated sales */}
      <div className="card p-6 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <p className="text-sm text-primary-300">Estimated Sales (Completed Orders)</p>
            <p className="text-3xl font-bold">{formatPrice(stats.estimatedSales)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-primary-900 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-primary-500 py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-primary-100 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-900 truncate">{order.customer_name}</p>
                    <p className="text-xs text-primary-500">{order.order_number} - {formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-primary-900">{formatPrice(Number(order.total_amount))}</p>
                    <span className={`badge text-xs ${
                      order.status === 'Completed' ? 'bg-success-100 text-success-700' :
                      order.status === 'Cancelled' ? 'bg-error-100 text-error-700' :
                      'bg-warning-100 text-warning-700'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-primary-900 mb-4">Products by Stock</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-primary-500 py-8 text-center">No products yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-primary-100 pb-3 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-primary-400 w-5">{idx + 1}</span>
                    <p className="text-sm font-medium text-primary-900 truncate">{p.name}</p>
                  </div>
                  <span className={`badge text-xs shrink-0 ${
                    p.stock === 0 ? 'bg-error-100 text-error-700' :
                    p.stock <= (settings?.low_stock_threshold ?? 5) ? 'bg-warning-100 text-warning-700' :
                    'bg-success-100 text-success-700'
                  }`}>{p.stock} in stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
