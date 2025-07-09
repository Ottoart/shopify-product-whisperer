import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== AI Optimize Product Function Called ===');
  console.log('Method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting product optimization...');
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { productHandle, productData, useDirectAI, customPromptTemplate } = requestBody;
    console.log('Product handle:', productHandle);
    console.log('Product title:', productData?.title);
    console.log('Use direct AI:', useDirectAI);
    console.log('Has custom template:', !!customPromptTemplate);
    
    // Check required fields
    if (!productHandle || !productData) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing productHandle or productData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key check:', openAIApiKey ? 'Found' : 'Not found');
    console.log('OpenAI API key length:', openAIApiKey?.length || 0);
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured in Supabase secrets',
          details: 'Please add your OpenAI API key to the Supabase Edge Function secrets'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (openAIApiKey.length < 20) {
      console.error('OpenAI API key appears to be invalid (too short)');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key appears to be invalid',
          details: 'The API key seems too short. Please check your OpenAI API key in Supabase secrets'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('OpenAI API key validation passed');
    
    // Check Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('Supabase credentials found');
    
    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token length:', token.length);
    
    let user;
    try {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError) {
        console.error('Auth error:', userError.message);
        return new Response(
          JSON.stringify({ error: `Authentication failed: ${userError.message}` }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!authUser) {
        console.error('No user found');
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      user = authUser;
      console.log('User authenticated:', user.id);
    } catch (e) {
      console.error('Authentication error:', e);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create AI prompt
    let prompt;
    if (useDirectAI && customPromptTemplate) {
      // Use custom template with placeholder replacement
      const customPrompt = customPromptTemplate
        .replace(/\{title\}/g, productData.title || 'No title')
        .replace(/\{type\}/g, productData.type || 'Not specified')
        .replace(/\{description\}/g, productData.description || 'No description')
        .replace(/\{tags\}/g, productData.tags || 'No tags');
      
      // Add JSON format requirement to custom prompt
      prompt = `${customPrompt}

CRITICAL REQUIREMENT: You MUST respond with ONLY a valid JSON object. No explanations, no additional text, no formatting, no markdown - ONLY the JSON object below:

{
  "title": "your optimized title here",
  "description": "your complete optimized description with all sections",
  "tags": "comma-separated tags following the guidelines"
}

Start your response with { and end with }. Nothing else.`;
      console.log('Using custom prompt template with JSON format requirement');
    } else {
      // Use default prompt
      prompt = `Optimize this Shopify product for better conversions and SEO:

Product Title: ${productData.title}
Product Type: ${productData.type || 'Not specified'}
Current Description: ${productData.description || 'No description'}
Current Tags: ${productData.tags || 'No tags'}

CRITICAL REQUIREMENT: Respond with ONLY a valid JSON object. No explanations, no additional text, no formatting - ONLY this JSON structure:

{
  "title": "SEO-optimized title (max 70 characters)",
  "description": "Compelling product description with benefits and features (100-300 words)", 
  "tags": "comma-separated relevant tags for search and categorization"
}

Start your response with { and end with }. Nothing else.`;
      console.log('Using default prompt template');
    }

    console.log('Calling OpenAI API...');
    console.log('OpenAI API Key exists:', !!openAIApiKey);
    console.log('OpenAI API Key length:', openAIApiKey?.length || 0);
    
    // Call OpenAI API
    let aiResponse;
    try {
      console.log('Making request to OpenAI...');
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a Shopify product optimization expert. You MUST respond with ONLY valid JSON - no other text, no explanations, no markdown formatting. Your response must start with { and end with }. Focus on converting features into benefits, SEO optimization, and compelling copy that drives sales.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };
      
      console.log('Request body prepared, sending to OpenAI...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('OpenAI response status:', response.status);
      console.log('OpenAI response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error ${response.status}:`, errorText);
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${response.status} - ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      aiResponse = await response.json();
      console.log('OpenAI API call successful');
      console.log('Response structure:', Object.keys(aiResponse));
    } catch (e) {
      console.error('OpenAI API call failed:', e);
      console.error('Error type:', typeof e);
      console.error('Error name:', e?.name);
      console.error('Error message:', e?.message);
      return new Response(
        JSON.stringify({ error: `Failed to call OpenAI API: ${e?.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const aiContent = aiResponse.choices[0].message.content;
    console.log('AI response received:', aiContent.substring(0, 100) + '...');
    
    // Parse AI response
    let optimizedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiContent;
      optimizedData = JSON.parse(jsonString);
      console.log('AI response parsed successfully');
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      console.error('AI response was:', aiContent);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate required fields
    if (!optimizedData.title || !optimizedData.description || !optimizedData.tags) {
      console.error('AI response missing required fields:', optimizedData);
      return new Response(
        JSON.stringify({ error: 'AI response missing required fields (title, description, tags)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Updating database...');
    
    // Update product in database
    try {
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
      
      console.log('Database updated successfully');
    } catch (e) {
      console.error('Database operation failed:', e);
      return new Response(
        JSON.stringify({ error: 'Database operation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('=== SUCCESS ===');
    
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
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});