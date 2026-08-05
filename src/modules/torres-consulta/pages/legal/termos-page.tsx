import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageSeo } from "@/modules/torres-consulta/components/seo/page-seo";

export function TermosPage() {
  return (
    <>
      <PageSeo
        title="Termos de Uso"
        description="Termos de uso da plataforma Torres Consulta para consulta veicular de pessoa física."
      />
      <Card className="mx-auto max-w-3xl border-border/70">
        <CardHeader>
          <CardTitle>Termos de Uso — Torres Consulta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Ao utilizar a plataforma Torres Consulta, você concorda com estes termos. O serviço é
            destinado a pessoas físicas que desejam consultar informações veiculares antes de uma
            compra.
          </p>
          <section>
            <h2 className="font-semibold text-foreground">1. Serviço</h2>
            <p>
              A Torres Consulta disponibiliza relatórios veiculares com base em bases de dados de
              terceiros. As informações são fornecidas no estado em que se encontram nas fontes
              originais.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">2. Responsabilidades</h2>
            <p>
              O usuário é responsável pela veracidade dos dados informados e pelo uso adequado dos
              relatórios obtidos. A Torres não se responsabiliza por decisões de compra baseadas
              exclusivamente nos relatórios.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">3. Pagamentos</h2>
            <p>
              Os valores dos relatórios são informados antes da confirmação. Após o pagamento
              confirmado, o relatório fica disponível para download na área do cliente.
            </p>
          </section>
          <p>
            <Link to={ROUTES.consultaLanding} className="font-semibold text-primary hover:underline">
              Voltar para Torres Consulta
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
