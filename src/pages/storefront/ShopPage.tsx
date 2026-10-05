import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search, ChevronDown, ShoppingBag, Home as HomeIcon } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { ProductCard, ProductCardSkeleton } from '@/components/storefront/ProductCard';
import { formatPrice, getEffectivePrice, getTotalStock, hasStock, cn } from '@/lib/utils';
import type { ProductWithDetails } from '@/types';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'popular' | 'discount';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', 'Free'];

export function ShopPage() {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { settings } = useShopSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 5000 });
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showBestOnly, setShowBestOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Apply URL filter params
  useEffect(() => {
    const filter = searchParams.get('filter');
    const cat = searchParams.get('category');
    if (filter === 'new') setShowNewOnly(true);
    if (filter === 'bestseller') setShowBestOnly(true);
    if (filter === 'sale') setShowDiscountOnly(true);
    if (cat) setSelectedCategories([cat]);
  }, [searchParams]);

  // Sync search query from URL
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const allColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.color) colorMap.set(v.color, v.color_hex);
      });
    });
    return Array.from(colorMap.entries()).map(([color, hex]) => ({ color, hex }));
  }, [products]);

  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    let result: ProductWithDetails[] = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q),
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => p.category && selectedCategories.includes(p.category.slug));
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) => v.sizes?.some((s) => selectedSizes.includes(s.size))),
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) => selectedColors.includes(v.color)),
      );
    }

    // Price filter
    result = result.filter((p) => {
      const price = getEffectivePrice(p.price, p.discount_price);
      return price >= priceRange.min && price <= priceRange.max;
    });

    // In stock
    if (showInStockOnly) {
      result = result.filter((p) => hasStock(p.variants || []));
    }

    // Discount only
    if (showDiscountOnly) {
      result = result.filter((p) => p.discount_price && p.discount_price < p.price);
    }

    // New only
    if (showNewOnly) {
      result = result.filter((p) => p.is_new_arrival);
    }

    // Best seller only
    if (showBestOnly) {
      result = result.filter((p) => p.is_best_seller);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort(
          (a, b) =>
            getEffectivePrice(a.price, a.discount_price) - getEffectivePrice(b.price, b.discount_price),
        );
        break;
      case 'price_high':
        result.sort(
          (a, b) =>
            getEffectivePrice(b.price, b.discount_price) - getEffectivePrice(a.price, a.discount_price),
        );
        break;
      case 'discount':
        result.sort((a, b) => {
          const da = a.discount_price ? (a.price - a.discount_price) / a.price : 0;
          const db = b.discount_price ? (b.price - b.discount_price) / b.price : 0;
          return db - da;
        });
        break;
      case 'popular':
        result.sort((a, b) => {
          const sa = getTotalStock(a.variants || []);
          const sb = getTotalStock(b.variants || []);
          return sb - sa;
        });
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedSizes,
    selectedColors,
    priceRange,
    showInStockOnly,
    showDiscountOnly,
    showNewOnly,
    showBestOnly,
    sortBy,
  ]);

  const toggleArrayFilter = (
    value: string,
    setter: (v: string[]) => void,
    current: string[],
  ) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange({ min: 0, max: 5000 });
    setShowInStockOnly(false);
    setShowDiscountOnly(false);
    setShowNewOnly(false);
    setShowBestOnly(false);
    setSearchQuery('');
    setSearchParams({});
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedColors.length +
    (showInStockOnly ? 1 : 0) +
    (showDiscountOnly ? 1 : 0) +
    (showNewOnly ? 1 : 0) +
    (showBestOnly ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-primary-900 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleArrayFilter(cat.slug, setSelectedCategories, selectedCategories)}
                className="rounded border-primary-300 text-primary-900 focus:ring-primary-900"
              />
              <span className="text-sm text-primary-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-primary-900 mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceRange.min}
            onChange={(e) => setPriceRange((p) => ({ ...p, min: Number(e.target.value) }))}
            className="input text-xs py-2"
            placeholder="Min"
          />
          <span className="text-primary-400">-</span>
          <input
            type="number"
            value={priceRange.max}
            onChange={(e) => setPriceRange((p) => ({ ...p, max: Number(e.target.value) }))}
            className="input text-xs py-2"
            placeholder="Max"
          />
        </div>
        <p className="text-xs text-primary-500 mt-2">
          {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
        </p>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-sm font-semibold text-primary-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleArrayFilter(size, setSelectedSizes, selectedSizes)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                selectedSizes.includes(size)
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'border-primary-300 text-primary-700 hover:border-primary-900',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      {allColors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-primary-900 mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {allColors.map(({ color, hex }) => (
              <button
                key={color}
                onClick={() => toggleArrayFilter(color, setSelectedColors, selectedColors)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                  selectedColors.includes(color)
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-primary-300 hover:border-primary-900',
                )}
              >
                <span
                  className="w-3 h-3 rounded-full border border-primary-300"
                  style={{ backgroundColor: hex }}
                />
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggles */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-primary-900 mb-3">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
            className="rounded border-primary-300 text-primary-900 focus:ring-primary-900"
          />
          <span className="text-sm text-primary-700">In Stock Only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDiscountOnly}
            onChange={(e) => setShowDiscountOnly(e.target.checked)}
            className="rounded border-primary-300 text-primary-900 focus:ring-primary-900"
          />
          <span className="text-sm text-primary-700">On Sale / Discount</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showNewOnly}
            onChange={(e) => setShowNewOnly(e.target.checked)}
            className="rounded border-primary-300 text-primary-900 focus:ring-primary-900"
          />
          <span className="text-sm text-primary-700">New Arrivals</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showBestOnly}
            onChange={(e) => setShowBestOnly(e.target.checked)}
            className="rounded border-primary-300 text-primary-900 focus:ring-primary-900"
          />
          <span className="text-sm text-primary-700">Best Sellers</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="btn-ghost w-full text-xs py-2 border border-primary-200"
        >
          <X className="w-3 h-3" /> Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-primary-500 mb-4">
        <Link to="/" className="hover:text-primary-900 flex items-center gap-1">
          <HomeIcon className="w-3 h-3" /> Home
        </Link>
        <span>/</span>
        <span className="text-primary-900 font-medium">Shop</span>
      </div>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display tracking-wide text-primary-900">
          {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
        </h1>
        <p className="text-sm text-primary-500 mt-1">
          {loading ? 'Loading...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 card p-5">
            <FilterPanel />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Sort & mobile filter toggle */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="btn-outline lg:hidden text-sm py-2"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {activeFilterCount > 0 && (
                <span className="badge bg-primary-900 text-white ml-1">{activeFilterCount}</span>
              )}
            </button>

            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input pr-8 py-2 text-sm appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Popular</option>
                <option value="discount">Biggest Discount</option>
              </select>
              <ChevronDown className="w-4 h-4 text-primary-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-16 h-16 text-primary-200 mb-4" />
              <h3 className="text-lg font-semibold text-primary-900 mb-1">No products found</h3>
              <p className="text-sm text-primary-500 mb-4">
                Try adjusting your filters or search terms.
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="btn-outline">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-primary-950/50 animate-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl animate-slide-in-right flex flex-col max-w-[85vw]">
            <div className="flex items-center justify-between p-4 border-b border-primary-200">
              <h2 className="text-lg font-semibold text-primary-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel />
            </div>
            <div className="border-t border-primary-200 p-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-primary w-full"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
