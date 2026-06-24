import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCreateInspectionType,
  useDeleteInspectionType,
  useInspectionTypes,
  useUpdateInspectionType,
} from "@/hooks/use-inspection-types";
import { useToast } from "@/hooks/use-toast";
import { inspectionTypeSchema, type InspectionTypeInput } from "@/schemas/inspection-type";
import type { InspectionType } from "@/services/inspection-type-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/formatters";
import { maskCurrency, parseCurrency } from "@/lib/masks";
import { cn } from "@/lib/utils";

function TypeFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: InspectionType | null;
  onSubmit: (data: InspectionTypeInput) => Promise<void>;
  isPending: boolean;
}) {
  const form = useForm<InspectionTypeInput>({
    resolver: zodResolver(inspectionTypeSchema),
    values: initial
      ? {
          name: initial.name,
          amount: initial.amount,
          is_active: initial.is_active,
          sort_order: initial.sort_order,
        }
      : {
          name: "",
          amount: 0,
          is_active: true,
          sort_order: 0,
        },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar tipo de vistoria" : "Novo tipo de vistoria"}</DialogTitle>
          <DialogDescription>
            Defina o nome e o valor de referência para contabilização interna.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (data) => {
            await onSubmit(data);
            onOpenChange(false);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="type-name">Nome</Label>
            <Input id="type-name" placeholder="Ex.: Vistoria Cautelar" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type-amount">Valor (R$)</Label>
            <Input
              id="type-amount"
              inputMode="decimal"
              placeholder="R$ 0,00"
              defaultValue={initial ? maskCurrency(String(initial.amount)) : ""}
              onChange={(event) => {
                const parsed = parseCurrency(event.target.value) ?? 0;
                form.setValue("amount", parsed, { shouldValidate: true });
                event.target.value = maskCurrency(String(parsed));
              }}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {initial ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InspectionTypesSection({ canEdit }: { canEdit: boolean }) {
  const { data: types = [], isLoading } = useInspectionTypes();
  const createType = useCreateInspectionType();
  const updateType = useUpdateInspectionType();
  const deleteType = useDeleteInspectionType();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InspectionType | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (type: InspectionType) => {
    setEditing(type);
    setDialogOpen(true);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
      <div className="border-b border-border/50 bg-muted/20 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <ClipboardList className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Tipos de vistoria</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Cadastre os tipos e valores usados na contabilização interna e nos relatórios.
              </p>
            </div>
          </div>
          {canEdit && (
            <Button type="button" className="touch-target shrink-0" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo tipo
            </Button>
          )}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : types.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum tipo cadastrado. Adicione o primeiro tipo de vistoria.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border/60">
            {types.map((type) => (
              <li
                key={type.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{type.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Valor de referência: {formatCurrency(type.amount)}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(type)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn("text-destructive hover:text-destructive")}
                      disabled={deleteType.isPending}
                      onClick={async () => {
                        if (!window.confirm(`Excluir "${type.name}"?`)) return;
                        try {
                          await deleteType.mutateAsync(type.id);
                          toast("Tipo de vistoria excluído");
                        } catch (err) {
                          toast(err instanceof Error ? err.message : "Erro ao excluir");
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {!canEdit && (
          <p className="mt-4 text-xs text-muted-foreground">
            Apenas administradores podem gerenciar tipos e valores de vistoria.
          </p>
        )}
      </div>

      {canEdit && (
        <TypeFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          isPending={createType.isPending || updateType.isPending}
          onSubmit={async (data) => {
            try {
              if (editing) {
                await updateType.mutateAsync({ id: editing.id, input: data });
                toast("Tipo de vistoria atualizado");
              } else {
                await createType.mutateAsync(data);
                toast("Tipo de vistoria cadastrado");
              }
            } catch (err) {
              toast(err instanceof Error ? err.message : "Erro ao salvar");
              throw err;
            }
          }}
        />
      )}
    </section>
  );
}
