import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ShoppingBag, Check, AlertCircle, User, Phone, MapPin, Truck, Store, StickyNote } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber, cn } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import type { Order } from '@/types';

export function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { settings } = useShopSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    deliveryMethod: 'Delivery',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customer.name.trim()) errs.name = 'Name is required';
    if (!customer.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(customer.phone.replace(/\D/g, '')))
      errs.phone = 'Enter a valid 10-digit phone number';
    if (customer.deliveryMethod === 'Delivery' && !customer.address.trim())
      errs.address = 'Address is required for delivery';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    try {
      const orderNumber = generateOrderNumber();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: customer.name,
          phone: customer.phone,
          address: customer.address || null,
          landmark: customer.landmark || null,
          delivery_method: customer.deliveryMethod,
          notes: customer.notes || null,
          total_amount: subtotal,
          total_quantity: totalItems,
          status: 'New',
        })
        .select()
        .single();

      if (orderError || !order) {
        showToast('Could not place order. Please try again.', 'error');
        setPlacing(false);
        return;
      }

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        line_total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        showToast('Order created but items could not be saved', 'error');
      }

      // Decrement stock for each item
      for (const item of items) {
        const { data: currentSize } = await supabase
          .from('variant_sizes')
          .select('id, stock')
          .eq('id', item.variant_size_id)
          .single();
        if (currentSize) {
          const newStock = Math.max(0, currentSize.stock - item.quantity);
          await supabase
            .from('variant_sizes')
            .update({ stock: newStock })
            .eq('id', item.variant_size_id);
        }
      }

      // Generate WhatsApp message
      const message = generateWhatsAppMessage(items, settings!, customer);
      const url = getWhatsAppUrl(settings?.whatsapp_number || '', message);

      setOrderPlaced(order as Order);
      setWhatsappUrl(url);
      clearCart();
      showToast('Order placed successfully!');
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setPlacing(false);
    }
  };

  // Success screen
  if (orderPlaced && whatsappUrl) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success-600" />
          </div>
          <h1 className="text-2xl font-semibold text-primary-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-sm text-primary-500 mb-1">Order Number</p>
          <p className="text-xl font-bold text-primary-900 mb-6">{orderPlaced.order_number}</p>

          <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#25D366] mt-0.5 shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-primary-900 text-sm mb-1">
                  Send your order to WhatsApp
                </h3>
                <p className="text-xs text-primary-600 mb-3">
                  Click the button below to send your order details to {settings?.shop_name}.
                  The shop owner will confirm your order.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full"
                >
                  <MessageCircle className="w-5 h-5" /> Send Order on WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/shop" className="btn-outline flex-1">
              Continue Shopping
            </Link>
            <Link to="/" className="btn-ghost flex-1">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-primary-200 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-primary-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-primary-500 mb-6">
          Add some products to your cart before checking out.
        </p>
        <Link to="/shop" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>

      <h1 className="text-3xl font-display tracking-wide text-primary-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Customer details form */}
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-primary-900 mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <label className="label">
                  Full Name <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className={cn('input pl-10', errors.name && 'border-error-500')}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-xs text-error-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="label">
                  Mobile Number <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className={cn('input pl-10', errors.phone && 'border-error-500')}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                {errors.phone && <p className="text-xs text-error-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="label">Delivery Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCustomer({ ...customer, deliveryMethod: 'Delivery' })}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all',
                      customer.deliveryMethod === 'Delivery'
                        ? 'border-primary-900 bg-primary-50 text-primary-900'
                        : 'border-primary-300 text-primary-600 hover:border-primary-900',
                    )}
                  >
                    <Truck className="w-4 h-4" /> Delivery
                  </button>
                  <button
                    onClick={() => setCustomer({ ...customer, deliveryMethod: 'Store Pickup' })}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all',
                      customer.deliveryMethod === 'Store Pickup'
                        ? 'border-primary-900 bg-primary-50 text-primary-900'
                        : 'border-primary-300 text-primary-600 hover:border-primary-900',
                    )}
                  >
                    <Store className="w-4 h-4" /> Store Pickup
                  </button>
                </div>
              </div>

              {customer.deliveryMethod === 'Delivery' && (
                <>
                  <div>
                    <label className="label">
                      Address <span className="text-error-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-primary-400" />
                      <textarea
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        className={cn('input pl-10 min-h-[80px] resize-y', errors.address && 'border-error-500')}
                        placeholder="Full delivery address"
                      />
                    </div>
                    {errors.address && <p className="text-xs text-error-600 mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="label">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={customer.landmark}
                      onChange={(e) => setCustomer({ ...customer, landmark: e.target.value })}
                      className="input"
                      placeholder="Nearby landmark for easy delivery"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="label">Order Notes (Optional)</label>
                <div className="relative">
                  <StickyNote className="absolute left-3 top-3 w-4 h-4 text-primary-400" />
                  <textarea
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    className="input pl-10 min-h-[60px] resize-y"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-primary-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variant_size_id} className="flex gap-3">
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-primary-100 shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-primary-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-900 line-clamp-1">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-primary-500">
                      {item.color} - Size {item.size} - Qty {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-primary-900 mt-0.5">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-primary-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Total Items</span>
                <span className="font-medium text-primary-900">{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Subtotal</span>
                <span className="font-medium text-primary-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Delivery</span>
                <span className="font-medium text-success-600">Free</span>
              </div>
              <div className="flex justify-between border-t border-primary-200 pt-2">
                <span className="font-semibold text-primary-900">Total</span>
                <span className="text-xl font-bold text-primary-900">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-3 mt-4 text-center">
              <p className="text-xs text-primary-600">
                Online payment is not needed. Order on WhatsApp and pay at store pickup.
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="btn-whatsapp w-full mt-4"
            >
              {placing ? (
                'Placing Order...'
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" /> Place Order on WhatsApp
                </>
              )}
            </button>

            <p className="text-xs text-primary-500 text-center mt-2">
              Your order will be sent to the shop owner via WhatsApp for confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
