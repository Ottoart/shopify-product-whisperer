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

    console.log(`Optimizing product: ${productData.title}`);

    // Create AI prompt for product optimization
    const prompt = `
You are an expert e-commerce copywriter. Optimize this product listing for better conversion and SEO:

CURRENT PRODUCT:
Title: ${productData.title}
Type: ${productData.type}
Tags: ${productData.tags}
Description: ${productData.description}

INSTRUCTIONS:
1. Create an optimized title (max 70 characters) that includes key benefits and is SEO-friendly
2. Write a compelling description (100-300 words) that highlights benefits, uses persuasive language, and includes relevant keywords
3. Generate 8-12 relevant tags (comma-separated) for better categorization and search

REQUIREMENTS:
- Keep the core product identity
- Use action-oriented, benefit-focused language
- Include relevant keywords naturally
- Make it conversion-focused
- Ensure it's mobile-friendly

RESPONSE FORMAT (JSON):
{
  "title": "optimized title here",
  "description": "optimized description here",
  "tags": "tag1, tag2, tag3, etc"
}
`;

    const makeOpenAIRequest = async (retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4.1-2025-04-14',
              messages: [
                { role: 'system', content: 'You are an expert e-commerce copywriter who responds only in valid JSON format.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          });

          if (response.ok) {
            return response;
          }

          // Handle rate limiting (429) with exponential backoff
          if (response.status === 429 && attempt < retries) {
            console.log(`Rate limited (attempt ${attempt}/${retries}), waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
            continue;
          }

          throw new Error(`OpenAI API error: ${response.status}`);
        } catch (error) {
          if (attempt === retries) throw error;
          console.log(`Request failed (attempt ${attempt}/${retries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
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