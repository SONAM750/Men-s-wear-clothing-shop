import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Copy, Trash2, Star, Sparkles, Eye, EyeOff, X, Save, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { formatPrice, getEffectivePrice, getTotalStock, slugify, cn } from '@/lib/utils';
import type { Product, Category, ProductVariant, VariantSize } from '@/types';

interface ProductWithVariants extends Product {
  variants: (ProductVariant & { sizes: VariantSize[] })[];
  category?: Category | null;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', 'Free'];

export function AdminProductsPage() {
  const { showToast } = useToast();
  const { settings } = useShopSettings();
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProductWithVariants | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    const { data: variants } = await supabase.from('product_variants').select('*');
    const { data: sizes } = await supabase.from('variant_sizes').select('*');

    const variantList = (variants as ProductVariant[]) || [];
    const sizeList = (sizes as VariantSize[]) || [];
    const catList = (cats as Category[]) || [];

    const result: ProductWithVariants[] = ((prods as Product[]) || []).map((p) => ({
      ...p,
      variants: variantList
        .filter((v) => v.product_id === p.id)
        .map((v) => ({
          ...v,
          sizes: sizeList.filter((s) => s.variant_id === v.id),
        })),
      category: catList.find((c) => c.id === p.category_id) || null,
    }));

    setProducts(result);
    setCategories(catList);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category_id === filterCategory;
    return matchSearch && matchCat;
  });

  const toggleFlag = async (product: ProductWithVariants, flag: 'is_featured' | 'is_best_seller' | 'is_new_arrival' | 'is_on_sale' | 'is_active') => {
    const { error } = await supabase.from('products').update({ [flag]: !product[flag] }).eq('id', product.id);
    if (error) { showToast('Failed to update', 'error'); return; }
    showToast('Updated successfully');
    fetchProducts();
  };

  const duplicateProduct = async (product: ProductWithVariants) => {
    const { id, created_at, updated_at, variants, category, ...prodData } = product;
    const { data: newProd, error } = await supabase.from('products').insert({
      ...prodData,
      name: `${product.name} (Copy)`,
      sku: product.sku ? `${product.sku}-COPY` : null,
    }).select().single();
    if (error || !newProd) { showToast('Failed to duplicate', 'error'); return; }

    // Duplicate variants + sizes
    for (const variant of variants) {
      const { id: vId, product_id, created_at: vc, sizes, ...vData } = variant;
      const { data: newVariant } = await supabase.from('product_variants').insert({
        ...vData,
        product_id: newProd.id,
      }).select().single();
      if (newVariant && sizes.length > 0) {
        await supabase.from('variant_sizes').insert(
          sizes.map((s) => ({ variant_id: newVariant.id, size: s.size, stock: s.stock }))
        );
      }
    }
    showToast('Product duplicated');
    fetchProducts();
  };

  const deleteProduct = async (product: ProductWithVariants) => {
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) { showToast('Failed to delete', 'error'); return; }
    showToast('Product deleted');
    setConfirmDelete(null);
    fetchProducts();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary-900">Products</h1>
          <p className="text-sm text-primary-500 mt-1">{products.length} total products</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, SKU, brand..." className="input pl-10" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input sm:w-48">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-4 h-20 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-primary-200 mx-auto mb-3" />
          <p className="text-sm text-primary-500 mb-4">No products found</p>
          <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Your First Product
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary-50 text-left text-xs text-primary-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filtered.map((p) => {
                  const stock = getTotalStock(p.variants);
                  return (
                    <tr key={p.id} className="hover:bg-primary-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-lg overflow-hidden bg-primary-100 shrink-0">
                            {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-primary-900 truncate max-w-[200px]">{p.name}</p>
                            <p className="text-xs text-primary-500">{p.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-primary-600">{p.category?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary-900">{formatPrice(getEffectivePrice(p.price, p.discount_price))}</span>
                        {p.discount_price && p.discount_price < p.price && (
                          <span className="text-xs text-primary-400 line-through ml-1">{formatPrice(p.price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('badge', stock === 0 ? 'bg-error-100 text-error-700' : stock <= (settings?.low_stock_threshold ?? 5) ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700')}>{stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.is_featured && <span className="badge bg-accent-100 text-accent-700" title="Featured"><Sparkles className="w-3 h-3" /></span>}
                          {p.is_best_seller && <span className="badge bg-accent-100 text-accent-700" title="Best Seller"><Star className="w-3 h-3" /></span>}
                          {p.is_new_arrival && <span className="badge bg-primary-100 text-primary-700">New</span>}
                          {p.is_on_sale && <span className="badge bg-error-100 text-error-700">Sale</span>}
                          <button onClick={() => toggleFlag(p, 'is_active')} className={cn('badge', p.is_active ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-500')}>
                            {p.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg" title="Edit"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => duplicateProduct(p)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg" title="Duplicate"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDelete(p)} className="p-2 text-error-600 hover:bg-error-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((p) => {
              const stock = getTotalStock(p.variants);
              return (
                <div key={p.id} className="card p-3">
                  <div className="flex gap-3">
                    <div className="w-14 h-16 rounded-lg overflow-hidden bg-primary-100 shrink-0">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-primary-500">{p.category?.name || '-'} - {p.sku || 'No SKU'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-primary-900">{formatPrice(getEffectivePrice(p.price, p.discount_price))}</span>
                        <span className={cn('badge text-xs', stock === 0 ? 'bg-error-100 text-error-700' : stock <= (settings?.low_stock_threshold ?? 5) ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700')}>{stock} stock</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-primary-100">
                    <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="btn-ghost text-xs py-1.5 px-2"><Pencil className="w-3 h-3" /> Edit</button>
                    <button onClick={() => duplicateProduct(p)} className="btn-ghost text-xs py-1.5 px-2"><Copy className="w-3 h-3" /> Copy</button>
                    <button onClick={() => setConfirmDelete(p)} className="btn-ghost text-xs py-1.5 px-2 text-error-600"><Trash2 className="w-3 h-3" /> Delete</button>
                    <button onClick={() => toggleFlag(p, 'is_active')} className="btn-ghost text-xs py-1.5 px-2 ml-auto">
                      {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSaved={() => { setShowModal(false); setEditingProduct(null); fetchProducts(); }}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-950/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-error-600" />
            </div>
            <h3 className="text-lg font-semibold text-primary-900 text-center mb-2">Delete Product?</h3>
            <p className="text-sm text-primary-500 text-center mb-6">
              Are you sure you want to delete "{confirmDelete.name}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => deleteProduct(confirmDelete)} className="btn bg-error-600 text-white hover:bg-error-700 flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Product Form Modal ---
interface ProductFormModalProps {
  product: ProductWithVariants | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function ProductFormModal({ product, categories, onClose, onSaved }: ProductFormModalProps) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category_id: product?.category_id || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    discount_price: product?.discount_price?.toString() || '',
    brand: product?.brand || '',
    fabric: product?.fabric || '',
    is_featured: product?.is_featured || false,
    is_best_seller: product?.is_best_seller || false,
    is_new_arrival: product?.is_new_arrival || false,
    is_on_sale: product?.is_on_sale || false,
    is_active: product?.is_active ?? true,
    images: (product?.images as string[]) || [],
  });
  const [variants, setVariants] = useState<{
    id?: string;
    color: string;
    color_hex: string;
    image_url: string;
    sizes: { id?: string; size: string; stock: number }[];
  }[]>(
    product?.variants?.map((v) => ({
      id: v.id,
      color: v.color,
      color_hex: v.color_hex,
      image_url: v.image_url || '',
      sizes: v.sizes?.map((s) => ({ id: s.id, size: s.size, stock: s.stock })) || [],
    })) || [
      { color: 'Black', color_hex: '#000000', image_url: '', sizes: SIZES.slice(0, 4).map((s) => ({ size: s, stock: 10 })) },
    ]
  );
  const [imageUrlInput, setImageUrlInput] = useState('');

  const addVariant = () => {
    setVariants([...variants, { color: '', color_hex: '#000000', image_url: '', sizes: SIZES.slice(0, 4).map((s) => ({ size: s, stock: 0 })) }]);
  };

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: string, value: string) => {
    setVariants(variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const updateSizeStock = (vIdx: number, sIdx: number, stock: number) => {
    setVariants(variants.map((v, i) => {
      if (i !== vIdx) return v;
      return { ...v, sizes: v.sizes.map((s, j) => (j === sIdx ? { ...s, stock } : s)) };
    }));
  };

  const addSizeToVariant = (vIdx: number) => {
    setVariants(variants.map((v, i) => {
      if (i !== vIdx) return v;
      const usedSizes = v.sizes.map((s) => s.size);
      const available = SIZES.find((s) => !usedSizes.includes(s));
      if (!available) return v;
      return { ...v, sizes: [...v.sizes, { size: available, stock: 0 }] };
    }));
  };

  const removeSizeFromVariant = (vIdx: number, sIdx: number) => {
    setVariants(variants.map((v, i) => {
      if (i !== vIdx) return v;
      return { ...v, sizes: v.sizes.filter((_, j) => j !== sIdx) };
    }));
  };

  const addImage = () => {
    if (imageUrlInput.trim()) {
      setForm({ ...form, images: [...form.images, imageUrlInput.trim()] });
      setImageUrlInput('');
    }
  };

  const removeImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Product name is required', 'error'); return; }
    if (!form.price || Number(form.price) <= 0) { showToast('Valid price is required', 'error'); return; }
    setSaving(true);

    try {
      const productData = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        category_id: form.category_id || null,
        description: form.description.trim() || null,
        price: Number(form.price),
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        brand: form.brand.trim() || null,
        fabric: form.fabric.trim() || null,
        is_featured: form.is_featured,
        is_best_seller: form.is_best_seller,
        is_new_arrival: form.is_new_arrival,
        is_on_sale: form.is_on_sale,
        is_active: form.is_active,
        images: form.images,
      };

      if (product) {
        // Update
        const { error } = await supabase.from('products').update(productData).eq('id', product.id);
        if (error) throw error;

        // Update variants - delete old, insert new (simplest approach)
        await supabase.from('product_variants').delete().eq('product_id', product.id);
        for (const variant of variants) {
          const { data: newVariant } = await supabase.from('product_variants').insert({
            product_id: product.id,
            color: variant.color || 'Default',
            color_hex: variant.color_hex,
            image_url: variant.image_url || null,
          }).select().single();
          if (newVariant && variant.sizes.length > 0) {
            await supabase.from('variant_sizes').insert(
              variant.sizes.map((s) => ({ variant_id: newVariant.id, size: s.size, stock: s.stock }))
            );
          }
        }
      } else {
        // Insert
        const { data: newProd, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        for (const variant of variants) {
          const { data: newVariant } = await supabase.from('product_variants').insert({
            product_id: newProd.id,
            color: variant.color || 'Default',
            color_hex: variant.color_hex,
            image_url: variant.image_url || null,
          }).select().single();
          if (newVariant && variant.sizes.length > 0) {
            await supabase.from('variant_sizes').insert(
              variant.sizes.map((s) => ({ variant_id: newVariant.id, size: s.size, stock: s.stock }))
            );
          }
        }
      }

      showToast(product ? 'Product updated' : 'Product added');
      onSaved();
    } catch {
      showToast('Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-primary-950/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full shadow-2xl my-0 sm:my-8 max-h-screen sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary-200 shrink-0">
          <h2 className="text-lg font-semibold text-primary-900">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Product Name <span className="text-error-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Premium Cotton T-Shirt" />
            </div>
            <div>
              <label className="label">SKU / Product Code</label>
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" placeholder="e.g. TS-001" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price (₹) <span className="text-error-500">*</span></label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" placeholder="799" min="0" />
            </div>
            <div>
              <label className="label">Discount Price (₹)</label>
              <input type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} className="input" placeholder="699" min="0" />
            </div>
            <div>
              <label className="label">Brand</label>
              <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" placeholder="e.g. Urban Co." />
            </div>
            <div>
              <label className="label">Fabric / Material</label>
              <input type="text" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} className="input" placeholder="e.g. 100% Cotton" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[80px] resize-y" placeholder="Product description..." />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="label">Product Images (URLs)</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())} className="input flex-1" placeholder="Paste image URL..." />
              <button onClick={addImage} className="btn-outline"><Plus className="w-4 h-4" /> Add</button>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-20 rounded-lg overflow-hidden bg-primary-100 group">
                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-error-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants (Color + Sizes) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Color Variants & Stock</label>
              <button onClick={addVariant} className="btn-ghost text-xs py-1.5"><Plus className="w-3 h-3" /> Add Color</button>
            </div>
            <div className="space-y-3">
              {variants.map((variant, vIdx) => (
                <div key={vIdx} className="border border-primary-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <input type="text" value={variant.color} onChange={(e) => updateVariant(vIdx, 'color', e.target.value)} className="input flex-1 text-sm" placeholder="Color name" />
                    <input type="color" value={variant.color_hex} onChange={(e) => updateVariant(vIdx, 'color_hex', e.target.value)} className="w-10 h-10 rounded-lg border border-primary-300 cursor-pointer" />
                    {variants.length > 1 && <button onClick={() => removeVariant(vIdx)} className="p-2 text-error-600 hover:bg-error-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                  <div className="space-y-2">
                    {variant.sizes.map((size, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary-700 w-12">{size.size}</span>
                        <input type="number" value={size.stock} onChange={(e) => updateSizeStock(vIdx, sIdx, Math.max(0, Number(e.target.value)))} className="input flex-1 text-sm py-1.5" min="0" placeholder="Stock" />
                        <span className="text-xs text-primary-500">qty</span>
                        <button onClick={() => removeSizeFromVariant(vIdx, sIdx)} className="p-1 text-primary-400 hover:text-error-600"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => addSizeToVariant(vIdx)} className="btn-ghost text-xs py-1"><Plus className="w-3 h-3" /> Add Size</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: 'is_active', label: 'Active' },
              { key: 'is_featured', label: 'Featured' },
              { key: 'is_best_seller', label: 'Best Seller' },
              { key: 'is_new_arrival', label: 'New Arrival' },
              { key: 'is_on_sale', label: 'On Sale' },
            ].map((flag) => (
              <label key={flag.key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-primary-200 hover:bg-primary-50">
                <input type="checkbox" checked={form[flag.key as keyof typeof form] as boolean} onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })} className="rounded border-primary-300 text-primary-900 focus:ring-primary-900" />
                <span className="text-sm text-primary-700">{flag.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-primary-200 p-4 flex gap-3 shrink-0">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Product'}</button>
        </div>
      </div>
    </div>
  );
}
