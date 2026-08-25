import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type QueryMode = "plate" | "chassis";

const TRUST_BADGES = ["Fontes oficiais", "Dados protegidos", "Resultado na hora"] as const;

const MODES = [
  { id: "plate" as const, label: "Placa" },
  { id: "chassis" as const, label: "Chassi" },
] as const;

export function HeroConsultaForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<QueryMode>("plate");
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    const params = new URLSearchParams();
    if (mode === "plate") {
      params.set("placa", value.trim().toUpperCase());
    } else {
      params.set("chassi", value.trim().toUpperCase());
    }
    navigate(`${ROUTES.consultaRegister}?${params.toString()}`);
  };

  return (
    <form
      id="consultar"
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-border bg-card p-4 shadow-elevated sm:p-5"
      aria-label="Formulário de consulta veicular"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-sm font-bold text-foreground">Consultar um veículo</p>
        <p className="text-xs font-medium text-muted-foreground">
          Cadastro grátis · sem compromisso
        </p>
      </div>

      <fieldset className="mt-4">
        <legend className="sr-only">Tipo de consulta</legend>
        <div className="landing-segment max-w-[15rem]">
          {MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setMode(option.id);
                setValue("");
              }}
              aria-pressed={mode === option.id}
              className={cn(
                "relative z-10 h-9 min-h-9 flex-1 rounded-md px-3 text-[13px] font-semibold transition-colors",
                mode === option.id ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
          <span
            className={cn(
              "landing-segment-thumb left-1 w-[calc(50%-4px)]",
              mode === "plate" ? "translate-x-0" : "translate-x-full",
            )}
            aria-hidden
          />
        </div>
      </fieldset>

      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="vehicle-identifier" className="sr-only">
            {mode === "plate" ? "Placa do veículo" : "Chassi do veículo"}
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />
          <Input
            id="vehicle-identifier"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder={mode === "plate" ? "ABC1D23" : "Chassi com 17 caracteres"}
            maxLength={mode === "plate" ? 7 : 17}
            autoComplete="off"
            spellCheck={false}
            className="h-12 pl-10 text-base font-bold uppercase tracking-[0.08em] placeholder:font-medium placeholder:tracking-normal placeholder:text-subtle-foreground"
            aria-describedby="consulta-hint"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 shrink-0 px-6">
          Consultar
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <p id="consulta-hint" className="mt-2 text-xs text-muted-foreground">
        {mode === "plate"
          ? "Aceita placa antiga e Mercosul."
          : "Informe os 17 caracteres do chassi (VIN)."}
      </p>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3.5">
        {TRUST_BADGES.map((badge) => (
          <li key={badge} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} aria-hidden />
            {badge}
          </li>
        ))}
      </ul>
    </form>
  );
}
