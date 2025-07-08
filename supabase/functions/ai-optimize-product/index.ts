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
    console.log('=== AI Optimize Product Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { productHandle, productData } = requestBody;
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key configured:', !!openAIApiKey);
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    console.log('Supabase URL configured:', !!supabaseUrl);
    console.log('Supabase Service Key configured:', !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error('User authentication error:', userError);
      throw new Error(`User authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error('No user found');
      throw new Error('No user found');
    }
    
    console.log('User authenticated:', user.id);

    console.log(`Starting optimization for product: ${productData.title}`);

    // Create the product URL for the custom GPT
    const storeUrl = 'https://prohair.ca';
    const productUrl = `${storeUrl}/products/${productHandle}`;

    console.log(`Product URL: ${productUrl}`);
    console.log(`Using Custom GPT for optimization...`);

    // Use custom GPT via OpenAI Assistants API or direct chat completion
    // Since we want to use the custom GPT's specific instructions, we'll call it directly
    const customGptPrompt = `Please analyze and optimize this Shopify product:

Product URL: ${productUrl}
Current Title: ${productData.title}
Current Type: ${productData.type}
Current Description: ${productData.description}
Current Tags: ${productData.tags}

Please provide optimized content following your specialized Shopify optimization instructions. Return the response in this exact JSON format:
{
  "title": "optimized title here",
  "description": "optimized description here", 
  "tags": "optimized tags here"
}`;

    const makeCustomGptRequest = async () => {
      console.log(`Sending request to Custom GPT...`);
      
      // For now, we'll use the standard OpenAI API with instructions that mimic your custom GPT
      // In the future, you could integrate with the Assistants API to use your exact custom GPT
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are a specialized Shopify product optimization expert. You excel at creating compelling, SEO-optimized product content that converts browsers into buyers. 

Your optimization approach:
- Transform features into benefits that resonate with customers
- Use psychological triggers and persuasive language
- Optimize for search engines while maintaining readability
- Focus on the customer's pain points and desires
- Create urgency and social proof when appropriate
- Ensure mobile-friendly formatting
- Use relevant keywords naturally
- Make titles compelling and SEO-friendly (max 70 chars)
- Write descriptions that tell a story and sell the solution (100-300 words)
- Create comprehensive, searchable tags

Always return responses in valid JSON format only.` 
            },
            { role: 'user', content: customGptPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Custom GPT API error ${response.status}: ${errorText}`);
        
        if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please wait a few minutes and try again.');
        } else if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
        } else {
          throw new Error(`Custom GPT API error: ${response.status} - ${errorText}`);
        }
      }

      console.log(`Custom GPT responded successfully`);
      return response;
    };

    const response = await makeCustomGptRequest();
    const aiData = await response.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('Custom GPT Response:', aiContent);

    // Parse AI response
    let optimizedData;
    try {
      // Clean the response in case there's extra text
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiContent;
      optimizedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Custom GPT response:', aiContent);
      throw new Error('Invalid response format from Custom GPT');
    }

    // Validate required fields
    if (!optimizedData.title || !optimizedData.description || !optimizedData.tags) {
      console.error('Missing fields in response:', optimizedData);
      throw new Error('Custom GPT response missing required fields (title, description, tags)');
    }

    // Update product in database
    const { error: updateError } = await supabase
      .from('products')
      .update({
        title: optimizedData.title,
        type: productData.type,
        body_html: optimizedData.description,
        tags: optimizedData.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('handle', productHandle)
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`);
    }

    console.log(`Successfully optimized product with Custom GPT: ${productHandle}`);

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
    console.error('=== ERROR in ai-optimize-product function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return more detailed error information
    const errorResponse = {
      error: error.message,
      timestamp: new Date().toISOString(),
      function: 'ai-optimize-product'
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});