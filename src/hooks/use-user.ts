import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { userService } from "@/services/user-service";
import type { UserRole } from "@/lib/enums";
import type { UserProfileInput } from "@/schemas/user";
import { useAuth } from "@/hooks/use-auth";
import { invalidateUserQueries } from "@/lib/cache-invalidation";

export function useUser() {
  const auth = useAuth();
  return {
    user: auth.user,
    profile: auth.profile,
    loading: auth.loading,
  };
}

export function useTeamProfiles() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.team,
    queryFn: () => userService.listTeam(profile!.company_id),
    enabled: profile?.role === "SUPER_ADMIN" && !!profile?.company_id,
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
