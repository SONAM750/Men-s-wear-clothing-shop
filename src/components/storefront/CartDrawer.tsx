import { Link } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeItem, subtotal, totalItems } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div
        className="absolute inset-0 bg-primary-950/50 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />
      <div className="relative w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-700" />
            <h2 className="text-lg font-semibold text-primary-900">
              Cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-primary-200 mb-4" />
            <h3 className="text-lg font-semibold text-primary-900 mb-1">Your cart is empty</h3>
            <p className="text-sm text-primary-500 mb-4">
              Browse our collection and add items you like.
            </p>
            <button
              onClick={() => setCartOpen(false)}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.variant_size_id}
                  className="flex gap-3 p-3 border border-primary-200 rounded-lg"
                >
                  <Link
                    to={`/product/${item.product_id}`}
                    onClick={() => setCartOpen(false)}
                    className="shrink-0"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-primary-300" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product_id}`}
                      onClick={() => setCartOpen(false)}
                      className="text-sm font-semibold text-primary-900 line-clamp-1 hover:text-primary-600"
                    >
                      {item.product_name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.color && (
                        <span className="text-xs text-primary-500 flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full border border-primary-300"
                            style={{ backgroundColor: item.color_hex }}
                          />
                          {item.color}
                        </span>
                      )}
                      <span className="text-xs text-primary-500">Size: {item.size}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-primary-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.variant_size_id, item.quantity - 1)}
                          className="px-2 py-1 text-primary-600 hover:bg-primary-100 rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm font-medium text-primary-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_size_id, item.quantity + 1)}
                          disabled={item.quantity >= item.max_stock}
                          className="px-2 py-1 text-primary-600 hover:bg-primary-100 rounded-r-lg disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-primary-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.variant_size_id)}
                    className="self-start p-1 text-primary-400 hover:text-error-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-primary-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-600">Subtotal</span>
                <span className="text-lg font-bold text-primary-900">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-primary-500 bg-primary-50 rounded-lg p-2 text-center">
                Online payment is not needed. Order on WhatsApp and pay at store pickup.
              </p>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="btn-primary w-full"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={() => setCartOpen(false)}
                className="btn-ghost w-full"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function FloatingCartButton() {
  const { totalItems, setCartOpen } = useCart();
  if (totalItems === 0) return null;
  return (
    <button
      onClick={() => setCartOpen(true)}
      className="fixed bottom-16 right-3 z-40 lg:hidden bg-primary-900 text-white rounded-full p-3.5 shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
    >
      <ShoppingBag className="w-5 h-5" />
      <span className="text-sm font-bold">{totalItems}</span>
    </button>
  );
}
