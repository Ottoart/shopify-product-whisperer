import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceSearchRequest {
  productTitle: string;
  currentPrice?: number;
  vendor?: string;
}

interface PriceResult {
  store: string;
  price: number;
  url: string;
}

interface SearchResult {
  lowest?: PriceResult;
  highest?: PriceResult;
  savings?: number;
}

serve(async (req) => {
  console.log('=== Find Best Price Function Called ===');
  console.log('Method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting price search...');
    
    // Parse request body
    let requestBody: PriceSearchRequest;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
      console.log('Product title:', requestBody.productTitle);
      console.log('Current price:', requestBody.currentPrice);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate required fields
    if (!requestBody.productTitle) {
      console.error('Missing product title');
      return new Response(
        JSON.stringify({ error: 'Product title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulate price search with realistic data
    // In a real implementation, you would use web scraping or API calls to actual stores
    const searchQuery = `${requestBody.vendor || ''} ${requestBody.productTitle}`.trim();
    console.log('Searching for:', searchQuery);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic price variations based on current price
    const basePrice = requestBody.currentPrice || 20;
    const variation = basePrice * 0.3; // 30% variation
    
    const mockResults: PriceResult[] = [
      {
        store: "Amazon",
        price: Number((basePrice - variation * Math.random()).toFixed(2)),
        url: `https://amazon.com/s?k=${encodeURIComponent(searchQuery)}`
      },
      {
        store: "eBay", 
        price: Number((basePrice - variation * 0.5 + variation * Math.random()).toFixed(2)),
        url: `https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}`
      },
      {
        store: "Walmart",
        price: Number((basePrice - variation * 0.3 + variation * Math.random()).toFixed(2)),
        url: `https://walmart.com/search?q=${encodeURIComponent(searchQuery)}`
      },
      {
        store: "Target",
        price: Number((basePrice + variation * 0.2 * Math.random()).toFixed(2)),
        url: `https://target.com/s?searchTerm=${encodeURIComponent(searchQuery)}`
      },
      {
        store: "Shopify Store",
        price: Number((basePrice + variation * 0.5 + variation * 0.3 * Math.random()).toFixed(2)),
        url: `https://shop.example.com/search?q=${encodeURIComponent(searchQuery)}`
      }
    ];

    // Find lowest and highest prices
    const sortedByPrice = mockResults.sort((a, b) => a.price - b.price);
    const lowest = sortedByPrice[0];
    const highest = sortedByPrice[sortedByPrice.length - 1];
    
    const savings = Number((highest.price - lowest.price).toFixed(2));

    const result: SearchResult = {
      lowest,
      highest,
      savings: savings > 0 ? savings : undefined
    };

    console.log('Price search completed successfully');
    console.log('Lowest price:', lowest.price, 'at', lowest.store);
    console.log('Highest price:', highest.price, 'at', highest.store);
    console.log('Potential savings:', savings);

    return new Response(
      JSON.stringify({ 
        success: true,
        results: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: `Price search failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});