import { useParams, Link } from 'react-router-dom';
import { Home as HomeIcon, ChevronRight, ShoppingBag } from 'lucide-react';
import { useProductsByCategory } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard, ProductCardSkeleton } from '@/components/storefront/ProductCard';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = useProductsByCategory(slug);
  const { categories } = useCategories();
  const category = categories.find((c) => c.slug === slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-primary-500 mb-4">
        <Link to="/" className="hover:text-primary-900 flex items-center gap-1">
          <HomeIcon className="w-3 h-3" /> Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary-900">
          Shop
        </Link>
        <span>/</span>
        <span className="text-primary-900 font-medium">{category?.name || 'Category'}</span>
      </div>

      {/* Category header */}
      {category && (
        <div className="relative h-40 sm:h-56 rounded-2xl overflow-hidden mb-6">
          {category.image_url ? (
            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 to-primary-950/20" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <h1 className="text-3xl sm:text-4xl font-display tracking-wide text-white">
              {category.name}
            </h1>
            <p className="text-sm text-primary-300 mt-1">
              {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-primary-200 mb-4" />
          <h3 className="text-lg font-semibold text-primary-900 mb-1">No products in this category yet</h3>
          <p className="text-sm text-primary-500 mb-4">Check back soon for new arrivals!</p>
          <Link to="/shop" className="btn-outline">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
