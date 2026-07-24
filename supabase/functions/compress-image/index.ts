import { getCorsHeaders } from "../_shared/cors.ts";
import { isAuthFailure, requireCaller } from "../_shared/require-caller.ts";

const MAX_BASE64_CHARS = 200_000;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const caller = await requireCaller(req);
    if (isAuthFailure(caller)) {
      return new Response(JSON.stringify({ error: caller.error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: caller.status,
      });
    }

    const raw = await req.text();
    if (raw.length > MAX_BASE64_CHARS * 1.4) {
      return new Response(JSON.stringify({ error: "Payload excede o limite permitido." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 413,
      });
    }

    const body = JSON.parse(raw) as { imageBase64?: string; maxWidth?: number };
    const { imageBase64, maxWidth = 1920 } = body;
    if (!imageBase64) throw new Error("imageBase64 é obrigatório");
    if (imageBase64.length > MAX_BASE64_CHARS) {
      throw new Error("Imagem muito grande para compressão no servidor");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Use compressão client-side (src/lib/compress-image.ts)",
        recommended: {
          library: "browser-image-compression",
          options: { maxWidthOrHeight: maxWidth, useWebWorker: true, fileType: "image/webp" },
        },
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
