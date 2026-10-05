import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  Truck,
  Store,
  MessageCircle,
  Check,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useToast } from '@/context/ToastContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ProductCard, ProductCardSkeleton } from '@/components/storefront/ProductCard';
import {
  formatPrice,
  getDiscountPercentage,
  getEffectivePrice,
  getStockLabel,
  cn,
} from '@/lib/utils';
import { getWhatsAppUrl } from '@/lib/whatsapp';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProduct(id);
  const { addItem, setCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { settings } = useShopSettings();
  const { showToast } = useToast();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { products: allProducts } = useProducts();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      // Auto-select first available variant
      const firstVariant = product.variants?.find(
        (v) => v.sizes && v.sizes.some((s) => s.stock > 0),
      );
      if (firstVariant) {
        setSelectedVariantId(firstVariant.id);
        const firstInStockSize = firstVariant.sizes?.find((s) => s.stock > 0);
        if (firstInStockSize) {
          setSelectedSizeId(firstInStockSize.id);
        }
      } else if (product.variants && product.variants.length > 0) {
        setSelectedVariantId(product.variants[0].id);
      }
      setQuantity(1);
      setActiveImage(0);
    }
  }, [product, addRecentlyViewed]);

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId);
  const selectedSize = selectedVariant?.sizes?.find((s) => s.id === selectedSizeId);
  const effectivePrice = product ? getEffectivePrice(product.price, product.discount_price) : 0;
  const discountPct = product ? getDiscountPercentage(product.price, product.discount_price) : 0;
  const inWishlist = product ? isInWishlist(product.id) : false;

  // Build image gallery: product images + variant images
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imgs = [...(product.images || [])];
    product.variants?.forEach((v) => {
      if (v.image_url && !imgs.includes(v.image_url)) imgs.push(v.image_url);
    });
    return imgs;
  }, [product]);

  // Related products (same category, excluding current)
  const relatedProducts = useMemo(() => {
    if (!product?.category_id) return [];
    return allProducts
      .filter((p) => p.category_id === product.category_id && p.id !== product.id)
      .slice(0, 4);
  }, [allProducts, product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant || !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (selectedSize.stock === 0) {
      showToast('This size is out of stock', 'error');
      return;
    }
    if (quantity > selectedSize.stock) {
      showToast(`Only ${selectedSize.stock} items available`, 'error');
      return;
    }
    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      variant_size_id: selectedSize.id,
      product_name: product.name,
      sku: product.sku,
      image_url: galleryImages[0] || '',
      price: effectivePrice,
      size: selectedSize.size,
      color: selectedVariant.color,
      color_hex: selectedVariant.color_hex,
      quantity,
      max_stock: selectedSize.stock,
    });
    showToast('Added to cart!');
    setCartOpen(true);
  };

  const handleBuyViaWhatsApp = () => {
    if (!product || !selectedVariant || !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (selectedSize.stock === 0) {
      showToast('This size is out of stock', 'error');
      return;
    }
    const msg = `Hi Sachdeva Mens Wear, I am interested in this product: ${product.name} (Size: ${selectedSize.size}, Color: ${selectedVariant.color}, Quantity: ${quantity}). Please share availability, size and price.`;
    window.open(getWhatsAppUrl(settings?.whatsapp_number || '', msg), '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-[3/4] skeleton rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 w-24 skeleton" />
            <div className="h-8 w-full skeleton" />
            <div className="h-6 w-32 skeleton" />
            <div className="h-32 w-full skeleton" />
            <div className="h-10 w-full skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-semibold text-primary-900 mb-2">Product not found</h1>
        <p className="text-sm text-primary-500 mb-4">
          The product you're looking for may have been removed.
        </p>
        <Link to="/shop" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-primary-500 mb-6 overflow-x-auto">
        <Link to="/" className="hover:text-primary-900 flex items-center gap-1 shrink-0">
          <HomeIcon className="w-3 h-3" /> Home
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link to="/shop" className="hover:text-primary-900 shrink-0">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link
              to={`/category/${product.category.slug}`}
              className="hover:text-primary-900 shrink-0"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-primary-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-primary-100 mb-3 relative">
            {galleryImages[activeImage] ? (
              <img
                src={galleryImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-primary-300" />
              </div>
            )}
            {discountPct > 0 && (
              <span className="absolute top-3 left-3 badge bg-error-600 text-white px-3 py-1.5">
                -{discountPct}% OFF
              </span>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors',
                    activeImage === idx ? 'border-primary-900' : 'border-primary-200',
                  )}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.brand && (
            <p className="text-sm font-medium text-primary-400 uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary-900 mb-2">
            {product.name}
          </h1>

          {/* SKU & Category */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-primary-500 mb-4">
            {product.sku && <span>SKU: {product.sku}</span>}
            {product.category && <span>Category: {product.category.name}</span>}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-primary-900">{formatPrice(effectivePrice)}</span>
            {product.discount_price && product.discount_price < product.price && (
              <>
                <span className="text-lg text-primary-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="badge bg-error-100 text-error-700">
                  Save {formatPrice(product.price - product.discount_price)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-primary-600 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Color selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <label className="label">Color: {selectedVariant?.color}</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const variantInStock = variant.sizes?.some((s) => s.stock > 0);
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        const firstInStock = variant.sizes?.find((s) => s.stock > 0);
                        setSelectedSizeId(firstInStock?.id || null);
                        setQuantity(1);
                      }}
                      disabled={!variantInStock}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                        selectedVariantId === variant.id
                          ? 'border-primary-900 bg-primary-50'
                          : 'border-primary-300 hover:border-primary-900',
                      )}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-primary-300"
                        style={{ backgroundColor: variant.color_hex }}
                      />
                      {variant.color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selection */}
          {selectedVariant && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Size</label>
                {selectedSize && (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      selectedSize.stock === 0
                        ? 'text-error-600'
                        : selectedSize.stock <= (settings?.low_stock_threshold ?? 5)
                          ? 'text-warning-600'
                          : 'text-success-600',
                    )}
                  >
                    {getStockLabel(selectedSize.stock, settings?.low_stock_threshold)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedVariant.sizes?.map((size) => {
                  const outOfStock = size.stock === 0;
                  return (
                    <button
                      key={size.id}
                      onClick={() => {
                        setSelectedSizeId(size.id);
                        setQuantity(1);
                      }}
                      disabled={outOfStock}
                      className={cn(
                        'min-w-[3rem] px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all relative',
                        outOfStock
                          ? 'border-primary-200 text-primary-300 cursor-not-allowed line-through'
                          : selectedSizeId === size.id
                            ? 'border-primary-900 bg-primary-900 text-white'
                            : 'border-primary-300 text-primary-800 hover:border-primary-900',
                      )}
                    >
                      {size.size}
                      {outOfStock && (
                        <span className="absolute -bottom-5 left-0 right-0 text-[10px] text-error-600 font-medium text-center">
                          Out of Stock
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          {selectedSize && selectedSize.stock > 0 && (
            <div className="mb-6">
              <label className="label">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-primary-300 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 text-primary-600 hover:bg-primary-100 rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > selectedSize.stock) {
                        showToast(`Only ${selectedSize.stock} items available`, 'error');
                        setQuantity(selectedSize.stock);
                      } else {
                        setQuantity(Math.max(1, val));
                      }
                    }}
                    min={1}
                    max={selectedSize.stock}
                    className="w-16 text-center text-sm font-semibold text-primary-900 border-0 focus:ring-0 focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      setQuantity((q) => {
                        if (q + 1 > selectedSize.stock) {
                          showToast(`Only ${selectedSize.stock} items available`, 'error');
                          return q;
                        }
                        return q + 1;
                      })
                    }
                    disabled={quantity >= selectedSize.stock}
                    className="px-3 py-2.5 text-primary-600 hover:bg-primary-100 rounded-r-lg disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-primary-500">
                  {selectedSize.stock} available
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || selectedSize.stock === 0}
              className="btn-primary flex-1"
            >
              <ShoppingBag className="w-5 h-5" /> Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                'btn border',
                inWishlist
                  ? 'border-error-500 text-error-600 bg-error-50'
                  : 'border-primary-300 text-primary-700 hover:border-primary-900',
              )}
            >
              <Heart className={cn('w-5 h-5', inWishlist && 'fill-error-500')} />
            </button>
          </div>

          <button
            onClick={handleBuyViaWhatsApp}
            disabled={!selectedSize || selectedSize.stock === 0}
            className="btn-whatsapp w-full mb-6"
          >
            <MessageCircle className="w-5 h-5" /> Order on WhatsApp
          </button>

          {/* Product details */}
          <div className="card p-4 space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-primary-900">Product Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.fabric && (
                <div>
                  <span className="text-primary-500">Fabric</span>
                  <p className="text-primary-900 font-medium">{product.fabric}</p>
                </div>
              )}
              {product.brand && (
                <div>
                  <span className="text-primary-500">Brand</span>
                  <p className="text-primary-900 font-medium">{product.brand}</p>
                </div>
              )}
              {product.sku && (
                <div>
                  <span className="text-primary-500">SKU</span>
                  <p className="text-primary-900 font-medium">{product.sku}</p>
                </div>
              )}
              {product.category && (
                <div>
                  <span className="text-primary-500">Category</span>
                  <p className="text-primary-900 font-medium">{product.category.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery info */}
          <div className="space-y-2">
            {settings?.delivery_info && (
              <div className="flex items-start gap-2 text-sm text-primary-600">
                <Truck className="w-4 h-4 text-success-600 mt-0.5 shrink-0" />
                <span>{settings?.delivery_info}</span>
              </div>
            )}
            {settings?.pickup_info && (
              <div className="flex items-start gap-2 text-sm text-primary-600">
                <Store className="w-4 h-4 text-accent-600 mt-0.5 shrink-0" />
                <span>{settings?.pickup_info}</span>
              </div>
            )}
            <div className="flex items-start gap-2 text-sm text-primary-600">
              <Check className="w-4 h-4 text-success-600 mt-0.5 shrink-0" />
              <span>Order on WhatsApp - no online payment needed.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-display tracking-wide text-primary-900 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
