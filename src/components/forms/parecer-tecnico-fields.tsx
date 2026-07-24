import { InspectionOpinion } from "@/lib/enums";
import { INSPECTION_OPINION_FORM_LABELS } from "@/lib/inspection-opinion-labels";
import { FormField } from "@/components/forms/form-field";
import {
  formGridClass,
  formGridFullWidthClass,
  selectInputClass,
  textareaInputClass,
} from "@/lib/form-styles";
import { cn } from "@/lib/utils";

const opinionOptions = Object.values(InspectionOpinion);

export interface ParecerTecnicoFieldsProps {
  opinion: string;
  technicalNotes: string;
  onOpinionChange: (value: string) => void;
  onTechnicalNotesChange: (value: string) => void;
  opinionError?: string;
  technicalNotesError?: string;
  disabled?: boolean;
  className?: string;
  showInternalNotes?: boolean;
  internalNotes?: string;
  onInternalNotesChange?: (value: string) => void;
  internalNotesError?: string;
}

/** Campos de parecer técnico e observações técnicas. */
export function ParecerTecnicoFields({
  opinion,
  technicalNotes,
  onOpinionChange,
  onTechnicalNotesChange,
  opinionError,
  technicalNotesError,
  disabled = false,
  className,
  showInternalNotes = false,
  internalNotes = "",
  onInternalNotesChange,
  internalNotesError,
}: ParecerTecnicoFieldsProps) {
  return (
    <div className={cn(formGridClass, className)}>
      <FormField
        label="Parecer técnico"
        error={opinionError}
        className={formGridFullWidthClass}
        hint="Resultado final da vistoria, exibido em destaque no laudo"
      >
        <select
          value={opinion}
          onChange={(e) => onOpinionChange(e.target.value)}
          disabled={disabled}
          className={selectInputClass}
          aria-invalid={Boolean(opinionError)}
        >
          <option value="">Selecione o parecer</option>
          {opinionOptions.map((o) => (
            <option key={o} value={o}>
              {INSPECTION_OPINION_FORM_LABELS[o]}
            </option>
          ))}
        </select>
      </FormField>
      <FormField
        label="Observações técnicas"
        error={technicalNotesError}
        className={formGridFullWidthClass}
        hint="Descreva achados, apontamentos ou recomendações. Entra no laudo PDF."
      >
        <textarea
          value={technicalNotes}
          onChange={(e) => onTechnicalNotesChange(e.target.value)}
          disabled={disabled}
          rows={5}
          placeholder="Ex.: Pintura original na lateral direita, pneus com desgaste irregular..."
          className={textareaInputClass}
          aria-invalid={Boolean(technicalNotesError)}
        />
      </FormField>
      {showInternalNotes && onInternalNotesChange && (
        <FormField
          label="Comentários internos (admin)"
          error={internalNotesError}
          className={formGridFullWidthClass}
          optional
        >
          <textarea
            value={internalNotes}
            onChange={(e) => onInternalNotesChange(e.target.value)}
            disabled={disabled}
            rows={4}
            className={textareaInputClass}
          />
        </FormField>
      )}
    </div>
  );
}
