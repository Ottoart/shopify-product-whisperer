import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompetitiveAnalysisRequest {
  productIds?: string[];
  analyzeMarket?: boolean;
  focusAreas?: string[];
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

    const { 
      productIds, 
      analyzeMarket = false, 
      focusAreas = ['pricing', 'features', 'positioning'] 
    }: CompetitiveAnalysisRequest = await req.json();

    // Fetch products for analysis
    let query = supabase
      .from('store_products')
      .select('*')
      .eq('user_id', user.id);

    if (productIds && productIds.length > 0) {
      query = query.in('id', productIds);
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

    const analyses = [];

    for (const product of products) {
      try {
        // Prepare comprehensive product and market data
        const analysisContext = {
          product: {
            title: product.title,
            description: product.description,
            price: product.price,
            brand: product.brand,
            category: product.category,
            features: product.specifications,
            tags: product.tags
          },
          competitors: product.competitor_data || {},
          market_data: product.analytics_data || {},
          sales_performance: {
            conversion_rate: product.analytics_data?.conversion_rate || 0,
            avg_order_value: product.analytics_data?.avg_order_value || 0,
            customer_reviews: product.analytics_data?.reviews || {}
          },
          focus_areas: focusAreas
        };

        // Call OpenAI for competitive analysis
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
                content: `You are an expert competitive intelligence analyst for e-commerce. Provide comprehensive competitive analysis focusing on:
                - Market positioning analysis
                - Competitive pricing strategies
                - Feature differentiation opportunities
                - Market gaps and opportunities
                - Strategic recommendations
                
                Respond with a JSON object containing:
                {
                  "competitive_position": {
                    "market_rank": string,
                    "strengths": string[],
                    "weaknesses": string[],
                    "opportunities": string[],
                    "threats": string[]
                  },
                  "pricing_analysis": {
                    "position": "premium" | "competitive" | "value",
                    "vs_competitors": number,
                    "price_elasticity": "high" | "medium" | "low",
                    "optimal_range": { "min": number, "max": number }
                  },
                  "feature_analysis": {
                    "unique_features": string[],
                    "missing_features": string[],
                    "improvement_areas": string[]
                  },
                  "market_opportunities": {
                    "underserved_segments": string[],
                    "emerging_trends": string[],
                    "growth_potential": "high" | "medium" | "low"
                  },
                  "strategic_recommendations": {
                    "immediate_actions": string[],
                    "medium_term_goals": string[],
                    "long_term_strategy": string[]
                  },
                  "confidence_score": number,
                  "risk_assessment": {
                    "level": "low" | "medium" | "high",
                    "factors": string[]
                  }
                }`
              },
              {
                role: 'user',
                content: `Analyze this product's competitive landscape:\n${JSON.stringify(analysisContext, null, 2)}`
              }
            ],
            temperature: 0.3,
            max_tokens: 2500
          }),
        });

        if (!aiResponse.ok) {
          console.error(`OpenAI API error for product ${product.id}:`, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const analysis = JSON.parse(aiData.choices[0].message.content);

        const competitiveAnalysis = {
          product_id: product.id,
          analysis_data: analysis,
          focus_areas: focusAreas,
          confidence_score: analysis.confidence_score,
          created_at: new Date().toISOString(),
          
          // Flatten key insights for easier querying
          market_position: analysis.competitive_position.market_rank,
          pricing_position: analysis.pricing_analysis.position,
          growth_potential: analysis.market_opportunities.growth_potential,
          risk_level: analysis.risk_assessment.level,
          
          // Key actionable insights
          immediate_actions: analysis.strategic_recommendations.immediate_actions,
          opportunities: analysis.competitive_position.opportunities,
          threats: analysis.competitive_position.threats
        };

        // Save to database
        const { error: saveError } = await supabase
          .from('ai_competitive_analysis')
          .upsert({
            user_id: user.id,
            product_id: product.id,
            analysis_data: competitiveAnalysis,
            confidence_score: analysis.confidence_score,
            status: 'completed'
          });

        if (saveError) {
          console.error(`Failed to save analysis for product ${product.id}:`, saveError);
        }

        analyses.push(competitiveAnalysis);

      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        continue;
      }
    }

    // Generate market-level insights if requested
    let marketInsights = null;
    if (analyzeMarket && analyses.length > 0) {
      try {
        const marketContext = {
          portfolio_size: products.length,
          categories: [...new Set(products.map(p => p.category))],
          price_range: {
            min: Math.min(...products.map(p => p.price || 0)),
            max: Math.max(...products.map(p => p.price || 0))
          },
          competitive_positions: analyses.map(a => ({
            product: a.product_id,
            position: a.market_position,
            growth_potential: a.growth_potential
          }))
        };

        const marketResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: `Provide strategic market-level insights for this product portfolio, including portfolio optimization recommendations, market expansion opportunities, and overall competitive strategy.`
              },
              {
                role: 'user',
                content: `Analyze this product portfolio:\n${JSON.stringify(marketContext, null, 2)}`
              }
            ],
            temperature: 0.3,
            max_tokens: 1000
          }),
        });

        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          marketInsights = marketData.choices[0].message.content;
        }
      } catch (error) {
        console.error('Error generating market insights:', error);
      }
    }

    console.log(`Generated ${analyses.length} competitive analyses for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        analyses,
        market_insights: marketInsights,
        total_analyzed: products.length,
        summary: {
          high_opportunity: analyses.filter(a => a.growth_potential === 'high').length,
          high_risk: analyses.filter(a => a.risk_level === 'high').length,
          premium_positioned: analyses.filter(a => a.pricing_position === 'premium').length,
          immediate_actions_needed: analyses.filter(a => a.immediate_actions.length > 0).length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-competitive-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});