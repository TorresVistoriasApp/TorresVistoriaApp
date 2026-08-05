import type { ConsultaRepository } from "@/modules/torres-consulta/domain/repositories/consulta-repository";
import type { Consulta, ConsultaFilters } from "@/modules/torres-consulta/domain/entities/consulta";

export type { ConsultaRepository };

/**
 * Adaptador em memória, escopo da aba do navegador.
 *
 * Existe para que o módulo funcione ponta a ponta antes da migration de
 * `vehicle_queries`. Deliberadamente não grava no Supabase: referenciar uma
 * tabela inexistente quebraria a aplicação em produção.
 */
export function createInMemoryConsultaRepository(): ConsultaRepository {
  const store = new Map<string, Consulta>();

  const scopedTo = (tenantId: string) =>
    [...store.values()]
      .filter((item) => item.tenantId === tenantId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    async list(tenantId, filters?: ConsultaFilters) {
      let results = scopedTo(tenantId);

      if (filters?.type) {
        results = results.filter((item) => item.type === filters.type);
      }
      if (filters?.status) {
        results = results.filter((item) => item.status === filters.status);
      }
      if (filters?.search) {
        const term = filters.search.trim().toUpperCase();
        results = results.filter(
          (item) => item.plate?.includes(term) || item.chassis?.includes(term),
        );
      }

      return results;
    },

    async findById(tenantId, id) {
      const found = store.get(id);
      return found && found.tenantId === tenantId ? found : null;
    },

    async save(consulta) {
      store.set(consulta.id, consulta);
      return consulta;
    },
  };
}

let repository: ConsultaRepository = createInMemoryConsultaRepository();

export function setConsultaRepository(next: ConsultaRepository): void {
  repository = next;
}

export function getConsultaRepository(): ConsultaRepository {
  return repository;
}
