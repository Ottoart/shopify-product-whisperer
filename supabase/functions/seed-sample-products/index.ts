import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  image_url?: string;
  category: string;
  supplier: string;
  status: string;
  inventory_quantity: number;
  cost?: number;
  markup_percentage?: number;
}

const sampleProducts: Product[] = [
  {
    name: "Bubble Wrap Roll 12\" x 100ft",
    description: "Protective bubble wrap for shipping and packaging",
    price: 24.99,
    compare_at_price: 29.99,
    currency: "USD",
    category: "Packaging",
    supplier: "staples",
    status: "active",
    inventory_quantity: 50,
    cost: 12.50,
    markup_percentage: 100
  },
  {
    name: "Corrugated Shipping Boxes 12x9x6 (Pack of 25)",
    description: "Durable cardboard boxes perfect for shipping",
    price: 34.99,
    compare_at_price: 39.99,
    currency: "USD",
    category: "Packaging",
    supplier: "staples",
    status: "active",
    inventory_quantity: 25,
    cost: 17.50,
    markup_percentage: 100
  },
  {
    name: "Packing Tape 2\" x 55yd Clear (6-Pack)",
    description: "Heavy-duty packing tape for secure sealing",
    price: 18.99,
    currency: "USD",
    category: "Packaging",
    supplier: "staples",
    status: "active",
    inventory_quantity: 100,
    cost: 9.50,
    markup_percentage: 100
  },
  {
    name: "Poly Mailers 10x13 Self-Seal (Pack of 100)",
    description: "Waterproof poly mailers with adhesive strip",
    price: 22.99,
    currency: "USD",
    category: "Packaging",
    supplier: "staples",
    status: "active",
    inventory_quantity: 75,
    cost: 11.50,
    markup_percentage: 100
  },
  {
    name: "Padded Envelopes #0 6x10 (Pack of 25)",
    description: "Cushioned envelopes for fragile items",
    price: 16.99,
    currency: "USD",
    category: "Packaging",
    supplier: "staples",
    status: "active",
    inventory_quantity: 40,
    cost: 8.50,
    markup_percentage: 100
  },
  {
    name: "Kraft Paper Rolls 36\" x 100ft",
    description: "Brown kraft paper for wrapping and protection",
    price: 28.99,
    currency: "USD",
    category: "Packaging",
    supplier: "staples",
    status: "active",
    inventory_quantity: 30,
    cost: 14.50,
    markup_percentage: 100
  },
  {
    name: "Shipping Labels 8.5x11 (Pack of 500)",
    description: "Self-adhesive shipping labels for packages",
    price: 45.99,
    currency: "USD",
    category: "Office Supplies",
    supplier: "staples",
    status: "active",
    inventory_quantity: 20,
    cost: 23.00,
    markup_percentage: 100
  },
  {
    name: "Box Cutter with Retractable Blade",
    description: "Heavy-duty utility knife for opening boxes",
    price: 12.99,
    currency: "USD",
    category: "Tools",
    supplier: "staples",
    status: "active",
    inventory_quantity: 60,
    cost: 6.50,
    markup_percentage: 100
  },
  {
    name: "Void Fill Packing Peanuts 14 cubic ft",
    description: "Biodegradable packing peanuts for cushioning",
    price: 19.99,
    currency: "USD",
    category: "Packaging",
    supplier: "staples",
    status: "active",
    inventory_quantity: 35,
    cost: 10.00,
    markup_percentage: 100
  },
  {
    name: "Heavy Duty Storage Bins 18qt (Set of 6)",
    description: "Clear storage containers with secure lids",
    price: 89.99,
    compare_at_price: 99.99,
    currency: "USD",
    category: "Storage",
    supplier: "staples",
    status: "active",
    inventory_quantity: 15,
    cost: 45.00,
    markup_percentage: 100
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('🌱 Seeding sample products...');

    // Insert sample products
    const { data, error } = await supabase
      .from('store_products')
      .upsert(sampleProducts, { onConflict: 'name,supplier' })
      .select();

    if (error) throw error;

    console.log(`✅ Successfully seeded ${data.length} products`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${data.length} sample products`,
        products: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});