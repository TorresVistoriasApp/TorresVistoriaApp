import { ROUTES } from "@/config/routes";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import {
  LegalDocLayout,
  LegalSectionBlock,
} from "@/modules/torres-consulta/components/marketing/legal-doc-layout";

const SECTIONS = [
  { id: "introducao", title: "Introdução" },
  { id: "dados-coletados", title: "Dados coletados" },
  { id: "finalidade", title: "Finalidade do tratamento" },
  { id: "base-legal", title: "Base legal" },
  { id: "compartilhamento", title: "Compartilhamento" },
  { id: "direitos", title: "Seus direitos" },
  { id: "seguranca", title: "Segurança" },
  { id: "retencao", title: "Retenção" },
  { id: "contato-dpo", title: "Contato do encarregado" },
];

export function PrivacyPage() {
  return (
    <MarketingShell
      seo={{
        title: "Política de Privacidade",
        description:
          "Política de Privacidade da Torres Consulta em conformidade com a LGPD. Saiba como tratamos seus dados pessoais.",
        canonicalPath: ROUTES.privacy,
      }}
      breadcrumb={[{ label: "Privacidade" }]}
      hero={{
        eyebrow: "Legal",
        title: "Política de Privacidade",
        description: "Última atualização: agosto de 2026. Documento em conformidade com a Lei 13.709/2018 (LGPD).",
        compact: true,
      }}
      fullWidth
    >
      <LegalDocLayout sections={SECTIONS}>
        <LegalSectionBlock id="introducao" title="1. Introdução">
          <p>
            A Torres Consulta, integrante do Ecossistema Torres, respeita a privacidade dos
            usuários e trata dados pessoais com transparência, segurança e em conformidade com a
            legislação brasileira.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="dados-coletados" title="2. Dados coletados">
          <ul className="list-disc space-y-1 pl-5">
            <li>Dados de cadastro: nome, e-mail, telefone e senha (criptografada).</li>
            <li>Dados de consulta: placa, chassi e histórico de relatórios solicitados.</li>
            <li>Dados de pagamento: processados por gateway certificado; não armazenamos dados completos de cartão.</li>
            <li>Dados técnicos: IP, navegador, logs de acesso para segurança e auditoria.</li>
          </ul>
        </LegalSectionBlock>
        <LegalSectionBlock id="finalidade" title="3. Finalidade do tratamento">
          <p>
            Utilizamos seus dados para prestar o serviço de consulta veicular, processar pagamentos,
            enviar relatórios, prestar suporte, cumprir obrigações legais e melhorar a plataforma.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="base-legal" title="4. Base legal">
          <p>
            O tratamento fundamenta-se em execução de contrato, consentimento, legítimo interesse e
            cumprimento de obrigação legal, conforme art. 7º da LGPD.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="compartilhamento" title="5. Compartilhamento">
          <p>
            Compartilhamos dados apenas com provedores essenciais (hospedagem, pagamento, bases de
            consulta veicular) sob contratos que garantem proteção adequada. Não vendemos dados
            pessoais.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="direitos" title="6. Seus direitos">
          <p>
            Você pode solicitar acesso, correção, portabilidade, exclusão, revogação de consentimento
            e informações sobre compartilhamento. Utilize a área Configurações ou o formulário de
            contato.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="seguranca" title="7. Segurança">
          <p>
            Adotamos criptografia TLS, controle de acesso, autenticação segura e monitoramento
            contínuo. Incidentes são tratados conforme prazos legais de notificação.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="retencao" title="8. Retenção">
          <p>
            Mantemos dados pelo tempo necessário à prestação do serviço e obrigações legais. Após
            solicitação de exclusão, o processamento segue prazos regulamentares.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="contato-dpo" title="9. Encarregado de dados">
          <p>
            Dúvidas sobre privacidade: privacidade@torresconsulta.com.br
          </p>
        </LegalSectionBlock>
      </LegalDocLayout>
    </MarketingShell>
  );
}
