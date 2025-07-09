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
    return `You are a Shopify product optimization expert. Create compelling, conversion-focused content STRICTLY IN ENGLISH LANGUAGE ONLY.

🚨 MANDATORY ENGLISH ONLY RULE: ALL generated content MUST be in English regardless of input language. If input is in French, Spanish, German, or any other language, you MUST translate concepts and create English content.

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
  "title": "CREATE A COMPLETELY NEW ENGLISH PRODUCT TITLE (max 60 chars). Analyze the product and create an engaging, SEO-optimized title that clearly describes what the product is. NEVER copy the existing title.",
  "description": "Generate a COMPLETE NEW product description in ENGLISH using HTML tags. DO NOT include any titles like 'Product Description' or headers. Start directly with content like: <p><strong>Transform your [product type] routine with this premium [product name].</strong></p> Then include: benefits, key features, how to use instructions in numbered list, target audience, and why customers should buy. Use <strong>bold</strong> text, <ol><li>numbered lists</li></ol> for instructions, and <ul><li>bullet points</li></ul> for features. Make it conversion-focused with specific benefits.",
  "tags": "Generate 25-50 COMPREHENSIVE SEO tags in ENGLISH. MANDATORY format: Brand_[BrandName], Category_[ProductCategory], Type_[SpecificType], Benefits_[MainBenefit], Hair_Type_[if hair product], Skin_Type_[if skincare], Ingredients_[KeyIngredient], Usage_[Daily/Weekly], Target_[Men/Women/Unisex], Price_Range_[Under25/25to50/50to100/Over100], Finish_[if applicable], Size_[if relevant]. Create specific, searchable tags.",
  "type": "Generate HIGHLY SPECIFIC product type in ENGLISH. Examples: 'Leave-In Hair Conditioner', 'Deep Conditioning Hair Mask', 'Anti-Aging Face Serum', 'Moisturizing Body Lotion', 'Vitamin C Facial Cleanser', 'Curl Defining Cream', 'Hair Growth Oil'. Be precise and descriptive - NEVER use generic terms like 'Hair Care' or 'Skincare'.",
  "category": "Select the MOST SPECIFIC category path. For HAIR: 'Health & Beauty > Personal Care > Cosmetics > Hair Care > [Hair Shampoo & Conditioner OR Hair Styling Products OR Hair Treatments & Masks OR Hair Oils & Serums]'. For SKINCARE: 'Health & Beauty > Personal Care > Cosmetics > Skin Care > [Face Moisturizers OR Cleansers OR Serums OR Eye Care]'. For BODY: 'Health & Beauty > Personal Care > Cosmetics > Skin Care > Body Care'. Choose the EXACT subcategory that matches the product type.",
  "seo_title": "Create NEW SEO-optimized title in ENGLISH (max 60 chars) - different from product title but equally compelling",
  "seo_description": "Create NEW meta description in ENGLISH (max 160 chars) highlighting main benefits and call-to-action",
  "vendor": "Use the brand name from the product information or create appropriate brand name if missing",
  "google_shopping_condition": "new",
  "google_shopping_gender": "unisex",
  "google_shopping_age_group": "adult"
}

🚨 CRITICAL ENGLISH-ONLY RULES:
1. ALL TEXT must be in English - titles, descriptions, tags, everything
2. If input product is French (like 'Masque'), translate to English (like 'Mask')
3. Description must start directly with content - NO titles like "Product Description"
4. Generate SPECIFIC product type - not generic categories
5. Create 25-50 tags with proper prefixes for better searchability
6. Use only HTML tags: <p>, <strong>, <ol>, <li>, <ul>, <br> - NO markdown
7. Response must be ONLY valid JSON starting with { and ending with }
8. Every field is MANDATORY - provide specific, relevant content for each`;
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