import { QueryClient } from "@tanstack/react-query";

/** Instância única — usada pelos providers e limpa no logout. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
