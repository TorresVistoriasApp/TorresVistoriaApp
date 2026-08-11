import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type QueryMode = "plate" | "chassis";

const TRUST_BADGES = [
  "Dados oficiais",
  "LGPD",
  "Relatório em poucos minutos",
  "Download imediato",
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
    navigate(`${ROUTES.clienteRegister}?${params.toString()}`);
  };

  return (
    <form
      id="consultar"
      onSubmit={handleSubmit}
      className="relative w-full max-w-xl"
      aria-label="Formulário de consulta veicular"
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/95 p-6 shadow-[0_32px_80px_rgb(15_23_42_/_0.12)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-8 top-0 z-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <fieldset>
          <legend className="sr-only">Tipo de consulta</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {(
              [
                { id: "plate" as const, label: "Consulta por Placa" },
                { id: "chassis" as const, label: "Consulta por Chassi" },
              ] as const
            ).map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                  mode === option.id
                    ? "border-primary/40 bg-primary/10 text-foreground shadow-[0_0_0_1px_rgb(234_88_12_/_0.15)]"
                    : "border-border/50 bg-slate-50/80 text-muted-foreground hover:border-primary/25 hover:bg-white",
                )}
              >
                <input
                  type="radio"
                  name="query-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => {
                    setMode(option.id);
                    setValue("");
                  }}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    mode === option.id ? "border-primary bg-primary" : "border-slate-300",
                  )}
                >
                  {mode === option.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="vehicle-identifier"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder={mode === "plate" ? "Digite a placa — ex: ABC1D23" : "Digite o chassi (17 caracteres)"}
            maxLength={mode === "plate" ? 7 : 17}
            className="h-16 border-slate-200/80 bg-slate-50/90 pl-14 text-lg font-semibold uppercase tracking-[0.12em] shadow-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus-visible:border-primary/30 focus-visible:bg-white focus-visible:ring-primary/20"
            aria-describedby="consulta-hint"
          />
        </div>
        <p id="consulta-hint" className="mt-2 text-center text-xs text-muted-foreground">
          {mode === "plate"
            ? "Placa padrão Mercosul, sem hífen"
            : "Número de identificação do veículo (VIN)"}
        </p>

        <Button
          type="submit"
          size="lg"
          className="mt-5 h-14 w-full rounded-2xl text-base font-bold shadow-[0_16px_48px_rgb(234_88_12_/_0.32)] transition-all duration-200 hover:shadow-[0_20px_56px_rgb(234_88_12_/_0.4)]"
        >
          Consultar Veículo
          <ArrowRight className="h-5 w-5" />
        </Button>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {TRUST_BADGES.map((badge) => (
            <li key={badge} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
