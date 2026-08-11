import { db } from "@/infra/supabase/client";
import type { Database, Json } from "@/infra/supabase/database.types";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";
import type { ConsumerConsulta } from "@/modules/torres-consulta/domain/entities/consumer-consulta";
import type { ConsumerConsultaRepository } from "@/modules/torres-consulta/domain/repositories/consumer-consulta-repository";
import type { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";

type ConsumerConsultaRow = Database["public"]["Tables"]["consumer_consultas"]["Row"];
type ConsumerConsultaInsert = Database["public"]["Tables"]["consumer_consultas"]["Insert"];

type ConsumerCreditBalanceRow = {
  available: number;
  pending: number;
};

function mapResultPayload(payload: Json | null): Record<string, unknown> | null {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  return payload as Record<string, unknown>;
}

function mapRow(row: ConsumerConsultaRow): ConsumerConsulta {
  return {
    id: row.id,
    consumerId: row.consumer_id,
    planName: row.plan_name,
    queryType: row.query_type as VehicleQueryType,
    plate: row.plate,
    chassis: row.chassis,
    status: row.status as ConsultaStatus,
    creditsCharged: row.credits_charged,
    failureReason: row.failure_reason,
    documentUrl: row.document_url,
    resultPayload: mapResultPayload(row.result_payload),
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

function mapToRow(consulta: ConsumerConsulta): ConsumerConsultaInsert {
  return {
    id: consulta.id,
    consumer_id: consulta.consumerId,
    plan_name: consulta.planName,
    query_type: consulta.queryType,
    plate: consulta.plate,
    chassis: consulta.chassis,
    status: consulta.status,
    credits_charged: consulta.creditsCharged,
    failure_reason: consulta.failureReason,
    document_url: consulta.documentUrl,
    result_payload: consulta.resultPayload as Json | null,
    completed_at: consulta.completedAt,
  };
}

export function createSupabaseConsumerConsultaRepository(): ConsumerConsultaRepository {
  return {
    async list(consumerId, filters) {
      let query = db
        .from("consumer_consultas")
        .select("*")
        .eq("consumer_id", consumerId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));

      let rows = (data as ConsumerConsultaRow[]) ?? [];

      if (filters?.search) {
        const term = filters.search.trim().toUpperCase();
        rows = rows.filter(
          (row) => row.plate?.includes(term) || row.chassis?.includes(term),
        );
      }

      return rows.map(mapRow);
    },

    async findById(consumerId, id) {
      const { data, error } = await db
        .from("consumer_consultas")
        .select("*")
        .eq("consumer_id", consumerId)
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
      return data ? mapRow(data as ConsumerConsultaRow) : null;
    },

    async save(consulta) {
      const payload = mapToRow(consulta);
      const { data, error } = await db
        .from("consumer_consultas")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
      return mapRow(data as ConsumerConsultaRow);
    },

    async getCreditBalance(consumerId) {
      const { data, error } = await db
        .from("consumer_credit_balances")
        .select("available, pending")
        .eq("consumer_id", consumerId)
        .maybeSingle();

      if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));

      const row = data as ConsumerCreditBalanceRow | null;
      return {
        available: row?.available ?? 0,
        pending: row?.pending ?? 0,
      };
    },
  };
}

let repository: ConsumerConsultaRepository = createSupabaseConsumerConsultaRepository();

export function setConsumerConsultaRepository(next: ConsumerConsultaRepository): void {
  repository = next;
}

export function getConsumerConsultaRepository(): ConsumerConsultaRepository {
  return repository;
}
