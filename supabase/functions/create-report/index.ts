import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

function formatLaudoNumber(inspectionNumber: number, issuedAt: string): string {
  const year = new Date(issuedAt).getFullYear();
  return `TV-${year}-${String(inspectionNumber).padStart(6, "0")}`;
}

function buildVerificationCode(inspectionNumber: number, issuedAt: string, version: number): string {
  const base = formatLaudoNumber(inspectionNumber, issuedAt);
  return version > 1 ? `${base}-V${version}` : base;
}

function randomHash(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      inspectionId,
      storagePath = "pending/client-side.pdf",
      verificationCode: providedVerificationCode,
      integrityHash: providedIntegrityHash,
      qrCodeData = null,
      publicUrl = null,
    } = await req.json();
    if (!inspectionId) throw new Error("inspectionId é obrigatório");

    const supabase = createServiceClient();

    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .select("id, company_id, inspector_id, status, inspection_number")
      .eq("id", inspectionId)
      .is("deleted_at", null)
      .single();

    if (inspectionError) throw inspectionError;
    if (!inspection) throw new Error("Vistoria não encontrada");

    const { data: existingReports } = await supabase
      .from("inspection_reports")
      .select("version")
      .eq("inspection_id", inspectionId)
      .is("deleted_at", null)
      .order("version", { ascending: false })
      .limit(1);

    const nextVersion = (existingReports?.[0]?.version ?? 0) + 1;
    const issuedAt = new Date().toISOString();
    const code = providedVerificationCode ||
      buildVerificationCode(inspection.inspection_number, issuedAt, nextVersion);
    const hash = providedIntegrityHash || randomHash();

    const { data: report, error: reportError } = await supabase
      .from("inspection_reports")
      .insert({
        inspection_id: inspectionId,
        company_id: inspection.company_id,
        version: nextVersion,
        storage_path: storagePath,
        verification_code: code,
        integrity_hash: hash,
        qr_code_data: qrCodeData,
        public_url: publicUrl,
        generated_by: inspection.inspector_id,
      })
      .select()
      .single();

    if (reportError) throw reportError;

    await supabase
      .from("inspections")
      .update({ status: "COMPLETED" })
      .eq("id", inspectionId);

    return new Response(
      JSON.stringify({
        success: true,
        report,
        verificationCode: code,
        message: "Laudo registrado com sucesso",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
