export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          document: string | null;
          email: string | null;
          phone: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          document?: string | null;
          email?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          role: "SUPER_ADMIN" | "VISTORIADOR";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          company_id: string;
          full_name: string;
          role?: "SUPER_ADMIN" | "VISTORIADOR";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      inspections: {
        Row: {
          id: string;
          company_id: string;
          inspector_id: string;
          inspection_number: number;
          inspection_date: string;
          inspection_time: string;
          location: string;
          client_name: string;
          client_document: string;
          client_phone: string | null;
          client_email: string | null;
          plate: string;
          chassis: string;
          renavam: string | null;
          brand: string;
          model: string;
          version: string | null;
          color: string;
          fuel: string;
          manufacture_year: number;
          model_year: number;
          mileage: number | null;
          situation: string;
          opinion: string | null;
          technical_notes: string | null;
          internal_notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: { Args: Record<string, never>; Returns: string };
      get_user_company_id: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
  };
}
