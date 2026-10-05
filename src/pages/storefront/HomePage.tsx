import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  Store,
  BadgePercent,
  Heart,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Star,
  Instagram,
  MapPin,
  Phone,
} from 'lucide-react';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useCategories } from '@/hooks/useCategories';
import { useFeaturedProducts, useNewArrivals, useBestSellers } from '@/hooks/useProducts';
import { ProductCard, ProductCardSkeleton } from '@/components/storefront/ProductCard';
import { getWhatsAppUrl } from '@/lib/whatsapp';

export function HomePage() {
  const { settings } = useShopSettings();
  const { categories } = useCategories();
  const { products: featured, loading: featuredLoading } = useFeaturedProducts();
  const { products: newArrivals, loading: newArrivalsLoading } = useNewArrivals();
  const { products: bestSellers, loading: bestSellersLoading } = useBestSellers();

  const trustIcons = [Sparkles, BadgePercent, Store, MessageCircle, Truck];
  const whatsappNumber = settings?.whatsapp_number || '919855882263';
  const instagramUrl = settings?.social_links?.instagram || 'https://www.instagram.com/sahil_sachdeva190/';

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-primary-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              settings?.hero_image_url ||
              'https://images.pexels.com/photos/6050428/pexels-photo-6050428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
            }
            alt="Sachdeva Mens Wear - Men's fashion in Fazilka"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 badge bg-accent-500/20 text-accent-300 border border-accent-500/30 mb-4 px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              New Arrivals in Store
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-wide">
              {settings?.hero_headline || 'Trending Men\u2019s Wear at the Right Price'}
            </h1>
            <p className="text-sm sm:text-base text-primary-300 mt-4 max-w-lg leading-relaxed">
              {settings?.hero_subtext ||
                'Discover trending shirts, T-shirts, jeans and everyday men\u2019s wear at Sachdeva Mens Wear, Fazilka.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
              <Link to="/shop" className="btn-accent text-base px-6 sm:px-8 py-3 sm:py-3.5">
                <ShoppingBag className="w-5 h-5" /> Shop Now
              </Link>
              <a
                href={getWhatsAppUrl(whatsappNumber, 'Hi Sachdeva Mens Wear, I would like to see your latest collection.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white text-base px-6 sm:px-8 py-3 sm:py-3.5 transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> Order on WhatsApp
              </a>
            </div>
            <p className="text-xs text-primary-400 mt-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Ph 22, Fazilka &middot; Opposite Vishal Mega Mart
            </p>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-primary-900">
            Shop By Category
          </h2>
          <Link
            to="/shop"
            className="text-sm font-medium text-primary-600 hover:text-primary-900 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative aspect-square sm:aspect-[4/5] rounded-xl overflow-hidden bg-primary-100"
            >
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-200">
                  <ShoppingBag className="w-8 h-8 text-primary-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <h3 className="text-white font-semibold text-sm sm:text-base">{cat.name}</h3>
                <span className="text-xs text-primary-300 group-hover:text-accent-400 flex items-center gap-1 mt-1 transition-colors">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Special Offers Banner */}
      {settings?.offers_enabled && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative bg-gradient-to-r from-accent-600 to-accent-500 rounded-2xl overflow-hidden p-6 sm:p-10">
            <div className="absolute top-0 right-0 opacity-10">
              <BadgePercent className="w-48 h-48 text-primary-950" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary-950" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary-950">
                  Offers &amp; Combos
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-primary-950 mb-2">
                {settings?.offers_text}
              </h2>
              <p className="text-sm text-primary-900 mb-4">
                Check out our latest combo offers and special deals. Style more, save more.
              </p>
              <Link to="/category/combo-offers" className="btn bg-primary-950 text-white hover:bg-primary-800">
                View Combos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trending / Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-accent-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
                Trending Now
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-primary-900">
              Featured Products
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium text-primary-600 hover:text-primary-900 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {featuredLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-primary-50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-success-600">
                  Fresh Styles
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-primary-900">
                New Arrivals
              </h2>
              <p className="text-sm text-primary-500 mt-1">Fresh styles just arrived at our store.</p>
            </div>
            <Link
              to="/shop?filter=new"
              className="text-sm font-medium text-primary-600 hover:text-primary-900 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {newArrivalsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : newArrivals.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
                Popular Picks
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-primary-900">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?filter=bestseller"
            className="text-sm font-medium text-primary-600 hover:text-primary-900 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {bestSellersLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="bg-primary-900 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-center mb-8">
            Why Shop With Us
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(settings?.trust_points || []).map((point, idx) => {
              const Icon = trustIcons[idx % trustIcons.length];
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-4 rounded-xl bg-primary-800/50 hover:bg-primary-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-accent-400" />
                  </div>
                  <p className="text-sm font-medium text-primary-200">{point}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visit Our Store Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-2xl bg-primary-50 border border-primary-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-6 sm:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-5 h-5 text-accent-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-accent-600">Visit Our Store</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-primary-900 mb-3">
                Sachdeva Mens Wear
              </h2>
              <p className="text-sm text-primary-600 mb-2 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                Ph 22, Fazilka, Punjab
              </p>
              <p className="text-sm text-primary-600 mb-6 pl-6">
                Right opposite Vishal Mega Mart, Fazilka
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Vishal+Mega+Mart+Fazilka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MapPin className="w-4 h-4" /> Get Directions
                </a>
                <a
                  href={getWhatsAppUrl(whatsappNumber, 'Hi Sachdeva Mens Wear, I would like to know more about your products.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us
                </a>
              </div>
            </div>
            <div className="relative min-h-[200px] bg-primary-200">
              <img
                src="https://images.pexels.com/photos/11911863/pexels-photo-11911863.jpeg?auto=compress&cs=tinysrgb&h=600"
                alt="Sachdeva Mens Wear store in Fazilka"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 p-6 sm:p-10 text-center">
          <MessageCircle className="w-12 h-12 text-[#25D366] mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-primary-900 mb-2">
            Order Through WhatsApp
          </h2>
          <p className="text-sm text-primary-600 max-w-md mx-auto mb-6">
            Browse products, add to cart, and send your order directly to us on WhatsApp.
            We'll confirm availability and you can pick up from our store.
          </p>
          <a
            href={getWhatsAppUrl(
              whatsappNumber,
              `Hi Sachdeva Mens Wear, I would like to know more about your products.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Instagram / Social Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Instagram className="w-5 h-5 text-primary-900" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary-500">
              See What's New on Instagram
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display tracking-wide text-primary-900">
            Follow @sahil_sachdeva190
          </h2>
          <p className="text-sm text-primary-500 mt-1 max-w-md mx-auto">
            Follow @sahil_sachdeva190 for new arrivals, latest styles, offers and product updates.
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {[
            'https://images.pexels.com/photos/3290886/pexels-photo-3290886.jpeg?auto=compress&cs=tinysrgb&h=200',
            'https://images.pexels.com/photos/2229712/pexels-photo-2229712.jpeg?auto=compress&cs=tinysrgb&h=200',
            'https://images.pexels.com/photos/4443831/pexels-photo-4443831.jpeg?auto=compress&cs=tinysrgb&h=200',
            'https://images.pexels.com/photos/28938765/pexels-photo-28938765.jpeg?auto=compress&cs=tinysrgb&h=200',
            'https://images.pexels.com/photos/27584193/pexels-photo-27584193.jpeg?auto=compress&cs=tinysrgb&h=200',
            'https://images.pexels.com/photos/9499128/pexels-photo-9499128.jpeg?auto=compress&cs=tinysrgb&h=200',
          ].map((src, i) => (
            <a
              key={i}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square rounded-lg overflow-hidden bg-primary-100 group relative"
            >
              <img
                src={src}
                alt="Instagram post from Sachdeva Mens Wear"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-primary-950/0 group-hover:bg-primary-950/30 transition-colors flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
        <div className="text-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <Instagram className="w-4 h-4" /> Follow on Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
