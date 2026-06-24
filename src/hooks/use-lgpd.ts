import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { lgpdService } from "@/services/lgpd-service";

export function useExportMyData() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sessão inválida");
      return lgpdService.exportMyData(user.id, user.email);
    },
  });
}

export function useRequestAccountDeletion() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sessão inválida");
      await lgpdService.requestAccountDeletion(user.id);
    },
  });
}
