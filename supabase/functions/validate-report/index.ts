import { getCorsHeaders } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function formatLaudoNumber(inspectionNumber: number, issuedAt: string): string {
  const yearMatch = issuedAt.match(/^(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date(issuedAt).getFullYear();
  return `TV-${year}-${String(inspectionNumber).padStart(6, "0")}`;
}

function formatDatePtBr(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = req.method === "GET"
      ? { verificationCode: new URL(req.url).searchParams.get("code") }
      : await req.json();

    const verificationCode = String(body?.verificationCode ?? "").trim();
    if (!verificationCode) throw new Error("Código de verificação é obrigatório");

    const supabase = createServiceClient();

    const { data: report, error: reportError } = await supabase
      .from("inspection_reports")
      .select(`
        id,
        version,
        storage_path,
        integrity_hash,
        verification_code,
        created_at,
        inspection:inspections!inner (
          inspection_number,
          inspection_date,
          deleted_at
        ),
        company:companies!inner (
          name
        )
      `)
      .eq("verification_code", verificationCode)
      .is("deleted_at", null)
      .maybeSingle();

    if (reportError) throw reportError;

    const inspection = report?.inspection as {
      inspection_number: number;
      inspection_date: string;
      deleted_at: string | null;
    } | null;
    const company = report?.company as { name: string } | null;

    if (!report || !inspection || inspection.deleted_at) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: "Código de verificação não encontrado",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    let hashStatus: "OK" | "FALHA" | "INDISPONIVEL" = "INDISPONIVEL";
    let integrityVerified = false;

    if (report.storage_path && report.integrity_hash) {
      const { data: pdfBlob, error: downloadError } = await supabase.storage
        .from("reports")
        .download(report.storage_path);

      if (!downloadError && pdfBlob) {
        const computedHash = await sha256Hex(await pdfBlob.arrayBuffer());
        integrityVerified = computedHash === report.integrity_hash;
        hashStatus = integrityVerified ? "OK" : "FALHA";
      }
    }

    const issuedAt = report.created_at;
    const laudoNumber = formatLaudoNumber(inspection.inspection_number, issuedAt);
    const status = hashStatus === "OK"
      ? "Documento íntegro"
      : hashStatus === "FALHA"
      ? "Documento adulterado"
      : "Arquivo indisponível para verificação";

    return new Response(
      JSON.stringify({
        valid: true,
        integrityVerified,
        hashStatus,
        status,
        companyName: company?.name ?? "Torres Vistoria",
        laudoNumber,
        verificationCode: report.verification_code,
        issuedAt,
        issuedAtFormatted: formatDatePtBr(issuedAt),
        inspectionNumber: inspection.inspection_number,
        inspectionDate: inspection.inspection_date,
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
