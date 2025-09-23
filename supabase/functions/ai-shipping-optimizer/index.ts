import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { optimization_type } = await req.json();

    // Fetch user's shipping data for analysis
    const { data: orders } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500);

    const { data: shippingRules } = await supabaseClient
      .from('shipping_rules')
      .select('*')
      .eq('user_id', user.id);

    const { data: carrierConfigs } = await supabaseClient
      .from('carrier_configurations')
      .select('*')
      .eq('user_id', user.id);

    // Analyze shipping patterns
    const shippingAnalysis = analyzeShippingPatterns(orders || []);
    
    // Generate AI recommendations
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const aiRecommendations = await generateAIRecommendations(
      openAIApiKey!,
      shippingAnalysis,
      shippingRules || [],
      carrierConfigs || [],
      optimization_type
    );

    // Save insights to database
    const { data: insight } = await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type: 'shipping_optimization',
        title: aiRecommendations.title,
        description: aiRecommendations.description,
        action_items: aiRecommendations.action_items,
        data_points: {
          optimization_type,
          analysis: shippingAnalysis,
          recommendations: aiRecommendations.recommendations,
          potential_savings: aiRecommendations.potential_savings
        },
        confidence_score: aiRecommendations.confidence_score,
        priority: aiRecommendations.priority
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      success: true,
      insight,
      recommendations: aiRecommendations.recommendations,
      potential_savings: aiRecommendations.potential_savings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-shipping-optimizer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeShippingPatterns(orders: any[]) {
  const analysis = {
    total_orders: orders.length,
    total_shipping_cost: 0,
    avg_shipping_cost: 0,
    carrier_performance: {} as Record<string, any>,
    destination_patterns: {} as Record<string, number>,
    weight_patterns: [] as number[],
    cost_efficiency: {} as Record<string, number>,
    delivery_performance: {} as Record<string, any>
  };

  orders.forEach(order => {
    if (order.shipping_cost) {
      analysis.total_shipping_cost += parseFloat(order.shipping_cost);
    }

    // Carrier performance analysis
    if (order.carrier) {
      if (!analysis.carrier_performance[order.carrier]) {
        analysis.carrier_performance[order.carrier] = {
          count: 0,
          total_cost: 0,
          avg_cost: 0,
          on_time_delivery: 0,
          total_deliveries: 0
        };
      }
      analysis.carrier_performance[order.carrier].count++;
      if (order.shipping_cost) {
        analysis.carrier_performance[order.carrier].total_cost += parseFloat(order.shipping_cost);
      }
    }

    // Destination patterns
    const state = order.shipping_state;
    if (state) {
      analysis.destination_patterns[state] = (analysis.destination_patterns[state] || 0) + 1;
    }

    // Weight patterns
    if (order.weight_lbs) {
      analysis.weight_patterns.push(parseFloat(order.weight_lbs));
    }

    // Delivery performance
    if (order.shipped_date && order.delivered_date) {
      const shippedDate = new Date(order.shipped_date);
      const deliveredDate = new Date(order.delivered_date);
      const deliveryDays = Math.ceil((deliveredDate.getTime() - shippedDate.getTime()) / (1000 * 3600 * 24));
      
      if (order.carrier) {
        if (!analysis.delivery_performance[order.carrier]) {
          analysis.delivery_performance[order.carrier] = {
            total_days: 0,
            delivery_count: 0,
            avg_delivery_days: 0
          };
        }
        analysis.delivery_performance[order.carrier].total_days += deliveryDays;
        analysis.delivery_performance[order.carrier].delivery_count++;
      }
    }
  });

  // Calculate averages
  analysis.avg_shipping_cost = analysis.total_orders > 0 ? analysis.total_shipping_cost / analysis.total_orders : 0;

  // Calculate carrier averages
  Object.keys(analysis.carrier_performance).forEach(carrier => {
    const perf = analysis.carrier_performance[carrier];
    perf.avg_cost = perf.count > 0 ? perf.total_cost / perf.count : 0;
  });

  // Calculate delivery averages
  Object.keys(analysis.delivery_performance).forEach(carrier => {
    const perf = analysis.delivery_performance[carrier];
    perf.avg_delivery_days = perf.delivery_count > 0 ? perf.total_days / perf.delivery_count : 0;
  });

  return analysis;
}

async function generateAIRecommendations(
  apiKey: string,
  analysis: any,
  rules: any[],
  carriers: any[],
  optimizationType: string
) {
  const systemPrompt = `You are an AI shipping optimization expert. Analyze shipping data and provide actionable recommendations to reduce costs and improve efficiency.

Focus on ${optimizationType} optimization. Provide specific, measurable recommendations with estimated cost savings.

Return a JSON object with:
- title: Brief title for the optimization
- description: 2-3 sentence summary
- recommendations: Array of specific actionable items
- action_items: Array of immediate steps to take
- potential_savings: Object with estimated monthly/yearly savings
- confidence_score: 0-1 confidence in recommendations
- priority: "high", "medium", or "low"`;

  const userPrompt = `Analyze this shipping data:

Orders Analysis:
- Total Orders: ${analysis.total_orders}
- Total Shipping Cost: $${analysis.total_shipping_cost.toFixed(2)}
- Average Shipping Cost: $${analysis.avg_shipping_cost.toFixed(2)}

Carrier Performance:
${Object.entries(analysis.carrier_performance).map(([carrier, perf]: [string, any]) => 
  `- ${carrier}: ${perf.count} orders, $${perf.avg_cost.toFixed(2)} avg cost`
).join('\n')}

Top Destinations:
${Object.entries(analysis.destination_patterns)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([state, count]) => `- ${state}: ${count} orders`)
  .join('\n')}

Current Rules: ${rules.length} shipping rules configured
Current Carriers: ${carriers.length} carriers configured

Provide optimization recommendations for: ${optimizationType}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}