export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          category: string
          created_at: string
          details: Json | null
          id: string
          level: string
          message: string
          timestamp: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: Json | null
          id?: string
          level: string
          message: string
          timestamp?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: Json | null
          id?: string
          level?: string
          message?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          action_url: string | null
          admin_user_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string | null
        }
        Insert: {
          action_url?: string | null
          admin_user_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string | null
        }
        Update: {
          action_url?: string | null
          admin_user_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_categorization_suggestions: {
        Row: {
          applied_at: string | null
          confidence_score: number | null
          created_at: string
          id: string
          product_id: string
          status: string
          suggestion_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          product_id: string
          status?: string
          suggestion_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          product_id?: string
          status?: string
          suggestion_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_competitive_analysis: {
        Row: {
          analysis_data: Json
          confidence_score: number | null
          created_at: string
          id: string
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json
          confidence_score?: number | null
          created_at?: string
          id?: string
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          confidence_score?: number | null
          created_at?: string
          id?: string
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          action_items: string[] | null
          confidence_score: number | null
          created_at: string
          data_points: Json | null
          description: string
          expires_at: string | null
          id: string
          insight_type: string
          is_read: boolean | null
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_items?: string[] | null
          confidence_score?: number | null
          created_at?: string
          data_points?: Json | null
          description: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_read?: boolean | null
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_items?: string[] | null
          confidence_score?: number | null
          created_at?: string
          data_points?: Json | null
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_read?: boolean | null
          priority?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_learning_patterns: {
        Row: {
          created_at: string
          effectiveness_score: number | null
          id: string
          pattern_data: Json
          pattern_type: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          pattern_data?: Json
          pattern_type: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          pattern_data?: Json
          pattern_type?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_pricing_recommendations: {
        Row: {
          applied_at: string | null
          confidence_score: number | null
          created_at: string
          id: string
          product_id: string
          recommendation_data: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          product_id: string
          recommendation_data?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          product_id?: string
          recommendation_data?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      batch_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          error_log: string[] | null
          failed_items: number | null
          id: string
          metadata: Json | null
          operation_type: string
          processed_items: number | null
          progress_percentage: number | null
          started_at: string | null
          status: string
          total_items: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_log?: string[] | null
          failed_items?: number | null
          id?: string
          metadata?: Json | null
          operation_type: string
          processed_items?: number | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          total_items: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_log?: string[] | null
          failed_items?: number | null
          id?: string
          metadata?: Json | null
          operation_type?: string
          processed_items?: number | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          total_items?: number
          user_id?: string
        }
        Relationships: []
      }
      billing_invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_url: string | null
          metadata: Json | null
          paid_date: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_url?: string | null
          metadata?: Json | null
          paid_date?: string | null
          status: string
          stripe_invoice_id?: string | null
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_url?: string | null
          metadata?: Json | null
          paid_date?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "billing_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_subscriptions: {
        Row: {
          billing_interval: string | null
          company_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          plan_name: string
          plan_price: number | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string | null
          company_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_name: string
          plan_price?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string | null
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_name?: string
          plan_price?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      bin_inventory: {
        Row: {
          bin_id: string
          created_at: string
          id: string
          last_updated_at: string
          quantity: number
          submission_item_id: string
        }
        Insert: {
          bin_id: string
          created_at?: string
          id?: string
          last_updated_at?: string
          quantity?: number
          submission_item_id: string
        }
        Update: {
          bin_id?: string
          created_at?: string
          id?: string
          last_updated_at?: string
          quantity?: number
          submission_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_bin_inventory_bin"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "warehouse_bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bin_inventory_item"
            columns: ["submission_item_id"]
            isOneToOne: false
            referencedRelation: "submission_items"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_configurations: {
        Row: {
          account_number: string | null
          api_credentials: Json
          carrier_name: string
          created_at: string
          default_package_type: string | null
          id: string
          is_active: boolean
          pickup_type_code: string | null
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          api_credentials?: Json
          carrier_name: string
          created_at?: string
          default_package_type?: string | null
          id?: string
          is_active?: boolean
          pickup_type_code?: string | null
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          api_credentials?: Json
          carrier_name?: string
          created_at?: string
          default_package_type?: string | null
          id?: string
          is_active?: boolean
          pickup_type_code?: string | null
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: Json | null
          billing_email: string | null
          created_at: string
          domain: string | null
          id: string
          name: string
          phone: string | null
          settings: Json | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          billing_email?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          phone?: string | null
          settings?: Json | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          billing_email?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          phone?: string | null
          settings?: Json | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          inquiry_type: string
          message: string
          name: string
          phone: string | null
          priority: string
          source_page: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string
          message: string
          name: string
          phone?: string | null
          priority?: string
          source_page?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          name?: string
          phone?: string | null
          priority?: string
          source_page?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string
          city: string
          company: string | null
          country: string
          created_at: string
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string
          city: string
          company?: string | null
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          phone?: string | null
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string
          city?: string
          company?: string | null
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_preferences: {
        Row: {
          created_at: string
          delivery_instructions: string | null
          id: string
          notification_preferences: Json | null
          preferred_delivery_time: string | null
          safe_place_instructions: string | null
          signature_required: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_instructions?: string | null
          id?: string
          notification_preferences?: Json | null
          preferred_delivery_time?: string | null
          safe_place_instructions?: string | null
          signature_required?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_instructions?: string | null
          id?: string
          notification_preferences?: Json | null
          preferred_delivery_time?: string | null
          safe_place_instructions?: string | null
          signature_required?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_automations: {
        Row: {
          clicked_at: string | null
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string
          template_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          template_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          template_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          conditions: Json | null
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fulfillment_destinations: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      fulfillment_orders: {
        Row: {
          assigned_picker_id: string | null
          created_at: string
          estimated_pick_time_minutes: number | null
          id: string
          order_id: string
          pack_completed_at: string | null
          pack_started_at: string | null
          pick_completed_at: string | null
          pick_started_at: string | null
          priority_level: number
          special_instructions: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_picker_id?: string | null
          created_at?: string
          estimated_pick_time_minutes?: number | null
          id?: string
          order_id: string
          pack_completed_at?: string | null
          pack_started_at?: string | null
          pick_completed_at?: string | null
          pick_started_at?: string | null
          priority_level?: number
          special_instructions?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_picker_id?: string | null
          created_at?: string
          estimated_pick_time_minutes?: number | null
          id?: string
          order_id?: string
          pack_completed_at?: string | null
          pack_started_at?: string | null
          pick_completed_at?: string | null
          pick_started_at?: string | null
          priority_level?: number
          special_instructions?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_adjustments: {
        Row: {
          adjusted_at: string
          adjusted_by_user_id: string
          adjustment_quantity: number
          bin_id: string
          created_at: string
          id: string
          reason: string
          submission_item_id: string
        }
        Insert: {
          adjusted_at?: string
          adjusted_by_user_id: string
          adjustment_quantity: number
          bin_id: string
          created_at?: string
          id?: string
          reason: string
          submission_item_id: string
        }
        Update: {
          adjusted_at?: string
          adjusted_by_user_id?: string
          adjustment_quantity?: number
          bin_id?: string
          created_at?: string
          id?: string
          reason?: string
          submission_item_id?: string
        }
        Relationships: []
      }
      inventory_allocations: {
        Row: {
          allocated_at: string
          allocation_priority: number | null
          bin_id: string
          created_at: string
          expires_at: string | null
          fulfillment_order_id: string
          id: string
          notes: string | null
          quantity_allocated: number
          quantity_picked: number | null
          status: string
          submission_item_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_at?: string
          allocation_priority?: number | null
          bin_id: string
          created_at?: string
          expires_at?: string | null
          fulfillment_order_id: string
          id?: string
          notes?: string | null
          quantity_allocated: number
          quantity_picked?: number | null
          status?: string
          submission_item_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_at?: string
          allocation_priority?: number | null
          bin_id?: string
          created_at?: string
          expires_at?: string | null
          fulfillment_order_id?: string
          id?: string
          notes?: string | null
          quantity_allocated?: number
          quantity_picked?: number | null
          status?: string
          submission_item_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          from_bin_id: string | null
          id: string
          moved_at: string
          moved_by_user_id: string
          movement_type: string
          quantity: number
          reason: string | null
          submission_item_id: string
          to_bin_id: string
        }
        Insert: {
          created_at?: string
          from_bin_id?: string | null
          id?: string
          moved_at?: string
          moved_by_user_id: string
          movement_type?: string
          quantity: number
          reason?: string | null
          submission_item_id: string
          to_bin_id: string
        }
        Update: {
          created_at?: string
          from_bin_id?: string | null
          id?: string
          moved_at?: string
          moved_by_user_id?: string
          movement_type?: string
          quantity?: number
          reason?: string | null
          submission_item_id?: string
          to_bin_id?: string
        }
        Relationships: []
      }
      inventory_submissions: {
        Row: {
          approved_at: string | null
          approved_by_user_id: string | null
          created_at: string
          destination_id: string
          id: string
          payment_id: string | null
          payment_status: string | null
          rejection_reason: string | null
          shipment_details: Json | null
          special_instructions: string | null
          status: string
          submission_number: string
          submitted_at: string | null
          total_items: number | null
          total_prep_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          created_at?: string
          destination_id: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          rejection_reason?: string | null
          shipment_details?: Json | null
          special_instructions?: string | null
          status?: string
          submission_number: string
          submitted_at?: string | null
          total_items?: number | null
          total_prep_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          created_at?: string
          destination_id?: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          rejection_reason?: string | null
          shipment_details?: Json | null
          special_instructions?: string | null
          status?: string
          submission_number?: string
          submitted_at?: string | null
          total_items?: number | null
          total_prep_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_submissions_destination"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "fulfillment_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_submissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "submission_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      item_inspections: {
        Row: {
          assigned_bin_id: string | null
          condition_status: string
          created_at: string
          expiration_check_passed: boolean | null
          id: string
          inspected_at: string
          inspected_by_user_id: string
          label_check_passed: boolean | null
          notes: string | null
          packaging_check_passed: boolean | null
          quality_grade: string | null
          quantity_expected: number
          quantity_received: number
          received_carton_id: string | null
          submission_item_id: string
        }
        Insert: {
          assigned_bin_id?: string | null
          condition_status?: string
          created_at?: string
          expiration_check_passed?: boolean | null
          id?: string
          inspected_at?: string
          inspected_by_user_id: string
          label_check_passed?: boolean | null
          notes?: string | null
          packaging_check_passed?: boolean | null
          quality_grade?: string | null
          quantity_expected: number
          quantity_received: number
          received_carton_id?: string | null
          submission_item_id: string
        }
        Update: {
          assigned_bin_id?: string | null
          condition_status?: string
          created_at?: string
          expiration_check_passed?: boolean | null
          id?: string
          inspected_at?: string
          inspected_by_user_id?: string
          label_check_passed?: boolean | null
          notes?: string | null
          packaging_check_passed?: boolean | null
          quality_grade?: string | null
          quantity_expected?: number
          quantity_received?: number
          received_carton_id?: string | null
          submission_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inspection_bin"
            columns: ["assigned_bin_id"]
            isOneToOne: false
            referencedRelation: "warehouse_bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inspection_carton"
            columns: ["received_carton_id"]
            isOneToOne: false
            referencedRelation: "received_cartons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inspection_item"
            columns: ["submission_item_id"]
            isOneToOne: false
            referencedRelation: "submission_items"
            referencedColumns: ["id"]
          },
        ]
      }
      low_stock_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by_user_id: string | null
          alert_level: string
          created_at: string
          current_quantity: number
          id: string
          is_acknowledged: boolean
          submission_item_id: string
          threshold_quantity: number
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by_user_id?: string | null
          alert_level?: string
          created_at?: string
          current_quantity: number
          id?: string
          is_acknowledged?: boolean
          submission_item_id: string
          threshold_quantity: number
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by_user_id?: string | null
          alert_level?: string
          created_at?: string
          current_quantity?: number
          id?: string
          is_acknowledged?: boolean
          submission_item_id?: string
          threshold_quantity?: number
        }
        Relationships: []
      }
      marketplace_configurations: {
        Row: {
          access_token: string | null
          created_at: string
          deleted_at: string | null
          deletion_reason: string | null
          external_user_id: string
          id: string
          is_active: boolean
          last_token_refresh: string | null
          metadata: Json | null
          platform: string
          refresh_token: string | null
          store_name: string | null
          store_url: string | null
          token_expires_at: string | null
          token_expires_warning_sent: boolean | null
          token_refresh_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_reason?: string | null
          external_user_id: string
          id?: string
          is_active?: boolean
          last_token_refresh?: string | null
          metadata?: Json | null
          platform: string
          refresh_token?: string | null
          store_name?: string | null
          store_url?: string | null
          token_expires_at?: string | null
          token_expires_warning_sent?: boolean | null
          token_refresh_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_reason?: string | null
          external_user_id?: string
          id?: string
          is_active?: boolean
          last_token_refresh?: string | null
          metadata?: Json | null
          platform?: string
          refresh_token?: string | null
          store_name?: string | null
          store_url?: string | null
          token_expires_at?: string | null
          token_expires_warning_sent?: boolean | null
          token_refresh_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_sync_status: {
        Row: {
          active_listings: number | null
          active_products_synced: number | null
          created_at: string
          draft_listings: number | null
          ended_listings: number | null
          error_message: string | null
          id: string
          inactive_products_skipped: number | null
          last_sync_at: string | null
          marketplace: string
          products_synced: number | null
          scheduled_listings: number | null
          sync_settings: Json | null
          sync_status: string
          total_products_found: number | null
          unsold_listings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_listings?: number | null
          active_products_synced?: number | null
          created_at?: string
          draft_listings?: number | null
          ended_listings?: number | null
          error_message?: string | null
          id?: string
          inactive_products_skipped?: number | null
          last_sync_at?: string | null
          marketplace: string
          products_synced?: number | null
          scheduled_listings?: number | null
          sync_settings?: Json | null
          sync_status?: string
          total_products_found?: number | null
          unsold_listings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_listings?: number | null
          active_products_synced?: number | null
          created_at?: string
          draft_listings?: number | null
          ended_listings?: number | null
          error_message?: string | null
          id?: string
          inactive_products_skipped?: number | null
          last_sync_at?: string | null
          marketplace?: string
          products_synced?: number | null
          scheduled_listings?: number | null
          sync_settings?: Json | null
          sync_status?: string
          total_products_found?: number | null
          unsold_listings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_feedback: {
        Row: {
          created_at: string
          delivery_experience: string | null
          delivery_rating: number | null
          feedback_text: string | null
          id: string
          order_id: string
          package_id: string | null
          rating: number | null
          user_id: string | null
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string
          delivery_experience?: string | null
          delivery_rating?: number | null
          feedback_text?: string | null
          id?: string
          order_id: string
          package_id?: string | null
          rating?: number | null
          user_id?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string
          delivery_experience?: string | null
          delivery_rating?: number | null
          feedback_text?: string | null
          id?: string
          order_id?: string
          package_id?: string | null
          rating?: number | null
          user_id?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "order_feedback_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          commodity_code: string | null
          created_at: string
          id: string
          order_id: string
          origin_country: string | null
          price: number
          product_handle: string | null
          product_title: string
          quantity: number
          sku: string | null
          variant_title: string | null
          weight_lbs: number | null
        }
        Insert: {
          commodity_code?: string | null
          created_at?: string
          id?: string
          order_id: string
          origin_country?: string | null
          price: number
          product_handle?: string | null
          product_title: string
          quantity?: number
          sku?: string | null
          variant_title?: string | null
          weight_lbs?: number | null
        }
        Update: {
          commodity_code?: string | null
          created_at?: string
          id?: string
          order_id?: string
          origin_country?: string | null
          price?: number
          product_handle?: string | null
          product_title?: string
          quantity?: number
          sku?: string | null
          variant_title?: string | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_validated: boolean | null
          carrier: string | null
          confirmation_type: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          delivered_date: string | null
          height_inches: number | null
          id: string
          label_url: string | null
          length_inches: number | null
          notes: string | null
          order_date: string
          order_number: string
          priority_level: number | null
          requested_service: string | null
          service_type: string | null
          shipped_date: string | null
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_city: string
          shipping_cost: number | null
          shipping_country: string
          shipping_method: string | null
          shipping_state: string
          shipping_zip: string
          status: string
          store_name: string
          store_platform: string
          tags: string[] | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
          weight_lbs: number | null
          width_inches: number | null
        }
        Insert: {
          address_validated?: boolean | null
          carrier?: string | null
          confirmation_type?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          delivered_date?: string | null
          height_inches?: number | null
          id?: string
          label_url?: string | null
          length_inches?: number | null
          notes?: string | null
          order_date: string
          order_number: string
          priority_level?: number | null
          requested_service?: string | null
          service_type?: string | null
          shipped_date?: string | null
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_city: string
          shipping_cost?: number | null
          shipping_country?: string
          shipping_method?: string | null
          shipping_state: string
          shipping_zip: string
          status?: string
          store_name: string
          store_platform: string
          tags?: string[] | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
          weight_lbs?: number | null
          width_inches?: number | null
        }
        Update: {
          address_validated?: boolean | null
          carrier?: string | null
          confirmation_type?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          delivered_date?: string | null
          height_inches?: number | null
          id?: string
          label_url?: string | null
          length_inches?: number | null
          notes?: string | null
          order_date?: string
          order_number?: string
          priority_level?: number | null
          requested_service?: string | null
          service_type?: string | null
          shipped_date?: string | null
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_city?: string
          shipping_cost?: number | null
          shipping_country?: string
          shipping_method?: string | null
          shipping_state?: string
          shipping_zip?: string
          status?: string
          store_name?: string
          store_platform?: string
          tags?: string[] | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
          weight_lbs?: number | null
          width_inches?: number | null
        }
        Relationships: []
      }
      pack_items: {
        Row: {
          created_at: string
          id: string
          item_condition: string | null
          pack_session_id: string
          packing_notes: string | null
          quantity_packed: number | null
          quantity_requested: number
          submission_item_id: string
          updated_at: string
          verified_at: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_condition?: string | null
          pack_session_id: string
          packing_notes?: string | null
          quantity_packed?: number | null
          quantity_requested: number
          submission_item_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_condition?: string | null
          pack_session_id?: string
          packing_notes?: string | null
          quantity_packed?: number | null
          quantity_requested?: number
          submission_item_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: []
      }
      pack_sessions: {
        Row: {
          actual_time_minutes: number | null
          completed_at: string | null
          created_at: string
          estimated_time_minutes: number | null
          fulfillment_order_id: string
          id: string
          packed_items: number | null
          packing_station_id: string
          session_notes: string | null
          started_at: string | null
          status: string
          total_items: number
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_time_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          estimated_time_minutes?: number | null
          fulfillment_order_id: string
          id?: string
          packed_items?: number | null
          packing_station_id: string
          session_notes?: string | null
          started_at?: string | null
          status?: string
          total_items?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_time_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          estimated_time_minutes?: number | null
          fulfillment_order_id?: string
          id?: string
          packed_items?: number | null
          packing_station_id?: string
          session_notes?: string | null
          started_at?: string | null
          status?: string
          total_items?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          carrier: string | null
          created_at: string
          delivered_at: string | null
          delivery_confirmation: Json | null
          height_inches: number | null
          id: string
          length_inches: number | null
          pack_session_id: string
          package_number: string
          package_type: string
          packed_at: string | null
          service_type: string | null
          shipped_at: string | null
          shipping_cost: number | null
          shipping_label_id: string | null
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
          weight_lbs: number | null
          width_inches: number | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_confirmation?: Json | null
          height_inches?: number | null
          id?: string
          length_inches?: number | null
          pack_session_id: string
          package_number: string
          package_type?: string
          packed_at?: string | null
          service_type?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          shipping_label_id?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
          weight_lbs?: number | null
          width_inches?: number | null
        }
        Update: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_confirmation?: Json | null
          height_inches?: number | null
          id?: string
          length_inches?: number | null
          pack_session_id?: string
          package_number?: string
          package_type?: string
          packed_at?: string | null
          service_type?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          shipping_label_id?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
          weight_lbs?: number | null
          width_inches?: number | null
        }
        Relationships: []
      }
      packing_stations: {
        Row: {
          assigned_user_id: string | null
          created_at: string
          current_session_id: string | null
          equipment_available: Json | null
          id: string
          is_active: boolean
          location_zone: string | null
          performance_metrics: Json | null
          station_code: string
          station_name: string
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string
          current_session_id?: string | null
          equipment_available?: Json | null
          id?: string
          is_active?: boolean
          location_zone?: string | null
          performance_metrics?: Json | null
          station_code: string
          station_name: string
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string
          current_session_id?: string | null
          equipment_available?: Json | null
          id?: string
          is_active?: boolean
          location_zone?: string | null
          performance_metrics?: Json | null
          station_code?: string
          station_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          avg_order_value: number | null
          conversion_rate: number | null
          cost_savings: number | null
          created_at: string
          id: string
          metric_date: string
          price_changes: number | null
          products_optimized: number | null
          profit_margin: number | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_order_value?: number | null
          conversion_rate?: number | null
          cost_savings?: number | null
          created_at?: string
          id?: string
          metric_date?: string
          price_changes?: number | null
          products_optimized?: number | null
          profit_margin?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_order_value?: number | null
          conversion_rate?: number | null
          cost_savings?: number | null
          created_at?: string
          id?: string
          metric_date?: string
          price_changes?: number | null
          products_optimized?: number | null
          profit_margin?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pick_items: {
        Row: {
          bin_id: string
          created_at: string
          fulfillment_order_id: string
          id: string
          location_path: string | null
          notes: string | null
          pick_list_id: string
          pick_sequence: number
          picked_at: string | null
          picked_by_user_id: string | null
          quantity_picked: number | null
          quantity_requested: number
          status: string
          submission_item_id: string
          updated_at: string
        }
        Insert: {
          bin_id: string
          created_at?: string
          fulfillment_order_id: string
          id?: string
          location_path?: string | null
          notes?: string | null
          pick_list_id: string
          pick_sequence?: number
          picked_at?: string | null
          picked_by_user_id?: string | null
          quantity_picked?: number | null
          quantity_requested: number
          status?: string
          submission_item_id: string
          updated_at?: string
        }
        Update: {
          bin_id?: string
          created_at?: string
          fulfillment_order_id?: string
          id?: string
          location_path?: string | null
          notes?: string | null
          pick_list_id?: string
          pick_sequence?: number
          picked_at?: string | null
          picked_by_user_id?: string | null
          quantity_picked?: number | null
          quantity_requested?: number
          status?: string
          submission_item_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pick_lists: {
        Row: {
          assigned_picker_id: string | null
          completed_at: string | null
          created_at: string
          estimated_time_minutes: number | null
          id: string
          list_name: string
          notes: string | null
          optimized_path: Json | null
          pick_session_id: string | null
          started_at: string | null
          status: string
          total_items: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_picker_id?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_time_minutes?: number | null
          id?: string
          list_name: string
          notes?: string | null
          optimized_path?: Json | null
          pick_session_id?: string | null
          started_at?: string | null
          status?: string
          total_items?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_picker_id?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_time_minutes?: number | null
          id?: string
          list_name?: string
          notes?: string | null
          optimized_path?: Json | null
          pick_session_id?: string | null
          started_at?: string | null
          status?: string
          total_items?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pick_sessions: {
        Row: {
          assigned_picker_id: string | null
          completed_at: string | null
          created_at: string
          efficiency_score: number | null
          id: string
          notes: string | null
          session_name: string
          session_type: string
          started_at: string | null
          status: string
          total_items: number
          total_orders: number
          total_pick_lists: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_picker_id?: string | null
          completed_at?: string | null
          created_at?: string
          efficiency_score?: number | null
          id?: string
          notes?: string | null
          session_name: string
          session_type?: string
          started_at?: string | null
          status?: string
          total_items?: number
          total_orders?: number
          total_pick_lists?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_picker_id?: string | null
          completed_at?: string | null
          created_at?: string
          efficiency_score?: number | null
          id?: string
          notes?: string | null
          session_name?: string
          session_type?: string
          started_at?: string | null
          status?: string
          total_items?: number
          total_orders?: number
          total_pick_lists?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prep_services: {
        Row: {
          base_price: number | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          base_price?: number | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          base_price?: number | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      price_changes: {
        Row: {
          change_type: string
          created_at: string
          id: string
          new_price: number | null
          old_price: number | null
          product_pricing_id: string
          reason: string | null
          rule_id: string | null
          user_id: string
        }
        Insert: {
          change_type: string
          created_at?: string
          id?: string
          new_price?: number | null
          old_price?: number | null
          product_pricing_id: string
          reason?: string | null
          rule_id?: string | null
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          id?: string
          new_price?: number | null
          old_price?: number | null
          product_pricing_id?: string
          reason?: string | null
          rule_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_changes_product_pricing_id_fkey"
            columns: ["product_pricing_id"]
            isOneToOne: false
            referencedRelation: "product_pricing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_changes_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "repricing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      product_drafts: {
        Row: {
          created_at: string
          draft_name: string
          id: string
          optimized_data: Json
          product_handle: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_name: string
          id?: string
          optimized_data: Json
          product_handle: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_name?: string
          id?: string
          optimized_data?: Json
          product_handle?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_edit_history: {
        Row: {
          after_value: string | null
          before_value: string | null
          created_at: string
          edit_type: string
          field_name: string
          id: string
          product_handle: string
          user_id: string
        }
        Insert: {
          after_value?: string | null
          before_value?: string | null
          created_at?: string
          edit_type: string
          field_name: string
          id?: string
          product_handle: string
          user_id: string
        }
        Update: {
          after_value?: string | null
          before_value?: string | null
          created_at?: string
          edit_type?: string
          field_name?: string
          id?: string
          product_handle?: string
          user_id?: string
        }
        Relationships: []
      }
      product_pricing: {
        Row: {
          competitor_price: number | null
          cost_of_goods: number | null
          created_at: string
          current_price: number | null
          id: string
          last_repriced_at: string | null
          marketplace: string
          max_price: number | null
          min_price: number | null
          product_title: string
          rule_id: string | null
          sku: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          competitor_price?: number | null
          cost_of_goods?: number | null
          created_at?: string
          current_price?: number | null
          id?: string
          last_repriced_at?: string | null
          marketplace: string
          max_price?: number | null
          min_price?: number | null
          product_title: string
          rule_id?: string | null
          sku: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          competitor_price?: number | null
          cost_of_goods?: number | null
          created_at?: string
          current_price?: number | null
          id?: string
          last_repriced_at?: string | null
          marketplace?: string
          max_price?: number | null
          min_price?: number | null
          product_title?: string
          rule_id?: string | null
          sku?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_pricing_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "repricing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          body_html: string | null
          category: string | null
          created_at: string
          ebay_listing_id: string | null
          end_time: string | null
          google_shopping_age_group: string | null
          google_shopping_condition: string | null
          google_shopping_gender: string | null
          handle: string
          id: string
          image_position: number | null
          image_src: string | null
          listing_status: string | null
          listing_type: string | null
          marketplace: string | null
          option1_name: string | null
          option1_value: string | null
          parent_listing_id: string | null
          published: boolean | null
          quantity_available: number | null
          quantity_sold: number | null
          seo_description: string | null
          seo_title: string | null
          shopify_product_id: string | null
          shopify_sync_status: string | null
          shopify_synced_at: string | null
          start_time: string | null
          tags: string | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
          variant_barcode: string | null
          variant_compare_at_price: number | null
          variant_fulfillment_service: string | null
          variant_grams: number | null
          variant_inventory_policy: string | null
          variant_inventory_qty: number | null
          variant_inventory_tracker: string | null
          variant_price: number | null
          variant_requires_shipping: boolean | null
          variant_sku: string | null
          variant_taxable: boolean | null
          vendor: string | null
        }
        Insert: {
          body_html?: string | null
          category?: string | null
          created_at?: string
          ebay_listing_id?: string | null
          end_time?: string | null
          google_shopping_age_group?: string | null
          google_shopping_condition?: string | null
          google_shopping_gender?: string | null
          handle: string
          id?: string
          image_position?: number | null
          image_src?: string | null
          listing_status?: string | null
          listing_type?: string | null
          marketplace?: string | null
          option1_name?: string | null
          option1_value?: string | null
          parent_listing_id?: string | null
          published?: boolean | null
          quantity_available?: number | null
          quantity_sold?: number | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_product_id?: string | null
          shopify_sync_status?: string | null
          shopify_synced_at?: string | null
          start_time?: string | null
          tags?: string | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
          variant_barcode?: string | null
          variant_compare_at_price?: number | null
          variant_fulfillment_service?: string | null
          variant_grams?: number | null
          variant_inventory_policy?: string | null
          variant_inventory_qty?: number | null
          variant_inventory_tracker?: string | null
          variant_price?: number | null
          variant_requires_shipping?: boolean | null
          variant_sku?: string | null
          variant_taxable?: boolean | null
          vendor?: string | null
        }
        Update: {
          body_html?: string | null
          category?: string | null
          created_at?: string
          ebay_listing_id?: string | null
          end_time?: string | null
          google_shopping_age_group?: string | null
          google_shopping_condition?: string | null
          google_shopping_gender?: string | null
          handle?: string
          id?: string
          image_position?: number | null
          image_src?: string | null
          listing_status?: string | null
          listing_type?: string | null
          marketplace?: string | null
          option1_name?: string | null
          option1_value?: string | null
          parent_listing_id?: string | null
          published?: boolean | null
          quantity_available?: number | null
          quantity_sold?: number | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_product_id?: string | null
          shopify_sync_status?: string | null
          shopify_synced_at?: string | null
          start_time?: string | null
          tags?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
          variant_barcode?: string | null
          variant_compare_at_price?: number | null
          variant_fulfillment_service?: string | null
          variant_grams?: number | null
          variant_inventory_policy?: string | null
          variant_inventory_qty?: number | null
          variant_inventory_tracker?: string | null
          variant_price?: number | null
          variant_requires_shipping?: boolean | null
          variant_sku?: string | null
          variant_taxable?: boolean | null
          vendor?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_tracking: {
        Row: {
          created_at: string
          customer_email: string | null
          estimated_delivery: string | null
          id: string
          order_number: string | null
          package_id: string | null
          status: string
          tracking_events: Json | null
          tracking_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          estimated_delivery?: string | null
          id?: string
          order_number?: string | null
          package_id?: string | null
          status?: string
          tracking_events?: Json | null
          tracking_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          estimated_delivery?: string | null
          id?: string
          order_number?: string | null
          package_id?: string | null
          status?: string
          tracking_events?: Json | null
          tracking_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_tracking_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          additional_services: string[] | null
          assigned_to: string | null
          business_details: Json
          contact_info: Json
          created_at: string
          estimated_savings: string | null
          id: string
          message: string | null
          pain_points: string | null
          priority: string
          service_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_services?: string[] | null
          assigned_to?: string | null
          business_details?: Json
          contact_info?: Json
          created_at?: string
          estimated_savings?: string | null
          id?: string
          message?: string | null
          pain_points?: string | null
          priority?: string
          service_type: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_services?: string[] | null
          assigned_to?: string | null
          business_details?: Json
          contact_info?: Json
          created_at?: string
          estimated_savings?: string | null
          id?: string
          message?: string | null
          pain_points?: string | null
          priority?: string
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      received_cartons: {
        Row: {
          carton_barcode: string
          condition_status: string
          created_at: string
          height_inches: number | null
          id: string
          length_inches: number | null
          receiving_record_id: string
          scanned_at: string
          scanned_by_user_id: string
          weight_lbs: number | null
          width_inches: number | null
        }
        Insert: {
          carton_barcode: string
          condition_status?: string
          created_at?: string
          height_inches?: number | null
          id?: string
          length_inches?: number | null
          receiving_record_id: string
          scanned_at?: string
          scanned_by_user_id: string
          weight_lbs?: number | null
          width_inches?: number | null
        }
        Update: {
          carton_barcode?: string
          condition_status?: string
          created_at?: string
          height_inches?: number | null
          id?: string
          length_inches?: number | null
          receiving_record_id?: string
          scanned_at?: string
          scanned_by_user_id?: string
          weight_lbs?: number | null
          width_inches?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_carton_receiving"
            columns: ["receiving_record_id"]
            isOneToOne: false
            referencedRelation: "receiving_records"
            referencedColumns: ["id"]
          },
        ]
      }
      receiving_discrepancies: {
        Row: {
          actual_quantity: number | null
          created_at: string
          description: string
          discrepancy_type: string
          expected_quantity: number | null
          id: string
          receiving_record_id: string
          reported_at: string
          reported_by_user_id: string
          resolution_notes: string | null
          resolution_status: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          severity: string
          submission_item_id: string | null
        }
        Insert: {
          actual_quantity?: number | null
          created_at?: string
          description: string
          discrepancy_type: string
          expected_quantity?: number | null
          id?: string
          receiving_record_id: string
          reported_at?: string
          reported_by_user_id: string
          resolution_notes?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity?: string
          submission_item_id?: string | null
        }
        Update: {
          actual_quantity?: number | null
          created_at?: string
          description?: string
          discrepancy_type?: string
          expected_quantity?: number | null
          id?: string
          receiving_record_id?: string
          reported_at?: string
          reported_by_user_id?: string
          resolution_notes?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity?: string
          submission_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_discrepancy_item"
            columns: ["submission_item_id"]
            isOneToOne: false
            referencedRelation: "submission_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_discrepancy_receiving"
            columns: ["receiving_record_id"]
            isOneToOne: false
            referencedRelation: "receiving_records"
            referencedColumns: ["id"]
          },
        ]
      }
      receiving_records: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          received_at: string
          received_by_user_id: string
          status: string
          submission_id: string
          total_cartons: number | null
          total_items_expected: number | null
          total_items_received: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          received_at?: string
          received_by_user_id: string
          status?: string
          submission_id: string
          total_cartons?: number | null
          total_items_expected?: number | null
          total_items_received?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          received_at?: string
          received_by_user_id?: string
          status?: string
          submission_id?: string
          total_cartons?: number | null
          total_items_expected?: number | null
          total_items_received?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_receiving_submission"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "inventory_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      repricing_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_resolved: boolean
          message: string
          product_pricing_id: string | null
          resolved_at: string | null
          rule_id: string | null
          severity: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          message: string
          product_pricing_id?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          severity?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          message?: string
          product_pricing_id?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repricing_alerts_product_pricing_id_fkey"
            columns: ["product_pricing_id"]
            isOneToOne: false
            referencedRelation: "product_pricing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repricing_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "repricing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      repricing_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          marketplaces: string[]
          name: string
          priority: number
          rule_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          marketplaces?: string[]
          name: string
          priority?: number
          rule_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          marketplaces?: string[]
          name?: string
          priority?: number
          rule_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      return_authorizations: {
        Row: {
          approved_at: string | null
          approved_by_user_id: string | null
          created_at: string
          customer_notes: string | null
          id: string
          internal_notes: string | null
          order_id: string
          package_id: string | null
          processed_at: string | null
          received_at: string | null
          refund_amount: number | null
          requested_at: string
          restocking_fee: number | null
          return_reason: string
          return_shipping_cost: number | null
          return_type: string
          rma_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          created_at?: string
          customer_notes?: string | null
          id?: string
          internal_notes?: string | null
          order_id: string
          package_id?: string | null
          processed_at?: string | null
          received_at?: string | null
          refund_amount?: number | null
          requested_at?: string
          restocking_fee?: number | null
          return_reason: string
          return_shipping_cost?: number | null
          return_type?: string
          rma_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          created_at?: string
          customer_notes?: string | null
          id?: string
          internal_notes?: string | null
          order_id?: string
          package_id?: string | null
          processed_at?: string | null
          received_at?: string | null
          refund_amount?: number | null
          requested_at?: string
          restocking_fee?: number | null
          return_reason?: string
          return_shipping_cost?: number | null
          return_type?: string
          rma_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      returns: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_notes: string | null
          id: string
          order_id: string
          reason: string
          refund_amount: number | null
          restocking_fee: number | null
          return_label_url: string | null
          return_number: string
          return_tracking_number: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_notes?: string | null
          id?: string
          order_id: string
          reason: string
          refund_amount?: number | null
          restocking_fee?: number | null
          return_label_url?: string | null
          return_number: string
          return_tracking_number?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_notes?: string | null
          id?: string
          order_id?: string
          reason?: string
          refund_amount?: number | null
          restocking_fee?: number | null
          return_label_url?: string | null
          return_number?: string
          return_tracking_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          conditions: Json | null
          created_at: string | null
          id: string
          permission: Database["public"]["Enums"]["permission_type"]
          resource_type: string
          role: string
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          id?: string
          permission: Database["public"]["Enums"]["permission_type"]
          resource_type: string
          role: string
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["permission_type"]
          resource_type?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shipment_labels: {
        Row: {
          carrier: string
          cost: number | null
          created_at: string
          currency: string | null
          id: string
          label_data: string | null
          label_format: string | null
          label_url: string | null
          metadata: Json | null
          order_id: string | null
          service_code: string
          service_name: string
          shipment_id: string | null
          status: string | null
          tracking_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          carrier: string
          cost?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          label_data?: string | null
          label_format?: string | null
          label_url?: string | null
          metadata?: Json | null
          order_id?: string | null
          service_code: string
          service_name: string
          shipment_id?: string | null
          status?: string | null
          tracking_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          carrier?: string
          cost?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          label_data?: string | null
          label_format?: string | null
          label_url?: string | null
          metadata?: Json | null
          order_id?: string | null
          service_code?: string
          service_name?: string
          shipment_id?: string | null
          status?: string | null
          tracking_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipping_analytics: {
        Row: {
          avg_pack_time_minutes: number | null
          carrier_performance: Json | null
          cost_per_package: number | null
          created_at: string
          date: string
          id: string
          on_time_delivery_rate: number | null
          return_rate: number | null
          service_type_breakdown: Json | null
          total_packages: number | null
          total_shipping_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_pack_time_minutes?: number | null
          carrier_performance?: Json | null
          cost_per_package?: number | null
          created_at?: string
          date?: string
          id?: string
          on_time_delivery_rate?: number | null
          return_rate?: number | null
          service_type_breakdown?: Json | null
          total_packages?: number | null
          total_shipping_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_pack_time_minutes?: number | null
          carrier_performance?: Json | null
          cost_per_package?: number | null
          created_at?: string
          date?: string
          id?: string
          on_time_delivery_rate?: number | null
          return_rate?: number | null
          service_type_breakdown?: Json | null
          total_packages?: number | null
          total_shipping_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipping_labels: {
        Row: {
          carrier: string
          created_at: string
          currency: string | null
          id: string
          label_format: string | null
          label_image_data: string | null
          order_id: string
          service_code: string
          service_name: string
          shipment_identification_number: string | null
          shipping_cost: number | null
          status: string | null
          tracking_number: string
          updated_at: string
          user_id: string
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          carrier: string
          created_at?: string
          currency?: string | null
          id?: string
          label_format?: string | null
          label_image_data?: string | null
          order_id: string
          service_code: string
          service_name: string
          shipment_identification_number?: string | null
          shipping_cost?: number | null
          status?: string | null
          tracking_number: string
          updated_at?: string
          user_id: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          carrier?: string
          created_at?: string
          currency?: string | null
          id?: string
          label_format?: string | null
          label_image_data?: string | null
          order_id?: string
          service_code?: string
          service_name?: string
          shipment_identification_number?: string | null
          shipping_cost?: number | null
          status?: string | null
          tracking_number?: string
          updated_at?: string
          user_id?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Relationships: []
      }
      shipping_rules: {
        Row: {
          actions: Json
          active: boolean | null
          applied_count: number | null
          conditions: Json
          created_at: string
          id: string
          name: string
          priority: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions: Json
          active?: boolean | null
          applied_count?: number | null
          conditions: Json
          created_at?: string
          id?: string
          name: string
          priority?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          active?: boolean | null
          applied_count?: number | null
          conditions?: Json
          created_at?: string
          id?: string
          name?: string
          priority?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipping_services: {
        Row: {
          carrier_configuration_id: string
          created_at: string
          estimated_days: string | null
          id: string
          is_available: boolean
          last_updated: string
          max_weight_lbs: number | null
          service_code: string
          service_name: string
          service_type: string
          supports_insurance: boolean | null
          supports_signature: boolean | null
          supports_tracking: boolean | null
          user_id: string
        }
        Insert: {
          carrier_configuration_id: string
          created_at?: string
          estimated_days?: string | null
          id?: string
          is_available?: boolean
          last_updated?: string
          max_weight_lbs?: number | null
          service_code: string
          service_name: string
          service_type: string
          supports_insurance?: boolean | null
          supports_signature?: boolean | null
          supports_tracking?: boolean | null
          user_id: string
        }
        Update: {
          carrier_configuration_id?: string
          created_at?: string
          estimated_days?: string | null
          id?: string
          is_available?: boolean
          last_updated?: string
          max_weight_lbs?: number | null
          service_code?: string
          service_name?: string
          service_type?: string
          supports_insurance?: boolean | null
          supports_signature?: boolean | null
          supports_tracking?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_services_carrier_configuration_id_fkey"
            columns: ["carrier_configuration_id"]
            isOneToOne: false
            referencedRelation: "carrier_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_analytics: {
        Row: {
          analytics_data: Json
          created_at: string
          id: string
          last_updated: string
          user_id: string
        }
        Insert: {
          analytics_data: Json
          created_at?: string
          id?: string
          last_updated?: string
          user_id: string
        }
        Update: {
          analytics_data?: Json
          created_at?: string
          id?: string
          last_updated?: string
          user_id?: string
        }
        Relationships: []
      }
      shopify_sync_status: {
        Row: {
          created_at: string
          id: string
          last_page_info: string | null
          last_sync_at: string | null
          sync_status: string | null
          total_synced: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_page_info?: string | null
          last_sync_at?: string | null
          sync_status?: string | null
          total_synced?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_page_info?: string | null
          last_sync_at?: string | null
          sync_status?: string | null
          total_synced?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      store_configurations: {
        Row: {
          access_token: string
          created_at: string
          domain: string
          id: string
          is_active: boolean
          platform: string
          ship_from_address: Json | null
          store_name: string
          storefront_domain: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean
          platform?: string
          ship_from_address?: Json | null
          store_name: string
          storefront_domain?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean
          platform?: string
          ship_from_address?: Json | null
          store_name?: string
          storefront_domain?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_products: {
        Row: {
          barcode: string | null
          category: string
          compare_at_price: number | null
          cost: number | null
          created_at: string
          currency: string | null
          description: string | null
          dimensions: Json | null
          featured: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          in_stock: boolean | null
          inventory_policy: string | null
          inventory_quantity: number | null
          name: string
          price: number
          requires_shipping: boolean | null
          seo_description: string | null
          seo_title: string | null
          shipping_info: Json | null
          short_description: string | null
          sku: string | null
          specifications: Json | null
          status: string | null
          subcategory: string | null
          supplier: string
          supplier_product_id: string | null
          supplier_url: string | null
          tags: string[] | null
          tax_code: string | null
          taxable: boolean | null
          track_quantity: boolean | null
          updated_at: string
          visibility: string | null
          weight_lbs: number | null
          weight_unit: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          name: string
          price?: number
          requires_shipping?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_info?: Json | null
          short_description?: string | null
          sku?: string | null
          specifications?: Json | null
          status?: string | null
          subcategory?: string | null
          supplier?: string
          supplier_product_id?: string | null
          supplier_url?: string | null
          tags?: string[] | null
          tax_code?: string | null
          taxable?: boolean | null
          track_quantity?: boolean | null
          updated_at?: string
          visibility?: string | null
          weight_lbs?: number | null
          weight_unit?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          name?: string
          price?: number
          requires_shipping?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_info?: Json | null
          short_description?: string | null
          sku?: string | null
          specifications?: Json | null
          status?: string | null
          subcategory?: string | null
          supplier?: string
          supplier_product_id?: string | null
          supplier_url?: string | null
          tags?: string[] | null
          tax_code?: string | null
          taxable?: boolean | null
          track_quantity?: boolean | null
          updated_at?: string
          visibility?: string | null
          weight_lbs?: number | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      store_shipping_configs: {
        Row: {
          auto_select_cheapest: boolean | null
          business_hours: Json | null
          created_at: string
          cutoff_time: string | null
          default_height_inches: number | null
          default_length_inches: number | null
          default_package_type: string | null
          default_service_types: string[] | null
          default_weight_lbs: number | null
          default_width_inches: number | null
          from_address_line1: string
          from_address_line2: string | null
          from_city: string
          from_company: string | null
          from_country: string
          from_name: string
          from_phone: string | null
          from_state: string
          from_zip: string
          id: string
          insurance_threshold_amount: number | null
          is_default: boolean
          preferred_carriers: string[] | null
          require_signature_over_amount: number | null
          store_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_select_cheapest?: boolean | null
          business_hours?: Json | null
          created_at?: string
          cutoff_time?: string | null
          default_height_inches?: number | null
          default_length_inches?: number | null
          default_package_type?: string | null
          default_service_types?: string[] | null
          default_weight_lbs?: number | null
          default_width_inches?: number | null
          from_address_line1: string
          from_address_line2?: string | null
          from_city: string
          from_company?: string | null
          from_country?: string
          from_name: string
          from_phone?: string | null
          from_state: string
          from_zip: string
          id?: string
          insurance_threshold_amount?: number | null
          is_default?: boolean
          preferred_carriers?: string[] | null
          require_signature_over_amount?: number | null
          store_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_select_cheapest?: boolean | null
          business_hours?: Json | null
          created_at?: string
          cutoff_time?: string | null
          default_height_inches?: number | null
          default_length_inches?: number | null
          default_package_type?: string | null
          default_service_types?: string[] | null
          default_weight_lbs?: number | null
          default_width_inches?: number | null
          from_address_line1?: string
          from_address_line2?: string | null
          from_city?: string
          from_company?: string | null
          from_country?: string
          from_name?: string
          from_phone?: string | null
          from_state?: string
          from_zip?: string
          id?: string
          insurance_threshold_amount?: number | null
          is_default?: boolean
          preferred_carriers?: string[] | null
          require_signature_over_amount?: number | null
          store_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submission_invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          payment_id: string
          pdf_url: string | null
          status: string
          submission_id: string
          subtotal_cents: number
          tax_amount_cents: number | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          payment_id: string
          pdf_url?: string | null
          status?: string
          submission_id: string
          subtotal_cents: number
          tax_amount_cents?: number | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          payment_id?: string
          pdf_url?: string | null
          status?: string
          submission_id?: string
          subtotal_cents?: number
          tax_amount_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "submission_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_invoices_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "inventory_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_items: {
        Row: {
          created_at: string
          expiration_date: string | null
          height_inches: number | null
          id: string
          length_inches: number | null
          lot_number: string | null
          product_title: string
          quantity: number
          sku: string
          submission_id: string
          unit_cost: number | null
          weight_lbs: number | null
          width_inches: number | null
        }
        Insert: {
          created_at?: string
          expiration_date?: string | null
          height_inches?: number | null
          id?: string
          length_inches?: number | null
          lot_number?: string | null
          product_title: string
          quantity: number
          sku: string
          submission_id: string
          unit_cost?: number | null
          weight_lbs?: number | null
          width_inches?: number | null
        }
        Update: {
          created_at?: string
          expiration_date?: string | null
          height_inches?: number | null
          id?: string
          length_inches?: number | null
          lot_number?: string | null
          product_title?: string
          quantity?: number
          sku?: string
          submission_id?: string
          unit_cost?: number | null
          weight_lbs?: number | null
          width_inches?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_submission_items_submission"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "inventory_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          paid_at: string | null
          payment_method_types: string[] | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          submission_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          payment_method_types?: string[] | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          submission_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          payment_method_types?: string[] | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_payments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "inventory_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_prep_services: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          prep_service_id: string
          quantity: number
          submission_id: string
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          prep_service_id: string
          quantity?: number
          submission_id: string
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          prep_service_id?: string
          quantity?: number
          submission_id?: string
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_submission_prep_services_item"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "submission_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submission_prep_services_service"
            columns: ["prep_service_id"]
            isOneToOne: false
            referencedRelation: "prep_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submission_prep_services_submission"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "inventory_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          description: string
          id: string
          priority: string
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sync_settings: {
        Row: {
          auto_sync_enabled: boolean
          created_at: string
          id: string
          last_preference_update: string | null
          platform: string
          sync_active_only: boolean
          sync_frequency_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_sync_enabled?: boolean
          created_at?: string
          id?: string
          last_preference_update?: string | null
          platform: string
          sync_active_only?: boolean
          sync_frequency_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_sync_enabled?: boolean
          created_at?: string
          id?: string
          last_preference_update?: string | null
          platform?: string
          sync_active_only?: boolean
          sync_frequency_hours?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean | null
          message_text: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message_text: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message_text?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          carrier: string
          created_at: string
          description: string | null
          event_time: string
          id: string
          location: string | null
          order_id: string
          status: string
          tracking_number: string
        }
        Insert: {
          carrier: string
          created_at?: string
          description?: string | null
          event_time: string
          id?: string
          location?: string | null
          order_id: string
          status: string
          tracking_number: string
        }
        Update: {
          carrier?: string
          created_at?: string
          description?: string | null
          event_time?: string
          id?: string
          location?: string | null
          order_id?: string
          status?: string
          tracking_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_companies: {
        Row: {
          company_id: string
          id: string
          is_active: boolean
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_edit_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          is_approved: boolean | null
          pattern_data: Json
          pattern_type: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          pattern_data: Json
          pattern_type: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          pattern_data?: Json
          pattern_type?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          conditions: Json | null
          created_at: string | null
          expires_at: string | null
          granted: boolean | null
          granted_by: string
          id: string
          permission: Database["public"]["Enums"]["permission_type"]
          resource_id: string | null
          resource_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          expires_at?: string | null
          granted?: boolean | null
          granted_by: string
          id?: string
          permission: Database["public"]["Enums"]["permission_type"]
          resource_id?: string | null
          resource_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          expires_at?: string | null
          granted?: boolean | null
          granted_by?: string
          id?: string
          permission?: Database["public"]["Enums"]["permission_type"]
          resource_id?: string | null
          resource_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendor_brand_tones: {
        Row: {
          brand_tone_analysis: Json
          created_at: string
          id: string
          tone_summary: string | null
          updated_at: string
          user_id: string
          vendor_name: string
          website_url: string | null
        }
        Insert: {
          brand_tone_analysis: Json
          created_at?: string
          id?: string
          tone_summary?: string | null
          updated_at?: string
          user_id: string
          vendor_name: string
          website_url?: string | null
        }
        Update: {
          brand_tone_analysis?: Json
          created_at?: string
          id?: string
          tone_summary?: string | null
          updated_at?: string
          user_id?: string
          vendor_name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      warehouse_bins: {
        Row: {
          aisle_number: number | null
          bin_code: string
          bin_type: string
          created_at: string
          current_capacity: number | null
          id: string
          is_active: boolean
          max_capacity: number | null
          shelf_level: number | null
          updated_at: string
          zone_name: string
        }
        Insert: {
          aisle_number?: number | null
          bin_code: string
          bin_type?: string
          created_at?: string
          current_capacity?: number | null
          id?: string
          is_active?: boolean
          max_capacity?: number | null
          shelf_level?: number | null
          updated_at?: string
          zone_name: string
        }
        Update: {
          aisle_number?: number | null
          bin_code?: string
          bin_type?: string
          created_at?: string
          current_capacity?: number | null
          id?: string
          is_active?: boolean
          max_capacity?: number | null
          shelf_level?: number | null
          updated_at?: string
          zone_name?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          notification_id: string | null
          payload: Json
          platform: string
          processed_at: string | null
          processing_error: string | null
          received_at: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          notification_id?: string | null
          payload: Json
          platform: string
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          notification_id?: string | null
          payload?: Json
          platform?: string
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_low_stock: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_rma_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_admin_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      has_permission: {
        Args: {
          _user_id: string
          _permission: Database["public"]["Enums"]["permission_type"]
          _resource_type: string
          _resource_id?: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      permission_type:
        | "read"
        | "write"
        | "delete"
        | "admin"
        | "billing_view"
        | "billing_manage"
        | "user_manage"
        | "company_manage"
        | "system_logs"
        | "analytics_view"
        | "inventory_manage"
        | "orders_manage"
        | "shipping_manage"
        | "repricing_manage"
      user_role: "master_admin" | "admin" | "manager" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      permission_type: [
        "read",
        "write",
        "delete",
        "admin",
        "billing_view",
        "billing_manage",
        "user_manage",
        "company_manage",
        "system_logs",
        "analytics_view",
        "inventory_manage",
        "orders_manage",
        "shipping_manage",
        "repricing_manage",
      ],
      user_role: ["master_admin", "admin", "manager", "user"],
    },
  },
} as const
