export { useAuth, useAuthContext } from "@/core/auth/auth-context";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/infra/supabase/queries";
import { authService } from "@/core/auth/auth-service";
import { useAuthContext } from "@/core/auth/auth-context";

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

export function useCompletePasswordChange() {
  return useMutation({
    mutationFn: (input: import("@/core/auth/schemas/auth").ChangePasswordInput) =>
      authService.completePasswordChange(input),
  });
}
