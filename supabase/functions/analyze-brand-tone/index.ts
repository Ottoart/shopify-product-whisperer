import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendorName, userId } = await req.json();

    if (!vendorName || !userId) {
      return new Response(
        JSON.stringify({ error: 'Vendor name and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we already have brand tone analysis for this vendor
    const { data: existingTone } = await supabase
      .from('vendor_brand_tones')
      .select('*')
      .eq('user_id', userId)
      .eq('vendor_name', vendorName)
      .maybeSingle();

    if (existingTone) {
      console.log('Found existing brand tone for vendor:', vendorName);
      return new Response(
        JSON.stringify({ 
          success: true, 
          brandTone: existingTone,
          cached: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Researching brand tone for vendor:', vendorName);

    // Search for the vendor's website
    const searchQuery = `${vendorName} official website brand about us`;
    const searchResponse = await fetch(`https://api.perplexity.ai/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a brand researcher. Find the official website for "${vendorName}" and extract key information about their brand voice, tone, and messaging style. Look for their About Us page, product descriptions, and brand messaging.`
          },
          {
            role: 'user',
            content: `Research the brand "${vendorName}" and provide their official website URL, key brand messaging, tone of voice, and style characteristics. Focus on how they describe their products and communicate with customers.`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const searchData = await searchResponse.json();
    const researchContent = searchData.choices?.[0]?.message?.content || '';

    console.log('Research completed, analyzing brand tone...');

    // Analyze the brand tone using OpenAI
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a brand tone analyst. Analyze the provided brand research and extract specific tone characteristics that can be used to write product descriptions. Focus on:
            
            1. Voice characteristics (formal/casual, friendly/professional, technical/accessible)
            2. Key messaging themes and values
            3. Language patterns and vocabulary preferences
            4. Customer communication style
            5. Brand personality traits
            
            Return a JSON object with the analysis.`
          },
          {
            role: 'user',
            content: `Analyze this brand research for ${vendorName} and extract their brand tone characteristics:

${researchContent}

Return a JSON object with these fields:
- website_url: The official website URL if found
- voice_characteristics: Array of voice traits (e.g., "professional", "friendly", "technical")
- messaging_themes: Array of key brand themes and values
- language_patterns: Description of vocabulary and language style
- customer_approach: How they communicate with customers
- personality_traits: Array of brand personality characteristics
- tone_summary: A concise summary for use in product descriptions (max 200 words)`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    const analysisData = await analysisResponse.json();
    const brandAnalysis = JSON.parse(analysisData.choices?.[0]?.message?.content || '{}');

    console.log('Brand tone analysis completed:', brandAnalysis);

    // Save the brand tone analysis to database
    const { data: savedTone, error: saveError } = await supabase
      .from('vendor_brand_tones')
      .insert({
        user_id: userId,
        vendor_name: vendorName,
        website_url: brandAnalysis.website_url || null,
        brand_tone_analysis: brandAnalysis,
        tone_summary: brandAnalysis.tone_summary || ''
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving brand tone:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save brand tone analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        brandTone: savedTone,
        cached: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-brand-tone function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze brand tone',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});