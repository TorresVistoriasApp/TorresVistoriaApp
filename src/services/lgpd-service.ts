import { db } from "@/lib/db-client";
import { AppError, getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth-service";
import type { Profile } from "@/types";

export type UserDataExport = {
  exportedAt: string;
  profile: Pick<
    Profile,
    "id" | "full_name" | "role" | "created_at" | "company_id" | "email" | "is_active"
  >;
  email: string | null;
  inspections: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
};

export const lgpdService = {
  async exportMyData(userId: string, email: string | undefined): Promise<UserDataExport> {
    try {
      const profile = await authService.getProfile(userId);
      if (!profile) throw new AppError("Perfil não encontrado");

      const { data: inspections, error: inspError } = await db
        .from("inspections")
        .select(
          "id, inspection_number, inspection_date, plate, brand, model, client_name, status, opinion, created_at, updated_at",
        )
        .eq("inspector_id", userId)
        .is("deleted_at", null)
        .order("inspection_date", { ascending: false })
        .limit(500);
      if (inspError) throw inspError;

      const { data: auditLogs, error: auditError } = await db
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, created_at")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(500);
      if (auditError) throw auditError;

      return {
        exportedAt: new Date().toISOString(),
        profile: {
          id: profile.id,
          full_name: profile.full_name,
          role: profile.role,
          created_at: profile.created_at,
          company_id: profile.company_id,
          email: profile.email ?? null,
          is_active: profile.is_active ?? true,
        },
        email: email ?? null,
        inspections: (inspections ?? []) as Array<Record<string, unknown>>,
        auditLogs: (auditLogs ?? []) as Array<Record<string, unknown>>,
      };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async requestAccountDeletion(userId: string): Promise<void> {
    try {
      const { error } = await db.rpc("anonymize_user_account", {
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
