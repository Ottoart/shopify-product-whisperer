import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PricingRequest {
  productId?: string;
  analyzeAll?: boolean;
  targetMargin?: number;
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

    const { productId, analyzeAll = false, targetMargin = 25 }: PricingRequest = await req.json();

    // Fetch products for analysis
    let query = supabase
      .from('store_products')
      .select('*')
      .eq('user_id', user.id);

    if (productId && !analyzeAll) {
      query = query.eq('id', productId);
    }

    const { data: products, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No products found for analysis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const recommendations = [];

    for (const product of products) {
      try {
        // Prepare product data for AI analysis
        const productContext = {
          title: product.title,
          price: product.price,
          supplier_cost: product.supplier_cost,
          category: product.category,
          brand: product.brand,
          status: product.status,
          last_updated: product.last_updated,
          competitor_prices: product.competitor_data?.prices || [],
          sales_data: product.analytics_data?.sales || {},
          market_trends: product.analytics_data?.trends || {}
        };

        // Call OpenAI for pricing optimization
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
                content: `You are an expert pricing strategist for e-commerce. Analyze product data and provide pricing recommendations based on:
                - Competitor pricing analysis
                - Market positioning
                - Profit margin optimization (target: ${targetMargin}%)
                - Price elasticity considerations
                - Market trends
                
                Respond with a JSON object containing:
                {
                  "recommended_price": number,
                  "confidence_score": number (0-100),
                  "reasoning": string,
                  "market_position": "premium" | "competitive" | "value",
                  "profit_margin": number,
                  "risk_level": "low" | "medium" | "high",
                  "price_change_percentage": number,
                  "competitive_advantages": string[],
                  "recommendations": string[]
                }`
              },
              {
                role: 'user',
                content: `Analyze this product for optimal pricing:\n${JSON.stringify(productContext, null, 2)}`
              }
            ],
            temperature: 0.3,
            max_tokens: 1500
          }),
        });

        if (!aiResponse.ok) {
          console.error(`OpenAI API error for product ${product.id}:`, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const aiRecommendation = JSON.parse(aiData.choices[0].message.content);

        // Store the recommendation
        const recommendation = {
          product_id: product.id,
          current_price: product.price,
          recommended_price: aiRecommendation.recommended_price,
          confidence_score: aiRecommendation.confidence_score,
          reasoning: aiRecommendation.reasoning,
          market_position: aiRecommendation.market_position,
          profit_margin: aiRecommendation.profit_margin,
          risk_level: aiRecommendation.risk_level,
          price_change_percentage: aiRecommendation.price_change_percentage,
          competitive_advantages: aiRecommendation.competitive_advantages,
          recommendations: aiRecommendation.recommendations,
          created_at: new Date().toISOString()
        };

        // Save to database
        const { error: saveError } = await supabase
          .from('ai_pricing_recommendations')
          .upsert({
            user_id: user.id,
            product_id: product.id,
            recommendation_data: recommendation,
            confidence_score: aiRecommendation.confidence_score,
            status: 'pending'
          });

        if (saveError) {
          console.error(`Failed to save recommendation for product ${product.id}:`, saveError);
        }

        recommendations.push(recommendation);

      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        continue;
      }
    }

    console.log(`Generated ${recommendations.length} pricing recommendations for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        total_analyzed: products.length,
        total_recommendations: recommendations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-pricing-optimizer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});