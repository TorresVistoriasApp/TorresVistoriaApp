/**
 * Tipos gerados ? Supabase TorresVistorias (ljzttzfjtskblxekmquu)
 * Regenerar: Supabase MCP generate_typescript_types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          deleted_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          deleted_at: string | null
          document: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_entries: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string
          entry_date: string
          entry_type: string
          id: string
          inspection_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description: string
          entry_date?: string
          entry_type: string
          id?: string
          inspection_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string
          entry_date?: string
          entry_type?: string
          id?: string
          inspection_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_checklists: {
        Row: {
          category: string
          company_id: string
          created_at: string
          deleted_at: string | null
          id: string
          inspection_id: string
          item_name: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          inspection_id: string
          item_name: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          inspection_id?: string
          item_name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_checklists_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_comments: {
        Row: {
          author_id: string
          company_id: string
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          inspection_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          company_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          inspection_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          company_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          inspection_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_comments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_comments_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_photos: {
        Row: {
          category: string
          company_id: string
          created_at: string
          deleted_at: string | null
          exif_metadata: Json | null
          file_size: number | null
          id: string
          inspection_id: string
          latitude: number | null
          longitude: number | null
          mime_type: string
          public_url: string | null
          storage_path: string
          updated_at: string
          watermark_applied: boolean
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          exif_metadata?: Json | null
          file_size?: number | null
          id?: string
          inspection_id: string
          latitude?: number | null
          longitude?: number | null
          mime_type?: string
          public_url?: string | null
          storage_path: string
          updated_at?: string
          watermark_applied?: boolean
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          exif_metadata?: Json | null
          file_size?: number | null
          id?: string
          inspection_id?: string
          latitude?: number | null
          longitude?: number | null
          mime_type?: string
          public_url?: string | null
          storage_path?: string
          updated_at?: string
          watermark_applied?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "inspection_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_reports: {
        Row: {
          company_id: string
          created_at: string
          deleted_at: string | null
          generated_by: string
          id: string
          inspection_id: string
          integrity_hash: string
          public_url: string | null
          qr_code_data: string | null
          storage_path: string
          updated_at: string
          verification_code: string
          version: number
        }
        Insert: {
          company_id: string
          created_at?: string
          deleted_at?: string | null
          generated_by: string
          id?: string
          inspection_id: string
          integrity_hash: string
          public_url?: string | null
          qr_code_data?: string | null
          storage_path: string
          updated_at?: string
          verification_code: string
          version?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          generated_by?: string
          id?: string
          inspection_id?: string
          integrity_hash?: string
          public_url?: string | null
          qr_code_data?: string | null
          storage_path?: string
          updated_at?: string
          verification_code?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspection_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_reports_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          brand: string
          chassis: string
          client_document: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          color: string
          company_id: string
          created_at: string
          deleted_at: string | null
          fuel: string
          id: string
          inspection_date: string
          inspection_number: number
          inspection_time: string
          inspector_id: string
          internal_notes: string | null
          location: string
          manufacture_year: number
          mileage: number | null
          model: string
          model_year: number
          opinion: string | null
          plate: string
          renavam: string | null
          situation: string
          status: string
          technical_notes: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          brand: string
          chassis: string
          client_document: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          color: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          fuel: string
          id?: string
          inspection_date: string
          inspection_number?: number
          inspection_time: string
          inspector_id: string
          internal_notes?: string | null
          location: string
          manufacture_year: number
          mileage?: number | null
          model: string
          model_year: number
          opinion?: string | null
          plate: string
          renavam?: string | null
          situation: string
          status?: string
          technical_notes?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          brand?: string
          chassis?: string
          client_document?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          color?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          fuel?: string
          id?: string
          inspection_date?: string
          inspection_number?: number
          inspection_time?: string
          inspector_id?: string
          internal_notes?: string | null
          location?: string
          manufacture_year?: number
          mileage?: number | null
          model?: string
          model_year?: number
          opinion?: string | null
          plate?: string
          renavam?: string | null
          situation?: string
          status?: string
          technical_notes?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          company_id: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          full_name: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          full_name: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          full_name?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          permission_id: string
          role_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          permission_id: string
          role_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          company_id: string
          created_at: string
          deleted_at: string | null
          id: string
          legal_footer: string | null
          primary_color: string
          signature_image_url: string | null
          theme_mode: string
          updated_at: string
          watermark_enabled: boolean
        }
        Insert: {
          company_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          legal_footer?: string | null
          primary_color?: string
          signature_image_url?: string | null
          theme_mode?: string
          updated_at?: string
          watermark_enabled?: boolean
        }
        Update: {
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          legal_footer?: string | null
          primary_color?: string
          signature_image_url?: string | null
          theme_mode?: string
          updated_at?: string
          watermark_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: { Args: { p_company_id: string }; Returns: Json }
      get_financial_summary: {
        Args: { p_company_id: string; p_end_date: string; p_start_date: string }
        Returns: Json
      }
      get_inspections_by_brand: {
        Args: { p_company_id: string }
        Returns: {
          brand: string
          count: number
        }[]
      }
      get_monthly_inspections: {
        Args: { p_company_id: string; p_year?: number }
        Returns: {
          count: number
          month: string
          revenue: number
        }[]
      }
      get_user_company_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
      search_inspections: {
        Args: {
          p_company_id: string
          p_end_date?: string
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_start_date?: string
          p_status?: string
        }
        Returns: {
          brand: string
          client_name: string
          id: string
          inspection_date: string
          inspection_number: number
          model: string
          opinion: string
          plate: string
          reporter_name: string
          status: string
          total_count: number
        }[]
      }
      anonymize_user_account: { Args: { p_user_id: string }; Returns: undefined }
      validate_report: { Args: { p_verification_code: string }; Returns: Json }
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
