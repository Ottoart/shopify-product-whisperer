import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest, validateEnvironment } from './validation.ts';
import { authenticateUser } from './auth.ts';
import { callOpenAI } from './openai.ts';
import { updateProduct } from './database.ts';
import type { ApiResponse } from './types.ts';

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
        JSON.stringify({ error: 'Invalid JSON in request body' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate request
    const validatedRequest = validateRequest(requestBody);
    if (!validatedRequest) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing productHandle or productData' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Product handle:', validatedRequest.productHandle);
    console.log('Product title:', validatedRequest.productData?.title);
    console.log('Use direct AI:', validatedRequest.useDirectAI);
    console.log('Has custom template:', !!validatedRequest.customPromptTemplate);
    
    // Validate environment
    const env = validateEnvironment();
    if (!env) {
      return new Response(
        JSON.stringify({ 
          error: 'Environment configuration error',
          details: 'Please check your API keys and Supabase configuration'
        } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Environment validation passed');
    
    // Authenticate user
    const authHeader = req.headers.get('authorization');
    const user = await authenticateUser(authHeader, env.supabaseUrl, env.supabaseServiceKey);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' } as ApiResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Call OpenAI
    let optimizedData;
    try {
      optimizedData = await callOpenAI(validatedRequest, env.openAIApiKey);
    } catch (e) {
      console.error('OpenAI API call failed:', e);
      return new Response(
        JSON.stringify({ error: `Failed to call OpenAI API: ${e?.message || 'Unknown error'}` } as ApiResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update database
    try {
      await updateProduct(
        validatedRequest.productHandle,
        user.id,
        optimizedData,
        env.supabaseUrl,
        env.supabaseServiceKey
      );
    } catch (e) {
      console.error('Database operation failed:', e);
      return new Response(
        JSON.stringify({ error: 'Database operation failed' } as ApiResponse),
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
      } as ApiResponse),
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
      } as ApiResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});