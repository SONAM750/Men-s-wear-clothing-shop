import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useCategories } from '@/hooks/useCategories';
import { getWhatsAppUrl } from '@/lib/whatsapp';

export function Footer() {
  const { settings } = useShopSettings();
  const { categories } = useCategories();

  const socialLinks = settings?.social_links || { instagram: '', facebook: '', twitter: '' };

  return (
    <footer className="bg-primary-950 text-primary-300 mt-16">
      {/* Store info bar */}
      <div className="border-b border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-accent-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Visit Our Store</h4>
                <p className="text-sm text-primary-400">{settings?.address}</p>
                <p className="text-xs text-primary-500 mt-1">Opposite Vishal Mega Mart, Fazilka</p>
                {settings?.maps_link && (
                  <a
                    href={settings.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-400 hover:text-accent-300 mt-1 inline-block"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
            {settings?.opening_hours && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Opening Hours</h4>
                  <p className="text-sm text-primary-400">{settings?.opening_hours}</p>
                </div>
              </div>
            )}
            <div className={cn('flex items-start gap-3', !settings?.opening_hours && 'md:col-start-3')}>
              <Phone className="w-5 h-5 text-accent-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Contact Us</h4>
                <p className="text-sm text-primary-400">Phone/WhatsApp: 9855882263</p>
                <a
                  href={getWhatsAppUrl(
                    settings?.whatsapp_number || '',
                    'Hello Sachdeva Mens Wear, I have a query about your products.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#25D366] hover:text-[#1da851] mt-1 inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-xl text-white tracking-wide leading-tight">
              {settings?.shop_name || 'Sachdeva Mens Wear'}
            </span>
            <p className="text-sm text-primary-400 mt-2 max-w-xs">
              Trending men\u2019s wear in Fazilka. Latest styles, comfortable fits and pocket-friendly prices.
              Order easily via WhatsApp.
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-4">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary-800 hover:bg-accent-500 hover:text-primary-950 flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary-800 hover:bg-accent-500 hover:text-primary-950 flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary-800 hover:bg-accent-500 hover:text-primary-950 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Categories</h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-primary-400 hover:text-accent-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=new" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=bestseller" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=sale" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  On Sale
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Information</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-400 hover:text-accent-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-primary-500">
            &copy; {new Date().getFullYear()} {settings?.shop_name || 'Sachdeva Mens Wear'}, Fazilka. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
