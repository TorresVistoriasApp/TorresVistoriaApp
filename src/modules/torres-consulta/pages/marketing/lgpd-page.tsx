import { ROUTES } from "@/config/routes";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import {
  LegalDocLayout,
  LegalSectionBlock,
} from "@/modules/torres-consulta/components/marketing/legal-doc-layout";
import { Link } from "react-router-dom";

const SECTIONS = [
  { id: "intro", title: "Introdução" },
  { id: "direitos", title: "Seus direitos" },
  { id: "exercicio", title: "Como exercer" },
  { id: "encarregado", title: "Encarregado" },
];

export function LgpdPage() {
  return (
    <MarketingShell
      seo={{
        title: "LGPD",
        description:
          "Informações sobre a Lei Geral de Proteção de Dados na Torres Consulta e como exercer seus direitos.",
        canonicalPath: ROUTES.lgpd,
      }}
      breadcrumb={[{ label: "LGPD" }]}
      hero={{
        eyebrow: "Legal",
        title: "Lei Geral de Proteção de Dados",
        description: "Compromisso com transparência e controle dos seus dados pessoais.",
        compact: true,
      }}
      fullWidth
    >
      <LegalDocLayout sections={SECTIONS}>
        <LegalSectionBlock id="intro" title="Nosso compromisso">
          <p>
            A Torres Consulta trata dados pessoais em conformidade com a Lei nº 13.709/2018 (LGPD),
            garantindo transparência, segurança e respeito aos direitos dos titulares.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="direitos" title="Seus direitos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Confirmação da existência de tratamento</li>
            <li>Acesso aos dados</li>
            <li>Correção de dados incompletos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação</li>
            <li>Portabilidade dos dados</li>
            <li>Revogação do consentimento</li>
          </ul>
        </LegalSectionBlock>
        <LegalSectionBlock id="exercicio" title="Como exercer seus direitos">
          <p>
            Acesse{" "}
            <Link to={ROUTES.clienteSettings} className="font-semibold text-primary hover:underline">
              Configurações
            </Link>{" "}
            na área do cliente para solicitar exportação ou exclusão. Prazos conforme regulamentação
            da ANPD.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="encarregado" title="Encarregado de dados (DPO)">
          <p>E-mail: privacidade@torresconsultas.com.br</p>
        </LegalSectionBlock>
      </LegalDocLayout>
    </MarketingShell>
  );
}
