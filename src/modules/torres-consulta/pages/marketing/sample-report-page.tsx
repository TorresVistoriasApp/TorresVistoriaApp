import { ROUTES } from "@/config/routes";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import { SampleReportDocument } from "@/modules/torres-consulta/components/marketing/sample-report-document";
import { ConversionCta } from "@/modules/torres-consulta/components/marketing/conversion-cta";

export function SampleReportPage() {
  return (
    <MarketingShell
      seo={{
        title: "Exemplo de Relatório Veicular",
        description:
          "Veja exatamente o que você recebe ao consultar um veículo na Torres Consulta. Relatório completo com score, histórico, sinistros e muito mais.",
        canonicalPath: ROUTES.relatorioExemplo,
        schema: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Exemplo de Relatório Veicular — Torres Consulta",
          description: "Demonstração interativa do relatório veicular completo.",
        },
      }}
      breadcrumb={[{ label: "Exemplo de Relatório" }]}
      hero={{
        eyebrow: "Transparência total",
        title: "Veja o relatório antes de comprar",
        description:
          "Este é um exemplo fiel do documento que você receberá após a consulta. Dados fictícios para demonstração.",
        compact: true,
      }}
      fullWidth
    >
      <SampleReportDocument />
      <ConversionCta className="mt-10" showSampleLink={false} />
    </MarketingShell>
  );
}
