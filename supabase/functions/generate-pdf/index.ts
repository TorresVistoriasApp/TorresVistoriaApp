import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { inspectionId } = await req.json();
    if (!inspectionId) throw new Error("inspectionId é obrigatório");

    const supabase = createServiceClient();
    const { data: inspection, error } = await supabase
      .from("inspections")
      .select(`
        *,
        inspection_checklists (*),
        inspection_photos (*),
        inspection_comments (*),
        inspector:profiles!inspections_inspector_id_fkey (full_name)
      `)
      .eq("id", inspectionId)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    if (!inspection) throw new Error("Vistoria não encontrada");

    const payload = JSON.stringify(inspection);
    const contentHash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload))),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const verificationCode = `TV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    return new Response(
      JSON.stringify({
        success: true,
        inspection,
        hash: contentHash,
        verificationCode,
        generatedAt: new Date().toISOString(),
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
