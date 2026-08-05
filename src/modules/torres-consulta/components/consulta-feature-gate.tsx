import type { ReactNode } from "react";
import { FeatureFlagGate } from "@/core/feature-flags";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/config/routes";
import { Link } from "react-router-dom";

function ConsultaDisabledFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="surface w-full max-w-md space-y-4 p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Torres Consulta indisponível</h1>
        <p className="text-sm text-muted-foreground">
          Este módulo está desativado pela configuração da plataforma. Contate o suporte se
          precisar habilitá-lo.
        </p>
        <Button asChild className="w-full">
          <Link to={ROUTES.dashboard}>Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}

/** Só renderiza o módulo quando a flag `torres-consulta` está ligada. */
export function ConsultaFeatureGate({ children }: { children: ReactNode }) {
  return (
    <FeatureFlagGate flag="torres-consulta" fallback={<ConsultaDisabledFallback />}>
      {children}
    </FeatureFlagGate>
  );
}
