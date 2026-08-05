import { ROUTES } from "@/config/routes";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import {
  LegalDocLayout,
  LegalSectionBlock,
} from "@/modules/torres-consulta/components/marketing/legal-doc-layout";

const SECTIONS = [
  { id: "aceitacao", title: "Aceitação" },
  { id: "servico", title: "O serviço" },
  { id: "cadastro", title: "Cadastro e conta" },
  { id: "pagamentos", title: "Pagamentos" },
  { id: "relatorios", title: "Relatórios" },
  { id: "responsabilidades", title: "Responsabilidades" },
  { id: "propriedade", title: "Propriedade intelectual" },
  { id: "alteracoes", title: "Alterações" },
  { id: "foro", title: "Foro" },
];

export function TermsPage() {
  return (
    <MarketingShell
      seo={{
        title: "Termos de Uso",
        description:
          "Termos de Uso da plataforma Torres Consulta. Condições para utilização do serviço de consulta veicular.",
        canonicalPath: ROUTES.termos,
      }}
      breadcrumb={[{ label: "Termos de Uso" }]}
      hero={{
        eyebrow: "Legal",
        title: "Termos de Uso",
        description: "Leia atentamente antes de utilizar a plataforma Torres Consulta.",
        compact: true,
      }}
      fullWidth
    >
      <LegalDocLayout sections={SECTIONS}>
        <LegalSectionBlock id="aceitacao" title="1. Aceitação dos termos">
          <p>
            Ao acessar ou utilizar a Torres Consulta, você declara ter lido, compreendido e aceito
            estes Termos de Uso e a Política de Privacidade. O serviço destina-se a pessoas físicas
            maiores de 18 anos.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="servico" title="2. Descrição do serviço">
          <p>
            A Torres Consulta disponibiliza relatórios veiculares consolidados a partir de bases de
            dados de terceiros. As informações refletem o estado das fontes no momento da consulta
            e não constituem garantia absoluta sobre o veículo.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="cadastro" title="3. Cadastro e conta">
          <p>
            O usuário é responsável pela veracidade dos dados cadastrais e pela confidencialidade de
            suas credenciais. É vedado compartilhar acesso ou utilizar a conta para fins ilícitos.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="pagamentos" title="4. Pagamentos">
          <p>
            Os preços são exibidos antes da confirmação. O pagamento é processado por gateway
            terceirizado. Reembolsos seguem política específica disponível na Central de Ajuda.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="relatorios" title="5. Relatórios">
          <p>
            Após confirmação do pagamento, o relatório fica disponível na área do cliente e pode ser
            baixado em PDF. O acesso é pessoal e intransferível.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="responsabilidades" title="6. Limitação de responsabilidade">
          <p>
            A Torres Consulta não se responsabiliza por decisões de compra baseadas exclusivamente
            nos relatórios. Recomendamos vistoria presencial e verificação documental complementar.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="propriedade" title="7. Propriedade intelectual">
          <p>
            Marca, layout, software e conteúdo da plataforma são protegidos. É proibida reprodução
            não autorizada dos relatórios para revenda ou redistribuição comercial.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="alteracoes" title="8. Alterações">
          <p>
            Podemos atualizar estes termos mediante publicação na plataforma. O uso continuado após
            alterações implica aceitação da nova versão.
          </p>
        </LegalSectionBlock>
        <LegalSectionBlock id="foro" title="9. Foro">
          <p>
            Fica eleito o foro da comarca do domicílio do consumidor para dirimir controvérsias,
            conforme o Código de Defesa do Consumidor.
          </p>
        </LegalSectionBlock>
      </LegalDocLayout>
    </MarketingShell>
  );
}
