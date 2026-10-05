import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, Tag, Eye, EyeOff, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { slugify, cn } from '@/lib/utils';
import type { Category, Product } from '@/types';

export function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<(Category & { productCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image_url: '', is_active: true, sort_order: 0 });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name');
    const { data: prods } = await supabase.from('products').select('category_id');

    const catList = (cats as Category[]) || [];
    const prodList = (prods as Pick<Product, 'category_id'>[]) || [];

    const result = catList.map((c) => ({
      ...c,
      productCount: prodList.filter((p) => p.category_id === c.id).length,
    }));
    setCategories(result);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', image_url: '', is_active: true, sort_order: 0 });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, image_url: cat.image_url || '', is_active: cat.is_active, sort_order: cat.sort_order });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) { showToast('Category name is required', 'error'); return; }
    const slug = form.slug.trim() || slugify(form.name);
    const data = { name: form.name.trim(), slug, image_url: form.image_url.trim() || null, is_active: form.is_active, sort_order: form.sort_order };

    if (editing) {
      const { error } = await supabase.from('categories').update(data).eq('id', editing.id);
      if (error) { showToast(error.message.includes('duplicate') ? 'Slug already exists' : 'Failed to update', 'error'); return; }
      showToast('Category updated');
    } else {
      const { error } = await supabase.from('categories').insert(data);
      if (error) { showToast(error.message.includes('duplicate') ? 'Slug already exists' : 'Failed to add', 'error'); return; }
      showToast('Category added');
    }
    setShowModal(false);
    fetchCategories();
  };

  const toggleActive = async (cat: Category) => {
    const { error } = await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    if (error) { showToast('Failed to update', 'error'); return; }
    showToast('Category updated');
    fetchCategories();
  };

  const deleteCat = async (cat: Category) => {
    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) { showToast('Cannot delete - products may be assigned', 'error'); return; }
    showToast('Category deleted');
    setConfirmDelete(null);
    fetchCategories();
  };

  const filtered = categories.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary-900">Categories</h1>
          <p className="text-sm text-primary-500 mt-1">{categories.length} total categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="input pl-10" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card p-4 h-32 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Tag className="w-12 h-12 text-primary-200 mx-auto mb-3" />
          <p className="text-sm text-primary-500 mb-4">No categories yet</p>
          <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Your First Category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div key={cat.id} className="card overflow-hidden">
              <div className="aspect-[16/9] bg-primary-100 relative">
                {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Tag className="w-8 h-8 text-primary-300" /></div>}
                <div className="absolute top-2 right-2">
                  <span className={cn('badge text-xs', cat.is_active ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-500')}>{cat.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-primary-900 text-sm">{cat.name}</h3>
                  <span className="text-xs text-primary-500">{cat.productCount} products</span>
                </div>
                <p className="text-xs text-primary-400 mb-3">/{cat.slug}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(cat)} className="btn-ghost text-xs py-1.5 px-2"><Pencil className="w-3 h-3" /> Edit</button>
                  <button onClick={() => toggleActive(cat)} className="btn-ghost text-xs py-1.5 px-2">
                    {cat.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button onClick={() => setConfirmDelete(cat)} className="btn-ghost text-xs py-1.5 px-2 text-error-600 ml-auto"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-950/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-primary-200">
              <h2 className="text-lg font-semibold text-primary-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Category Name <span className="text-error-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="input" placeholder="e.g. T-Shirts" />
              </div>
              <div>
                <label className="label">Slug (URL)</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="input" placeholder="t-shirts" />
                <p className="text-xs text-primary-400 mt-1">Used in the URL: /category/t-shirts</p>
              </div>
              <div>
                <label className="label">Image URL</label>
                <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input" placeholder="https://..." />
                {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 w-full aspect-[16/9] rounded-lg object-cover" />}
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input" min="0" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-primary-300 text-primary-900 focus:ring-primary-900" />
                <span className="text-sm text-primary-700">Active (visible to customers)</span>
              </label>
            </div>
            <div className="border-t border-primary-200 p-4 flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-primary flex-1"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-950/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-error-600" /></div>
            <h3 className="text-lg font-semibold text-primary-900 text-center mb-2">Delete Category?</h3>
            <p className="text-sm text-primary-500 text-center mb-6">Delete "{confirmDelete.name}"? Products in this category will remain but become uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => deleteCat(confirmDelete)} className="btn bg-error-600 text-white hover:bg-error-700 flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
