import { useEffect, useState, useCallback } from 'react';
import { Search, Save, Boxes, Check, AlertTriangle, XCircle, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { cn } from '@/lib/utils';
import type { Product, ProductVariant, VariantSize } from '@/types';

interface StockRow {
  productId: string;
  productName: string;
  variantId: string;
  color: string;
  color_hex: string;
  sizeId: string;
  size: string;
  stock: number;
  originalStock: number;
}

export function AdminStockPage() {
  const { showToast } = useToast();
  const { settings } = useShopSettings();
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    const { data: prods } = await supabase.from('products').select('*').order('name');
    const { data: variants } = await supabase.from('product_variants').select('*');
    const { data: sizes } = await supabase.from('variant_sizes').select('*');

    const variantList = (variants as ProductVariant[]) || [];
    const sizeList = (sizes as VariantSize[]) || [];
    const prodList = (prods as Product[]) || [];

    const stockRows: StockRow[] = [];
    prodList.forEach((p) => {
      variantList.filter((v) => v.product_id === p.id).forEach((v) => {
        sizeList.filter((s) => s.variant_id === v.id).forEach((s) => {
          stockRows.push({
            productId: p.id,
            productName: p.name,
            variantId: v.id,
            color: v.color,
            color_hex: v.color_hex,
            sizeId: s.id,
            size: s.size,
            stock: s.stock,
            originalStock: s.stock,
          });
        });
      });
    });

    setRows(stockRows);
    setHasChanges(false);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const updateStock = (sizeId: string, newStock: number) => {
    setRows(rows.map((r) => r.sizeId === sizeId ? { ...r, stock: Math.max(0, newStock) } : r));
    setHasChanges(true);
  };

  const saveAll = async () => {
    const changed = rows.filter((r) => r.stock !== r.originalStock);
    if (changed.length === 0) { showToast('No changes to save'); return; }

    setSaving(true);
    try {
      for (const row of changed) {
        const { error } = await supabase.from('variant_sizes').update({ stock: row.stock }).eq('id', row.sizeId);
        if (error) throw error;
      }
      showToast(`Updated ${changed.length} stock ${changed.length === 1 ? 'entry' : 'entries'}`);
      fetchStock();
    } catch {
      showToast('Failed to save some changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Product', 'Color', 'Size', 'Stock', 'Status'];
    const csvRows = rows.map((r) => {
      const status = r.stock === 0 ? 'Out of Stock' : r.stock <= (settings?.low_stock_threshold ?? 5) ? 'Low Stock' : 'In Stock';
      return [r.productName, r.color, r.size, r.stock, status].map((v) => `"${v}"`).join(',');
    });
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = rows.filter((r) => {
    const matchSearch = !search || r.productName.toLowerCase().includes(search.toLowerCase()) || r.color.toLowerCase().includes(search.toLowerCase());
    const threshold = settings?.low_stock_threshold ?? 5;
    const matchStatus = !filterStatus ||
      (filterStatus === 'out' && r.stock === 0) ||
      (filterStatus === 'low' && r.stock > 0 && r.stock <= threshold) ||
      (filterStatus === 'in' && r.stock > threshold);
    return matchSearch && matchStatus;
  });

  // Group by product
  const grouped: Record<string, StockRow[]> = {};
  filtered.forEach((r) => {
    if (!grouped[r.productId]) grouped[r.productId] = [];
    grouped[r.productId].push(r);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary-900">Stock Management</h1>
          <p className="text-sm text-primary-500 mt-1">Update inventory by color and size</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-outline"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={saveAll} disabled={!hasChanges || saving} className="btn-primary"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-warning-50 border border-warning-200 text-warning-700 text-sm rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          You have unsaved changes. Click "Save Changes" to update inventory.
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product name or color..." className="input pl-10" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input sm:w-48">
          <option value="">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-4 h-20 skeleton" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center">
          <Boxes className="w-12 h-12 text-primary-200 mx-auto mb-3" />
          <p className="text-sm text-primary-500">No stock entries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([productId, productRows]) => (
            <div key={productId} className="card overflow-hidden">
              <div className="bg-primary-50 px-4 py-2.5 border-b border-primary-100">
                <h3 className="font-semibold text-primary-900 text-sm">{productRows[0].productName}</h3>
              </div>
              <div className="divide-y divide-primary-100">
                {/* Group by color */}
                {Object.entries(
                  productRows.reduce((acc, r) => {
                    if (!acc[r.color]) acc[r.color] = [];
                    acc[r.color].push(r);
                    return acc;
                  }, {} as Record<string, StockRow[]>)
                ).map(([color, colorRows]) => (
                  <div key={color} className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-4 h-4 rounded-full border border-primary-300" style={{ backgroundColor: colorRows[0].color_hex }} />
                      <span className="text-sm font-medium text-primary-700">{color}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                      {colorRows.map((row) => {
                        const status = row.stock === 0 ? 'out' : row.stock <= (settings?.low_stock_threshold ?? 5) ? 'low' : 'in';
                        const changed = row.stock !== row.originalStock;
                        return (
                          <div key={row.sizeId} className={cn('rounded-lg border p-2', changed ? 'border-accent-400 bg-accent-50' : 'border-primary-200')}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-primary-700">{row.size}</span>
                              {status === 'in' && <Check className="w-3 h-3 text-success-600" />}
                              {status === 'low' && <AlertTriangle className="w-3 h-3 text-warning-600" />}
                              {status === 'out' && <XCircle className="w-3 h-3 text-error-600" />}
                            </div>
                            <input type="number" value={row.stock} onChange={(e) => updateStock(row.sizeId, Number(e.target.value))} min="0" className={cn('w-full text-sm rounded border px-2 py-1 focus:outline-none focus:ring-1', changed ? 'border-accent-400 ring-accent-400' : 'border-primary-200 focus:border-primary-900 focus:ring-primary-900')} />
                            <p className={cn('text-[10px] mt-0.5', status === 'out' ? 'text-error-600' : status === 'low' ? 'text-warning-600' : 'text-success-600')}>
                              {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
