import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/enums";

export type TeamProfile = {
  id: string;
  company_id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
};

export const userService = {
  async listTeam(): Promise<TeamProfile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, company_id, full_name, role, avatar_url, created_at")
      .is("deleted_at", null)
      .order("full_name");
    if (error) throw error;
    return (data ?? []) as TeamProfile[];
  },

  async updateRole(profileId: string, role: UserRole): Promise<TeamProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", profileId)
      .select("id, company_id, full_name, role, avatar_url, created_at")
      .single();
    if (error) throw error;
    return data as TeamProfile;
  },

  async updateProfile(profileId: string, fullName: string): Promise<TeamProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profileId)
      .select("id, company_id, full_name, role, avatar_url, created_at")
      .single();
    if (error) throw error;
    return data as TeamProfile;
  },
};
