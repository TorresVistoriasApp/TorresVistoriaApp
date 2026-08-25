import { useEffect, useMemo, useState } from "react";
import type { ChecklistIssueOption } from "@/modules/torres-vistoria/domain/checklist/checklist-issue-options";
import { cn } from "@/shared/lib/utils";
import { AlertCircle, Plus } from "lucide-react";

type ChecklistIssuePickerProps = {
  itemId: string;
  options: readonly ChecklistIssueOption[];
  selectedCodes: readonly string[];
  manualObservation: string;
  disabled?: boolean;
  showValidation?: boolean;
  /** Resumo compacto (item não ativo): só chips selecionados. */
  collapsed?: boolean;
  onToggleCode: (code: string) => void;
  onManualChange: (value: string) => void;
  onManualBlur: () => void;
  onExpand?: () => void;
};

export function ChecklistIssuePicker({
  itemId,
  options,
  selectedCodes,
  manualObservation,
  disabled,
  showValidation,
  collapsed = false,
  onToggleCode,
  onManualChange,
  onManualBlur,
  onExpand,
}: ChecklistIssuePickerProps) {
  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);
  const selectedOptions = useMemo(
    () => options.filter((o) => selectedSet.has(o.code)),
    [options, selectedSet],
  );
  const [showManual, setShowManual] = useState(() => Boolean(manualObservation.trim()));
  const manualFieldId = `issue-manual-${itemId}`;

  useEffect(() => {
    if (manualObservation.trim()) setShowManual(true);
  }, [manualObservation]);

  if (collapsed) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onExpand}
        className="mt-1.5 flex w-full flex-wrap items-center gap-1 rounded-md px-0.5 py-0.5 text-left"
        aria-label="Editar apontamentos"
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <span
              key={option.code}
              className="rounded border border-warning-border bg-warning-subtle px-1.5 py-0.5 text-[10px] font-semibold text-warning"
            >
              {option.label}
            </span>
          ))
        ) : (
          <span className="text-[11px] font-semibold text-warning">
            {showValidation ? "Informe o apontamento" : "Toque para apontar"}
          </span>
        )}
        {manualObservation.trim() && (
          <span className="line-clamp-1 text-[10px] text-muted-foreground">
            · {manualObservation.trim()}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className="mt-1.5 space-y-1.5 rounded-md border border-warning-border bg-warning-subtle p-2"
      role="group"
      aria-label="Apontamentos do item"
    >
      {options.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {options.map((option) => {
            const active = selectedSet.has(option.code);
            return (
              <button
                key={option.code}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                aria-label={option.label}
                onClick={() => onToggleCode(option.code)}
                className={cn(
                  "min-h-[34px] rounded border px-2 py-1 text-[11px] font-medium transition-colors duration-100",
                  "disabled:opacity-50 sm:min-h-[32px]",
                  active
                    ? "border-warning bg-warning text-white"
                    : "border-border bg-card text-foreground hover:border-warning-border hover:bg-warning-subtle",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">Descreva o apontamento abaixo.</p>
      )}

      {showManual || manualObservation.trim() ? (
        <div className="space-y-1">
          <textarea
            id={manualFieldId}
            value={manualObservation}
            disabled={disabled}
            rows={2}
            placeholder="Observação adicional..."
            aria-label="Observação adicional"
            onChange={(e) => onManualChange(e.target.value)}
            onBlur={onManualBlur}
            className={cn(
              "w-full resize-y rounded-md border bg-card px-2 py-1.5 text-sm",
              "transition-colors duration-150 focus-visible:border-primary",
              showValidation && selectedCodes.length === 0 ? "border-warning" : "border-border",
            )}
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowManual(true)}
          className="inline-flex min-h-[32px] items-center gap-1 rounded px-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3" aria-hidden />
          Adicionar observação
        </button>
      )}

      {showValidation && (
        <p className="flex items-center gap-1 text-[11px] font-semibold text-warning" role="alert">
          <AlertCircle className="size-3 shrink-0" aria-hidden />
          Informe o apontamento identificado.
        </p>
      )}
    </div>
  );
}
