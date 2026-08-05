import { PlugZap } from "lucide-react";
import {
  ConsultaUnavailableReason,
  missingIntegrations,
} from "@/modules/torres-consulta/services/consulta-service";

const REASON_LABELS: Record<ConsultaUnavailableReason, string> = {
  [ConsultaUnavailableReason.PROVIDER]: "Provedor de consulta veicular",
  [ConsultaUnavailableReason.CREDITS]: "Sistema de créditos",
};

/**
 * Estado exibido enquanto as integrações do módulo não têm adaptador.
 *
 * A arquitetura do Torres Consulta está pronta; o que falta é conectar os
 * provedores externos. Explicitar isso na tela evita a impressão de erro.
 */
export function IntegrationPendingNotice() {
  const pending = missingIntegrations();
  if (pending.length === 0) return null;

  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <PlugZap className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="text-xl font-bold tracking-tight">Integração pendente</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        O Torres Consulta já está integrado à plataforma, mas ainda aguarda a conexão dos serviços
        externos abaixo.
      </p>
      <ul className="mx-auto mt-4 flex max-w-xs flex-col gap-2">
        {pending.map((reason) => (
          <li
            key={reason}
            className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-medium"
          >
            {REASON_LABELS[reason]}
          </li>
        ))}
      </ul>
    </div>
  );
}
