import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import type { ProductWithDetails } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useToast } from '@/context/ToastContext';
import {
  formatPrice,
  getDiscountPercentage,
  getEffectivePrice,
  getTotalStock,
  hasStock,
  cn,
} from '@/lib/utils';

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem, setCartOpen } = useCart();
  const { settings } = useShopSettings();
  const { showToast } = useToast();

  const effectivePrice = getEffectivePrice(product.price, product.discount_price);
  const discountPct = getDiscountPercentage(product.price, product.discount_price);
  const inStock = hasStock(product.variants || []);
  const totalStock = getTotalStock(product.variants || []);
  const allSizes = [
    ...new Set(
      (product.variants || []).flatMap((v) => v.sizes?.map((s) => s.size) || []),
    ),
  ].sort();

  const primaryImage = product.images?.[0] || (product.variants?.[0]?.image_url ?? null);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }
    // Find first in-stock variant+size
    for (const variant of product.variants || []) {
      for (const size of variant.sizes || []) {
        if (size.stock > 0) {
          addItem({
            product_id: product.id,
            variant_id: variant.id,
            variant_size_id: size.id,
            product_name: product.name,
            sku: product.sku,
            image_url: primaryImage || '',
            price: effectivePrice,
            size: size.size,
            color: variant.color,
            color_hex: variant.color_hex,
            quantity: 1,
            max_stock: size.stock,
          });
          showToast('Added to cart');
          setCartOpen(true);
          return;
        }
      }
    }
    showToast('No available stock', 'error');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast(
      isInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist',
      'info',
    );
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group card overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-primary-100">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-primary-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPct > 0 && (
            <span className="badge bg-error-600 text-white">-{discountPct}%</span>
          )}
          {product.is_new_arrival && (
            <span className="badge bg-primary-900 text-white">New</span>
          )}
          {product.is_best_seller && (
            <span className="badge bg-accent-500 text-primary-950">Best Seller</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm transition-all"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={cn(
              'w-4 h-4',
              isInWishlist(product.id) ? 'fill-error-500 text-error-500' : 'text-primary-600',
            )}
          />
        </button>

        {/* Stock status */}
        {!inStock && (
          <div className="absolute inset-0 bg-primary-950/40 flex items-center justify-center">
            <span className="badge bg-white text-primary-900 px-4 py-1.5 text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={!inStock}
            className="flex-1 btn-primary text-xs py-2"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </button>
          <span className="btn bg-white text-primary-900 text-xs py-2 px-3">
            <Eye className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {product.brand && (
          <p className="text-xs text-primary-400 font-medium uppercase tracking-wide">
            {product.brand}
          </p>
        )}
        <h3 className="text-sm font-semibold text-primary-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        {allSizes.length > 0 && (
          <p className="text-xs text-primary-500">
            Sizes: {allSizes.slice(0, 5).join(', ')}
            {allSizes.length > 5 ? '...' : ''}
          </p>
        )}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-base font-bold text-primary-900">
            {formatPrice(effectivePrice)}
          </span>
          {product.discount_price && product.discount_price < product.price && (
            <span className="text-xs text-primary-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        {inStock && totalStock <= (settings?.low_stock_threshold ?? 5) && (
          <p className="text-xs text-warning-600 font-medium">Only {totalStock} left!</p>
        )}
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-20 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-3 w-16 skeleton" />
        <div className="h-5 w-24 skeleton" />
      </div>
    </div>
  );
}
