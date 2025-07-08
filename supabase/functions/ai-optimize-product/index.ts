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
    const { productHandle, productData } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log(`Starting optimization for product: ${productData.title}`);

    // Create the product URL if store URL is available
    const storeUrl = 'https://prohair.ca'; // You can make this dynamic later
    const productUrl = `${storeUrl}/products/${productHandle}`;

    console.log(`Product URL: ${productUrl}`);

    // Simple prompt for optimization
    const prompt = `Product URL: ${productUrl}

Please analyze this product and provide optimized e-commerce content in the following JSON format:
{
  "title": "SEO-optimized product title (max 70 characters)",
  "description": "Compelling product description with benefits, usage, and key features (100-300 words)",
  "tags": "comma-separated relevant tags for categorization and search"
}

Focus on:
- Converting features into benefits
- SEO-friendly language
- Clear value proposition
- Professional tone
- Mobile-friendly formatting`;

    console.log(`Sending request to OpenAI GPT...`);

    const makeOpenAIRequest = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
      
      try {
        console.log(`Making request to OpenAI API...`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert e-commerce copywriter specialized in product optimization. Analyze product URLs and provide optimized content in valid JSON format only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log(`OpenAI API responded with status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error ${response.status}: ${errorText}`);
          
          if (response.status === 429) {
            throw new Error('OpenAI API rate limit exceeded. Please wait a few minutes and try again.');
          } else if (response.status === 401) {
            throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
          } else if (response.status === 403) {
            throw new Error('OpenAI API access denied. Please check your account status and billing.');
          } else {
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }
        }

        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    };

    const response = await makeOpenAIRequest();
    const aiData = await response.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Response:', aiContent);

    // Parse AI response
    let optimizedData;
    try {
      optimizedData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Validate required fields
    if (!optimizedData.title || !optimizedData.description || !optimizedData.tags) {
      throw new Error('AI response missing required fields');
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

    console.log(`Successfully optimized product: ${productHandle}`);

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
    console.error('Error in ai-optimize-product function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});