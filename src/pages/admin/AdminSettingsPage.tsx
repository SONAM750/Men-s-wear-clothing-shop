import { useState, useEffect } from 'react';
import { Save, Store, MessageCircle, Phone, MapPin, Clock, Share2, Truck, Image as ImageIcon, Plus, X, Sparkles, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useToast } from '@/context/ToastContext';
import type { ShopSettings } from '@/types';

export function AdminSettingsPage() {
  const { settings, refresh } = useShopSettings();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShopSettings | null>(null);
  const [trustInput, setTrustInput] = useState('');

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!form) {
    return <div className="card p-8 h-40 skeleton" />;
  }

  const update = (field: keyof ShopSettings, value: unknown) => {
    setForm({ ...form, [field]: value });
  };

  const addTrustPoint = () => {
    if (trustInput.trim()) {
      update('trust_points', [...form.trust_points, trustInput.trim()]);
      setTrustInput('');
    }
  };

  const removeTrustPoint = (idx: number) => {
    update('trust_points', form.trust_points.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('shop_settings').update({
      shop_name: form.shop_name,
      logo_url: form.logo_url,
      whatsapp_number: form.whatsapp_number,
      phone_number: form.phone_number,
      address: form.address,
      maps_link: form.maps_link,
      opening_hours: form.opening_hours,
      social_links: form.social_links,
      delivery_info: form.delivery_info,
      pickup_info: form.pickup_info,
      hero_headline: form.hero_headline,
      hero_subtext: form.hero_subtext,
      hero_image_url: form.hero_image_url,
      offers_enabled: form.offers_enabled,
      offers_text: form.offers_text,
      trust_points: form.trust_points,
      low_stock_threshold: form.low_stock_threshold,
    }).eq('id', 1);
    if (error) { showToast('Failed to save settings', 'error'); setSaving(false); return; }
    showToast('Settings saved successfully');
    refresh();
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-900">Shop Settings</h1>
          <p className="text-sm text-primary-500 mt-1">Configure your store information</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</button>
      </div>

      {/* General */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><Store className="w-5 h-5 text-primary-700" /><h2 className="text-lg font-semibold text-primary-900">General</h2></div>
        <div className="space-y-4">
          <div>
            <label className="label">Shop Name</label>
            <input type="text" value={form.shop_name} onChange={(e) => update('shop_name', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Logo URL</label>
            <input type="text" value={form.logo_url || ''} onChange={(e) => update('logo_url', e.target.value)} className="input" placeholder="https://..." />
            {form.logo_url && <img src={form.logo_url} alt="Logo" className="mt-2 h-12 w-auto" />}
          </div>
          <div>
            <label className="label">Low Stock Threshold</label>
            <input type="number" value={form.low_stock_threshold} onChange={(e) => update('low_stock_threshold', Number(e.target.value))} className="input w-32" min="1" />
            <p className="text-xs text-primary-400 mt-1">Products with stock at or below this number are marked as "Low Stock"</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-accent-500" /><h2 className="text-lg font-semibold text-primary-900">Homepage Hero</h2></div>
        <div className="space-y-4">
          <div>
            <label className="label">Hero Headline</label>
            <input type="text" value={form.hero_headline} onChange={(e) => update('hero_headline', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Hero Subtext</label>
            <textarea value={form.hero_subtext} onChange={(e) => update('hero_subtext', e.target.value)} className="input min-h-[60px] resize-y" />
          </div>
          <div>
            <label className="label">Hero Image URL</label>
            <input type="text" value={form.hero_image_url || ''} onChange={(e) => update('hero_image_url', e.target.value)} className="input" placeholder="https://..." />
            {form.hero_image_url && <img src={form.hero_image_url} alt="Hero" className="mt-2 w-full aspect-[16/6] rounded-lg object-cover" />}
          </div>
        </div>
      </div>

      {/* Offers */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-accent-500" /><h2 className="text-lg font-semibold text-primary-900">Special Offers</h2></div>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.offers_enabled} onChange={(e) => update('offers_enabled', e.target.checked)} className="rounded border-primary-300 text-primary-900 focus:ring-primary-900" />
            <span className="text-sm text-primary-700">Show offers section on homepage</span>
          </label>
          <div>
            <label className="label">Offer Text</label>
            <input type="text" value={form.offers_text} onChange={(e) => update('offers_text', e.target.value)} className="input" placeholder="e.g. Flat 20% OFF on all T-Shirts" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><Phone className="w-5 h-5 text-primary-700" /><h2 className="text-lg font-semibold text-primary-900">Contact & WhatsApp</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">WhatsApp Number</label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
              <input type="text" value={form.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} className="input pl-10" placeholder="919855882263" />
            </div>
            <p className="text-xs text-primary-400 mt-1">Include country code, no + or spaces</p>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input type="text" value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} className="input pl-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-primary-700" /><h2 className="text-lg font-semibold text-primary-900">Store Location</h2></div>
        <div className="space-y-4">
          <div>
            <label className="label">Address</label>
            <textarea value={form.address} onChange={(e) => update('address', e.target.value)} className="input min-h-[60px] resize-y" />
          </div>
          <div>
            <label className="label">Google Maps Link</label>
            <input type="text" value={form.maps_link} onChange={(e) => update('maps_link', e.target.value)} className="input" placeholder="https://maps.google.com/..." />
          </div>
          <div>
            <label className="label">Opening Hours</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input type="text" value={form.opening_hours} onChange={(e) => update('opening_hours', e.target.value)} className="input pl-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Social */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><Share2 className="w-5 h-5 text-primary-700" /><h2 className="text-lg font-semibold text-primary-900">Social Media</h2></div>
        <div className="space-y-4">
          <div>
            <label className="label">Instagram URL</label>
            <input type="text" value={form.social_links.instagram || ''} onChange={(e) => update('social_links', { ...form.social_links, instagram: e.target.value })} className="input" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="label">Facebook URL</label>
            <input type="text" value={form.social_links.facebook || ''} onChange={(e) => update('social_links', { ...form.social_links, facebook: e.target.value })} className="input" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="label">Twitter / X URL</label>
            <input type="text" value={form.social_links.twitter || ''} onChange={(e) => update('social_links', { ...form.social_links, twitter: e.target.value })} className="input" placeholder="https://twitter.com/..." />
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><Truck className="w-5 h-5 text-primary-700" /><h2 className="text-lg font-semibold text-primary-900">Delivery & Pickup</h2></div>
        <div className="space-y-4">
          <div>
            <label className="label">Delivery Information</label>
            <textarea value={form.delivery_info} onChange={(e) => update('delivery_info', e.target.value)} className="input min-h-[60px] resize-y" />
          </div>
          <div>
            <label className="label">Store Pickup Information</label>
            <textarea value={form.pickup_info} onChange={(e) => update('pickup_info', e.target.value)} className="input min-h-[60px] resize-y" />
          </div>
        </div>
      </div>

      {/* Trust Points */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><ImageIcon className="w-5 h-5 text-primary-700" /><h2 className="text-lg font-semibold text-primary-900">Why Shop With Us</h2></div>
        <div className="space-y-3">
          {form.trust_points.map((point, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" value={point} onChange={(e) => update('trust_points', form.trust_points.map((p, i) => i === idx ? e.target.value : p))} className="input flex-1" />
              <button onClick={() => removeTrustPoint(idx)} className="p-2 text-error-600 hover:bg-error-50 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <input type="text" value={trustInput} onChange={(e) => setTrustInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrustPoint())} className="input flex-1" placeholder="Add a trust point..." />
            <button onClick={addTrustPoint} className="btn-outline"><Plus className="w-4 h-4" /> Add</button>
          </div>
        </div>
      </div>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Changes'}</button>
      </div>
    </div>
  );
}
