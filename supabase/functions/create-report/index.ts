import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

function randomHash(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function verificationCode(): string {
  return `TV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { inspectionId, storagePath = "pending/client-side.pdf" } = await req.json();
    if (!inspectionId) throw new Error("inspectionId é obrigatório");

    const supabase = createServiceClient();

    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .select("id, company_id, inspector_id, status")
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
    const code = verificationCode();
    const hash = randomHash();

    const { data: report, error: reportError } = await supabase
      .from("inspection_reports")
      .insert({
        inspection_id: inspectionId,
        company_id: inspection.company_id,
        version: nextVersion,
        storage_path: storagePath,
        verification_code: code,
        integrity_hash: hash,
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
