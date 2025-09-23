import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

interface RateSummaryRequest {
  fulfillmentPlanIds: string[];
}

interface RateSummaryResponse {
  bulkUpdateJobGuid: string;
  fulfillmentPlanCount: number;
  fulfillmentPlansWithRecommendationsCount: number;
  totalSavings: {
    value: number;
    code: string;
  };
  serviceRateRecommendations: Array<{
    orderId: string;
    currentRate: number;
    recommendedRate: number;
    savings: number;
    carrier: string;
    service: string;
  }>;
  insuranceRateRecommendations: Array<{
    orderId: string;
    currentInsurance: number;
    recommendedInsurance: number;
    savings: number;
  }>;
  orderDetails: Array<{
    orderId: string;
    orderNumber: string;
    carrier: string;
    service: string;
    serviceName: string;
    shipTo: any;
    shipFrom: any;
    package: any;
    items: any[];
    costs: {
      baseAmount: number;
      fuelSurcharge: number;
      hstAmount: number;
      gstAmount: number;
      pstAmount: number;
      deliveryConfirmation: number;
      totalCost: number;
      currency: string;
    };
    estimatedDelivery: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📊 Shipping Rate Summary API called');
    
    const { fulfillmentPlanIds }: RateSummaryRequest = await req.json();
    console.log('📋 Fulfillment Plan IDs:', fulfillmentPlanIds);

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const userId = user.id;
    console.log('👤 User ID:', userId);

    // Fetch order details for the fulfillment plans (using order IDs as fulfillment plan IDs)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_title,
          price,
          quantity,
          weight_lbs,
          origin_country,
          commodity_code,
          sku
        ),
        store_configurations (
          store_name,
          ship_from_address
        )
      `)
      .in('id', fulfillmentPlanIds)
      .eq('user_id', userId);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      throw ordersError;
    }

    if (!orders || orders.length === 0) {
      console.log('⚠️ No orders found for fulfillment plan IDs');
      return new Response(JSON.stringify({
        bulkUpdateJobGuid: "00000000-0000-0000-0000-000000000000",
        fulfillmentPlanCount: 0,
        fulfillmentPlansWithRecommendationsCount: 0,
        totalSavings: { value: 0.0, code: "Unknown" },
        serviceRateRecommendations: [],
        insuranceRateRecommendations: [],
        orderDetails: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`📦 Found ${orders.length} orders`);

    // Calculate shipping rates for each order to get current rates
    const orderDetails = [];
    let totalSavings = 0;

    for (const order of orders) {
      try {
        // Get current shipping rate by calling calculate-shipping-rates
        const shipFrom = order.store_configurations?.[0]?.ship_from_address || {
          name: "Default Shipper",
          company: "",
          address: "123 Main St",
          city: "Montreal",
          state: "QC",
          zip: "H2N1Z4",
          country: "CA"
        };

        const rateRequest = {
          order_id: order.id,
          ship_from: shipFrom,
          ship_to: {
            name: order.ship_to_name,
            address: order.ship_to_address,
            city: order.ship_to_city,
            state: order.ship_to_state,
            zip: order.ship_to_zip,
            country: order.ship_to_country
          },
          package: {
            weight: order.weight_lbs || 1,
            weight_unit: "lbs",
            length: order.length_inches || 12,
            width: order.width_inches || 8,
            height: order.height_inches || 4,
            dimension_unit: "in",
            value: order.order_items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
          },
          order: {
            orderNumber: order.order_number,
            currency: order.currency || "CAD",
            items: order.order_items || []
          }
        };

        // Call calculate-shipping-rates to get current rates
        const ratesResponse = await fetch(`${supabaseUrl}/functions/v1/calculate-shipping-rates`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rateRequest)
        });

        let currentRates = [];
        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          currentRates = ratesData.rates || [];
        }

        // Find the cheapest rate (recommended)
        const recommendedRate = currentRates.length > 0 ? 
          currentRates.reduce((min: any, rate: any) => rate.cost < min.cost ? rate : min) :
          null;

        // Calculate cost breakdown (simulate ShipStation's detailed breakdown)
        const baseRate = recommendedRate ? recommendedRate.cost : 15.99;
        const fuelSurcharge = baseRate * 0.2; // 20% fuel surcharge
        const hstAmount = (baseRate + fuelSurcharge) * 0.13; // 13% HST for Canada
        const totalCost = baseRate + fuelSurcharge + hstAmount;

        const orderDetail = {
          orderId: order.id,
          orderNumber: order.order_number || `ORD-${order.id.slice(0, 8)}`,
          carrier: recommendedRate ? recommendedRate.carrier : "Canada Post",
          service: recommendedRate ? recommendedRate.service_code : "REG",
          serviceName: recommendedRate ? recommendedRate.service_name : "Regular Parcel",
          shipTo: {
            name: order.ship_to_name,
            address: order.ship_to_address,
            city: order.ship_to_city,
            state: order.ship_to_state,
            zip: order.ship_to_zip,
            country: order.ship_to_country
          },
          shipFrom: shipFrom,
          package: {
            weight: order.weight_lbs || 1,
            length: order.length_inches || 12,
            width: order.width_inches || 8,
            height: order.height_inches || 4
          },
          items: order.order_items?.map((item: any) => ({
            name: item.product_title,
            quantity: item.quantity,
            price: item.price
          })) || [],
          costs: {
            baseAmount: Number(baseRate.toFixed(2)),
            fuelSurcharge: Number(fuelSurcharge.toFixed(2)),
            hstAmount: Number(hstAmount.toFixed(2)),
            gstAmount: 0,
            pstAmount: 0,
            deliveryConfirmation: 0,
            totalCost: Number(totalCost.toFixed(2)),
            currency: order.currency || "CAD"
          },
          estimatedDelivery: recommendedRate ? recommendedRate.estimated_days : "5-7 business days"
        };

        orderDetails.push(orderDetail);

        console.log(`✅ Processed order ${order.order_number}: ${orderDetail.costs.totalCost} ${orderDetail.costs.currency}`);

      } catch (error) {
        console.error(`❌ Error processing order ${order.id}:`, error);
        // Add a fallback order detail with default values
        orderDetails.push({
          orderId: order.id,
          orderNumber: order.order_number || `ORD-${order.id.slice(0, 8)}`,
          carrier: "Canada Post",
          service: "REG",
          serviceName: "Regular Parcel",
          shipTo: {
            name: order.ship_to_name || "Unknown",
            address: order.ship_to_address || "",
            city: order.ship_to_city || "",
            state: order.ship_to_state || "",
            zip: order.ship_to_zip || "",
            country: order.ship_to_country || "CA"
          },
          shipFrom: {
            name: "Default Shipper",
            company: "",
            address: "123 Main St",
            city: "Montreal",
            state: "QC",
            zip: "H2N1Z4",
            country: "CA"
          },
          package: {
            weight: 1,
            length: 12,
            width: 8,
            height: 4
          },
          items: [],
          costs: {
            baseAmount: 15.99,
            fuelSurcharge: 3.20,
            hstAmount: 2.49,
            gstAmount: 0,
            pstAmount: 0,
            deliveryConfirmation: 0,
            totalCost: 21.68,
            currency: "CAD"
          },
          estimatedDelivery: "5-7 business days"
        });
      }
    }

    const response: RateSummaryResponse = {
      bulkUpdateJobGuid: "00000000-0000-0000-0000-000000000000",
      fulfillmentPlanCount: orders.length,
      fulfillmentPlansWithRecommendationsCount: 0,
      totalSavings: {
        value: totalSavings,
        code: "CAD"
      },
      serviceRateRecommendations: [],
      insuranceRateRecommendations: [],
      orderDetails: orderDetails
    };

    console.log(`📊 Rate summary completed for ${orders.length} orders`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Error in shipping rate summary:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to generate rate summary',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});