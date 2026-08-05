import type { Consulta, ConsultaFilters } from "@/modules/torres-consulta/domain/entities/consulta";

/**
 * Porta de persistência do domínio.
 *
 * Use-cases dependem desta interface; o adaptador in-memory (e o futuro
 * Supabase) vivem fora de `domain/`.
 */
export interface ConsultaRepository {
  list(tenantId: string, filters?: ConsultaFilters): Promise<Consulta[]>;
  findById(tenantId: string, id: string): Promise<Consulta | null>;
  save(consulta: Consulta): Promise<Consulta>;
}
