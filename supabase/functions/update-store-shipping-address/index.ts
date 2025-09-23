import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid authorization token')
    }

    const { address } = await req.json()

    console.log('🏢 Updating store shipping address for user:', user.id)
    console.log('📍 New address data:', address)

    // Update the store shipping configuration with the exact UPS registered address
    const { data, error } = await supabase
      .from('store_shipping_configs')
      .update({
        from_address_line1: address.address_line1,
        from_address_line2: address.address_line2,
        from_city: address.city,
        from_state: address.state,
        from_zip: address.zip,
        from_country: address.country,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('❌ Error updating shipping address:', error)
      throw error
    }

    console.log('✅ Successfully updated shipping address:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Shipping address updated successfully',
        data: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Error in update-store-shipping-address function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})