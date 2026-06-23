import { useAuth } from "@/hooks/use-auth";

export function useUser() {
  const auth = useAuth();
  return {
    user: auth.user,
    profile: auth.profile,
    loading: auth.loading,
  };
}
