import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateUserQueries } from "@/lib/cache-invalidation";
import { adminUsersService } from "@/features/users/services/admin-users-service";
import type { CreateUserInput, UpdateUserInput } from "@/features/users/schemas/user-admin";

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => adminUsersService.createUser(input),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}

/** @deprecated Use `useCreateUser` — fluxo antigo por convite. */
export function useInviteUser() {
  return useCreateUser();
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateUserInput }) =>
      adminUsersService.updateUser(userId, input),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminUsersService.setUserActive(userId, isActive),
    onSuccess: () => {
      invalidateUserQueries(qc);
    },
  });
}
