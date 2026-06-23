/** React Query mutations — implementar na Fase 1 */
export const mutationKeys = {
  inspection: {
    create: ["inspection", "create"] as const,
    update: (id: string) => ["inspection", "update", id] as const,
    delete: (id: string) => ["inspection", "delete", id] as const,
  },
} as const;
