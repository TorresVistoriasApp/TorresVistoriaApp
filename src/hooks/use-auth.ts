export { useAuth, useAuthContext } from "@/app/auth-context";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { authService } from "@/services/auth-service";
import { useAuthContext } from "@/app/auth-context";

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
    mutationFn: (input: import("@/schemas/auth").ChangePasswordInput) =>
      authService.completePasswordChange(input),
  });
}
