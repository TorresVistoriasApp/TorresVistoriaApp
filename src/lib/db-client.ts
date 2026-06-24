import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const apiUrl = import.meta.env.VITE_API_URL;
const apiAnonKey = import.meta.env.VITE_API_ANON_KEY;

function createDbClient(): SupabaseClient<Database> {
  if (!apiUrl || !apiAnonKey) {
    if (import.meta.env.PROD) {
      throw new Error(
        "Backend não configurado. Defina VITE_API_URL e VITE_API_ANON_KEY.",
      );
    }

    console.warn(
      "Backend não configurado. Copie .env.example para .env.local e preencha as variáveis.",
    );

    return createClient<Database>("http://127.0.0.1:54321", "dev-only-placeholder", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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

export const db = createDbClient();
