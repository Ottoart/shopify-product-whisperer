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

    const { rule_type, business_requirements } = await req.json();

    // Fetch historical data for rule generation
    const { data: orders } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1000);

    const { data: existingRules } = await supabaseClient
      .from('shipping_rules')
      .select('*')
      .eq('user_id', user.id);

    const { data: storeConfigs } = await supabaseClient
      .from('store_shipping_configs')
      .select('*')
      .eq('user_id', user.id);

    // Generate AI-powered shipping rules
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const aiGeneratedRules = await generateShippingRules(
      openAIApiKey!,
      orders || [],
      existingRules || [],
      storeConfigs || [],
      rule_type,
      business_requirements
    );

    // Create the rules in the database
    const createdRules = [];
    for (const rule of aiGeneratedRules.rules) {
      const { data: createdRule } = await supabaseClient
        .from('shipping_rules')
        .insert({
          user_id: user.id,
          name: rule.name,
          conditions: rule.conditions,
          actions: rule.actions,
          priority: rule.priority,
          active: false // Start as inactive for review
        })
        .select()
        .single();
      
      if (createdRule) {
        createdRules.push(createdRule);
      }
    }

    // Save generation insight
    await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type: 'shipping_rules_generated',
        title: `Generated ${aiGeneratedRules.rules.length} Shipping Rules`,
        description: aiGeneratedRules.summary,
        action_items: ['Review generated rules', 'Test rules with sample orders', 'Activate approved rules'],
        data_points: {
          rule_type,
          business_requirements,
          generated_rules: aiGeneratedRules.rules,
          reasoning: aiGeneratedRules.reasoning
        },
        confidence_score: aiGeneratedRules.confidence_score,
        priority: 'medium'
      });

    return new Response(JSON.stringify({
      success: true,
      generated_rules: createdRules,
      reasoning: aiGeneratedRules.reasoning,
      recommendations: aiGeneratedRules.recommendations
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-shipping-rules-generator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateShippingRules(
  apiKey: string,
  orders: any[],
  existingRules: any[],
  storeConfigs: any[],
  ruleType: string,
  businessRequirements: string
) {
  const systemPrompt = `You are an AI shipping rules expert. Generate intelligent shipping rules based on historical order data and business requirements.

Create rules that are:
1. Specific and actionable
2. Based on real data patterns
3. Cost-effective
4. Easy to understand and maintain

Return a JSON object with:
- rules: Array of rule objects with name, conditions, actions, priority
- summary: Brief explanation of generated rules
- reasoning: Detailed explanation of why these rules were created
- recommendations: Additional suggestions for optimization
- confidence_score: 0-1 confidence in rule effectiveness

Rule conditions should use these operators: "equals", "not_equals", "greater_than", "less_than", "contains", "in_array"
Rule actions should specify: carrier, service_type, priority_adjustment, cost_adjustment, etc.`;

  // Analyze order patterns for rule generation
  const orderAnalysis = analyzeOrderPatternsForRules(orders);
  
  const userPrompt = `Generate ${ruleType} shipping rules based on this data:

Historical Orders: ${orders.length} orders analyzed

Order Patterns:
- Weight Distribution: ${JSON.stringify(orderAnalysis.weight_distribution)}
- Value Distribution: ${JSON.stringify(orderAnalysis.value_distribution)}
- Destination Frequency: ${JSON.stringify(orderAnalysis.destination_frequency)}
- Carrier Performance: ${JSON.stringify(orderAnalysis.carrier_performance)}

Existing Rules: ${existingRules.length} rules currently active
Store Configurations: ${storeConfigs.length} store configs

Business Requirements: ${businessRequirements}

Rule Type Requested: ${ruleType}

Generate 3-5 optimized shipping rules that will improve efficiency and reduce costs.`;

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

function analyzeOrderPatternsForRules(orders: any[]) {
  const analysis = {
    weight_distribution: { light: 0, medium: 0, heavy: 0 },
    value_distribution: { low: 0, medium: 0, high: 0 },
    destination_frequency: {} as Record<string, number>,
    carrier_performance: {} as Record<string, any>
  };

  orders.forEach(order => {
    // Weight analysis
    const weight = parseFloat(order.weight_lbs || '0');
    if (weight <= 2) analysis.weight_distribution.light++;
    else if (weight <= 10) analysis.weight_distribution.medium++;
    else analysis.weight_distribution.heavy++;

    // Value analysis
    const value = parseFloat(order.total_amount || '0');
    if (value <= 50) analysis.value_distribution.low++;
    else if (value <= 200) analysis.value_distribution.medium++;
    else analysis.value_distribution.high++;

    // Destination frequency
    const state = order.shipping_state;
    if (state) {
      analysis.destination_frequency[state] = (analysis.destination_frequency[state] || 0) + 1;
    }

    // Carrier performance
    if (order.carrier && order.shipping_cost) {
      if (!analysis.carrier_performance[order.carrier]) {
        analysis.carrier_performance[order.carrier] = {
          orders: 0,
          total_cost: 0,
          avg_cost: 0
        };
      }
      analysis.carrier_performance[order.carrier].orders++;
      analysis.carrier_performance[order.carrier].total_cost += parseFloat(order.shipping_cost);
    }
  });

  // Calculate averages
  Object.keys(analysis.carrier_performance).forEach(carrier => {
    const perf = analysis.carrier_performance[carrier];
    perf.avg_cost = perf.orders > 0 ? perf.total_cost / perf.orders : 0;
  });

  return analysis;
}