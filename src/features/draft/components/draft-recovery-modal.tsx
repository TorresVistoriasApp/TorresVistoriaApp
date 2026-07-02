import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPlate } from "@/lib/formatters";
import type { ActiveDraftSummary } from "@/features/draft/types";

type DraftRecoveryModalProps = {
  draft: ActiveDraftSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onDelete: () => void;
  onStartNew: () => void;
  isBusy?: boolean;
};

export function DraftRecoveryModal({
  draft,
  open,
  onOpenChange,
  onContinue,
  onDelete,
  onStartNew,
  isBusy = false,
}: DraftRecoveryModalProps) {
  if (!draft) return null;

  const createdAt = format(new Date(draft.created_at), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });
  const updatedAt = format(new Date(draft.updated_at), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(100vw-2rem,26rem)] gap-5 sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-0">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 sm:mt-0.5">
              <FileWarning className="size-5" aria-hidden />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <DialogTitle>Encontramos uma vistoria em andamento</DialogTitle>
              <DialogDescription>
                Você possui um rascunho salvo automaticamente. Deseja continuar de onde parou?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 rounded-lg border border-border/70 bg-muted/20 px-4 py-3.5 text-sm sm:gap-x-6">
          <dt className="text-muted-foreground">Cliente</dt>
          <dd className="font-medium">{draft.client_name}</dd>
          <dt className="text-muted-foreground">Placa</dt>
          <dd className="font-medium tabular-nums">{formatPlate(draft.plate)}</dd>
          <dt className="text-muted-foreground">Progresso</dt>
          <dd className="font-semibold text-primary tabular-nums">{draft.completion_percent}%</dd>
          <dt className="text-muted-foreground">Iniciada em</dt>
          <dd className="tabular-nums">{createdAt}</dd>
          <dt className="text-muted-foreground">Última alteração</dt>
          <dd className="tabular-nums">{updatedAt}</dd>
        </dl>

        <DialogFooter className="flex-col gap-3 sm:flex-col sm:items-stretch">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button className="flex-1 touch-target" onClick={onContinue} disabled={isBusy}>
              Continuar vistoria
            </Button>
            <Button
              variant="outline"
              className="flex-1 touch-target"
              onClick={onStartNew}
              disabled={isBusy}
            >
              Iniciar nova vistoria
            </Button>
          </div>
          <Button
            variant="ghost"
            className="touch-target text-destructive hover:text-destructive sm:self-center"
            onClick={onDelete}
            disabled={isBusy}
          >
            Excluir rascunho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
