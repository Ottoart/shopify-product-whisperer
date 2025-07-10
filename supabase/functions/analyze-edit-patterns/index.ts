import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Analyze Edit Patterns Function Called ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's edit history
    const { data: editHistory, error: historyError } = await supabase
      .from('product_edit_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('edit_type', 'manual')
      .order('created_at', { ascending: false })
      .limit(100);

    if (historyError) throw historyError;

    if (!editHistory || editHistory.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No edit history found yet. Start making manual edits to build patterns.',
          patterns: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze patterns with OpenAI
    const analysisPrompt = `Analyze these product edit patterns and extract user preferences:

Edit History:
${editHistory.map(edit => 
  `Field: ${edit.field_name}\nBefore: ${edit.before_value}\nAfter: ${edit.after_value}\n---`
).join('\n')}

Identify patterns in:
1. Title style preferences (length, capitalization, keywords)
2. Description formatting (structure, tone, length)
3. Tag preferences (categories, naming conventions)
4. Type categorization patterns

Respond with ONLY a JSON array of patterns:
[
  {
    "pattern_type": "title_style",
    "description": "User prefers shorter, specific titles under 50 characters",
    "pattern_data": {
      "max_length": 50,
      "style": "specific",
      "examples": ["example1", "example2"]
    },
    "confidence_score": 0.8
  }
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const patterns = JSON.parse(data.choices[0].message.content);

    // Save patterns to database
    for (const pattern of patterns) {
      await supabase
        .from('user_edit_patterns')
        .upsert({
          user_id: user.id,
          pattern_type: pattern.pattern_type,
          pattern_data: pattern.pattern_data,
          confidence_score: pattern.confidence_score,
          usage_count: 1,
          is_approved: null // User needs to approve
        }, { 
          onConflict: 'user_id,pattern_type',
          ignoreDuplicates: false 
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        patterns: patterns.map(p => ({
          ...p,
          needsApproval: true
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-edit-patterns function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Failed to analyze patterns: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});