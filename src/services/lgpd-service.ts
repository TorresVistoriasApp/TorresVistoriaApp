import { supabase } from "@/lib/supabase";
import { AppError, getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth-service";
import type { Profile } from "@/types";

export type UserDataExport = {
  exportedAt: string;
  profile: Pick<Profile, "id" | "full_name" | "role" | "created_at">;
  email: string | null;
  inspectionsCount: number;
  auditLogsCount: number;
};

export const lgpdService = {
  async exportMyData(userId: string, email: string | undefined): Promise<UserDataExport> {
    try {
      const profile = await authService.getProfile(userId);
      if (!profile) throw new AppError("Perfil não encontrado");

      const { count: inspectionsCount, error: inspError } = await supabase
        .from("inspections")
        .select("id", { count: "exact", head: true })
        .eq("inspector_id", userId)
        .is("deleted_at", null);
      if (inspError) throw inspError;

      const { count: auditLogsCount, error: auditError } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if (auditError) throw auditError;

      return {
        exportedAt: new Date().toISOString(),
        profile: {
          id: profile.id,
          full_name: profile.full_name,
          role: profile.role,
          created_at: profile.created_at,
        },
        email: email ?? null,
        inspectionsCount: inspectionsCount ?? 0,
        auditLogsCount: auditLogsCount ?? 0,
      };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async requestAccountDeletion(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("anonymize_user_account", {
        p_user_id: userId,
      });
      if (error) throw error;
      await authService.signOut();
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  downloadExport(data: UserDataExport): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `torres-dados-${data.profile.id.slice(0, 8)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
