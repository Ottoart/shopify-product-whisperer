import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightRequest {
  type?: 'performance' | 'pricing' | 'operations' | 'all';
  timeframe?: 'week' | 'month' | 'quarter';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { type = 'all', timeframe = 'month' }: InsightRequest = await req.json().catch(() => ({}));

    console.log(`Generating AI insights for user ${user.id}, type: ${type}, timeframe: ${timeframe}`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      default: // month
        startDate.setMonth(endDate.getMonth() - 1);
    }

    // Gather data for insights
    const insights = [];

    if (type === 'all' || type === 'performance') {
      // Get performance metrics
      const { data: metrics } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: false });

      if (metrics && metrics.length > 0) {
        const performanceInsight = await generatePerformanceInsight(openaiApiKey, metrics);
        insights.push(performanceInsight);
      }
    }

    if (type === 'all' || type === 'pricing') {
      // Get pricing recommendations
      const { data: pricingRecs } = await supabase
        .from('ai_pricing_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (pricingRecs && pricingRecs.length > 0) {
        const pricingInsight = await generatePricingInsight(openaiApiKey, pricingRecs);
        insights.push(pricingInsight);
      }
    }

    if (type === 'all' || type === 'operations') {
      // Get batch operations data
      const { data: operations } = await supabase
        .from('batch_operations')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (operations && operations.length > 0) {
        const operationsInsight = await generateOperationsInsight(openaiApiKey, operations);
        insights.push(operationsInsight);
      }
    }

    // Store insights in database
    for (const insight of insights) {
      await supabase.from('ai_insights').insert({
        user_id: user.id,
        insight_type: insight.type,
        title: insight.title,
        description: insight.description,
        action_items: insight.action_items,
        priority: insight.priority,
        confidence_score: insight.confidence_score,
        data_points: insight.data_points
      });
    }

    console.log(`Generated ${insights.length} AI insights for user ${user.id}`);

    return new Response(JSON.stringify({
      success: true,
      insights_generated: insights.length,
      insights: insights
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating AI insights:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generatePerformanceInsight(apiKey: string, metrics: any[]): Promise<any> {
  const latestMetric = metrics[0];
  const previousMetric = metrics[1];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a business analyst generating insights from performance metrics. Focus on actionable recommendations.'
        },
        {
          role: 'user',
          content: `Analyze this performance data and provide insights:
          
Latest metrics: ${JSON.stringify(latestMetric, null, 2)}
Previous metrics: ${JSON.stringify(previousMetric, null, 2)}

Provide a JSON response with:
- title: Brief insight title
- description: 2-3 sentence analysis
- action_items: Array of 2-3 specific actions
- priority: "high", "medium", or "low"
- confidence_score: 0.0-1.0`
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  const insight = JSON.parse(data.choices[0].message.content);
  
  return {
    ...insight,
    type: 'performance',
    data_points: { latest_metric: latestMetric, previous_metric: previousMetric }
  };
}

async function generatePricingInsight(apiKey: string, recommendations: any[]): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a pricing strategist analyzing AI pricing recommendations. Focus on revenue optimization.'
        },
        {
          role: 'user',
          content: `Analyze these pricing recommendations and provide insights:
          
${recommendations.map(r => `- Product ${r.product_id}: ${JSON.stringify(r.recommendation_data)}`).join('\n')}

Provide a JSON response with:
- title: Brief insight title
- description: 2-3 sentence analysis
- action_items: Array of 2-3 specific actions
- priority: "high", "medium", or "low"
- confidence_score: 0.0-1.0`
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  const insight = JSON.parse(data.choices[0].message.content);
  
  return {
    ...insight,
    type: 'pricing',
    data_points: { recommendations: recommendations.slice(0, 5) }
  };
}

async function generateOperationsInsight(apiKey: string, operations: any[]): Promise<any> {
  const completedOps = operations.filter(op => op.status === 'completed');
  const failedOps = operations.filter(op => op.status === 'failed');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an operations analyst reviewing batch operations performance. Focus on efficiency improvements.'
        },
        {
          role: 'user',
          content: `Analyze these operations metrics:
          
Total operations: ${operations.length}
Completed: ${completedOps.length}
Failed: ${failedOps.length}
Success rate: ${((completedOps.length / operations.length) * 100).toFixed(1)}%

Recent operations: ${operations.slice(0, 5).map(op => 
  `${op.operation_type}: ${op.status} (${op.processed_items}/${op.total_items} items)`
).join(', ')}

Provide a JSON response with:
- title: Brief insight title
- description: 2-3 sentence analysis
- action_items: Array of 2-3 specific actions
- priority: "high", "medium", or "low"
- confidence_score: 0.0-1.0`
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  const insight = JSON.parse(data.choices[0].message.content);
  
  return {
    ...insight,
    type: 'operations',
    data_points: { 
      total_operations: operations.length,
      success_rate: (completedOps.length / operations.length) * 100,
      recent_operations: operations.slice(0, 3)
    }
  };
}