import { db } from "@/infra/supabase/client";
import type { UserRole } from "@/core/rbac/roles";

/** Escritas no cadastro de usuários da empresa. */
export const mutations = {
  profiles: {
    update(
      id: string,
      data: { full_name?: string; role?: UserRole; avatar_url?: string | null; phone?: string | null },
    ) {
      return db.from("profiles").update(data).eq("id", id).select("*").single();
    },
  },
};
