import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🏷️ Canada Post Label Download API called');
    
    // Extract JWT token and get user ID
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      if (!userId) throw new Error('No user ID in token');
      console.log('✅ User authenticated:', userId);
    } catch (jwtError) {
      console.error('❌ Failed to extract user from JWT:', jwtError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get label ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const labelId = pathParts[pathParts.length - 1];

    if (!labelId) {
      return new Response(
        JSON.stringify({ error: 'Label ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Looking for label ID:', labelId);

    // Create service role client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the shipment label record
    const { data: labelRecord, error: labelError } = await serviceSupabase
      .from('shipment_labels')
      .select('*')
      .eq('id', labelId)
      .eq('user_id', userId)
      .single();

    if (labelError || !labelRecord) {
      console.error('❌ Label not found:', labelError);
      return new Response(
        JSON.stringify({ error: 'Label not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📋 Found label record:', {
      id: labelRecord.id,
      carrier: labelRecord.carrier,
      tracking_number: labelRecord.tracking_number,
      label_url: labelRecord.label_url
    });

    // If we already have the label data stored, return it
    if (labelRecord.label_data) {
      console.log('📄 Returning stored label data');
      return new Response(labelRecord.label_data, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="label-${labelRecord.tracking_number}.pdf"`
        }
      });
    }

    // If we have a label URL, fetch the label from Canada Post
    if (labelRecord.label_url && labelRecord.carrier === 'Canada Post') {
      console.log('📡 Fetching label from Canada Post API:', labelRecord.label_url);

      // Get Canada Post credentials
      const apiKey = Deno.env.get('CANADA_POST_DEV_API_KEY');
      const apiSecret = Deno.env.get('CANADA_POST_DEV_API_SECRET');

      if (!apiKey || !apiSecret) {
        console.error('❌ Canada Post API credentials not configured');
        return new Response(
          JSON.stringify({ error: 'Canada Post API credentials not configured' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      try {
        const labelResponse = await fetch(labelRecord.label_url, {
          headers: {
            'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
            'Accept': 'application/pdf'
          }
        });

        console.log('📊 Canada Post Label API Response Status:', labelResponse.status);

        if (labelResponse.ok) {
          const labelData = await labelResponse.arrayBuffer();
          const labelBytes = new Uint8Array(labelData);
          
          console.log('📄 Retrieved label data, size:', labelBytes.length, 'bytes');

          // Store the label data in our database for future use
          await serviceSupabase
            .from('shipment_labels')
            .update({ 
              label_data: labelBytes,
              updated_at: new Date().toISOString()
            })
            .eq('id', labelId);

          console.log('💾 Stored label data in database');

          // Return the PDF label
          return new Response(labelBytes, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="label-${labelRecord.tracking_number}.pdf"`
            }
          });
        } else {
          const errorText = await labelResponse.text();
          console.error('❌ Failed to fetch label from Canada Post:', labelResponse.status, errorText);
          
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch label from Canada Post',
              details: `Status: ${labelResponse.status}`,
              raw_response: errorText
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } catch (fetchError) {
        console.error('❌ Error fetching label:', fetchError);
        return new Response(
          JSON.stringify({ 
            error: 'Error fetching label',
            details: fetchError.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // No label data available
    return new Response(
      JSON.stringify({ error: 'Label data not available' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in label download:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});