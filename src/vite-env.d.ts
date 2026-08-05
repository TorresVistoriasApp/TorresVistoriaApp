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
  /** Feature flags: VITE_FF_TORRES_CONSULTA, VITE_FF_PAYMENTS, etc. */
  readonly VITE_FF_TORRES_CONSULTA?: string;
  readonly VITE_FF_TORRES_CONSULTA_OFFICIAL_API?: string;
  readonly VITE_FF_TORRES_VISTORIA?: string;
  readonly VITE_FF_PAYMENTS?: string;
  readonly VITE_FF_CASHBACK?: string;
  readonly VITE_FF_COUPONS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
