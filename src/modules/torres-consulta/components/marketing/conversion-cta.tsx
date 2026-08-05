import { Link } from "react-router-dom";
import { ArrowRight, FileSearch } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface ConversionCtaProps {
  title?: string;
  description?: string;
  className?: string;
  showSampleLink?: boolean;
}

export function ConversionCta({
  title = "Pronto para consultar seu veículo?",
  description = "Descubra o histórico completo em poucos minutos e tome uma decisão segura na compra.",
  className,
  showSampleLink = true,
}: ConversionCtaProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-white to-orange-50/50 p-8 shadow-soft sm:p-10",
        className,
      )}
    >
      <div className="relative z-10 max-w-xl">
        <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link to={ROUTES.consultaLanding}>
              Consultar Agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {showSampleLink && (
            <Button variant="outline" size="lg" asChild>
              <Link to={ROUTES.relatorioExemplo}>
                <FileSearch className="h-4 w-4" />
                Ver Exemplo de Relatório
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
