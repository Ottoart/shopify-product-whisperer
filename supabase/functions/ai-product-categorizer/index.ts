import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CategorizationRequest {
  productIds?: string[];
  analyzeAll?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { productIds, analyzeAll = false }: CategorizationRequest = await req.json();

    // Fetch products for categorization
    let query = supabase
      .from('store_products')
      .select('*')
      .eq('user_id', user.id);

    if (productIds && !analyzeAll) {
      query = query.in('id', productIds);
    }

    const { data: products, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No products found for categorization' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const categorizations = [];

    // Process products in batches for efficiency
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const productData = batch.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        brand: product.brand,
        current_category: product.category,
        tags: product.tags,
        specifications: product.specifications
      }));

      try {
        // Call OpenAI for intelligent categorization
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              {
                role: 'system',
                content: `You are an expert product categorization specialist. Analyze products and suggest optimal categories, subcategories, and tags based on:
                - Product title and description
                - Brand positioning
                - Industry standards
                - SEO optimization
                - Market trends
                
                For each product, respond with a JSON array containing objects with:
                {
                  "product_id": string,
                  "primary_category": string,
                  "subcategories": string[],
                  "suggested_tags": string[],
                  "confidence_score": number (0-100),
                  "reasoning": string,
                  "seo_keywords": string[],
                  "target_audience": string,
                  "market_segment": string,
                  "seasonality": "year-round" | "seasonal" | "holiday",
                  "price_tier": "budget" | "mid-range" | "premium" | "luxury"
                }`
              },
              {
                role: 'user',
                content: `Categorize these products:\n${JSON.stringify(productData, null, 2)}`
              }
            ],
            temperature: 0.2,
            max_tokens: 2000
          }),
        });

        if (!aiResponse.ok) {
          console.error(`OpenAI API error for batch starting at ${i}:`, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const aiCategorizations = JSON.parse(aiData.choices[0].message.content);

        // Process each categorization
        for (const categorization of aiCategorizations) {
          const product = batch.find(p => p.id === categorization.product_id);
          if (!product) continue;

          const categoryData = {
            product_id: categorization.product_id,
            primary_category: categorization.primary_category,
            subcategories: categorization.subcategories,
            suggested_tags: categorization.suggested_tags,
            confidence_score: categorization.confidence_score,
            reasoning: categorization.reasoning,
            seo_keywords: categorization.seo_keywords,
            target_audience: categorization.target_audience,
            market_segment: categorization.market_segment,
            seasonality: categorization.seasonality,
            price_tier: categorization.price_tier,
            current_category: product.category,
            created_at: new Date().toISOString()
          };

          // Save to database
          const { error: saveError } = await supabase
            .from('ai_categorization_suggestions')
            .upsert({
              user_id: user.id,
              product_id: categorization.product_id,
              suggestion_data: categoryData,
              confidence_score: categorization.confidence_score,
              status: 'pending'
            });

          if (saveError) {
            console.error(`Failed to save categorization for product ${categorization.product_id}:`, saveError);
          }

          categorizations.push(categoryData);
        }

      } catch (error) {
        console.error(`Error processing batch starting at ${i}:`, error);
        continue;
      }
    }

    console.log(`Generated ${categorizations.length} categorization suggestions for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        categorizations,
        total_analyzed: products.length,
        total_suggestions: categorizations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-product-categorizer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});