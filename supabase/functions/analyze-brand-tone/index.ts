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
    const { vendorName, userId, websiteContent } = await req.json();

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

    console.log('Analyzing brand tone for vendor using OpenAI:', vendorName);

    // Use OpenAI to analyze brand tone based on brand knowledge or provided content
    const analysisPrompt = websiteContent 
      ? `Analyze this brand content for "${vendorName}" and extract their brand tone characteristics: ${websiteContent}`
      : `Based on your knowledge of the brand "${vendorName}", analyze their brand voice, tone, and communication style. If you're not familiar with this specific brand, provide a professional tone analysis suitable for their industry sector.`;

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
            content: `You are a brand tone analyst. Analyze the brand "${vendorName}" and extract specific tone characteristics that can be used to write product descriptions. Focus on:
            
            1. Voice characteristics (formal/casual, friendly/professional, technical/accessible)
            2. Key messaging themes and values
            3. Language patterns and vocabulary preferences
            4. Customer communication style
            5. Brand personality traits
            
            If you don't have specific knowledge about this brand, create a professional analysis based on typical industry standards for their sector.
            
            Return a JSON object with the analysis.`
          },
          {
            role: 'user',
            content: `${analysisPrompt}

Return a JSON object with these fields:
- website_url: The official website URL if known (or null if unknown)
- voice_characteristics: Array of voice traits (e.g., "professional", "friendly", "technical", "approachable", "premium")
- messaging_themes: Array of key brand themes and values (e.g., "quality", "innovation", "sustainability", "luxury")
- language_patterns: Description of vocabulary and language style (e.g., "Uses premium beauty terminology", "Simple, accessible language", "Technical precision")
- customer_approach: How they communicate with customers (e.g., "Educational and helpful", "Luxurious and aspirational", "Direct and practical")
- personality_traits: Array of brand personality characteristics (e.g., "sophisticated", "trustworthy", "innovative", "caring")
- tone_summary: A concise summary for use in product descriptions (max 200 words) that captures the brand's voice and style`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    const analysisData = await analysisResponse.json();
    const brandAnalysis = JSON.parse(analysisData.choices?.[0]?.message?.content || '{}');

    console.log('Brand tone analysis completed:', brandAnalysis);

    // Ensure we have default values if OpenAI doesn't provide complete data
    const completeBrandAnalysis = {
      website_url: brandAnalysis.website_url || null,
      voice_characteristics: brandAnalysis.voice_characteristics || ["professional", "trustworthy"],
      messaging_themes: brandAnalysis.messaging_themes || ["quality", "reliability"],
      language_patterns: brandAnalysis.language_patterns || "Clear, professional communication focused on product benefits",
      customer_approach: brandAnalysis.customer_approach || "Helpful and informative with focus on customer needs",
      personality_traits: brandAnalysis.personality_traits || ["reliable", "professional"],
      tone_summary: brandAnalysis.tone_summary || `${vendorName} maintains a professional, trustworthy tone focused on quality and customer satisfaction. Their communication style emphasizes product benefits and reliability.`
    };

    // Save the brand tone analysis to database
    const { data: savedTone, error: saveError } = await supabase
      .from('vendor_brand_tones')
      .insert({
        user_id: userId,
        vendor_name: vendorName,
        website_url: completeBrandAnalysis.website_url,
        brand_tone_analysis: completeBrandAnalysis,
        tone_summary: completeBrandAnalysis.tone_summary
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