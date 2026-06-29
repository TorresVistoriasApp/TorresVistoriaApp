import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Save } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "rounded-lg border border-sky-200/80 bg-sky-50/70 px-3 py-2.5 text-xs leading-relaxed text-sky-950",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <Save className="mt-0.5 size-3.5 shrink-0 text-sky-700" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium">Rascunho salvo automaticamente.</p>
          <p className="text-sky-900/80">
            Esta vistoria está sendo salva automaticamente. Você possui até 24 horas para concluí-la.
            Após esse prazo ela será removida automaticamente.
          </p>
          {expiryLabel && (
            <p className="flex items-center gap-1 text-sky-800/70">
              <Clock className="size-3" aria-hidden />
              Expira em {expiryLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
