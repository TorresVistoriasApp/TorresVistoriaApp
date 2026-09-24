import { canonicalAppOrigin, getCorsHeaders, rejectNonPost } from "../_shared/cors.ts";
import {
  canAccessInspection,
  isAuthFailure,
  requireCaller,
} from "../_shared/require-caller.ts";
import {
  checkRateLimit,
  clientKey,
  consumePersistentRateLimit,
  rateLimitedResponse,
} from "../_shared/rate-limit.ts";
import { buildVerificationCode, sha256Hex } from "../_shared/verification-code.ts";
import type { OfficialInspection } from "../_shared/official-laudo-pdf.ts";

const MAX_PDF_BYTES = 28 * 1024 * 1024;

type InspectionRow = OfficialInspection & {
  id: string;
  tenant_id: string;
  created_by: string;
  inspector_id: string | null;
  status: string;
  deleted_at: string | null;
};

const INSPECTION_SELECT = [
  "id",
  "tenant_id",
  "created_by",
  "inspector_id",
  "status",
  "deleted_at",
  "inspection_number",
  "inspection_date",
  "inspection_time",
  "location",
  "inspection_purpose",
  "plate",
  "chassis",
  "renavam",
  "brand",
  "model",
  "version",
  "color",
  "fuel",
  "manufacture_year",
  "model_year",
  "mileage",
  "motor_number",
  "vehicle_uf",
  "registration_city_uf",
  "vehicle_category",
  "vehicle_species",
  "passenger_capacity",
  "power_cv",
  "engine_displacement",
  "situation",
  "market_fipe_value",
  "market_average_value",
  "insurance_acceptance_percent",
  "vehicle_condition",
  "is_armored",
  "buyer_name",
  "buyer_document",
  "seller_name",
  "seller_document",
  "client_name",
  "client_document",
  "client_phone",
  "client_email",
  "requester_name",
  "requester_document",
  "opinion",
  "technical_notes",
].join(", ");

function jsonError(
  corsHeaders: Record<string, string>,
  status: number,
  error: string,
): Response {
  return new Response(JSON.stringify({ error }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function buildStoragePath(tenantId: string, inspectionId: string, version: number): string {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${tenantId}/${inspectionId}/laudo-v${version}-${suffix}.pdf`;
}

function decodePdfBase64(value: string): Uint8Array {
  const normalized = value.replace(/^data:application\/pdf;base64,/, "").trim();
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  const methodError = rejectNonPost(req, corsHeaders);
  if (methodError) return methodError;

  try {
    const caller = await requireCaller(req);
    if (isAuthFailure(caller)) {
      return jsonError(corsHeaders, caller.status, caller.error);
    }

    const ip = clientKey(req);
    const memoryLimit = checkRateLimit(`create-report:${caller.userId}:${ip}`, 8, 15 * 60 * 1000);
    if (!memoryLimit.allowed) {
      return rateLimitedResponse(corsHeaders, memoryLimit.retryAfterSec);
    }
    const persisted = await consumePersistentRateLimit(
      caller.supabase,
      `create-report:${caller.tenantId}:${caller.userId}`,
      8,
      15 * 60,
    );
    if (!persisted.allowed) {
      return rateLimitedResponse(corsHeaders, persisted.retryAfterSec);
    }

    const body = (await req.json()) as Record<string, unknown>;
    const inspectionId = typeof body.inspectionId === "string" ? body.inspectionId.trim() : "";
    const pdfBase64 = typeof body.pdfBase64 === "string" ? body.pdfBase64.trim() : "";
    if (!inspectionId) throw new Error("inspectionId é obrigatório");
    if (pdfBase64.length > MAX_PDF_BYTES * 1.4) {
      throw new Error("PDF excede o tamanho máximo permitido.");
    }

    const supabase = caller.supabase;

    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .select(INSPECTION_SELECT)
      .eq("id", inspectionId)
      .is("deleted_at", null)
      .maybeSingle();

    if (inspectionError) throw inspectionError;

    const row = inspection as InspectionRow | null;
    if (!row || !canAccessInspection(caller, row)) {
      return jsonError(corsHeaders, 404, "Vistoria não encontrada");
    }

    if (row.status === "ARCHIVED") {
      return jsonError(corsHeaders, 409, "Vistoria arquivada não pode emitir laudo.");
    }

    const { data: existingReports, error: existingError } = await supabase
      .from("inspection_reports")
      .select("id, version, verification_code")
      .eq("inspection_id", inspectionId)
      .is("deleted_at", null)
      .order("version", { ascending: false });

    if (existingError) throw existingError;

    const nextVersion = (existingReports?.[0]?.version ?? 0) + 1;
    const code = existingReports?.[0]?.verification_code || buildVerificationCode();
    const origin = canonicalAppOrigin(req);
    const validationUrl = `${origin}/validar/${encodeURIComponent(code)}`;

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({
          success: true,
          needsClientPdf: true,
          verificationCode: code,
          validationUrl,
          official: true,
        }),
        { headers: jsonHeaders, status: 200 },
      );
    }

    const pdfBytes = decodePdfBase64(pdfBase64);
    if (pdfBytes.byteLength < 128 || pdfBytes.byteLength > MAX_PDF_BYTES) {
      throw new Error("Arquivo PDF inválido ou fora do limite.");
    }
    if (pdfBytes[0] !== 0x25 || pdfBytes[1] !== 0x50 || pdfBytes[2] !== 0x44 || pdfBytes[3] !== 0x46) {
      throw new Error("O conteúdo enviado não é um PDF.");
    }

    const storagePath = buildStoragePath(row.tenant_id, row.id, nextVersion);
    const integrityHash = await sha256Hex(pdfBytes);

    const { error: uploadError } = await supabase.storage.from("reports").upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const supersededAt = new Date().toISOString();
    if (existingReports && existingReports.length > 0) {
      const { error: supersedeError } = await supabase
        .from("inspection_reports")
        .update({ deleted_at: supersededAt, deleted_by: caller.userId })
        .eq("inspection_id", inspectionId)
        .is("deleted_at", null);
      if (supersedeError) throw supersedeError;
    }

    const { data: report, error: reportError } = await supabase
      .from("inspection_reports")
      .insert({
        inspection_id: inspectionId,
        tenant_id: row.tenant_id,
        version: nextVersion,
        storage_path: storagePath,
        verification_code: code,
        integrity_hash: integrityHash,
        qr_code_data: validationUrl,
        public_url: null,
        generated_by: caller.userId,
        created_by: row.created_by,
      })
      .select()
      .single();

    if (reportError) {
      await supabase.storage.from("reports").remove([storagePath]);
      throw reportError;
    }

    if (row.status !== "COMPLETED") {
      const { error: statusError } = await supabase
        .from("inspections")
        .update({ status: "COMPLETED" })
        .eq("id", inspectionId);
      if (statusError) throw statusError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        report,
        verificationCode: code,
        integrityHash,
        storagePath,
        validationUrl,
        supersededPrevious: (existingReports?.length ?? 0) > 0,
        official: true,
      }),
      { headers: jsonHeaders, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonError(corsHeaders, 400, message);
  }
});

