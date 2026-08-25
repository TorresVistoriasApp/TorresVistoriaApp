import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Save } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type DraftAutoSaveBannerProps = {
  draftExpiresAt?: string | null;
  className?: string;
};

export function DraftAutoSaveBanner({ draftExpiresAt, className }: DraftAutoSaveBannerProps) {
  const expiryLabel =
    draftExpiresAt &&
    format(new Date(draftExpiresAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <Save className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Rascunho salvo automaticamente.</p>
          <p>
            Esta vistoria está sendo salva automaticamente. Você possui até 24 horas para concluí-la.
            Após esse prazo ela será removida automaticamente.
          </p>
          {expiryLabel && (
            <p className="flex items-center gap-1">
              <Clock className="size-3" aria-hidden />
              Expira em {expiryLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
