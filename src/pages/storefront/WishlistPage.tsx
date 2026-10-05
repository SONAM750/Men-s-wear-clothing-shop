import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard, ProductCardSkeleton } from '@/components/storefront/ProductCard';

export function WishlistPage() {
  const { wishlist } = useWishlist();
  const { products, loading } = useProducts();

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-error-500 fill-error-500" />
        <h1 className="text-3xl font-display tracking-wide text-primary-900">My Wishlist</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="w-16 h-16 text-primary-200 mb-4" />
          <h3 className="text-lg font-semibold text-primary-900 mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-primary-500 mb-4">
            Save products you love by tapping the heart icon.
          </p>
          <Link to="/shop" className="btn-primary">
            <ShoppingBag className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {wishlistProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
