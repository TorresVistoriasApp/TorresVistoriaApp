import { useMemo, useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPasswordStrength,
  PASSWORD_REQUIREMENTS,
} from "@/lib/password-policy";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordStrengthInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
}

export function PasswordStrengthInput({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete = "new-password",
}: PasswordStrengthInputProps) {
  const [visible, setVisible] = useState(false);
  const strength = useMemo(() => getPasswordStrength(value), [value]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            className="touch-target pr-11"
            value={value}
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

      <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                strength > index ? "bg-primary" : "bg-muted-foreground/20",
              )}
            />
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {PASSWORD_REQUIREMENTS.map((requirement) => {
            const met = requirement.test(value);
            return (
              <div
                key={requirement.id}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  met ? "text-emerald-600" : "text-muted-foreground",
                )}
              >
                {met ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                <span>{requirement.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
