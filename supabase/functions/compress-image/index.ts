import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageBase64, maxWidth = 1920 } = await req.json();
    if (!imageBase64) throw new Error("imageBase64 é obrigatório");

    const imageBuffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));

    return new Response(
      JSON.stringify({
        success: true,
        originalSize: imageBuffer.length,
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
