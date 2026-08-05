/**
 * Fábricas de chaves de cache tipadas e tenant-scoped.
 *
 * Toda chave que carrega dado de empresa começa com o tenantId — assim invalidar
 * um tenant nunca toca o cache de outro, mesmo no mesmo QueryClient.
 */

export const cacheKeys = {
  tenant: {
    company: (tenantId: string) => ["tenant", tenantId, "company"] as const,
    settings: (tenantId: string) => ["tenant", tenantId, "settings"] as const,
  },
  inspections: {
    all: (tenantId: string) => ["tenant", tenantId, "inspections"] as const,
    detail: (tenantId: string, id: string) =>
      ["tenant", tenantId, "inspections", id] as const,
  },
  consulta: {
    all: (tenantId: string) => ["tenant", tenantId, "consulta"] as const,
    detail: (tenantId: string, id: string) =>
      ["tenant", tenantId, "consulta", id] as const,
    credits: (tenantId: string) => ["tenant", tenantId, "consulta", "credits"] as const,
  },
  financial: {
    all: (tenantId: string) => ["tenant", tenantId, "financial"] as const,
    summary: (tenantId: string) => ["tenant", tenantId, "financial", "summary"] as const,
  },
  dashboard: {
    metrics: (tenantId: string) => ["tenant", tenantId, "dashboard", "metrics"] as const,
  },
  users: {
    team: (tenantId: string) => ["tenant", tenantId, "users", "team"] as const,
  },
} as const;

export type CacheKey = readonly unknown[];
