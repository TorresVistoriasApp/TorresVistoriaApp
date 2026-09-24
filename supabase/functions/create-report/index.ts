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
import type { OfficialInspection } from "../_shared/inspection-row.ts";
import {
  buildLaudoContentDigest,
  pdfContainsBindingMarkers,
  type ChecklistDigestRow,
} from "../_shared/laudo-content-digest.ts";
import {
  issueTokenExpiresAt,
  signReportIssueToken,
  verifyReportIssueToken,
} from "../_shared/report-issue-token.ts";

const MAX_PDF_BYTES = 40 * 1024 * 1024;

type InspectionRow = OfficialInspection & {
  id: string;
  tenant_id: string;
  created_by: string;
  inspector_id: string | null;
  status: string;
  deleted_at: string | null;
  updated_at: string | null;
};

const INSPECTION_SELECT = [
  "id",
  "tenant_id",
  "created_by",
  "inspector_id",
  "status",
  "deleted_at",
  "updated_at",
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

async function loadIssueContext(
  supabase: ReturnType<typeof import("../_shared/supabase-client.ts").createServiceClient>,
  inspectionId: string,
) {
  const [
    { data: checklist },
    { data: photos },
    { data: existingReports, error: existingError },
  ] = await Promise.all([
    supabase
      .from("inspection_checklists")
      .select("id, category, item_name, status, notes")
      .eq("inspection_id", inspectionId)
      .is("deleted_at", null)
      .order("category", { ascending: true }),
    supabase
      .from("inspection_photos")
      .select("id")
      .eq("inspection_id", inspectionId)
      .is("deleted_at", null),
    supabase
      .from("inspection_reports")
      .select("id, version, verification_code, storage_path, integrity_hash")
      .eq("inspection_id", inspectionId)
      .is("deleted_at", null)
      .order("version", { ascending: false }),
  ]);

  if (existingError) throw existingError;

  return {
    checklist: (checklist ?? []) as ChecklistDigestRow[],
    photoCount: photos?.length ?? 0,
    existingReports: existingReports ?? [],
  };
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
    const issueToken = typeof body.issueToken === "string" ? body.issueToken.trim() : "";
    const verificationCodeBody =
      typeof body.verificationCode === "string" ? body.verificationCode.trim() : "";
    const contentDigestBody =
      typeof body.contentDigest === "string" ? body.contentDigest.trim() : "";

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

    const { checklist, photoCount, existingReports } = await loadIssueContext(supabase, inspectionId);
    const nextVersion = (existingReports[0]?.version ?? 0) + 1;
    const code = existingReports[0]?.verification_code || buildVerificationCode();
    const origin = canonicalAppOrigin(req);
    const validationUrl = `${origin}/validar/${encodeURIComponent(code)}`;

    const contentDigest = await buildLaudoContentDigest({
      inspection: row,
      checklist,
      photoCount,
      verificationCode: code,
      nextVersion,
    });

    if (!pdfBase64) {
      const expMs = issueTokenExpiresAt();
      const issueTokenSigned = await signReportIssueToken({
        inspectionId,
        tenantId: row.tenant_id,
        verificationCode: code,
        contentDigest,
        nextVersion,
        expMs,
      });

      return new Response(
        JSON.stringify({
          success: true,
          needsClientPdf: true,
          verificationCode: code,
          validationUrl,
          contentDigest,
          issueToken: issueTokenSigned,
          nextVersion,
          official: true,
        }),
        { headers: jsonHeaders, status: 200 },
      );
    }

    if (!issueToken || !verificationCodeBody || !contentDigestBody) {
      throw new Error("Emissão incompleta: token, código e digest são obrigatórios.");
    }

    const tokenPayload = await verifyReportIssueToken(issueToken);
    if (tokenPayload.inspectionId !== inspectionId) {
      throw new Error("Token de emissão não corresponde à vistoria.");
    }
    if (tokenPayload.tenantId !== row.tenant_id) {
      throw new Error("Token de emissão inválido para este tenant.");
    }
    if (tokenPayload.verificationCode !== verificationCodeBody || tokenPayload.verificationCode !== code) {
      throw new Error("Código de verificação divergente.");
    }
    if (tokenPayload.contentDigest !== contentDigestBody || tokenPayload.contentDigest !== contentDigest) {
      throw new Error("Os dados da vistoria mudaram desde o início da emissão. Gere o laudo novamente.");
    }
    if (tokenPayload.nextVersion !== nextVersion) {
      throw new Error("Versão de emissão desatualizada. Gere o laudo novamente.");
    }

    const pdfBytes = decodePdfBase64(pdfBase64);
    if (pdfBytes.byteLength < 128 || pdfBytes.byteLength > MAX_PDF_BYTES) {
      throw new Error("Arquivo PDF inválido ou fora do limite.");
    }
    if (pdfBytes[0] !== 0x25 || pdfBytes[1] !== 0x50 || pdfBytes[2] !== 0x44 || pdfBytes[3] !== 0x46) {
      throw new Error("O conteúdo enviado não é um PDF.");
    }

    if (!(await pdfContainsBindingMarkers(pdfBytes, verificationCodeBody, contentDigestBody))) {
      throw new Error("O PDF não contém o código e o digest oficiais desta vistoria.");
    }

    const storagePath = buildStoragePath(row.tenant_id, row.id, nextVersion);
    const integrityHash = await sha256Hex(pdfBytes);

    const { error: uploadError } = await supabase.storage.from("reports").upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const supersededAt = new Date().toISOString();
    if (existingReports.length > 0) {
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
        contentDigest,
        storagePath,
        validationUrl,
        supersededPrevious: existingReports.length > 0,
        official: true,
      }),
      { headers: jsonHeaders, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonError(corsHeaders, 400, message);
  }
});
