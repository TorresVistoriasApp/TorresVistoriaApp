import { useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParecerTecnicoFields } from "@/components/forms/parecer-tecnico-fields";
import { InspectionOpinion } from "@/lib/enums";
import { cn } from "@/lib/utils";

const opinionValues = new Set<string>(Object.values(InspectionOpinion));

export type ParecerTecnicoValue = {
  opinion: string;
  technical_notes: string;
};

interface ParecerTecnicoSectionProps {
  value: ParecerTecnicoValue;
  onChange: (value: ParecerTecnicoValue) => void;
  errors?: Partial<Record<keyof ParecerTecnicoValue, string>>;
  disabled?: boolean;
  className?: string;
  /** Destaque visual alinhado às seções do wizard */
  variant?: "card" | "section";
}

/** Bloco de parecer técnico para o final do checklist. */
export function ParecerTecnicoSection({
  value,
  onChange,
  errors,
  disabled = false,
  className,
  variant = "section",
}: ParecerTecnicoSectionProps) {
  const fields = (
    <ParecerTecnicoFields
      opinion={value.opinion}
      technicalNotes={value.technical_notes}
      onOpinionChange={(opinion) => onChange({ ...value, opinion })}
      onTechnicalNotesChange={(technical_notes) => onChange({ ...value, technical_notes })}
      opinionError={errors?.opinion}
      technicalNotesError={errors?.technical_notes}
      disabled={disabled}
    />
  );

  if (variant === "card") {
    return (
      <Card className={cn("shadow-soft", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Parecer técnico</CardTitle>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Conclusão após revisar o veículo e concluir o checklist
          </p>
        </CardHeader>
        <CardContent>{fields}</CardContent>
      </Card>
    );
  }

  return (
    <section
      id="checklist-parecer"
      className={cn(
        "scroll-mt-24 rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5 md:p-6",
        className,
      )}
      aria-labelledby="checklist-parecer-title"
    >
      <div className="mb-4 space-y-1 sm:mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-primary/5 sm:size-9">
            <Scale className="size-4 sm:size-[1.125rem]" aria-hidden />
          </span>
          <h2 id="checklist-parecer-title" className="text-base font-semibold sm:text-lg">
            Parecer técnico
          </h2>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground sm:pl-11 sm:text-sm">
          Preencha somente após revisar o veículo e concluir todos os itens do checklist. O resultado
          e as observações entram no laudo.
        </p>
      </div>
      {fields}
    </section>
  );
}

/** Valida parecer e observações técnicas (mesmas regras do laudo). */
export function validateParecerTecnico(value: ParecerTecnicoValue): {
  valid: boolean;
  errors: Partial<Record<keyof ParecerTecnicoValue, string>>;
} {
  const errors: Partial<Record<keyof ParecerTecnicoValue, string>> = {};
  const opinion = value.opinion?.trim() ?? "";
  const notes = value.technical_notes?.trim() ?? "";

  if (!opinion || !opinionValues.has(opinion)) {
    errors.opinion = "Selecione o parecer técnico";
  }
  if (notes.length < 10) {
    errors.technical_notes = "Descreva as observações técnicas (mínimo 10 caracteres)";
  } else if (notes.length > 5000) {
    errors.technical_notes = "Observações técnicas devem ter no máximo 5000 caracteres";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Estado local + callback debounced para persistir parecer no checklist. */
export function useParecerTecnicoDraft(
  initial: ParecerTecnicoValue | null,
  onPersist: (value: ParecerTecnicoValue) => void,
  debounceMs = 500,
) {
  const [value, setValue] = useState<ParecerTecnicoValue>({
    opinion: "",
    technical_notes: "",
  });
  const onPersistRef = useRef(onPersist);
  onPersistRef.current = onPersist;
  const lastSerialized = useRef("");
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!initial || hydratedRef.current) return;
    hydratedRef.current = true;
    const serialized = JSON.stringify(initial);
    lastSerialized.current = serialized;
    setValue(initial);
  }, [initial]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastSerialized.current) return;

    const timer = setTimeout(() => {
      lastSerialized.current = serialized;
      onPersistRef.current(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  return [value, setValue] as const;
}
