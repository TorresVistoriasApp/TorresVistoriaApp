import { useQuery } from "@tanstack/react-query";
import { platformServiceService } from "@/modules/torres-vistoria/services/platform-service-service";

export const platformServiceQueryKeys = {
  active: () => ["platform_services", "active"] as const,
};

/**
 * Carrega os serviços ativos da plataforma Torres.
 * Cache de 10 minutos — os serviços mudam raramente.
 */
export function usePlatformServices() {
  return useQuery({
    queryKey: platformServiceQueryKeys.active(),
    queryFn: () => platformServiceService.listActive(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
