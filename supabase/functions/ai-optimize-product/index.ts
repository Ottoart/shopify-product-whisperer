import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Function called successfully');
    
    // Parse request
    const { productHandle, productData } = await req.json();
    console.log('Product handle:', productHandle);
    console.log('Product title:', productData?.title);
    
    // Check environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      console.error('Missing OpenAI API key');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: `Authentication failed: ${userError.message}` }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!user) {
      console.error('No user found');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('User authenticated:', user.id);
    
    // Call OpenAI API
    console.log('Calling OpenAI API...');
    
    const prompt = `Optimize this Shopify product:
Title: ${productData.title}
Type: ${productData.type}
Description: ${productData.description}
Tags: ${productData.tags}

Return JSON with optimized title, description, and tags:
{
  "title": "optimized title",
  "description": "optimized description", 
  "tags": "optimized tags"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a Shopify product optimization expert. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error ${response.status}:`, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const aiContent = aiData.choices[0].message.content;
    console.log('AI response received');
    
    // Parse JSON response
    let optimizedData;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      optimizedData = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);
    } catch (error) {
      console.error('JSON parse error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate response
    if (!optimizedData.title || !optimizedData.description || !optimizedData.tags) {
      console.error('Missing fields in AI response');
      return new Response(
        JSON.stringify({ error: 'AI response missing required fields' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update database
    console.log('Updating database...');
    const { error: updateError } = await supabase
      .from('products')
      .update({
        title: optimizedData.title,
        body_html: optimizedData.description,
        tags: optimizedData.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('handle', productHandle)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: `Database update failed: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Success!');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        optimizedData: {
          title: optimizedData.title,
          description: optimizedData.description,
          tags: optimizedData.tags,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error.message}`,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});