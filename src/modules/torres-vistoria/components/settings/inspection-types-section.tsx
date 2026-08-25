import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCreateInspectionType,
  useDeleteInspectionType,
  useInspectionTypes,
  useUpdateInspectionType,
} from "@/modules/torres-vistoria/hooks/use-inspection-types";
import { useToast } from "@/shared/hooks/use-toast";
import { inspectionTypeSchema, type InspectionTypeInput } from "@/modules/torres-vistoria/schemas/inspection-type";
import type { InspectionType } from "@/modules/torres-vistoria/services/inspection-type-service";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/components/forms/form-field";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { formatCurrency } from "@/shared/lib/formatters";
import { maskCurrency, parseCurrency } from "@/shared/lib/masks";
import { cn } from "@/shared/lib/utils";
import {
  SETTINGS_FIELD_LABEL_CLASS,
  SettingsNotice,
  SettingsSection,
} from "@/shared/components/settings/settings-section";

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
      <DialogContent className="w-[calc(100%-1rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar tipo de vistoria" : "Novo tipo de vistoria"}</DialogTitle>
          <DialogDescription>
            Defina a nomenclatura e o valor de referência para contabilização interna e relatórios.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(async (data) => {
            await onSubmit(data);
            onOpenChange(false);
          })}
        >
          <FormField
            label="Nome do tipo"
            labelClassName={SETTINGS_FIELD_LABEL_CLASS}
            error={form.formState.errors.name?.message}
          >
            <Input
              id="type-name"
              className="touch-target"
              placeholder="Ex.: Vistoria cautelar"
              {...form.register("name")}
            />
          </FormField>
          <FormField
            label="Valor de referência (R$)"
            labelClassName={SETTINGS_FIELD_LABEL_CLASS}
            hint="Valor utilizado para cálculos internos e indicadores financeiros."
            error={form.formState.errors.amount?.message}
          >
            <Input
              id="type-amount"
              className="touch-target"
              inputMode="decimal"
              placeholder="R$ 0,00"
              defaultValue={initial ? maskCurrency(String(initial.amount)) : ""}
              onChange={(event) => {
                const parsed = parseCurrency(event.target.value) ?? 0;
                form.setValue("amount", parsed, { shouldValidate: true });
                event.target.value = maskCurrency(String(parsed));
              }}
            />
          </FormField>
          <DialogFooter className="gap-2 pt-2 sm:justify-end">
            <Button type="button" variant="outline" className="touch-target w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="touch-target w-full sm:w-auto" disabled={isPending}>
              {isPending ? "Salvando..." : initial ? "Salvar alterações" : "Cadastrar tipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InspectionTypesSection({
  canEdit,
  className,
  fillHeight = false,
}: {
  canEdit: boolean;
  className?: string;
  fillHeight?: boolean;
}) {
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
    <SettingsSection
      icon={ClipboardList}
      title="Tipos de vistoria"
      description="Parâmetros operacionais utilizados na contabilização interna, relatórios e indicadores."
      className={className}
      fillHeight={fillHeight}
      action={
        canEdit ? (
          <Button type="button" className="touch-target w-full sm:w-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo tipo
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : types.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Nenhum tipo cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {canEdit
              ? "Cadastre o primeiro tipo para padronizar valores e nomenclaturas."
              : "Aguarde o administrador configurar os tipos de vistoria."}
          </p>
        </div>
      ) : (
        <ul
          className={cn(
            "divide-y divide-border overflow-hidden rounded-lg border border-border bg-card",
            fillHeight && "min-h-0 flex-1 overflow-y-auto",
          )}
        >
          {types.map((type) => (
            <li
              key={type.id}
              className="flex flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground sm:text-base">{type.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  Referência:{" "}
                  <span className="font-medium text-foreground">{formatCurrency(type.amount)}</span>
                </p>
              </div>
              {canEdit && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 min-h-9 flex-1 px-3 sm:flex-none"
                    onClick={() => openEdit(type)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 min-h-9 flex-1 px-3 text-destructive hover:text-destructive sm:flex-none",
                    )}
                    disabled={deleteType.isPending}
                    onClick={async () => {
                      if (!window.confirm(`Excluir o tipo "${type.name}"?`)) return;
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
        <SettingsNotice className="mt-5">
          Somente administradores podem gerenciar tipos e valores de vistoria.
        </SettingsNotice>
      )}

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
    </SettingsSection>
  );
}
