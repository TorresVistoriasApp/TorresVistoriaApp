export { useUser, useUserContext } from "@/app/user-context";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/app/user-context";
import { queryKeys } from "@/lib/queries";
import { userService } from "@/services/user-service";
import type { UserRole } from "@/lib/enums";
import type { UserProfileInput } from "@/schemas/user";
import { invalidateUserQueries } from "@/lib/cache-invalidation";

export function useTeamProfiles() {
  const { companyId, role } = useUserContext();

  return useQuery({
    queryKey: queryKeys.users.team,
    queryFn: () => userService.listTeam(companyId!),
    enabled: role === "SUPER_ADMIN" && !!companyId,
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
