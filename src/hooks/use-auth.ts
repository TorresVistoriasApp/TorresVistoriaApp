export { useAuthContext as useAuth } from "@/app/auth-context";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { authService } from "@/services/auth-service";
import { invalidateUserQueries } from "@/lib/cache-invalidation";
import { useAuthContext } from "@/app/auth-context";
import type { InviteUserInput } from "@/schemas/auth";

export function useAuthProfile() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => authService.getProfile(user!.id),
    enabled: !!user?.id,
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (password: string) => authService.updatePassword(password),
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteUserInput) => authService.inviteUser(input),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}
