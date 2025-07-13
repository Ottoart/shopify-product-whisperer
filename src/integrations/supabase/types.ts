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
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_handle: string | null
          product_title: string
          quantity: number
          sku: string | null
          variant_title: string | null
          weight_lbs: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_handle?: string | null
          product_title: string
          quantity?: number
          sku?: string | null
          variant_title?: string | null
          weight_lbs?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
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
      products: {
        Row: {
          body_html: string | null
          category: string | null
          created_at: string
          google_shopping_age_group: string | null
          google_shopping_condition: string | null
          google_shopping_gender: string | null
          handle: string
          id: string
          image_position: number | null
          image_src: string | null
          option1_name: string | null
          option1_value: string | null
          published: boolean | null
          seo_description: string | null
          seo_title: string | null
          shopify_sync_status: string | null
          shopify_synced_at: string | null
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
          google_shopping_age_group?: string | null
          google_shopping_condition?: string | null
          google_shopping_gender?: string | null
          handle: string
          id?: string
          image_position?: number | null
          image_src?: string | null
          option1_name?: string | null
          option1_value?: string | null
          published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_sync_status?: string | null
          shopify_synced_at?: string | null
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
          google_shopping_age_group?: string | null
          google_shopping_condition?: string | null
          google_shopping_gender?: string | null
          handle?: string
          id?: string
          image_position?: number | null
          image_src?: string | null
          option1_name?: string | null
          option1_value?: string | null
          published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_sync_status?: string | null
          shopify_synced_at?: string | null
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
      store_configurations: {
        Row: {
          access_token: string
          created_at: string
          domain: string
          id: string
          is_active: boolean
          platform: string
          store_name: string
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
          store_name: string
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
          store_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
