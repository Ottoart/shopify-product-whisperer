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
    variant_price?: number;
    variant_compare_at_price?: number;
    variant_sku?: string;
    variant_barcode?: string;
    variant_grams?: number;
    google_shopping_condition?: string;
    google_shopping_gender?: string;
    google_shopping_age_group?: string;
  };
  useDirectAI?: boolean;
  customPromptTemplate?: string;
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
  variant_price?: number;
  variant_compare_at_price?: number;
  variant_sku?: string;
  variant_barcode?: string;
  variant_grams?: number;
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