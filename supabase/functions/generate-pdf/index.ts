import { getCorsHeaders, rejectNonPost } from "../_shared/cors.ts";
import { canAccessInspection, isAuthFailure, requireCaller } from "../_shared/require-caller.ts";
import { enforceCallerRateLimit } from "../_shared/rate-limit.ts";

/**
 * Leitura autorizada da vistoria para prévia no cliente.
 * Não emite laudo, não gera código oficial e não grava arquivo.
 */
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  const methodError = rejectNonPost(req, corsHeaders);
  if (methodError) return methodError;

  try {
    const caller = await requireCaller(req);
    if (isAuthFailure(caller)) {
      return new Response(JSON.stringify({ error: caller.error }), {
        headers: jsonHeaders,
        status: caller.status,
      });
    }

    const limited = await enforceCallerRateLimit(
      req,
      caller.supabase,
      "generate-pdf",
      caller.userId,
      20,
      15 * 60,
      corsHeaders,
      caller.tenantId,
    );
    if (limited) return limited;

    const body = (await req.json()) as Record<string, unknown>;
    const inspectionId = typeof body.inspectionId === "string" ? body.inspectionId.trim() : "";
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

    if (!inspection || !canAccessInspection(caller, inspection)) {
      return new Response(JSON.stringify({ error: "Vistoria não encontrada" }), {
        headers: jsonHeaders,
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        inspection,
        official: false,
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
