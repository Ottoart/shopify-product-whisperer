import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// eBay webhook verification token - you'll set this in Supabase secrets
const EBAY_VERIFICATION_TOKEN = Deno.env.get('EBAY_VERIFICATION_TOKEN');

interface EbayWebhookNotification {
  notificationId: string;
  eventDate: string;
  publishDate: string;
  publishAttemptCount: number;
  data: {
    username: string;
    userId: string;
    eiasToken: string;
  };
}

interface EbayWebhookRequest {
  metadata: {
    topic: string;
    schemaVersion: string;
    deprecated: boolean;
  };
  notification: EbayWebhookNotification;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== eBay Webhook Handler Debug ===');
    console.log('Received eBay webhook:', req.method, req.url);
    console.log('EBAY_VERIFICATION_TOKEN exists:', !!EBAY_VERIFICATION_TOKEN);
    console.log('EBAY_VERIFICATION_TOKEN length:', EBAY_VERIFICATION_TOKEN?.length);
    
    // Test basic endpoint access
    if (req.method === 'GET' && !req.url.includes('challenge_code')) {
      return new Response(JSON.stringify({
        status: 'eBay webhook handler is running',
        hasVerificationToken: !!EBAY_VERIFICATION_TOKEN,
        tokenLength: EBAY_VERIFICATION_TOKEN?.length,
        endpoint: 'https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/ebay-webhook-handler'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Handle eBay verification requests (GET with challenge parameters)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const challengeCode = url.searchParams.get('challenge_code');
      
      console.log('eBay verification request:', { challengeCode, url: req.url });
      
      if (challengeCode && EBAY_VERIFICATION_TOKEN) {
        // According to eBay docs, we need to hash: challengeCode + verificationToken + endpoint
        // Use the full webhook endpoint URL as registered with eBay
        const endpoint = 'https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/ebay-webhook-handler';
        const dataToHash = challengeCode + EBAY_VERIFICATION_TOKEN + endpoint;
        
        console.log('Hashing data:', {
          challengeCode,
          verificationToken: EBAY_VERIFICATION_TOKEN,
          endpoint
        });
        
        // Create SHA-256 hash
        const encoder = new TextEncoder();
        const data = encoder.encode(dataToHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const challengeResponse = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        console.log('Generated challenge response:', challengeResponse);
        
        // Return JSON response with challengeResponse field
        return new Response(JSON.stringify({
          challengeResponse: challengeResponse
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } else {
        console.log('Missing challenge_code or verification token:', {
          hasChallengeCode: !!challengeCode,
          hasVerificationToken: !!EBAY_VERIFICATION_TOKEN,
          challengeCode,
          verificationTokenLength: EBAY_VERIFICATION_TOKEN?.length
        });
        return new Response(JSON.stringify({
          error: 'Missing challenge_code or verification token',
          hasChallengeCode: !!challengeCode,
          hasVerificationToken: !!EBAY_VERIFICATION_TOKEN
        }), { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    // Handle POST requests (actual webhook notifications)
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    
    console.log('Request headers:', headers);
    console.log('Request body:', body);

    // Verify the webhook signature/token if provided
    if (EBAY_VERIFICATION_TOKEN) {
      const providedToken = headers['x-ebay-verification-token'] || headers['authorization'];
      if (providedToken !== EBAY_VERIFICATION_TOKEN) {
        console.error('Invalid verification token');
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // Parse the webhook payload
    let webhookData: EbayWebhookRequest;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return new Response('Invalid JSON', { status: 400 });
    }

    const { notification, metadata } = webhookData;
    
    console.log('Processing eBay notification:', {
      notificationId: notification.notificationId,
      topic: metadata.topic,
      userId: notification.data.userId,
      username: notification.data.username
    });

    // Handle different notification types
    switch (metadata.topic) {
      case 'MARKETPLACE_ACCOUNT_DELETION':
        await handleMarketplaceAccountDeletion(notification);
        break;
      
      default:
        console.log('Unhandled notification type:', metadata.topic);
    }

    // Log the webhook event for debugging
    await logWebhookEvent(notification, metadata.topic);

    // Respond with 200 OK to acknowledge receipt
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully',
      notificationId: notification.notificationId
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });

  } catch (error: any) {
    console.error('Error processing eBay webhook:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }
});

async function handleMarketplaceAccountDeletion(notification: EbayWebhookNotification) {
  const { userId, eiasToken, username } = notification.data;
  
  console.log('Handling marketplace account deletion:', {
    userId,
    eiasToken,
    username
  });

  try {
    // Find the user's eBay marketplace configuration
    const { data: marketplaceConfigs, error: fetchError } = await supabase
      .from('marketplace_configurations')
      .select('*')
      .eq('platform', 'ebay')
      .eq('external_user_id', userId);

    if (fetchError) {
      console.error('Error fetching marketplace configs:', fetchError);
      return;
    }

    if (!marketplaceConfigs || marketplaceConfigs.length === 0) {
      console.log('No eBay marketplace configuration found for user:', userId);
      return;
    }

    // Update all matching configurations to mark as deleted
    const { error: updateError } = await supabase
      .from('marketplace_configurations')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deletion_reason: 'MARKETPLACE_ACCOUNT_DELETION',
        updated_at: new Date().toISOString()
      })
      .eq('platform', 'ebay')
      .eq('external_user_id', userId);

    if (updateError) {
      console.error('Error updating marketplace configurations:', updateError);
      return;
    }

    console.log(`Successfully marked ${marketplaceConfigs.length} eBay configurations as deleted`);

    // Optionally, you can also notify the user via email or in-app notification
    // await notifyUserOfAccountDeletion(marketplaceConfigs);

  } catch (error) {
    console.error('Error handling marketplace account deletion:', error);
  }
}

async function logWebhookEvent(notification: EbayWebhookNotification, eventType: string) {
  try {
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        platform: 'ebay',
        event_type: eventType,
        notification_id: notification.notificationId,
        payload: notification,
        received_at: notification.publishDate,
        processed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging webhook event:', error);
    }
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}