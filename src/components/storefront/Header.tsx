import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Heart, Phone, Instagram } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, setCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { settings } = useShopSettings();
  const { categories } = useCategories();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-900 text-white text-xs py-2 px-4 text-center hidden sm:block">
        <p>
          {settings?.offers_enabled
            ? settings?.offers_text
            : 'Order via WhatsApp - No online payment needed'}
        </p>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-white border-b border-primary-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={settings.shop_name} className="h-8 w-auto" />
              ) : (
                <span className="font-display text-xl sm:text-2xl tracking-wide text-primary-900 leading-tight">
                  {settings?.shop_name || 'Sachdeva Mens Wear'}
                </span>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Shop All
              </Link>
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                to="/about"
                className="px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                to="/wishlist"
                className="p-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors relative hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-error-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-primary-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="border-t border-primary-200 bg-white animate-slide-up">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, SKU, brand..."
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary">
                  <Search className="w-4 h-4" /> Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn-ghost"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-primary-950/50 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-primary-200">
              <span className="font-display text-lg text-primary-900 leading-tight">
                {settings?.shop_name || 'Sachdeva Mens Wear'}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50 rounded-lg"
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block px-3 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50 rounded-lg"
              >
                Shop All
              </Link>
              <div className="pt-2 pb-1 px-3 text-xs font-semibold text-primary-400 uppercase tracking-wide">
                Categories
              </div>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="block px-3 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50 rounded-lg"
                >
                  {cat.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-primary-200 mt-2">
                <Link
                  to="/wishlist"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50 rounded-lg"
                >
                  <Heart className="w-4 h-4" /> Wishlist ({wishlistCount})
                </Link>
                {settings?.phone_number && (
                  <a
                    href={`tel:${settings.phone_number}`}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50 rounded-lg"
                  >
                    <Phone className="w-4 h-4" /> Call Us
                  </a>
                )}
                {settings?.social_links?.instagram && (
                  <a
                    href={settings.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50 rounded-lg"
                  >
                    <Instagram className="w-4 h-4" /> @sahil_sachdeva190
                  </a>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
