import { useMemo, useState } from "react";
import { Check, Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  getPasswordStrength,
  PASSWORD_REQUIREMENTS,
} from "@/core/auth/password-policy";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface PasswordStrengthInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  /** Versão densa: barras e requisitos em linha. */
  compact?: boolean;
  /** Quando false, renderiza só o campo — use com PasswordRequirementsHint abaixo. */
  showDetails?: boolean;
}

const SHORT_REQUIREMENT_LABELS: Record<string, string> = {
  length: "8 caracteres",
  uppercase: "Maiúscula",
  special: "Especial",
  lowercase: "Minúscula",
  number: "Número",
};

export function PasswordRequirementsHint({
  value,
  compact = false,
  className,
}: {
  value: string;
  compact?: boolean;
  className?: string;
}) {
  const safeValue = value ?? "";
  return (
    <ul className={cn("flex flex-wrap gap-x-3 gap-y-1", compact && "gap-x-2.5", className)}>
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const met = requirement.test(safeValue);
        return (
          <li
            key={requirement.id}
            className={cn(
              "flex items-center gap-1.5 text-[11px]",
              met ? "text-success" : "text-muted-foreground",
            )}
          >
            {met ? (
              <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
            ) : (
              <X className="h-3 w-3 shrink-0" aria-hidden />
            )}
            {compact ? SHORT_REQUIREMENT_LABELS[requirement.id] ?? requirement.label : requirement.label}
          </li>
        );
      })}
    </ul>
  );
}

export function PasswordRulesBar({
  value,
  invalid = false,
  className,
}: {
  value: string;
  /** Destaca em vermelho quando o envio falhou por senha fraca. */
  invalid?: boolean;
  className?: string;
}) {
  const safeValue = value ?? "";
  const total = PASSWORD_REQUIREMENTS.length;
  const strength = getPasswordStrength(safeValue);
  const missing = total - strength;

  const status =
    safeValue.length === 0
      ? "A senha precisa ter"
      : missing === 0
        ? "Senha forte"
        : missing === 1
          ? "Falta 1 requisito"
          : `Faltam ${missing} requisitos`;

  return (
    <div
      className={cn(
        "rounded-xl border bg-muted px-3 py-2.5",
        invalid && missing > 0 ? "border-destructive/70" : "border-border",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
          {PASSWORD_REQUIREMENTS.map((requirement, index) => (
            <div
              key={requirement.id}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                strength > index
                  ? missing === 0
                    ? "bg-success"
                    : "bg-primary"
                  : "bg-muted-foreground/20",
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "shrink-0 text-[11px] font-semibold",
            missing === 0
              ? "text-success"
              : invalid
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          {status}
        </span>
      </div>
      <PasswordRequirementsHint value={safeValue} compact className="mt-2" />
    </div>
  );
}

export function PasswordStrengthInput({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete = "new-password",
  compact = false,
  showDetails = true,
}: PasswordStrengthInputProps) {
  const [visible, setVisible] = useState(false);
  const safeValue = value ?? "";
  const total = PASSWORD_REQUIREMENTS.length;
  const strength = useMemo(() => getPasswordStrength(safeValue), [safeValue]);
  const strengthLabel =
    strength === total ? "Senha forte" : strength <= 2 ? "Senha fraca" : "Senha média";

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-3")}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={id}>{label}</Label>
          {safeValue.length > 0 && (
            <span
              className={cn(
                "text-xs font-medium",
                strength === total
                  ? "text-success"
                  : strength <= 2
                    ? "text-destructive"
                    : "text-warning",
              )}
            >
              {strengthLabel}
            </span>
          )}
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={id}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            className="touch-target pl-11 pr-11"
            value={safeValue}
            onChange={(event) => onChange(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {showDetails ? (
        <>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
            {PASSWORD_REQUIREMENTS.map((requirement, index) => (
              <div
                key={requirement.id}
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  strength > index
                    ? strength === total
                      ? "bg-success"
                      : "bg-primary"
                    : "bg-muted-foreground/20",
                )}
              />
            ))}
          </div>

          {compact ? (
            <PasswordRequirementsHint value={safeValue} compact />
          ) : (
            <div className="rounded-lg border border-border bg-muted p-3">
              <PasswordRequirementsHint value={safeValue} />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
