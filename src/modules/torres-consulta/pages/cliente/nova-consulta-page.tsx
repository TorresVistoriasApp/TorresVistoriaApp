import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { HeroConsultaForm } from "@/modules/torres-consulta/components/landing/hero-consulta-form";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

/**
 * Fluxo de nova consulta B2C — captura placa/chassi antes do checkout futuro.
 * Integração com APIs externas será adicionada em etapa posterior.
 */
export function ConsultaAppNovaConsultaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Nova consulta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe a placa ou o chassi do veículo para iniciar sua consulta veicular.
        </p>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            Consultar veículo
          </CardTitle>
          <CardDescription>
            Escolha placa ou chassi e continue para cadastro ou login, se necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroConsultaForm />
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="outline" asChild>
          <Link to={ROUTES.consultaLanding}>Ver planos na página inicial</Link>
        </Button>
      </div>
    </div>
  );
}
