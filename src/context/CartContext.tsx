import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { CartItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (variantSizeId: string, quantity: number) => void;
  removeItem: (variantSizeId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'ug_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variant_size_id === item.variant_size_id);
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, item.max_stock);
        return prev.map((i) =>
          i.variant_size_id === item.variant_size_id ? { ...i, quantity: newQty } : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((variantSizeId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.variant_size_id === variantSizeId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.max_stock)) }
          : i,
      ),
    );
  }, []);

  const removeItem = useCallback((variantSizeId: string) => {
    setItems((prev) => prev.filter((i) => i.variant_size_id !== variantSizeId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
