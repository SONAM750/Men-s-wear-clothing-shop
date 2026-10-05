import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductVariant, VariantSize, Category, ProductWithDetails } from '@/types';

async function fetchProductsWithDetails(productIds?: string[]): Promise<ProductWithDetails[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (productIds) {
    if (productIds.length === 0) return [];
    query = query.in('id', productIds);
  }

  const { data: products, error } = await query;
  if (error || !products) return [];

  // Fetch variants for these products
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', products.map((p) => p.id))
    .order('sort_order', { ascending: true });

  // Fetch sizes for these variants
  const variantIds = variants?.map((v) => v.id) || [];
  let sizes: VariantSize[] = [];
  if (variantIds.length > 0) {
    const { data: sizesData } = await supabase
      .from('variant_sizes')
      .select('*')
      .in('variant_id', variantIds);
    sizes = (sizesData as VariantSize[]) || [];
  }

  // Fetch categories
  const categoryIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))] as string[];
  let categories: Category[] = [];
  if (categoryIds.length > 0) {
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds);
    categories = (catData as Category[]) || [];
  }

  const productsWithDetails: ProductWithDetails[] = products.map((p) => {
    const productVariants = (variants || [])
      .filter((v) => v.product_id === p.id)
      .map((v) => ({
        ...(v as ProductVariant),
        sizes: sizes.filter((s) => s.variant_id === v.id),
      }));
    return {
      ...(p as Product),
      category: categories.find((c) => c.id === p.category_id) || null,
      variants: productVariants,
    };
  });

  return productsWithDetails;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchProductsWithDetails();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, loading, refresh };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(8);
      if (error || !data) {
        setLoading(false);
        return;
      }
      const ids = data.map((p) => p.id);
      const all = await fetchProductsWithDetails(ids);
      // preserve featured order
      const ordered = ids
        .map((id) => all.find((p) => p.id === id))
        .filter(Boolean) as ProductWithDetails[];
      setProducts(ordered);
      setLoading(false);
    };
    fetch();
  }, []);

  return { products, loading };
}

export function useNewArrivals() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error || !data) {
        setLoading(false);
        return;
      }
      const ids = data.map((p) => p.id);
      const all = await fetchProductsWithDetails(ids);
      setProducts(all);
      setLoading(false);
    };
    fetch();
  }, []);

  return { products, loading };
}

export function useBestSellers() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_best_seller', true)
        .order('sort_order', { ascending: true })
        .limit(8);
      if (error || !data) {
        setLoading(false);
        return;
      }
      const ids = data.map((p) => p.id);
      const all = await fetchProductsWithDetails(ids);
      setProducts(all);
      setLoading(false);
    };
    fetch();
  }, []);

  return { products, loading };
}

export function useProductsByCategory(slug: string | undefined) {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!cat) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data: prods, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_id', cat.id)
        .order('created_at', { ascending: false });
      if (error || !prods) {
        setLoading(false);
        return;
      }
      const ids = prods.map((p) => p.id);
      const all = await fetchProductsWithDetails(ids);
      setProducts(all);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  return { products, loading };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        setProduct(null);
        setLoading(false);
        return;
      }
      const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .order('sort_order', { ascending: true });
      const variantIds = variants?.map((v) => v.id) || [];
      let sizes: VariantSize[] = [];
      if (variantIds.length > 0) {
        const { data: sizesData } = await supabase
          .from('variant_sizes')
          .select('*')
          .in('variant_id', variantIds);
        sizes = (sizesData as VariantSize[]) || [];
      }
      let category: Category | null = null;
      if (data.category_id) {
        const { data: cat } = await supabase
          .from('categories')
          .select('*')
          .eq('id', data.category_id)
          .maybeSingle();
        category = (cat as Category) || null;
      }
      setProduct({
        ...(data as Product),
        category,
        variants: (variants || []).map((v) => ({
          ...(v as ProductVariant),
          sizes: sizes.filter((s) => s.variant_id === v.id),
        })),
      });
      setLoading(false);
    };
    fetch();
  }, [id]);

  return { product, loading };
}

export { fetchProductsWithDetails };
