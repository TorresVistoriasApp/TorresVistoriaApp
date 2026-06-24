import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { userService } from "@/services/user-service";
import { authService } from "@/services/auth-service";
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

export function useInviteUser() {
  return useCreateUser();
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: import("@/schemas/auth").CreateUserInput) => authService.createUser(input),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: import("@/schemas/auth").UpdateUserInput }) =>
      authService.updateUser(userId, input),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      authService.setUserActive(userId, isActive),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}
