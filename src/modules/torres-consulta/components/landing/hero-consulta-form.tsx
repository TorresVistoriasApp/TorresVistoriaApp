import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
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
  const [focused, setFocused] = useState(false);

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
      className="mx-auto w-full max-w-xl"
      aria-label="Formulário de consulta veicular"
    >
      <div
        className={cn(
          "rounded-2xl border bg-[rgb(12_16_22_/_0.72)] p-1.5 shadow-[0_20px_48px_rgb(0_0_0_/_0.4)] transition-[border-color,box-shadow] duration-200",
          focused ? "border-white/25 shadow-[0_20px_48px_rgb(0_0_0_/_0.5)]" : "border-white/12",
        )}
      >
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-0">
          <fieldset className="shrink-0 sm:pl-1">
            <legend className="sr-only">Tipo de consulta</legend>
            <div className="flex rounded-xl bg-white/[0.06] p-1 sm:mr-1">
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
                    "h-10 min-h-10 flex-1 rounded-lg px-3.5 text-[13px] font-semibold transition-colors sm:flex-none",
                    mode === option.id
                      ? "bg-white text-foreground"
                      : "text-white/55 hover:text-white/85",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="relative min-w-0 flex-1">
            <label htmlFor="vehicle-identifier" className="sr-only">
              {mode === "plate" ? "Placa do veículo" : "Chassi do veículo"}
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
              aria-hidden
            />
            <input
              id="vehicle-identifier"
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={mode === "plate" ? "ABC1D23" : "17 caracteres"}
              maxLength={mode === "plate" ? 7 : 17}
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full border-0 bg-transparent pl-9 pr-3 text-[15px] font-bold uppercase tracking-[0.12em] text-white outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-white/30"
              aria-describedby="consulta-hint"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Consultar
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2.5">
        <p id="consulta-hint" className="text-center text-xs text-white/40">
          {mode === "plate"
            ? "Aceita placa antiga e Mercosul · cadastro grátis"
            : "Informe os 17 caracteres do chassi (VIN) · cadastro grátis"}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {TRUST_BADGES.map((badge) => (
            <li key={badge} className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
              <Check className="h-3 w-3 text-success" strokeWidth={2.5} aria-hidden />
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
