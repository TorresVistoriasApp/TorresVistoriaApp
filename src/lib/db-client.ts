import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getApiAnonKey, getApiUrl, getDevBackendFallback, isBackendConfigured } from "@/lib/env";

function createDbClient(): SupabaseClient<Database> {
  const apiUrl = getApiUrl();
  const apiAnonKey = getApiAnonKey();

  if (!apiUrl || !apiAnonKey) {
    if (!import.meta.env.PROD) {
      console.warn(
        "Backend não configurado. Copie .env.example para .env.local e preencha as variáveis.",
      );
      const fallback = getDevBackendFallback();
      return createClient<Database>(fallback.url, fallback.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }

    const fallback = getDevBackendFallback();
    return createClient<Database>(fallback.url, fallback.key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return createClient<Database>(apiUrl, apiAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export { isBackendConfigured };
export const db = createDbClient();
