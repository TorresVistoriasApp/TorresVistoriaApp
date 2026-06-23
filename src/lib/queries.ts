/** React Query hooks — implementar na Fase 1 */
export const queryKeys = {
  inspections: {
    all: ["inspections"] as const,
    list: (filters?: Record<string, unknown>) => ["inspections", "list", filters] as const,
    detail: (id: string) => ["inspections", id] as const,
  },
  checklist: (inspectionId: string) => ["checklist", inspectionId] as const,
  photos: (inspectionId: string) => ["photos", inspectionId] as const,
  dashboard: {
    metrics: ["dashboard", "metrics"] as const,
    recent: ["dashboard", "recent"] as const,
  },
  financial: {
    all: ["financial"] as const,
    summary: ["financial", "summary"] as const,
  },
  profile: ["profile"] as const,
  company: {
    detail: (id: string) => ["company", id] as const,
    settings: (id: string) => ["company", id, "settings"] as const,
  },
  users: {
    team: ["users", "team"] as const,
  },
  audit: {
    all: ["audit"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
} as const;
