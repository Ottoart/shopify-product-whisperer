import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

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

interface EbayWebhookEvent {
  notificationId: string;
  publishedDate: string;
  notificationType: string;
  implementationName: string;
  version: string;
  payload: {
    userId: string;
    eiasToken: string;
    notificationEventType: string;
    timestamp: string;
    eventId: string;
  };
}

interface EbayWebhookRequest {
  notification: EbayWebhookEvent;
  timestamp: string;
  signature: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received eBay webhook:', req.method, req.url);
    
    // Handle eBay verification requests (GET with challenge parameters)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const challenge = url.searchParams.get('challenge_code');
      const verificationToken = url.searchParams.get('verification_token');
      
      console.log('eBay verification request:', { challenge, verificationToken });
      
      if (challenge && verificationToken) {
        if (verificationToken === EBAY_VERIFICATION_TOKEN) {
          console.log('Verification successful, returning challenge');
          return new Response(challenge, { 
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/plain'
            }
          });
        } else {
          console.log('Verification failed - token mismatch');
          return new Response('Verification failed', { 
            status: 401,
            headers: corsHeaders 
          });
        }
      }
      
      // If no challenge parameters, treat as invalid request
      return new Response('Invalid verification request', { 
        status: 400,
        headers: corsHeaders 
      });
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

    const { notification } = webhookData;
    
    console.log('Processing eBay notification:', {
      notificationId: notification.notificationId,
      notificationType: notification.notificationType,
      eventType: notification.payload?.notificationEventType,
      userId: notification.payload?.userId
    });

    // Handle different notification types
    switch (notification.notificationType) {
      case 'MARKETPLACE_ACCOUNT_DELETION':
        await handleMarketplaceAccountDeletion(notification);
        break;
      
      default:
        console.log('Unhandled notification type:', notification.notificationType);
    }

    // Log the webhook event for debugging
    await logWebhookEvent(notification, webhookData.timestamp);

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

async function handleMarketplaceAccountDeletion(notification: EbayWebhookEvent) {
  const { userId, eiasToken, eventId } = notification.payload;
  
  console.log('Handling marketplace account deletion:', {
    userId,
    eiasToken,
    eventId
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

async function logWebhookEvent(notification: EbayWebhookEvent, timestamp: string) {
  try {
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        platform: 'ebay',
        event_type: notification.notificationType,
        notification_id: notification.notificationId,
        payload: notification,
        received_at: timestamp,
        processed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging webhook event:', error);
    }
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}