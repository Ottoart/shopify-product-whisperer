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
    return `You are optimizing a Shopify product. Create compelling, conversion-focused content.

PRODUCT INFORMATION:
Title: ${productData.title}
Type: ${productData.type || 'Not specified'}
Description: ${productData.description || 'No description'}
Tags: ${productData.tags || 'No tags'}
Vendor: ${productData.vendor || 'Not specified'}
Current SEO Title: ${productData.seo_title || 'None'}
Current SEO Description: ${productData.seo_description || 'None'}

ABSOLUTE REQUIREMENT - RESPOND WITH EXACTLY THIS JSON STRUCTURE:

{
  "title": "Optimized product title (max 60 chars)",
  "description": "<p><strong>Compelling opening about product benefit.</strong> Detailed info with <strong>key features bolded</strong>. Include <strong>specific results</strong> and <strong>target audience</strong>.</p><p><strong>How to Use the Product?</strong></p><ol><li>Step 1</li><li>Step 2</li><li>Step 3</li></ol><p><strong>Key Features of the Product:</strong></p><ul><li><strong>Feature 1</strong> with benefits</li><li><strong>Feature 2</strong> with ingredients</li><li><strong>Vegan, cruelty-free</strong> etc</li></ul><p><strong>Who Should Use This Product & Hair/Skin Concerns It Can Address?</strong></p><ul><li><strong>Target 1</strong> with concerns</li><li><strong>Target 2</strong> with types</li></ul><p><strong>Why Should You Use This Product & Benefits?</strong><br>Ultimate solution for <strong>transformation</strong> and <strong>results</strong>.</p>",
  "tags": "tag1,tag2,tag3",
  "type": "Product Category (e.g., Hair Care, Skincare, Tools)",
  "seo_title": "SEO optimized title (max 60 chars)",
  "seo_description": "SEO meta description (max 160 chars)",
  "vendor": "Brand Name",
  "google_shopping_condition": "new",
  "google_shopping_gender": "unisex",
  "google_shopping_age_group": "adult"
}

CRITICAL RULES:
1. Response must be ONLY valid JSON - no other text
2. Description MUST use HTML tags: <p>, <strong>, <ol>, <li>, <ul>, <br>
3. NO markdown formatting like **text** - use <strong>text</strong>
4. Start with { and end with }
5. Include ALL fields shown above`;
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
        content: 'You are a Shopify product optimization expert. CRITICAL: You MUST respond with ONLY valid JSON. NO explanations, NO text outside JSON, NO markdown formatting. Use HTML tags (<p>, <strong>, <ol>, <li>, <ul>) NOT markdown (**). Your response must start with { and end with }. Focus on SEO optimization and compelling copy.' 
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