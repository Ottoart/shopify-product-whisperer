import type { OptimizeProductRequest, OptimizedProductData } from './types.ts';

function createPrompt(request: OptimizeProductRequest): string {
  const { productData, useDirectAI, customPromptTemplate } = request;
  
  if (useDirectAI && customPromptTemplate) {
    // Use custom template with placeholder replacement
    const customPrompt = customPromptTemplate
      .replace(/\{title\}/g, productData.title || 'No title')
      .replace(/\{type\}/g, productData.type || 'Not specified')
      .replace(/\{description\}/g, productData.description || 'No description')
      .replace(/\{tags\}/g, productData.tags || 'No tags');
    
    // Add JSON format requirement to custom prompt
    return `${customPrompt}

CRITICAL REQUIREMENT: You MUST respond with ONLY a valid JSON object. No explanations, no additional text, no formatting, no markdown - ONLY the JSON object below:

{
  "title": "your optimized title here",
  "description": "your complete optimized description with all sections",
  "tags": "comma-separated tags following the guidelines"
}

Start your response with { and end with }. Nothing else.`;
  } else {
    // Use default structured prompt
    return `You are optimizing a Shopify product. Create compelling, conversion-focused content IN ENGLISH LANGUAGE ONLY.

CRITICAL: You MUST generate COMPLETELY NEW content IN ENGLISH regardless of input language. DO NOT copy or keep any existing descriptions, tags, or content from the input data. Create fresh, optimized content from scratch.

PRODUCT INFORMATION (for reference only - DO NOT copy this content):
Title: ${productData.title}
Type: ${productData.type || 'Not specified'}
Description: ${productData.description || 'No description'}
Tags: ${productData.tags || 'No tags'}
Vendor: ${productData.vendor || 'Not specified'}
Current SEO Title: ${productData.seo_title || 'None'}
Current SEO Description: ${productData.seo_description || 'None'}

ABSOLUTE REQUIREMENT - RESPOND WITH EXACTLY THIS JSON STRUCTURE:

  
{
  "title": "Create a NEW optimized product title (max 60 chars) - DO NOT use the existing title",
  "description": "Generate a COMPLETELY NEW product description using HTML tags. Start with: <p><strong>Transform your hair with [product name].</strong> Create compelling content with <strong>bold</strong> text, <ol><li>numbered lists</li></ol> for usage instructions, and <ul><li>bullet points</li></ul> for features. Include specific benefits, ingredients, usage instructions, key features, target audience, and compelling reasons to buy. Make it conversion-focused and engaging. DO NOT copy any existing description content.",
  "tags": "Generate COMPLETELY NEW comprehensive SEO tags (up to 50). Include: Brand_[BrandName], Hair Type_[Curly/Straight/Wavy/All], Benefits_[Hydrating/Strengthening/etc], Ingredients_[KeyIngredients], Concern_[Dryness/Damage/etc], PRICE_[Under25/25to50/etc], Finish_[Matte/Glossy/Natural], Color_[if applicable], Usage_[Daily/Weekly], Desired Effect_[Smooth/Shiny/Voluminous], Product Category. Create NEW tags, do not reuse existing ones.",
  "type": "Generate SPECIFIC product type based on the product (e.g., Leave-In Conditioner, Deep Conditioning Mask, Curl Cream, Hair Serum, Shampoo, etc.) - be precise and descriptive",
  "category": "Select the MOST SPECIFIC Shopify category. For HAIR CARE: 'Health & Beauty > Personal Care > Cosmetics > Hair Care > [choose specific: Hair Shampoo & Conditioner for shampoos/conditioners/leave-in conditioners, Hair Styling Products for gels/creams/sprays, Hair Treatments & Masks for deep treatments/masks, Hair Oils & Serums for oils/serums]'. For LEAVE-IN CONDITIONERS specifically use 'Health & Beauty > Personal Care > Cosmetics > Hair Care > Hair Shampoo & Conditioner'. For SKINCARE: 'Health & Beauty > Personal Care > Cosmetics > Skin Care > [specific type]'. For NAIL CARE: 'Health & Beauty > Personal Care > Cosmetics > Nail Care > [specific type]'.",
  "seo_title": "Create NEW SEO title (max 60 chars) - different from product title",
  "seo_description": "Create NEW SEO meta description (max 160 chars) with compelling benefits",
  "vendor": "Use the brand name from the product information",
  "google_shopping_condition": "new",
  "google_shopping_gender": "unisex",
  "google_shopping_age_group": "adult"
}

CRITICAL RULES:
1. Response must be ONLY valid JSON - no other text
2. Description MUST use HTML tags: <p>, <strong>, <ol>, <li>, <ul>, <br>
3. NO markdown formatting like **text** - use <strong>text</strong>
4. Start with { and end with }
5. Include ALL fields shown above
6. NEVER add any titles like "Product Overview", "Description", or section headers - start directly with the first paragraph
7. Generate up to 50 comprehensive tags including Brand_, Hair Type_, Benefits_, Ingredients_, Concern_, PRICE_, Finish_, Color_, Usage_, Desired Effect_ prefixes
8. ALWAYS include a specific product type (Hair Care, Skincare, Nail Care, Tools, etc.)
9. Make descriptions conversion-focused with specific benefits and results
10. The description field must start exactly with "<p><strong>Revitalize" - NO additional titles or headers before this`;
  }
}

export async function callOpenAI(request: OptimizeProductRequest, apiKey: string): Promise<OptimizedProductData> {
  const prompt = createPrompt(request);
  
  console.log('Calling OpenAI API...');
  console.log('OpenAI API Key exists:', !!apiKey);
  console.log('OpenAI API Key length:', apiKey?.length || 0);
  
  const requestBody = {
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a Shopify product optimization expert. CRITICAL: You MUST respond with ONLY valid JSON in ENGLISH LANGUAGE ONLY. NO explanations, NO text outside JSON, NO markdown formatting. Use HTML tags (<p>, <strong>, <ol>, <li>, <ul>) NOT markdown (**). Your response must start with { and end with }. Focus on SEO optimization and compelling copy. ALL CONTENT MUST BE GENERATED IN ENGLISH regardless of input language.' 
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
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('OpenAI response status:', response.status);
  console.log('OpenAI response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI API error ${response.status}:`, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const aiResponse = await response.json();
  console.log('OpenAI API call successful');
  console.log('Response structure:', Object.keys(aiResponse));
  
  const aiContent = aiResponse.choices[0].message.content;
  console.log('AI response received:', aiContent.substring(0, 100) + '...');
  
  // Parse AI response
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : aiContent;
    const optimizedData = JSON.parse(jsonString);
    console.log('AI response parsed successfully');
    
    // Validate required fields
    if (!optimizedData.title || !optimizedData.description || !optimizedData.tags) {
      console.error('AI response missing required fields:', optimizedData);
      throw new Error('AI response missing required fields (title, description, tags)');
    }
    
    // Ensure all required fields have defaults
    return {
      title: optimizedData.title,
      description: optimizedData.description,
      tags: optimizedData.tags,
      type: optimizedData.type || 'General',
      category: optimizedData.category || 'Health & Beauty > Personal Care',
      seo_title: optimizedData.seo_title || optimizedData.title,
      seo_description: optimizedData.seo_description || '',
      vendor: optimizedData.vendor,
      variant_price: optimizedData.variant_price,
      variant_compare_at_price: optimizedData.variant_compare_at_price,
      variant_sku: optimizedData.variant_sku,
      variant_barcode: optimizedData.variant_barcode,
      variant_grams: optimizedData.variant_grams,
      google_shopping_condition: optimizedData.google_shopping_condition,
      google_shopping_gender: optimizedData.google_shopping_gender,
      google_shopping_age_group: optimizedData.google_shopping_age_group,
    };
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    console.error('AI response was:', aiContent);
    throw new Error('Invalid AI response format');
  }
}