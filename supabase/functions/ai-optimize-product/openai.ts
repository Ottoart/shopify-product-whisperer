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

IMPORTANT INSTRUCTIONS:
- For "description": ONLY include the actual product description content, NOT section headers like "Product Description:" or "Product Type:"
- For "type": Provide a SPECIFIC product type like "Disposable Nail Wipes" or "Multi-Purpose Beauty Wipes", NOT generic types like "nail_beauty"
- For "category": Use the exact Google Shopping category path format

{
  "title": "your optimized title in English",
  "description": "your complete optimized description content WITHOUT any section headers - just the actual description text with HTML formatting",
  "tags": "comma-separated tags following the guidelines",
  "type": "SPECIFIC product type like 'Disposable Nail Wipes' or 'Multi-Purpose Beauty Wipes'",
  "category": "Health & Beauty > Personal Care > Cosmetics > [specific subcategory]"
}

Start your response with { and end with }. Nothing else.`;
  } else {
    // Use default structured prompt
    return `You are a Shopify product optimization expert. Create compelling, conversion-focused content STRICTLY IN ENGLISH LANGUAGE ONLY.

🔥 CRITICAL FAILURE CONDITIONS - DO NOT DO THESE:
❌ NEVER include "Product Description" or any title/header in the description field
❌ NEVER use generic types like "Hair Care" or "Skincare" - be SPECIFIC
❌ NEVER use generic categories - use EXACT subcategories
❌ NEVER generate content in French or any language other than English

PRODUCT INPUT (translate to English if needed):
Title: ${productData.title}
Type: ${productData.type || 'Not specified'}
Description: ${productData.description || 'No description'}
Tags: ${productData.tags || 'No tags'}
Vendor: ${productData.vendor || 'Not specified'}

MANDATORY JSON OUTPUT - COPY THIS EXACT STRUCTURE:

{
  "title": "ENGLISH TITLE HERE - max 60 chars - DO NOT copy existing title",
  "description": "<p><strong>Transform your routine with this premium [specific product type].</strong></p><p>This [specific product] delivers [specific benefits]. Perfect for [target audience] seeking [desired results].</p><ul><li>Key benefit 1</li><li>Key benefit 2</li><li>Key benefit 3</li></ul><p><strong>How to use:</strong></p><ol><li>Step 1 instruction</li><li>Step 2 instruction</li><li>Step 3 instruction</li></ol><p>Experience [specific results] with this premium [product type].</p>",
  "tags": "Brand_[ActualBrandName], Type_[SpecificProductType], Benefits_[MainBenefit], Hair_Type_[if hair product], Skin_Type_[if skincare], Ingredients_[KeyIngredient], Usage_Daily, Target_Unisex, Price_Range_[Under25/25to50/50to100], Professional_Grade, Premium_Quality, Natural_Formula, [15+ more specific tags]",
  "type": "EXAMPLE REQUIRED: Leave-In Hair Conditioner OR Deep Conditioning Hair Mask OR Anti-Aging Face Serum OR Moisturizing Body Lotion OR Vitamin C Facial Cleanser - BE THIS SPECIFIC",
  "category": "Health & Beauty > Personal Care > Cosmetics > Hair Care > Hair Treatments & Masks OR Health & Beauty > Personal Care > Cosmetics > Skin Care > Face Moisturizers - CHOOSE EXACT MATCH",
  "seo_title": "NEW SEO title in English (max 60 chars) different from main title",
  "seo_description": "NEW meta description in English (max 160 chars) with benefits and CTA",
  "vendor": "${productData.vendor || 'Premium Beauty'}",
  "google_shopping_condition": "new",
  "google_shopping_gender": "unisex", 
  "google_shopping_age_group": "adult"
}

🚨 ULTRA-SPECIFIC REQUIREMENTS:

FOR PRODUCT TYPE - Choose ONE of these EXACT formats:
- Hair: "Leave-In Hair Conditioner", "Deep Conditioning Hair Mask", "Curl Defining Cream", "Hair Growth Serum", "Volumizing Hair Mousse"
- Skincare: "Anti-Aging Face Serum", "Hydrating Face Moisturizer", "Vitamin C Facial Cleanser", "Exfoliating Face Scrub", "Eye Contour Cream"
- Body: "Moisturizing Body Lotion", "Exfoliating Body Scrub", "Firming Body Oil", "Soothing Body Balm"

FOR CATEGORY - Choose ONE of these EXACT paths:
- Hair Conditioners/Treatments: "Health & Beauty > Personal Care > Cosmetics > Hair Care > Hair Treatments & Masks"
- Hair Styling: "Health & Beauty > Personal Care > Cosmetics > Hair Care > Hair Styling Products"  
- Face Skincare: "Health & Beauty > Personal Care > Cosmetics > Skin Care > Face Moisturizers"
- Body Care: "Health & Beauty > Personal Care > Cosmetics > Skin Care > Body Care"

FOR DESCRIPTION - MUST start with: "<p><strong>Transform" and NEVER include "Product Description" title

FINAL CHECK: Your response MUST be ONLY the JSON object starting with { and ending with }`;
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