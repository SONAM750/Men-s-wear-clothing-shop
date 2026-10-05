import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface WishlistContextValue {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

const STORAGE_KEY = 'ug_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWishlist(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isInWishlist, count: wishlist.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
