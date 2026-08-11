import type {
  ConsumerConsulta,
  ConsumerConsultaFilters,
  ConsumerCreditBalance,
} from "@/modules/torres-consulta/domain/entities/consumer-consulta";

export interface ConsumerConsultaRepository {
  list(consumerId: string, filters?: ConsumerConsultaFilters): Promise<ConsumerConsulta[]>;
  findById(consumerId: string, id: string): Promise<ConsumerConsulta | null>;
  save(consulta: ConsumerConsulta): Promise<ConsumerConsulta>;
  getCreditBalance(consumerId: string): Promise<ConsumerCreditBalance>;
}
