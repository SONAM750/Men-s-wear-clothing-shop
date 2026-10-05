import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ug_recently_viewed';
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentlyViewed(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentlyViewed, addRecentlyViewed };
}
