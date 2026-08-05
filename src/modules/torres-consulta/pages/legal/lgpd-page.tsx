import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageSeo } from "@/modules/torres-consulta/components/seo/page-seo";

export function LgpdPage() {
  return (
    <>
      <PageSeo
        title="LGPD"
        description="Informações sobre tratamento de dados pessoais na Torres Consulta em conformidade com a LGPD."
      />
      <Card className="mx-auto max-w-3xl border-border/70">
        <CardHeader>
          <CardTitle>LGPD — Lei Geral de Proteção de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            A Torres Consulta trata dados pessoais em conformidade com a Lei nº 13.709/2018 (LGPD),
            garantindo transparência, segurança e os direitos dos titulares.
          </p>
          <section>
            <h2 className="font-semibold text-foreground">Dados coletados</h2>
            <ul className="list-disc pl-5">
              <li>Nome, e-mail e telefone (cadastro)</li>
              <li>Dados de consultas veiculares realizadas</li>
              <li>Registros de acesso e logs de segurança</li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">Seus direitos</h2>
            <ul className="list-disc pl-5">
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos ou desatualizados</li>
              <li>Portabilidade e exportação dos dados</li>
              <li>Exclusão de dados, quando aplicável</li>
              <li>Revogação do consentimento</li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">Como exercer seus direitos</h2>
            <p>
              Acesse a{" "}
              <Link to={ROUTES.clienteSettings} className="font-semibold text-primary hover:underline">
                área de configurações
              </Link>{" "}
              do cliente para solicitar exportação ou exclusão da conta. As solicitações serão
              processadas nos prazos legais.
            </p>
          </section>
          <p>
            <Link to={ROUTES.privacy} className="font-semibold text-primary hover:underline">
              Política de Privacidade completa
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
