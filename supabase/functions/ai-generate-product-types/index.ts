import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== AI Generate Product Types Function Called ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { products } = await req.json();
    
    if (!products || !Array.isArray(products)) {
      return new Response(
        JSON.stringify({ error: 'Products array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const productData = products.map(p => ({
      id: p.id,
      title: p.title,
      description: p.bodyHtml || p.description || '',
      currentType: p.type || ''
    }));

    const prompt = `You are a product categorization expert. Generate specific, descriptive product types for these Shopify products.

Rules:
- Product types should be specific (e.g., "Leave-In Hair Conditioner" not "Hair Product")  
- Use proper capitalization
- Keep under 50 characters
- Be consistent with similar products
- Consider the product title and description

Respond with ONLY a JSON array in this format:
[
  {
    "id": "product_id",
    "suggestedType": "Specific Product Type"
  }
]

Products:
${productData.map(p => `ID: ${p.id}\nTitle: ${p.title}\nDescription: ${p.description}\nCurrent Type: ${p.currentType}\n---`).join('\n')}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedTypes = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({ 
        success: true,
        productTypes: generatedTypes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-generate-product-types function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Failed to generate product types: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});