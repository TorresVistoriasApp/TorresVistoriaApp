/**
 * Tipos gerados a partir do schema do backend.
 * Regenerar: npm run db:types
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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          tenant_id: string | null
          updated_at: string
          updated_by: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          address: string | null
          address_cep: string | null
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          document: string | null
          email: string | null
          feature_flags: Json
          id: string
          legal_name: string | null
          location: string | null
          logo_url: string | null
          phone: string | null
          primary_color: string
          secondary_color: string
          status: string
          subscription_plan: string
          trade_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          address_cep?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          document?: string | null
          email?: string | null
          feature_flags?: Json
          id?: string
          legal_name?: string | null
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          primary_color?: string
          secondary_color?: string
          status?: string
          subscription_plan?: string
          trade_name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          address_cep?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          document?: string | null
          email?: string | null
          feature_flags?: Json
          id?: string
          legal_name?: string | null
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          primary_color?: string
          secondary_color?: string
          status?: string
          subscription_plan?: string
          trade_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_branches: {
        Row: {
          address: Json | null
          code: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_headquarters: boolean
          name: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: Json | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_headquarters?: boolean
          name: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: Json | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_headquarters?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_branches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_branches_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_branches_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_custom_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          granted: boolean
          id: string
          permission_code: string
          profile_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          granted?: boolean
          id?: string
          permission_code: string
          profile_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          granted?: boolean
          id?: string
          permission_code?: string
          profile_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_custom_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_custom_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "company_custom_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_custom_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string
          created_by: string | null
          current_period_end: string | null
          current_period_start: string | null
          deleted_at: string | null
          deleted_by: string | null
          external_provider: string | null
          external_subscription_id: string | null
          id: string
          plan_code: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string
          created_by?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          external_provider?: string | null
          external_subscription_id?: string | null
          id?: string
          plan_code: string
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cancel_at?: string | null
          created_at?: string
          created_by?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          external_provider?: string | null
          external_subscription_id?: string | null
          id?: string
          plan_code?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_team_members: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          profile_id: string
          role_in_team: string
          team_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          profile_id: string
          role_in_team?: string
          team_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          profile_id?: string
          role_in_team?: string
          team_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "company_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_team_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_teams: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_teams_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "company_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_teams_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_teams_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string
          entry_date: string
          entry_type: string
          id: string
          inspection_id: string | null
          source: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          entry_date?: string
          entry_type: string
          id?: string
          inspection_id?: string | null
          source?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          entry_date?: string
          entry_type?: string
          id?: string
          inspection_id?: string | null
          source?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_deleted_by_fkey"
            columns: ["deleted_by"]
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
          {
            foreignKeyName: "financial_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_checklists: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          inspection_id: string
          item_name: string
          notes: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          inspection_id: string
          item_name: string
          notes?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          inspection_id?: string
          item_name?: string
          notes?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_checklists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_checklists_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_checklists_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_checklists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_checklists_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          inspection_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          inspection_id: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          inspection_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
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
            foreignKeyName: "inspection_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_comments_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_comments_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_comments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_paint_items: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          inspection_id: string
          notes: string | null
          part_code: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          inspection_id: string
          notes?: string | null
          part_code: string
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          inspection_id?: string
          notes?: string | null
          part_code?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_paint_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_paint_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_paint_items_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_paint_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_paint_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_photos: {
        Row: {
          ai_validation: Json | null
          captured_at: string | null
          category: string
          complementary_category: string | null
          complementary_name: string | null
          content_hash: string | null
          created_at: string
          created_by: string | null
          damage_category: string | null
          damage_location: string | null
          damage_severity: string | null
          deleted_at: string | null
          deleted_by: string | null
          device_model: string | null
          device_os: string | null
          display_name: string | null
          exif_metadata: Json | null
          file_size: number | null
          gps_accuracy: number | null
          height: number | null
          id: string
          inspection_id: string
          is_required: boolean | null
          latitude: number | null
          longitude: number | null
          mime_type: string
          public_url: string | null
          resolution: string | null
          section_key: string | null
          sort_order: number | null
          status: string | null
          storage_path: string
          subcategory: string | null
          tenant_id: string
          thumbnail_url: string | null
          updated_at: string
          updated_by: string | null
          uploaded_by: string | null
          watermark_applied: boolean
          width: number | null
        }
        Insert: {
          ai_validation?: Json | null
          captured_at?: string | null
          category: string
          complementary_category?: string | null
          complementary_name?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          damage_category?: string | null
          damage_location?: string | null
          damage_severity?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          device_model?: string | null
          device_os?: string | null
          display_name?: string | null
          exif_metadata?: Json | null
          file_size?: number | null
          gps_accuracy?: number | null
          height?: number | null
          id?: string
          inspection_id: string
          is_required?: boolean | null
          latitude?: number | null
          longitude?: number | null
          mime_type?: string
          public_url?: string | null
          resolution?: string | null
          section_key?: string | null
          sort_order?: number | null
          status?: string | null
          storage_path: string
          subcategory?: string | null
          tenant_id: string
          thumbnail_url?: string | null
          updated_at?: string
          updated_by?: string | null
          uploaded_by?: string | null
          watermark_applied?: boolean
          width?: number | null
        }
        Update: {
          ai_validation?: Json | null
          captured_at?: string | null
          category?: string
          complementary_category?: string | null
          complementary_name?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          damage_category?: string | null
          damage_location?: string | null
          damage_severity?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          device_model?: string | null
          device_os?: string | null
          display_name?: string | null
          exif_metadata?: Json | null
          file_size?: number | null
          gps_accuracy?: number | null
          height?: number | null
          id?: string
          inspection_id?: string
          is_required?: boolean | null
          latitude?: number | null
          longitude?: number | null
          mime_type?: string
          public_url?: string | null
          resolution?: string | null
          section_key?: string | null
          sort_order?: number | null
          status?: string | null
          storage_path?: string
          subcategory?: string | null
          tenant_id?: string
          thumbnail_url?: string | null
          updated_at?: string
          updated_by?: string | null
          uploaded_by?: string | null
          watermark_applied?: boolean
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_photos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_photos_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_photos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_photos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_reports: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          generated_by: string
          id: string
          inspection_id: string
          integrity_hash: string
          public_url: string | null
          qr_code_data: string | null
          storage_path: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          verification_code: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          generated_by: string
          id?: string
          inspection_id: string
          integrity_hash: string
          public_url?: string | null
          qr_code_data?: string | null
          storage_path: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          verification_code: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          generated_by?: string
          id?: string
          inspection_id?: string
          integrity_hash?: string
          public_url?: string | null
          qr_code_data?: string | null
          storage_path?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          verification_code?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspection_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_reports_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "inspection_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_reports_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_types: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_types_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_types_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          brand: string
          buyer_document: string | null
          buyer_name: string | null
          chassis: string
          client_document: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          color: string
          completion_percent: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          draft_expires_at: string | null
          engine_displacement: number | null
          fuel: string
          id: string
          inspection_date: string
          inspection_number: number
          inspection_purpose: string | null
          inspection_time: string
          inspection_type_id: string | null
          inspector_id: string
          insurance_acceptance_percent: number | null
          internal_notes: string | null
          is_armored: boolean
          judicial_court: string | null
          judicial_district: string | null
          judicial_process: string | null
          last_auto_saved_at: string | null
          location: string
          manufacture_year: number
          market_average_value: number | null
          market_fipe_value: number | null
          mileage: number | null
          model: string
          model_year: number
          motor_number: string | null
          opinion: string | null
          passenger_capacity: number | null
          plate: string
          power_cv: number | null
          registration_city_uf: string | null
          renavam: string | null
          requester_document: string | null
          requester_name: string | null
          seller_document: string | null
          seller_name: string | null
          situation: string
          status: string
          technical_notes: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          vehicle_category: string | null
          vehicle_condition: string | null
          vehicle_species: string | null
          vehicle_uf: string | null
          version: string | null
        }
        Insert: {
          brand: string
          buyer_document?: string | null
          buyer_name?: string | null
          chassis: string
          client_document: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          color: string
          completion_percent?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          draft_expires_at?: string | null
          engine_displacement?: number | null
          fuel: string
          id?: string
          inspection_date: string
          inspection_number?: number
          inspection_purpose?: string | null
          inspection_time: string
          inspection_type_id?: string | null
          inspector_id: string
          insurance_acceptance_percent?: number | null
          internal_notes?: string | null
          is_armored?: boolean
          judicial_court?: string | null
          judicial_district?: string | null
          judicial_process?: string | null
          last_auto_saved_at?: string | null
          location: string
          manufacture_year: number
          market_average_value?: number | null
          market_fipe_value?: number | null
          mileage?: number | null
          model: string
          model_year: number
          motor_number?: string | null
          opinion?: string | null
          passenger_capacity?: number | null
          plate: string
          power_cv?: number | null
          registration_city_uf?: string | null
          renavam?: string | null
          requester_document?: string | null
          requester_name?: string | null
          seller_document?: string | null
          seller_name?: string | null
          situation: string
          status?: string
          technical_notes?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          vehicle_category?: string | null
          vehicle_condition?: string | null
          vehicle_species?: string | null
          vehicle_uf?: string | null
          version?: string | null
        }
        Update: {
          brand?: string
          buyer_document?: string | null
          buyer_name?: string | null
          chassis?: string
          client_document?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          color?: string
          completion_percent?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          draft_expires_at?: string | null
          engine_displacement?: number | null
          fuel?: string
          id?: string
          inspection_date?: string
          inspection_number?: number
          inspection_purpose?: string | null
          inspection_time?: string
          inspection_type_id?: string | null
          inspector_id?: string
          insurance_acceptance_percent?: number | null
          internal_notes?: string | null
          is_armored?: boolean
          judicial_court?: string | null
          judicial_district?: string | null
          judicial_process?: string | null
          last_auto_saved_at?: string | null
          location?: string
          manufacture_year?: number
          market_average_value?: number | null
          market_fipe_value?: number | null
          mileage?: number | null
          model?: string
          model_year?: number
          motor_number?: string | null
          opinion?: string | null
          passenger_capacity?: number | null
          plate?: string
          power_cv?: number | null
          registration_city_uf?: string | null
          renavam?: string | null
          requester_document?: string | null
          requester_name?: string | null
          seller_document?: string | null
          seller_name?: string | null
          situation?: string
          status?: string
          technical_notes?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          vehicle_category?: string | null
          vehicle_condition?: string | null
          vehicle_species?: string | null
          vehicle_uf?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_inspection_type_id_fkey"
            columns: ["inspection_type_id"]
            isOneToOne: false
            referencedRelation: "inspection_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          last_sync_at: string | null
          provider: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_connections_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_storage_path_map: {
        Row: {
          bucket_id: string
          created_at: string
          entity_id: string | null
          entity_table: string | null
          migrated_at: string | null
          new_path: string
          old_path: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          entity_id?: string | null
          entity_table?: string | null
          migrated_at?: string | null
          new_path: string
          old_path: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          entity_id?: string | null
          entity_table?: string | null
          migrated_at?: string | null
          new_path?: string
          old_path?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      photo_categories: {
        Row: {
          category_type: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean
          is_system: boolean
          key: string
          max_count: number
          min_count: number
          name: string
          required: boolean
          section_id: string | null
          section_key: string
          sort_order: number
          tenant_id: string | null
          updated_at: string
          updated_by: string | null
          visual_guide: Json | null
        }
        Insert: {
          category_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          key: string
          max_count?: number
          min_count?: number
          name: string
          required?: boolean
          section_id?: string | null
          section_key: string
          sort_order?: number
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
          visual_guide?: Json | null
        }
        Update: {
          category_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          key?: string
          max_count?: number
          min_count?: number
          name?: string
          required?: boolean
          section_id?: string | null
          section_key?: string
          sort_order?: number
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
          visual_guide?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_categories_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_categories_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "photo_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_sections: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean
          is_system: boolean
          key: string
          max_allowed_count: number
          min_required_count: number
          name: string
          sort_order: number
          tenant_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          key: string
          max_allowed_count?: number
          min_required_count?: number
          name: string
          sort_order?: number
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          key?: string
          max_allowed_count?: number
          min_required_count?: number
          name?: string
          sort_order?: number
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_sections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_sections_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_sections_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      inspector_registrations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_role: Database["public"]["Enums"]["tenant_role"] | null
          approved_tenant_id: string | null
          created_at: string
          document_hash: string
          document_tail: string
          document_type: string
          email: string
          full_name: string
          id: string
          phone: string | null
          rejection_reason: string | null
          rejected_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_role?: Database["public"]["Enums"]["tenant_role"] | null
          approved_tenant_id?: string | null
          created_at?: string
          document_hash: string
          document_tail: string
          document_type: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          rejection_reason?: string | null
          rejected_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_role?: Database["public"]["Enums"]["tenant_role"] | null
          approved_tenant_id?: string | null
          created_at?: string
          document_hash?: string
          document_tail?: string
          document_type?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          rejection_reason?: string | null
          rejected_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspector_registrations_approved_tenant_id_fkey"
            columns: ["approved_tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      consumer_profiles: {
        Row: {
          account_status: string
          created_at: string
          deleted_at: string | null
          deletion_requested_at: string | null
          deletion_scheduled_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          deleted_at?: string | null
          deletion_requested_at?: string | null
          deletion_scheduled_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string
          created_at?: string
          deleted_at?: string | null
          deletion_requested_at?: string | null
          deletion_scheduled_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      consumer_consultas: {
        Row: {
          chassis: string | null
          completed_at: string | null
          consumer_id: string
          credits_charged: number
          created_at: string
          deleted_at: string | null
          document_url: string | null
          failure_reason: string | null
          id: string
          plan_name: string
          plate: string | null
          query_type: string
          result_payload: Json | null
          status: string
        }
        Insert: {
          chassis?: string | null
          completed_at?: string | null
          consumer_id: string
          credits_charged?: number
          created_at?: string
          deleted_at?: string | null
          document_url?: string | null
          failure_reason?: string | null
          id?: string
          plan_name: string
          plate?: string | null
          query_type: string
          result_payload?: Json | null
          status?: string
        }
        Update: {
          chassis?: string | null
          completed_at?: string | null
          consumer_id?: string
          credits_charged?: number
          created_at?: string
          deleted_at?: string | null
          document_url?: string | null
          failure_reason?: string | null
          id?: string
          plan_name?: string
          plate?: string | null
          query_type?: string
          result_payload?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumer_consultas_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "consumer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consumer_credit_balances: {
        Row: {
          available: number
          consumer_id: string
          created_at: string
          pending: number
          updated_at: string
        }
        Insert: {
          available?: number
          consumer_id: string
          created_at?: string
          pending?: number
          updated_at?: string
        }
        Update: {
          available?: number
          consumer_id?: string
          created_at?: string
          pending?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumer_credit_balances_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: true
            referencedRelation: "consumer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          must_change_password: boolean
          phone: string | null
          role: Database["public"]["Enums"]["tenant_role"]
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean
          must_change_password?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["tenant_role"]
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["tenant_role"]
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
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
          code: Database["public"]["Enums"]["tenant_role"]
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: Database["public"]["Enums"]["tenant_role"]
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: Database["public"]["Enums"]["tenant_role"]
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
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          legal_footer: string | null
          signature_image_url: string | null
          tenant_id: string
          theme_mode: string
          updated_at: string
          updated_by: string | null
          watermark_enabled: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          legal_footer?: string | null
          signature_image_url?: string | null
          tenant_id: string
          theme_mode?: string
          updated_at?: string
          updated_by?: string | null
          watermark_enabled?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          legal_footer?: string | null
          signature_image_url?: string | null
          tenant_id?: string
          theme_mode?: string
          updated_at?: string
          updated_by?: string | null
          watermark_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          status: string
          tenant_id: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role: string
          status?: string
          tenant_id: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          status?: string
          tenant_id?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
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
      anonymize_user_account: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      can_access_financial_row: {
        Args: {
          p_company_id: string
          p_created_by: string
          p_inspection_id: string
        }
        Returns: boolean
      }
      can_access_inspection_row: {
        Args: { p_inspection_id: string }
        Returns: boolean
      }
      can_access_tenant_row: {
        Args: { p_company_id: string; p_created_by: string }
        Returns: boolean
      }
      cleanup_expired_inspection_drafts: { Args: never; Returns: number }
      company_inspection_revenue: {
        Args: {
          p_end_date?: string
          p_inspector_id?: string
          p_start_date?: string
          p_tenant_id: string
        }
        Returns: number
      }
      company_manual_revenue: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_tenant_id: string
        }
        Returns: number
      }
      dashboard_inspector_scope: { Args: never; Returns: string }
      get_dashboard_stats: { Args: { p_tenant_id: string }; Returns: Json }
      get_default_tenant_id: { Args: never; Returns: string }
      get_entity_history: {
        Args: { p_entity_id: string; p_entity_type: string; p_limit?: number }
        Returns: {
          action: string
          changed_at: string
          changed_by: string
          changed_by_name: string
          changed_fields: string[]
          new_data: Json
          old_data: Json
          version: number
        }[]
      }
      get_financial_summary: {
        Args: { p_end_date: string; p_start_date: string; p_tenant_id: string }
        Returns: Json
      }
      get_inspections_by_brand: {
        Args: { p_tenant_id: string }
        Returns: {
          brand: string
          count: number
        }[]
      }
      get_migration_health_report: {
        Args: { p_tenant_id?: string }
        Returns: Json
      }
      get_monthly_inspections: {
        Args: { p_tenant_id: string; p_year?: number }
        Returns: {
          count: number
          month: string
          revenue: number
        }[]
      }
      get_request_ip: { Args: never; Returns: unknown }
      get_request_user_agent: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      get_user_tenant_id: { Args: never; Returns: string }
      inspection_photo_matches_storage_object: {
        Args: {
          p_object_name: string
          p_storage_path: string
          p_thumbnail_url: string
        }
        Returns: boolean
      }
      inspection_photo_object_category: {
        Args: { p_name: string }
        Returns: string
      }
      inspection_photo_thumbnail_path: {
        Args: { p_storage_path: string }
        Returns: string
      }
      is_canonical_inspection_photo_object_path: {
        Args: { p_name: string }
        Returns: boolean
      }
      is_canonical_report_object_path: {
        Args: { p_name: string }
        Returns: boolean
      }
      is_inspector: { Args: never; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      mark_storage_path_migrated: {
        Args: { p_bucket_id: string; p_old_path: string }
        Returns: undefined
      }
      normalize_tenant_role: {
        Args: { p_role: string }
        Returns: Database["public"]["Enums"]["tenant_role"]
      }
      record_audit_event: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type?: string
          p_metadata?: Json
        }
        Returns: string
      }
      redact_audit_jsonb: { Args: { payload: Json }; Returns: Json }
      search_inspections: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_start_date?: string
          p_status?: string
          p_tenant_id: string
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
      validate_report: { Args: { p_verification_code: string }; Returns: Json }
    }
    Enums: {
      tenant_role:
        | "SUPER_ADMIN"
        | "INSPECTOR"
        | "FINANCIAL"
        | "MANAGER"
        | "READ_ONLY"
        | "SUPPORT"
        | "OWNER"
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
      tenant_role: [
        "SUPER_ADMIN",
        "INSPECTOR",
        "FINANCIAL",
        "MANAGER",
        "READ_ONLY",
        "SUPPORT",
        "OWNER",
      ],
    },
  },
} as const
