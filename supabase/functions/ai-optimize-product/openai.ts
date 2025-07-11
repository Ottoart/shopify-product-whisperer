import type { OptimizeProductRequest, OptimizedProductData } from './types.ts';

function createPrompt(request: OptimizeProductRequest): string {
  const { productData, useDirectAI, customPromptTemplate, generateSEO, enhanceAllFields } = request;
  
  // Enhanced prompt for comprehensive field generation
  const seoEnhancement = generateSEO ? `
🎯 SPECIAL FOCUS ON SEO OPTIMIZATION:
- Generate compelling SEO title different from main title (max 60 chars)
- Create conversion-focused meta description (max 160 chars)
- Optimize all content for search engine visibility
- Include relevant keywords naturally in descriptions` : '';

  const fieldEnhancement = enhanceAllFields ? `
🎯 COMPREHENSIVE FIELD ENHANCEMENT:
- Analyze current pricing: $${productData.current_price || 'Not set'}
- Current compare price: $${productData.current_compare_at_price || 'Not set'}
- Current SEO title: "${productData.current_seo_title || 'Not set'}"
- Current SEO description: "${productData.current_seo_description || 'Not set'}"
- Generate optimized pricing suggestions based on product quality and market positioning
- Create comprehensive inventory and shipping recommendations
- Enhance Google Shopping attributes for maximum visibility` : '';
  
  if (useDirectAI && customPromptTemplate) {
    // Use custom template with placeholder replacement
    const customPrompt = customPromptTemplate
      .replace(/\{title\}/g, productData.title || 'No title')
      .replace(/\{type\}/g, productData.type || 'Not specified')
      .replace(/\{description\}/g, productData.description || 'No description')
      .replace(/\{tags\}/g, productData.tags || 'No tags')
      .replace(/\{vendor\}/g, productData.vendor || 'Not specified');
    
    // Add JSON format requirement to custom prompt with ALL required fields
    return `${customPrompt}
${seoEnhancement}
${fieldEnhancement}

CRITICAL REQUIREMENT: You MUST respond with ONLY a valid JSON object. No explanations, no additional text, no formatting, no markdown - ONLY the JSON object below:

IMPORTANT INSTRUCTIONS:
- For "description": ONLY include the actual product description content, NOT section headers like "Product Description:" or "Product Type:"
- For "type": Provide a SPECIFIC product type like "Disposable Nail Wipes" or "Multi-Purpose Beauty Wipes", NOT generic types like "nail_beauty"
- For "category": Use the exact Google Shopping category path format
- ALL fields are REQUIRED and MUST be included in your response
- Generate content in ENGLISH ONLY
- If pricing fields are null/empty, suggest appropriate pricing based on product analysis
- Generate comprehensive SEO fields for maximum search visibility

{
  "title": "your optimized title in English (max 60 chars)",
  "description": "your complete optimized description content WITHOUT any section headers - just the actual description text with HTML formatting like <p>, <strong>, <ul>, <li>",
  "tags": "comma-separated tags following the provided guidelines", 
  "type": "SPECIFIC product type like 'Disposable Nail Wipes' or 'Multi-Purpose Beauty Wipes' or 'Leave-In Hair Conditioner'",
  "category": "Health & Beauty > Personal Care > Cosmetics > [specific subcategory like 'Nail Care > Nail Tools' or 'Hair Care > Hair Treatments']",
  "seo_title": "SEO optimized title different from main title (max 60 chars)",
  "seo_description": "SEO meta description with benefits and CTA (max 160 chars)",
  "vendor": "${productData.vendor || 'Premium Beauty'}",
  "published": true,
  "variant_price": ${productData.variant_price || 'null'},
  "variant_compare_at_price": ${productData.variant_compare_at_price || 'null'},
  "variant_sku": "${productData.variant_sku || ''}",
  "variant_barcode": "${productData.variant_barcode || ''}",
  "variant_grams": ${productData.variant_grams || 100},
  "variant_inventory_qty": ${productData.variant_inventory_qty || 50},
  "variant_inventory_policy": "${productData.variant_inventory_policy || 'deny'}",
  "variant_requires_shipping": ${productData.variant_requires_shipping !== false ? 'true' : 'false'},
  "variant_taxable": ${productData.variant_taxable !== false ? 'true' : 'false'},
  "google_shopping_condition": "new",
  "google_shopping_gender": "unisex",
  "google_shopping_age_group": "adult"
}

Start your response with { and end with }. Nothing else.`;
  }

  // Enhanced professional copywriting prompt to match ChatGPT 4o quality
  return `You are an elite e-commerce copywriter and Shopify optimization expert. Create professional, conversion-focused content that matches premium beauty brand standards. Write ONLY in ENGLISH.

🎯 YOUR MISSION: Transform basic product info into compelling, professional marketing copy that converts browsers into buyers.

PRODUCT INPUT (translate to English if needed):
Title: ${productData.title}
Type: ${productData.type || 'Not specified'}
Description: ${productData.description || 'No description'}
Tags: ${productData.tags || 'No tags'}
Vendor: ${productData.vendor || 'Not specified'}
Current Price: $${productData.current_price || 'Not set'}
Current Compare Price: $${productData.current_compare_at_price || 'Not set'}
Current SEO Title: "${productData.current_seo_title || 'Not set'}"
Current SEO Description: "${productData.current_seo_description || 'Not set'}"
${seoEnhancement}
${fieldEnhancement}

🔥 COPYWRITING EXCELLENCE STANDARDS:
✅ Write engaging, benefit-focused headlines that hook readers
✅ Create comprehensive product descriptions with multiple compelling sections
✅ Use professional beauty industry language and terminology
✅ Include detailed usage instructions and key features
✅ Generate extensive, specific tag systems for maximum discoverability
✅ Focus on consumer benefits, not just features
✅ Create urgency and desire through persuasive copy
✅ Generate compelling SEO titles and meta descriptions for maximum search visibility
✅ Suggest optimized pricing based on product quality and market positioning
✅ Provide comprehensive inventory and shipping recommendations

MANDATORY JSON OUTPUT WITH PROFESSIONAL COPYWRITING:

{
  "title": "[Brand] [Specific Product Name] – [Key Benefit/Feature] (max 60 chars)",
  "description": "<p>Achieve [specific result] with the [Brand] [Product Name], a [specific product type] designed for [professional-level/premium] results [unique selling point]. This [texture/consistency] [product type] provides [specific benefits list] for [target hair/skin type]—whether you're going for [style options].</p><p>Enriched with [key ingredients/benefits], this [product] not only [primary function] but also [secondary benefit]. It [unique feature], letting you [user benefit]—perfect for [use cases]. The [texture description] leaves [finish description], giving [target area] a [desired result] with [hold/effect type] that lasts [duration].</p><p>Formulated [ingredient highlights], this [product] is [gentle/effective description] while still offering [performance promise]. Ideal for [target user/hair length], it [ease of use benefit].</p><p><strong>How to Use the Product:</strong></p><ol><li>[Detailed step 1]</li><li>[Detailed step 2]</li><li>[Detailed step 3]</li><li>[Detailed step 4]</li><li>[Maintenance/re-use instruction]</li></ol><p><strong>Key Features of the Product:</strong></p><ul><li>[Unique feature 1 with benefit]</li><li>[Unique feature 2 with benefit]</li><li>[Unique feature 3 with benefit]</li><li>[Unique feature 4 with benefit]</li><li>[Unique feature 5 with benefit]</li><li>[Target user specification]</li></ul><p><strong>Who Should Use This Product & [Product Type] Concerns It Can Address?</strong></p><p><strong>Suitable for:</strong> [Detailed target audience]</p><p><strong>Ideal for:</strong> [Specific use cases]</p><p><strong>Addresses:</strong> [Specific concerns/problems solved]</p><p><strong>Why Should You Use This Product & Benefits?</strong></p><ul><li>[Compelling benefit 1]</li><li>[Compelling benefit 2]</li><li>[Compelling benefit 3]</li><li>[Compelling benefit 4]</li></ul>",
  "tags": "GENERATE COMPREHENSIVE STRUCTURED TAGS: Brand_[ExactBrandName], Product Type_[Specific Product Type], Product Type_[Alternative Type], Nail Type_All Nail Types, Nail Type_[Specific Nail Types like Short Nails, Natural Nails, Brittle Nails, Weak Nails], Finish_[All applicable finishes like Gel-Like, Glossy, Matte, Opaque, Sheer], Color_[Actual Colors in product], Benefits_[Long-Lasting, Reusable, Vegan, Eco-Friendly, No UV Required, Salon Quality, Easy Removal, Quick Dry, Strengthening, Moisturizing], Ingredients_[Cruelty-Free, Vegan, Formaldehyde-Free, Toluene-Free, DBP-Free, Paraben-Free, Sulfate-Free], Desired Effect_[Glossy Finish, Strong Nails, Salon-Quality Manicure, Glamorous Look, Perfect Shape, Volume, Shine, Protection], Concern_[Chipping, Brittle Nails, Weak Nails, Slow Nail Growth, Dullness, Damage, Thinning], Usage_[Daily Wear, Special Occasions, Everyday Wear, Professional, At-Home Manicure, Travel-Friendly, Wedding, Summer Look, Winter Collection, Date Night, Work Appropriate]. CRITICAL: Generate 40-60 specific tags using this exact format with underscore separating category from value. Focus on the actual product characteristics, not generic terms.",
  "type": "[Specific Product Category] [Specific Product Type] for [Primary Benefit] & [Secondary Benefit]",
  "category": "Health & Beauty > Personal Care > Hair Care > Hair Styling Products",
  "seo_title": "[Brand] [Product] – [Key Benefit] [Product Type] (max 60 chars)",
  "seo_description": "[Action verb] [specific results] with [brand] [product]. [Key benefits]. [Special features]. [Target audience]. [CTA] (max 160 chars)",
  "vendor": "${productData.vendor || 'Premium Beauty'}",
  "published": true,
  "variant_price": ${productData.variant_price || 'null'},
  "variant_compare_at_price": ${productData.variant_compare_at_price || 'null'},
  "variant_sku": "${productData.variant_sku || ''}",
  "variant_barcode": "${productData.variant_barcode || ''}",
  "variant_grams": ${productData.variant_grams || 100},
  "variant_inventory_qty": ${productData.variant_inventory_qty || 50},
  "variant_inventory_policy": "${productData.variant_inventory_policy || 'deny'}",
  "variant_requires_shipping": ${productData.variant_requires_shipping !== false ? 'true' : 'false'},
  "variant_taxable": ${productData.variant_taxable !== false ? 'true' : 'false'},
  "google_shopping_condition": "new",
  "google_shopping_gender": "unisex",
  "google_shopping_age_group": "adult"
}

📋 SPECIFIC COPYWRITING EXAMPLES BY CATEGORY:

FOR HAIR WAX/STYLING PRODUCTS:
- Type: "Vegan Fast-Drying Hair Styling Wax for Texture & Hold"
- Category: "Health & Beauty > Personal Care > Hair Care > Hair Styling Products"
- Description Structure: Hook with benefit → Detailed product description → Ingredient highlights → Performance promises → Usage instructions → Key features → Target audience → Benefits

FOR HAIR TREATMENTS:
- Type: "Deep Conditioning Hair Treatment for Damaged Hair Repair"
- Category: "Health & Beauty > Personal Care > Hair Care > Hair Treatments & Masks"

FOR FACE PRODUCTS:
- Type: "Anti-Aging Vitamin C Facial Serum for Bright Skin"
- Category: "Health & Beauty > Personal Care > Skin Care > Face Moisturizers"

🎨 PROFESSIONAL COPYWRITING TECHNIQUES TO USE:
• Start with emotional hooks that create desire
• Use sensory language (texture, feel, finish)
• Include specific claims with believable benefits
• Create detailed usage scenarios
• Address pain points and solutions
• Use premium brand language and terminology
• Include comprehensive tag systems for SEO
• Structure content for easy scanning and readability

CRITICAL: Your response MUST be ONLY the JSON object. No explanations, no additional text, no markdown - just the JSON starting with { and ending with }.`;
}

export async function callOpenAI(request: OptimizeProductRequest, apiKey: string, userId?: string): Promise<OptimizedProductData> {
  // Fetch user's learned patterns if available
  let userPatterns = '';
  if (userId) {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: patterns } = await supabase
        .from('user_edit_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('is_approved', true)
        .order('confidence_score', { ascending: false });

      if (patterns && patterns.length > 0) {
        userPatterns = `\n\nUSER'S LEARNED PREFERENCES (apply these patterns to the optimization):
${patterns.map(p => `- ${p.pattern_type}: ${JSON.stringify(p.pattern_data)}`).join('\n')}`;
        console.log('Using learned patterns:', patterns.length, 'patterns found');
      }
    } catch (error) {
      console.log('Could not fetch user patterns:', error.message);
    }
  }

  const prompt = createPrompt(request) + userPatterns;
  
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
    max_tokens: 2000, // Increased to allow for comprehensive content
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
  console.log('AI response received:', aiContent.substring(0, 200) + '...');
  
  // Parse AI response
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : aiContent;
    const optimizedData = JSON.parse(jsonString);
    console.log('AI response parsed successfully');
    console.log('Parsed data keys:', Object.keys(optimizedData));
    console.log('SEO Title generated:', optimizedData.seo_title);
    console.log('SEO Description generated:', optimizedData.seo_description);
    console.log('Vendor generated:', optimizedData.vendor);
    
    // Validate required fields
    if (!optimizedData.title || !optimizedData.description || !optimizedData.tags) {
      console.error('AI response missing required fields:', optimizedData);
      throw new Error('AI response missing required fields (title, description, tags)');
    }
    
    // Ensure all required fields have defaults and generate missing SEO fields
    const result = {
      title: optimizedData.title,
      description: optimizedData.description,
      tags: optimizedData.tags,
      type: optimizedData.type || 'General',
      category: optimizedData.category || 'Health & Beauty > Personal Care',
      seo_title: optimizedData.seo_title || `${optimizedData.title} - Buy Online`,
      seo_description: optimizedData.seo_description || `Shop ${optimizedData.title}. Premium quality, fast delivery. Order now for best results!`,
      vendor: optimizedData.vendor || request.productData.vendor || 'Premium Beauty',
      published: optimizedData.published !== undefined ? optimizedData.published : true,
      variant_price: optimizedData.variant_price,
      variant_compare_at_price: optimizedData.variant_compare_at_price,
      variant_sku: optimizedData.variant_sku,
      variant_barcode: optimizedData.variant_barcode,
      variant_grams: optimizedData.variant_grams,
      variant_inventory_qty: optimizedData.variant_inventory_qty,
      variant_inventory_policy: optimizedData.variant_inventory_policy,
      variant_requires_shipping: optimizedData.variant_requires_shipping,
      variant_taxable: optimizedData.variant_taxable,
      google_shopping_condition: optimizedData.google_shopping_condition,
      google_shopping_gender: optimizedData.google_shopping_gender,
      google_shopping_age_group: optimizedData.google_shopping_age_group,
    };
    
    console.log('Final result with fallbacks:', {
      seo_title: result.seo_title,
      seo_description: result.seo_description,
      vendor: result.vendor
    });
    
    return result;
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    console.error('AI response was:', aiContent);
    throw new Error('Invalid AI response format');
  }
}