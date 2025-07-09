export interface OptimizeProductRequest {
  productHandle: string;
  productData: {
    title: string;
    type?: string;
    description?: string;
    tags?: string;
  };
  useDirectAI?: boolean;
  customPromptTemplate?: string;
}

export interface OptimizedProductData {
  title: string;
  description: string;
  tags: string;
}

export interface ApiResponse {
  success: boolean;
  optimizedData?: OptimizedProductData;
  error?: string;
  details?: string;
  timestamp?: string;
}