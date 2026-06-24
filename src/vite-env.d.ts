/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_ANON_KEY?: string;
  /** @deprecated Use VITE_API_URL */
  readonly VITE_SUPABASE_URL?: string;
  /** @deprecated Use VITE_API_ANON_KEY */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
