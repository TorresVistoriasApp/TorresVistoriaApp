import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { userService } from "@/services/user-service";
import type { UserRole } from "@/lib/enums";
import { useAuth } from "@/hooks/use-auth";

export function useTeamProfiles() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.team,
    queryFn: () => userService.listTeam(),
    enabled: profile?.role === "SUPER_ADMIN",
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, role }: { profileId: string; role: UserRole }) =>
      userService.updateRole(profileId, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.team });
    },
  });
}
