import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

type QueryMode = "plate" | "chassis";

export function HeroConsultaForm() {
  const [mode, setMode] = useState<QueryMode>("plate");
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <form
      id="consultar"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-elevated backdrop-blur-xl sm:p-6"
      aria-label="Formulário de consulta veicular"
    >
      <fieldset className="mb-4">
        <legend className="sr-only">Tipo de consulta</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          {(
            [
              { id: "plate" as const, label: "Consulta por Placa" },
              { id: "chassis" as const, label: "Consulta por Chassi" },
            ] as const
          ).map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                mode === option.id
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-border/60 bg-slate-50/80 text-muted-foreground hover:border-primary/20",
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
                className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="vehicle-identifier">
          {mode === "plate" ? "Placa do veículo" : "Chassi (VIN)"}
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="vehicle-identifier"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder={mode === "plate" ? "ABC1D23" : "9BWZZZ377VT004251"}
            maxLength={mode === "plate" ? 7 : 17}
            className="h-13 border-slate-200 bg-slate-50 pl-11 text-base uppercase tracking-wider shadow-none focus-visible:bg-white"
            aria-describedby="consulta-hint"
          />
        </div>
        <p id="consulta-hint" className="text-xs text-muted-foreground">
          {mode === "plate"
            ? "Informe a placa sem hífen. Ex: ABC1D23"
            : "Informe os 17 caracteres do chassi (VIN)."}
        </p>
      </div>

      {submitted && (
        <p
          role="status"
          className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-700"
        >
          Consulta simulada com sucesso! Em breve você poderá acessar o relatório completo.
        </p>
      )}

      <Button type="submit" size="lg" className="mt-5 h-13 w-full rounded-2xl text-base">
        Consultar Agora
        <ArrowRight className="h-5 w-5" />
      </Button>
    </form>
  );
}
