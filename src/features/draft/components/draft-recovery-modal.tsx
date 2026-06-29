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
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <FileWarning className="size-6" aria-hidden />
          </div>
          <DialogTitle className="text-center">Encontramos uma vistoria em andamento</DialogTitle>
          <DialogDescription className="text-center">
            Você possui um rascunho salvo automaticamente. Deseja continuar de onde parou?
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Cliente</dt>
            <dd className="font-medium text-right">{draft.client_name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Placa</dt>
            <dd className="font-medium">{formatPlate(draft.plate)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Progresso</dt>
            <dd className="font-semibold text-primary">{draft.completion_percent}%</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Iniciada em</dt>
            <dd>{createdAt}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Última alteração</dt>
            <dd>{updatedAt}</dd>
          </div>
        </dl>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full touch-target" onClick={onContinue} disabled={isBusy}>
            Continuar vistoria
          </Button>
          <Button
            variant="outline"
            className="w-full touch-target"
            onClick={onStartNew}
            disabled={isBusy}
          >
            Iniciar nova vistoria
          </Button>
          <Button
            variant="ghost"
            className="w-full touch-target text-destructive hover:text-destructive"
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
