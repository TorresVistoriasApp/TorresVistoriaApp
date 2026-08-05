import { useEffect, useState } from "react";
import { Camera, ImageIcon, X } from "lucide-react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DAMAGE_LOCATION_OPTIONS,
  DAMAGE_SEVERITY_OPTIONS,
  DAMAGE_TYPE_OPTIONS,
  EMPTY_DAMAGE_CAPTURE_FORM,
  isDamageCaptureFormValid,
  validateDamageCaptureForm,
  type DamageCaptureForm,
} from "@/lib/photos/avarias";
import { selectInputClass, textareaInputClass } from "@/lib/form-styles";
import { cn } from "@/lib/utils";

type PhotoDamageCaptureSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName?: string;
  damageIndex?: number;
  onTakePhoto: (form: DamageCaptureForm) => void;
  onPickGallery: (form: DamageCaptureForm) => void;
};

export function PhotoDamageCaptureSheet({
  open,
  onOpenChange,
  categoryName,
  damageIndex,
  onTakePhoto,
  onPickGallery,
}: PhotoDamageCaptureSheetProps) {
  const [form, setForm] = useState<DamageCaptureForm>(EMPTY_DAMAGE_CAPTURE_FORM);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_DAMAGE_CAPTURE_FORM);
      setShowErrors(false);
    }
  }, [open]);

  const errors = showErrors ? validateDamageCaptureForm(form) : {};
  const canCapture = isDamageCaptureFormValid(form);

  const updateForm = (patch: Partial<DamageCaptureForm>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const submitCapture = (handler: (form: DamageCaptureForm) => void) => {
    if (!isDamageCaptureFormValid(form)) {
      setShowErrors(true);
      return;
    }
    handler(form);
    onOpenChange(false);
  };

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-sm gap-0 overflow-y-auto p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle className="text-base">
            {typeof damageIndex === "number" ? `Avaria ${damageIndex}` : "Registrar avaria"}
          </DialogTitle>
          {categoryName && <DialogDescription>{categoryName}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Preencha os dados da avaria antes de capturar a fotografia.
          </p>

          <FormField label="Localização" error={errors.location}>
            <select
              value={form.location}
              onChange={(event) => updateForm({ location: event.target.value })}
              className={selectInputClass}
            >
              <option value="">Selecione a localização</option>
              {DAMAGE_LOCATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormField>

          {form.location === "Outro" && (
            <FormField label="Descreva a localização" error={errors.location}>
              <Input
                value={form.customLocation}
                onChange={(event) => updateForm({ customLocation: event.target.value })}
                placeholder="Ex.: Soleira direita"
                maxLength={200}
              />
            </FormField>
          )}

          <FormField label="Categoria da avaria" error={errors.category}>
            <select
              value={form.category}
              onChange={(event) => updateForm({ category: event.target.value })}
              className={selectInputClass}
            >
              <option value="">Selecione o tipo</option>
              {DAMAGE_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormField>

          {form.category === "Outro" && (
            <FormField label="Descreva o tipo" error={errors.category}>
              <Input
                value={form.customCategory}
                onChange={(event) => updateForm({ customCategory: event.target.value })}
                placeholder="Ex.: Mancha de tinta"
                maxLength={100}
              />
            </FormField>
          )}

          <FormField label="Grau" error={errors.severity}>
            <div className="grid grid-cols-1 gap-2">
              {DAMAGE_SEVERITY_OPTIONS.map((option) => {
                const isSelected = form.severity === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateForm({ severity: option.value })}
                    className={cn(
                      "rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30",
                    )}
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </FormField>

          <FormField
            label="Descrição"
            error={errors.description}
            optional
            hint="Detalhes adicionais visíveis no laudo."
          >
            <textarea
              value={form.description}
              onChange={(event) => updateForm({ description: event.target.value })}
              className={textareaInputClass}
              placeholder="Ex.: amassado com pintura riscada próximo ao friso"
              maxLength={500}
              rows={3}
            />
          </FormField>

          <div className="flex flex-col gap-1 pt-1">
            <Button
              type="button"
              className="h-11 justify-start gap-3 rounded-xl px-4 text-base font-normal"
              disabled={!canCapture && showErrors}
              onClick={() => submitCapture(onTakePhoto)}
            >
              <Camera className="size-5" aria-hidden />
              Tirar foto
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 justify-start gap-3 rounded-xl px-4 text-base font-normal"
              disabled={!canCapture && showErrors}
              onClick={() => submitCapture(onPickGallery)}
            >
              <ImageIcon className="size-5" aria-hidden />
              Selecionar da galeria
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-start gap-3 rounded-xl px-4 text-base font-normal text-muted-foreground"
              onClick={close}
            >
              <X className="size-5" aria-hidden />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
