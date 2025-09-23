export interface OptimizeProductRequest {
  productHandle: string;
  productData: {
    title: string;
    type?: string;
    description?: string;
    tags?: string;
    vendor?: string;
    seo_title?: string;
    seo_description?: string;
    published?: boolean;
    variant_price?: number;
    variant_compare_at_price?: number;
    variant_sku?: string;
    variant_barcode?: string;
    variant_grams?: number;
    variant_inventory_qty?: number;
    variant_inventory_policy?: string;
    variant_requires_shipping?: boolean;
    variant_taxable?: boolean;
    google_shopping_condition?: string;
    google_shopping_gender?: string;
    google_shopping_age_group?: string;
    category?: string;
    current_seo_title?: string;
    current_seo_description?: string;
    current_price?: number;
    current_compare_at_price?: number;
    image_src?: string;
  };
  useDirectAI?: boolean;
  customPromptTemplate?: string;
  generateSEO?: boolean;
  enhanceAllFields?: boolean;
}

export interface OptimizedProductData {
  title: string;
  description: string;
  tags: string;
  type: string;
  category: string;
  seo_title: string;
  seo_description: string;
  vendor?: string;
  published?: boolean;
  variant_price?: number;
  variant_compare_at_price?: number;
  variant_sku?: string;
  variant_barcode?: string;
  variant_grams?: number;
  variant_inventory_qty?: number;
  variant_inventory_policy?: string;
  variant_requires_shipping?: boolean;
  variant_taxable?: boolean;
  google_shopping_condition?: string;
  google_shopping_gender?: string;
  google_shopping_age_group?: string;
}

export interface ApiResponse {
  success: boolean;
  optimizedData?: OptimizedProductData;
  error?: string;
  details?: string;
  timestamp?: string;
}