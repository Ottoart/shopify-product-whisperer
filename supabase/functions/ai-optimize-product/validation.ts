import type { OptimizeProductRequest } from './types.ts';

export function validateRequest(requestBody: any): OptimizeProductRequest | null {
  const { productHandle, productData, useDirectAI, customPromptTemplate } = requestBody;
  
  if (!productHandle || !productData) {
    return null;
  }
  
  return {
    productHandle,
    productData,
    useDirectAI,
    customPromptTemplate
  };
}

export function validateEnvironment(): { openAIApiKey: string; supabaseUrl: string; supabaseServiceKey: string } | null {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!openAIApiKey) {
    console.error('OpenAI API key not found in environment');
    return null;
  }
  
  if (openAIApiKey.length < 20) {
    console.error('OpenAI API key appears to be invalid (too short)');
    return null;
  }
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    return null;
  }
  
  return { openAIApiKey, supabaseUrl, supabaseServiceKey };
}