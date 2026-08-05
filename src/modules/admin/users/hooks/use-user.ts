import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/core/auth/user-context";
import { usePermission } from "@/core/rbac/use-permission";
import { queryKeys } from "@/infra/supabase/queries";
import { userService } from "@/modules/admin/users/services/user-service";
import type { UserRole } from "@/core/rbac/roles";
import type { UserProfileInput } from "@/modules/admin/users/schemas/user";
import { invalidateUserQueries } from "@/infra/query/cache-invalidation";

export function useTeamProfiles() {
  const { companyId } = useUserContext();
  const { can } = usePermission();

  return useQuery({
    queryKey: queryKeys.users.team(companyId ?? undefined),
    queryFn: () => userService.listTeam(companyId!),
    enabled: can("users.manage") && !!companyId,
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, input }: { profileId: string; input: UserProfileInput }) =>
      userService.updateProfile(profileId, input),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}

export function useUploadUserAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      userService.updateAvatar(userId, file),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, role }: { profileId: string; role: UserRole }) =>
      userService.updateRole(profileId, role),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}
