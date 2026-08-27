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
          "overflow-hidden rounded-2xl border bg-[rgb(8_11_16_/_0.78)] p-2 shadow-[0_1px_0_rgb(255_255_255_/_0.08)_inset,0_24px_64px_rgb(0_0_0_/_0.5)] backdrop-blur-xl transition-[border-color,box-shadow] duration-200",
          focused
            ? "border-primary/45 shadow-[0_1px_0_rgb(255_255_255_/_0.08)_inset,0_24px_64px_rgb(0_0_0_/_0.5),0_0_0_1px_rgb(226_87_12_/_0.25)]"
            : "border-white/15",
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5">
          <fieldset className="shrink-0">
            <legend className="sr-only">Tipo de consulta</legend>
            <div className="flex rounded-xl bg-white/[0.06] p-1">
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
                    "h-11 min-h-11 flex-1 rounded-lg px-4 text-[13px] font-semibold tracking-wide transition-all duration-200 sm:flex-none",
                    mode === option.id
                      ? "bg-white text-foreground shadow-[0_2px_8px_rgb(0_0_0_/_0.2)]"
                      : "text-white/60 hover:text-white",
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
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
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
              className="h-12 w-full border-0 bg-transparent pl-10 pr-3 text-[15px] font-semibold uppercase tracking-[0.16em] text-white outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-white/35"
              aria-describedby="consulta-hint"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[14px] font-semibold tracking-wide text-primary-foreground shadow-glow transition-[background-color,transform] duration-200 hover:bg-primary-hover hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          >
            Consultar agora
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <p
        id="consulta-hint"
        className="mt-4 text-center text-[12px] font-medium tracking-wide text-white/65"
      >
        {mode === "plate"
          ? "Aceita placa antiga e Mercosul. Cadastro grátis para começar."
          : "Informe os 17 caracteres do chassi. Cadastro grátis para começar."}
      </p>

      <ul className="mt-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {TRUST_BADGES.map((badge) => (
          <li
            key={badge}
            className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide text-white/75"
          >
            <Check className="h-3.5 w-3.5 text-[#3ecf8e]" strokeWidth={2.5} aria-hidden />
            {badge}
          </li>
        ))}
      </ul>
    </form>
  );
}
