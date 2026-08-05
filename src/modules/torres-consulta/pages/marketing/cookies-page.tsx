import { ROUTES } from "@/config/routes";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import {
  LegalDocLayout,
  LegalSectionBlock,
} from "@/modules/torres-consulta/components/marketing/legal-doc-layout";

const SECTIONS = [
  { id: "o-que-sao", title: "O que são cookies" },
  { id: "tipos", title: "Tipos utilizados" },
  { id: "gerenciar", title: "Como gerenciar" },
];

export function CookiesPage() {
  return (
    <MarketingShell
      seo={{
        title: "Política de Cookies",
        description: "Saiba como a Torres Consulta utiliza cookies e tecnologias similares.",
        canonicalPath: ROUTES.cookies,
      }}
      breadcrumb={[{ label: "Cookies" }]}
      hero={{
        eyebrow: "Legal",
        title: "Política de Cookies",
        description: "Transparência sobre cookies essenciais e de preferência na plataforma.",
        compact: true,
      }}
      fullWidth
    >
      <LegalDocLayout sections={SECTIONS}>
        <LegalSectionBlock id="o-que-sao" title="O que são cookies">
          <p>
            Cookies são pequenos arquivos armazenados no seu dispositivo para lembrar preferências,
            manter sua sessão autenticada e melhorar a experiência de navegação.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="tipos" title="Tipos que utilizamos">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Essenciais:</strong> necessários para login, segurança e funcionamento da plataforma.</li>
            <li><strong>Preferência:</strong> lembram configurações como consentimento LGPD.</li>
            <li><strong>Analíticos:</strong> quando habilitados, ajudam a entender uso agregado da plataforma.</li>
          </ul>
        </LegalSectionBlock>
        <LegalSectionBlock id="gerenciar" title="Como gerenciar">
          <p>
            Você pode bloquear cookies nas configurações do navegador. Note que cookies essenciais
            são necessários para autenticação e algumas funcionalidades podem deixar de funcionar.
          </p>
        </LegalSectionBlock>
      </LegalDocLayout>
    </MarketingShell>
  );
}
