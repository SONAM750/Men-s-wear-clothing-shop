import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, X, Phone, MapPin, Truck, Store, Calendar, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import type { Order, OrderItem, OrderStatus } from '@/types';
import { ORDER_STATUSES } from '@/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  'New': 'bg-blue-100 text-blue-700',
  'Confirmed': 'bg-primary-100 text-primary-700',
  'Preparing': 'bg-accent-100 text-accent-700',
  'Ready': 'bg-warning-100 text-warning-700',
  'Out for Delivery': 'bg-purple-100 text-purple-700',
  'Completed': 'bg-success-100 text-success-700',
  'Cancelled': 'bg-error-100 text-error-700',
};

export function AdminOrdersPage() {
  const { showToast } = useToast();
  const { settings } = useShopSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewOrder, setViewOrder] = useState<{ order: Order; items: OrderItem[] } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) { showToast('Failed to load orders', 'error'); setLoading(false); return; }
    setOrders((data as Order[]) || []);
    setLoading(false);
  }, [showToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const viewOrderDetails = async (order: Order) => {
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setViewOrder({ order, items: (data as OrderItem[]) || [] });
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { showToast('Failed to update status', 'error'); return; }
    showToast('Order status updated');
    setOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o));
    if (viewOrder && viewOrder.order.id === orderId) {
      setViewOrder({ ...viewOrder, order: { ...viewOrder.order, status } });
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-primary-900">Orders</h1>
        <p className="text-sm text-primary-500 mt-1">{orders.length} total orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order number, name, phone..." className="input pl-10" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input sm:w-48">
          <option value="">All Status</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-4 h-24 skeleton" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 text-primary-200 mx-auto mb-3" />
          <p className="text-sm text-primary-500">No orders found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary-50 text-left text-xs text-primary-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order #</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Delivery</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-primary-50">
                    <td className="px-4 py-3 font-medium text-primary-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-primary-700">{order.customer_name}</td>
                    <td className="px-4 py-3 text-primary-600">{order.phone}</td>
                    <td className="px-4 py-3 text-primary-600">{order.total_quantity}</td>
                    <td className="px-4 py-3 font-medium text-primary-900">{formatPrice(Number(order.total_amount))}</td>
                    <td className="px-4 py-3 text-xs text-primary-500">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-primary-600">
                        {order.delivery_method === 'Delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                        {order.delivery_method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)} className={cn('text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer', STATUS_COLORS[order.status as OrderStatus])}>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => viewOrderDetails(order)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((order) => (
              <div key={order.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-primary-900 text-sm">{order.customer_name}</p>
                    <p className="text-xs text-primary-500">{order.order_number}</p>
                  </div>
                  <span className={cn('badge text-xs', STATUS_COLORS[order.status as OrderStatus])}>{order.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-600">{order.phone}</span>
                  <span className="font-bold text-primary-900">{formatPrice(Number(order.total_amount))}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-primary-500">
                  <span className="flex items-center gap-1">{order.delivery_method === 'Delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />} {order.delivery_method}</span>
                  <span>{order.total_quantity} items</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary-100">
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)} className={cn('text-xs font-medium rounded-full px-3 py-1.5 border-0 cursor-pointer flex-1', STATUS_COLORS[order.status as OrderStatus])}>
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => viewOrderDetails(order)} className="btn-ghost text-xs py-1.5"><Eye className="w-3 h-3" /> View</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Order details modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-[80] flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-primary-950/50" onClick={() => setViewOrder(null)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl my-0 sm:my-8 max-h-screen sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-primary-200 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-primary-900">Order Details</h2>
                <p className="text-xs text-primary-500">{viewOrder.order.order_number}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Customer info */}
              <div className="card p-3 space-y-2">
                <h3 className="text-sm font-semibold text-primary-900 mb-1">Customer</h3>
                <p className="text-sm text-primary-700">{viewOrder.order.customer_name}</p>
                <p className="text-sm text-primary-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {viewOrder.order.phone}</p>
                {viewOrder.order.address && <p className="text-sm text-primary-600 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5" /> {viewOrder.order.address}</p>}
                {viewOrder.order.landmark && <p className="text-xs text-primary-500">Landmark: {viewOrder.order.landmark}</p>}
                <p className="text-sm text-primary-600 flex items-center gap-1">
                  {viewOrder.order.delivery_method === 'Delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                  {viewOrder.order.delivery_method}
                </p>
                {viewOrder.order.notes && <p className="text-xs text-primary-500 bg-primary-50 rounded p-2">Notes: {viewOrder.order.notes}</p>}
              </div>

              {/* Order items */}
              <div className="card p-3">
                <h3 className="text-sm font-semibold text-primary-900 mb-3">Items</h3>
                <div className="space-y-2">
                  {viewOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm border-b border-primary-100 pb-2 last:border-0">
                      <div className="min-w-0">
                        <p className="font-medium text-primary-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-primary-500">{item.color} - Size {item.size} - Qty {item.quantity}</p>
                        {item.sku && <p className="text-xs text-primary-400">SKU: {item.sku}</p>}
                      </div>
                      <span className="font-medium text-primary-900 shrink-0 ml-2">{formatPrice(Number(item.line_total))}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-primary-200">
                  <span className="font-semibold text-primary-900">Total</span>
                  <span className="text-lg font-bold text-primary-900">{formatPrice(Number(viewOrder.order.total_amount))}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="label">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((s) => (
                    <button key={s} onClick={() => updateStatus(viewOrder.order.id, s)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', viewOrder.order.status === s ? STATUS_COLORS[s] + ' border-transparent' : 'border-primary-200 text-primary-600 hover:border-primary-900')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-primary-200 p-4 flex gap-3 shrink-0">
              <a href={getWhatsAppUrl(viewOrder.order.phone, `Hello ${viewOrder.order.customer_name}, regarding your order ${viewOrder.order.order_number}...`)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1"><MessageCircle className="w-4 h-4" /> Contact Customer</a>
              <button onClick={() => setViewOrder(null)} className="btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
