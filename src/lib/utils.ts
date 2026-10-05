export function formatPrice(price: number): string {
  return `\u20B9${Math.round(price).toLocaleString('en-IN')}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getDiscountPercentage(price: number, discountPrice: number | null): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function getEffectivePrice(price: number, discountPrice: number | null): number {
  if (!discountPrice || discountPrice >= price) return price;
  return discountPrice;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `UG${y}${m}${d}${rand}`;
}

export function getStockStatus(
  stock: number,
  lowStockThreshold: number = 5,
): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stock === 0) return 'out_of_stock';
  if (stock <= lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

export function getStockLabel(
  stock: number,
  lowStockThreshold: number = 5,
): string {
  const status = getStockStatus(stock, lowStockThreshold);
  if (status === 'out_of_stock') return 'Out of Stock';
  if (status === 'low_stock') return `Low Stock (${stock} left)`;
  return 'In Stock';
}

export function getTotalStock(variants: { sizes?: { stock: number }[] }[]): number {
  return variants.reduce((total, v) => {
    return total + (v.sizes?.reduce((s, sz) => s + sz.stock, 0) || 0);
  }, 0);
}

export function hasStock(variants: { sizes?: { stock: number }[] }[]): boolean {
  return getTotalStock(variants) > 0;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
