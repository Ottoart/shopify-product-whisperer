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
    return `Create a compelling, conversion-focused product description for this Shopify product:

Product Title: ${productData.title}
Product Type: ${productData.type || 'Not specified'}
Current Description: ${productData.description || 'No description'}
Current Tags: ${productData.tags || 'No tags'}

CRITICAL HTML FORMATTING REQUIREMENT: You MUST respond with ONLY a valid JSON object containing HTML-formatted description. The description field must contain EXACT HTML structure with proper tags.

MANDATORY JSON FORMAT:
{
  "title": "SEO-optimized title (max 70 characters)",
  "description": "<p><strong>Opening compelling statement about the product and its main benefit.</strong> Detailed description with <strong>key ingredients/features highlighted in bold</strong> and specific benefits. Include <strong>measurable results</strong> where possible and mention it's suitable for <strong>target audience</strong>. <strong>Key ingredients</strong> like hyaluronic acid, squalane, etc. should be <strong>bolded</strong>.</p><p><strong>How to Use the Product?</strong></p><ol><li>First step instruction</li><li>Second step instruction</li><li>Third step instruction</li><li>Additional steps as needed</li></ol><p><strong>Key Features of the Product:</strong></p><ul><li>Feature 1 with <strong>highlighted benefits in bold</strong></li><li>Feature 2 with <strong>key ingredients bolded</strong></li><li>Feature 3 about formulation like <strong>vegan</strong>, <strong>cruelty-free</strong>, etc.</li><li>Additional relevant features</li></ul><p><strong>Who Should Use This Product & Hair/Skin Concerns It Can Address?</strong></p><ul><li>Target audience 1 with <strong>specific concerns bolded</strong></li><li>Target audience 2 with <strong>hair/skin types highlighted</strong></li><li>Problems it addresses like <strong>dryness</strong>, <strong>aging</strong>, <strong>frizz</strong>, etc.</li></ul><p><strong>Why Should You Use This Product & Benefits?</strong><br>Compelling closing statement about why this is the <strong>ultimate solution</strong> and the <strong>transformation</strong> customers can expect. Mention <strong>key benefits</strong> and <strong>results</strong> they'll achieve for <strong>final impact</strong>.</p>",
  "tags": "comma-separated relevant tags for search and categorization"
}

CRITICAL: Your response must be ONLY valid JSON starting with { and ending with }. The description field must contain proper HTML tags (<p>, <ol>, <li>, <ul>, <strong>) exactly as shown above. No plain text formatting allowed.`;
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
        content: 'You are a Shopify product optimization expert. You MUST respond with ONLY valid JSON - no other text, no explanations, no markdown formatting. Your response must start with { and end with }. Focus on converting features into benefits, SEO optimization, and compelling copy that drives sales.' 
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
    
    return optimizedData;
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    console.error('AI response was:', aiContent);
    throw new Error('Invalid AI response format');
  }
}