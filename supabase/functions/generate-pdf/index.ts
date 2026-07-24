import { getCorsHeaders } from "../_shared/cors.ts";
import { canAccessInspection, isAuthFailure, requireCaller } from "../_shared/require-caller.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const caller = await requireCaller(req);
    if (isAuthFailure(caller)) {
      return new Response(JSON.stringify({ error: caller.error }), {
        headers: jsonHeaders,
        status: caller.status,
      });
    }

    const { inspectionId } = await req.json();
    if (!inspectionId) throw new Error("inspectionId é obrigatório");

    const supabase = caller.supabase;
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
      .maybeSingle();

    if (error) throw error;

    // Mesma resposta para inexistente e sem permissão, para não revelar quais IDs existem.
    if (!inspection || !canAccessInspection(caller, inspection)) {
      return new Response(JSON.stringify({ error: "Vistoria não encontrada" }), {
        headers: jsonHeaders,
        status: 404,
      });
    }

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
      { headers: jsonHeaders, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
