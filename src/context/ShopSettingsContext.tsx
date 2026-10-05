import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ShopSettings } from '@/types';
import { supabase } from '@/lib/supabase';

interface ShopSettingsContextValue {
  settings: ShopSettings | null;
  loading: boolean;
  refresh: () => void;
}

const ShopSettingsContext = createContext<ShopSettingsContextValue | undefined>(undefined);

const DEFAULT_SETTINGS: ShopSettings = {
  id: 1,
  shop_name: 'Sachdeva Mens Wear',
  logo_url: null,
  whatsapp_number: '919855882263',
  phone_number: '919855882263',
  address: 'Ph 22, Fazilka, Punjab',
  maps_link: '',
  opening_hours: '',
  social_links: { instagram: 'https://www.instagram.com/sahil_sachdeva190/', facebook: '', twitter: '' },
  delivery_info: '',
  pickup_info: 'Visit our store in Ph 22, Fazilka, opposite Vishal Mega Mart.',
  hero_headline: 'Trending Men\u2019s Wear at the Right Price',
  hero_subtext:
    'Discover trending shirts, T-shirts, jeans and everyday men\u2019s wear at Sachdeva Mens Wear, Fazilka. Latest styles, comfortable fits and pocket-friendly prices \u2014 all under one roof.',
  hero_image_url: null,
  offers_enabled: true,
  offers_text: 'Combo Offers Available \u2014 Style More, Save More',
  trust_points: [
    'Trending Styles & New Arrivals',
    'Affordable, Pocket-Friendly Prices',
    'Local & Trusted Store in Fazilka',
    'Easy WhatsApp Ordering',
    'Visit Store \u2014 Opposite Vishal Mega Mart',
  ],
  low_stock_threshold: 5,
};

export function ShopSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (!error && data) {
        setSettings(data as ShopSettings);
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ShopSettingsContext.Provider
      value={{ settings, loading, refresh: fetchSettings }}
    >
      {children}
    </ShopSettingsContext.Provider>
  );
}

export function useShopSettings() {
  const ctx = useContext(ShopSettingsContext);
  if (!ctx) throw new Error('useShopSettings must be used within ShopSettingsProvider');
  return ctx;
}
