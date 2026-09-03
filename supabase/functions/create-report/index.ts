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
import {
  buildOfficialLaudoPdf,
  type OfficialChecklistItem,
  type OfficialCompany,
  type OfficialInspection,
  type OfficialPhotoItem,
} from "../_shared/official-laudo-pdf.ts";

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
    if (!inspectionId) throw new Error("inspectionId é obrigatório");

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

    const [
      { data: checklist },
      { data: photos },
      { data: company },
      { data: inspector },
      { data: existingReports, error: existingError },
    ] = await Promise.all([
      supabase
        .from("inspection_checklists")
        .select("id, category, item_name, status, notes")
        .eq("inspection_id", row.id)
        .is("deleted_at", null)
        .order("category", { ascending: true }),
      supabase
        .from("inspection_photos")
        .select("id, category, storage_path")
        .eq("inspection_id", row.id)
        .is("deleted_at", null)
        .order("category", { ascending: true }),
      supabase
        .from("companies")
        .select(
          "trade_name, legal_name, document, email, phone, address, address_street, address_number, address_neighborhood, address_city, address_state, address_cep",
        )
        .eq("id", row.tenant_id)
        .maybeSingle(),
      row.inspector_id
        ? supabase.from("profiles").select("full_name").eq("id", row.inspector_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("inspection_reports")
        .select("id, version, verification_code")
        .eq("inspection_id", inspectionId)
        .is("deleted_at", null)
        .order("version", { ascending: false }),
    ]);

    if (existingError) throw existingError;

    const officialChecklist = (checklist ?? []) as OfficialChecklistItem[];
    const officialPhotos = (photos ?? []) as OfficialPhotoItem[];
    const nextVersion = (existingReports?.[0]?.version ?? 0) + 1;
    const code = existingReports?.[0]?.verification_code || buildVerificationCode();
    const storagePath = buildStoragePath(row.tenant_id, row.id, nextVersion);
    const origin = canonicalAppOrigin(req);
    const validationUrl = `${origin}/validar/${encodeURIComponent(code)}`;
    const issuedAt = new Date().toISOString();

    const pdfBytes = await buildOfficialLaudoPdf({
      inspection: row,
      company: (company ?? null) as OfficialCompany | null,
      inspectorName: inspector?.full_name ?? null,
      checklist: officialChecklist,
      photos: officialPhotos,
      verificationCode: code,
      validationUrl,
      issuedAt,
    });

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

