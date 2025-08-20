// Clean ProductWhisper types without sync-related complexity
export interface ProductWhisperItem {
  id: string;
  title: string;
  handle: string;
  body_html: string; // description
  tags: string | null;
  type: string | null;
  category: string | null;
  vendor: string | null;
  published: boolean;
  
  // Variant fields
  variant_price: number;
  variant_compare_at_price: number;
  variant_sku: string;
  variant_inventory_qty: number;
  variant_inventory_policy: string;
  variant_requires_shipping: boolean;
  variant_taxable: boolean;
  variant_barcode: string;
  variant_grams: number;
  
  // SEO fields
  seo_title: string;
  seo_description: string;
  
  // Google Shopping fields
  google_shopping_condition: string;
  google_shopping_gender: string;
  google_shopping_age_group: string;
  
  // Image
  image_src: string;
  
  // Meta
  updated_at: string;
  user_id: string;
}

export interface ProductWhisperFilters {
  search: string;
  type: string;
  category: string;
  vendor: string;
  published: 'all' | 'published' | 'draft';
  priceMin?: number;
  priceMax?: number;
}

export interface ProductWhisperStats {
  total: number;
  published: number;
  drafts: number;
  categories: number;
  vendors: number;
}