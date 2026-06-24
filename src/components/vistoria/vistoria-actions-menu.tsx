import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, ArchiveRestore, MoreVertical, Trash2 } from "lucide-react";
import type { Inspection } from "@/services/inspection-service";
import {
  useArchiveInspection,
  useDeleteInspection,
  useUnarchiveInspection,
} from "@/hooks/use-inspections";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InspectionStatus } from "@/lib/enums";
import { ROUTES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type VistoriaActionsMenuProps = {
  inspection: Pick<Inspection, "id" | "status" | "inspection_number" | "plate" | "opinion">;
  /** Após excluir, redireciona para a listagem */
  redirectOnDelete?: boolean;
  className?: string;
  triggerClassName?: string;
};

export function VistoriaActionsMenu({
  inspection,
  redirectOnDelete = false,
  className,
  triggerClassName,
}: VistoriaActionsMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const archive = useArchiveInspection();
  const unarchive = useUnarchiveInspection();
  const remove = useDeleteInspection();

  const [confirmAction, setConfirmAction] = useState<"archive" | "delete" | null>(null);

  const isArchived = inspection.status === InspectionStatus.ARCHIVED;
  const isPending = archive.isPending || unarchive.isPending || remove.isPending;

  const handleArchive = async () => {
    try {
      await archive.mutateAsync(inspection.id);
      toast("Vistoria arquivada");
      setConfirmAction(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao arquivar vistoria");
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchive.mutateAsync({
        id: inspection.id,
        opinion: inspection.opinion,
      });
      toast("Vistoria restaurada");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao restaurar vistoria");
    }
  };

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(inspection.id);
      toast("Vistoria excluída");
      setConfirmAction(null);
      if (redirectOnDelete) {
        navigate(ROUTES.inspections);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao excluir vistoria");
    }
  };

  return (
    <>
      <div
        className={cn(className)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 shrink-0", triggerClassName)}
              aria-label="Ações da vistoria"
              disabled={isPending}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isArchived ? (
              <DropdownMenuItem onSelect={() => void handleUnarchive()} disabled={isPending}>
                <ArchiveRestore className="h-4 w-4" />
                Desarquivar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => setConfirmAction("archive")} disabled={isPending}>
                <Archive className="h-4 w-4" />
                Arquivar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setConfirmAction("delete")}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirmAction === "archive"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Arquivar vistoria?"
        description={`A vistoria #${inspection.inspection_number} (${inspection.plate}) ficará oculta da listagem principal e poderá ser encontrada pelo filtro "Arquivada".`}
        confirmLabel="Arquivar"
        loading={archive.isPending}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={confirmAction === "delete"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Excluir vistoria?"
        description={`A vistoria #${inspection.inspection_number} (${inspection.plate}) será removida permanentemente do sistema. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        loading={remove.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
