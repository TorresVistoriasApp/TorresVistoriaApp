import type { Consulta, ConsultaFilters } from "@/modules/torres-consulta/types/consulta";

/**
 * Contrato de persistência das consultas.
 *
 * O service depende desta interface, nunca de um cliente de banco. Quando a
 * migration criar `vehicle_queries`, basta acrescentar um adaptador Supabase e
 * trocar o registro — nenhuma tela ou hook muda.
 */
export interface ConsultaRepository {
  list(tenantId: string, filters?: ConsultaFilters): Promise<Consulta[]>;
  findById(tenantId: string, id: string): Promise<Consulta | null>;
  save(consulta: Consulta): Promise<Consulta>;
}

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
    async list(tenantId, filters) {
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
      // Checagem de tenant no adaptador espelha o que a RLS fará no banco.
      return found && found.tenantId === tenantId ? found : null;
    },

    async save(consulta) {
      store.set(consulta.id, consulta);
      return consulta;
    },
  };
}

/** Instância ativa do repositório. Trocável no bootstrap ou em testes. */
let repository: ConsultaRepository = createInMemoryConsultaRepository();

export function setConsultaRepository(next: ConsultaRepository): void {
  repository = next;
}

export function getConsultaRepository(): ConsultaRepository {
  return repository;
}
