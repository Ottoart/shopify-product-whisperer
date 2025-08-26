import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { storeUrl, accessToken, operationType, query, bulkOperationId } = await req.json();
    
    if (!storeUrl || !accessToken) {
      throw new Error('Store URL and access token are required');
    }

    // Clean and prepare access token
    let cleanAccessToken = accessToken.toString().trim();
    try {
      const parsed = JSON.parse(cleanAccessToken);
      if (parsed.access_token) {
        cleanAccessToken = parsed.access_token;
      }
    } catch (e) {
      // Not JSON, continue with string cleaning
    }
    
    cleanAccessToken = cleanAccessToken
      .replace(/[\s\n\r\t\u2028\u2029]/g, '')
      .split(/\s+/)[0]
      .replace(/[^\w-]/g, '');
    
    const shpatMatch = cleanAccessToken.match(/shpat_[a-zA-Z0-9]+/);
    if (shpatMatch) {
      cleanAccessToken = shpatMatch[0];
    }
    
    if (!cleanAccessToken.startsWith('shpat_')) {
      throw new Error('Invalid Shopify access token format');
    }

    // Clean domain
    let shopifyDomain = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (shopifyDomain.includes('_')) {
      shopifyDomain = shopifyDomain.split('_')[0];
    }
    const graphqlUrl = `https://${shopifyDomain}/admin/api/2023-10/graphql.json`;

    console.log(`Processing bulk operation for user ${user.id}, type: ${operationType}`);

    let result = {};

    if (operationType === 'start' && query) {
      // Start a new bulk operation
      console.log('Starting new bulk operation...');
      
      const bulkOperationMutation = `
        mutation bulkOperationRunQuery($query: String!) {
          bulkOperationRunQuery(query: $query) {
            bulkOperation {
              id
              status
              errorCode
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': cleanAccessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify({
          query: bulkOperationMutation,
          variables: { query }
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const bulkOperation = data.data?.bulkOperationRunQuery?.bulkOperation;
      const userErrors = data.data?.bulkOperationRunQuery?.userErrors;

      if (userErrors && userErrors.length > 0) {
        throw new Error(`User errors: ${JSON.stringify(userErrors)}`);
      }

      if (bulkOperation) {
        // Save bulk operation to database
        const { error: bulkError } = await supabase
          .from('shopify_bulk_operations')
          .upsert({
            user_id: user.id,
            shopify_bulk_operation_id: bulkOperation.id,
            operation_type: 'bulk_query',
            status: bulkOperation.status,
            query: query,
            url: bulkOperation.url,
            partial_data_url: bulkOperation.partialDataUrl,
            object_count: bulkOperation.objectCount,
            file_size: bulkOperation.fileSize,
            error_code: bulkOperation.errorCode,
            completed_at: bulkOperation.completedAt,
            created_at: bulkOperation.createdAt || new Date().toISOString()
          }, {
            onConflict: 'user_id,shopify_bulk_operation_id'
          });

        if (bulkError) {
          console.error('Bulk operation save error:', bulkError);
        }

        result = {
          bulkOperationId: bulkOperation.id,
          status: bulkOperation.status,
          message: 'Bulk operation started successfully'
        };
      }

    } else if (operationType === 'check' && bulkOperationId) {
      // Check status of existing bulk operation
      console.log(`Checking bulk operation status: ${bulkOperationId}`);
      
      const checkQuery = `
        query getBulkOperation($id: ID!) {
          node(id: $id) {
            ... on BulkOperation {
              id
              status
              errorCode
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
            }
          }
        }
      `;

      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': cleanAccessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify({
          query: checkQuery,
          variables: { id: bulkOperationId }
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const bulkOperation = data.data?.node;

      if (bulkOperation) {
        // Update bulk operation in database
        const { error: bulkError } = await supabase
          .from('shopify_bulk_operations')
          .update({
            status: bulkOperation.status,
            url: bulkOperation.url,
            partial_data_url: bulkOperation.partialDataUrl,
            object_count: bulkOperation.objectCount,
            file_size: bulkOperation.fileSize,
            error_code: bulkOperation.errorCode,
            completed_at: bulkOperation.completedAt
          })
          .eq('user_id', user.id)
          .eq('shopify_bulk_operation_id', bulkOperationId);

        if (bulkError) {
          console.error('Bulk operation update error:', bulkError);
        }

        result = {
          bulkOperationId: bulkOperation.id,
          status: bulkOperation.status,
          url: bulkOperation.url,
          objectCount: bulkOperation.objectCount,
          fileSize: bulkOperation.fileSize,
          errorCode: bulkOperation.errorCode,
          completedAt: bulkOperation.completedAt,
          message: `Bulk operation status: ${bulkOperation.status}`
        };
      }

    } else if (operationType === 'download' && bulkOperationId) {
      // Download data from completed bulk operation
      console.log(`Downloading bulk operation data: ${bulkOperationId}`);
      
      // Get bulk operation from database
      const { data: bulkOp, error: fetchError } = await supabase
        .from('shopify_bulk_operations')
        .select('*')
        .eq('user_id', user.id)
        .eq('shopify_bulk_operation_id', bulkOperationId)
        .single();

      if (fetchError || !bulkOp) {
        throw new Error('Bulk operation not found');
      }

      if (bulkOp.status !== 'COMPLETED' || !bulkOp.url) {
        throw new Error('Bulk operation not completed or no download URL available');
      }

      // Download the data
      const downloadResponse = await fetch(bulkOp.url);
      
      if (!downloadResponse.ok) {
        throw new Error(`Failed to download bulk data: ${downloadResponse.status}`);
      }

      const bulkData = await downloadResponse.text();
      
      result = {
        bulkOperationId: bulkOperationId,
        status: 'downloaded',
        dataSize: bulkData.length,
        recordCount: bulkData.split('\n').filter(line => line.trim()).length,
        message: 'Bulk operation data downloaded successfully',
        data: bulkData.substring(0, 1000) + (bulkData.length > 1000 ? '...' : '') // Preview
      };

    } else {
      throw new Error('Invalid operation type or missing parameters');
    }

    console.log(`Bulk operation ${operationType} completed successfully`);

    return new Response(JSON.stringify({
      success: true,
      operation: operationType,
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in shopify-bulk-operations:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});