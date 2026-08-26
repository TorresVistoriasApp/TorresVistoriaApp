import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const HERO_CAR_IMAGE = "/images/consultations/heroconsultations-800.webp";
const HERO_CAR_SRCSET =
  "/images/consultations/heroconsultations-400.webp 400w, /images/consultations/heroconsultations-800.webp 800w";
const HERO_CAR_SIZES = "(max-width: 640px) 90vw, 432px";

/** Dados de exemplo alinhados à ilustração (Range Rover Evoque na imagem do hero). */
const SAMPLE_VEHICLE = {
  plate: "ABC1D23",
  name: "Land Rover Range Rover Evoque",
  year: "2019",
  fuel: "Gasolina",
} as const;

const REPORT_ROWS: { label: string; value: string; hideOnCompact?: boolean }[] = [
  { label: "Histórico de leilão", value: "Sem registros" },
  { label: "Sinistro / indenização", value: "Nada consta" },
  { label: "Roubo e furto", value: "Nada consta" },
  { label: "Débitos e multas", value: "R$ 0,00" },
  { label: "Recall pendente", value: "Em dia", hideOnCompact: true },
];

const SCORE = 97;

interface HeroVehicleVisualProps {
  compact?: boolean;
  className?: string;
}

/** Amostra estática do relatório: comunica o produto sem custo de render. */
export function HeroVehicleVisual({ compact = false, className }: HeroVehicleVisualProps) {
  const rows = compact ? REPORT_ROWS.filter((row) => !row.hideOnCompact) : REPORT_ROWS;

  return (
    <div
      className={cn("mx-auto w-full", compact ? "max-w-md" : "max-w-[27rem] lg:max-w-md", className)}
      aria-hidden
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <span className="rounded-md border border-border-strong bg-muted px-2.5 py-1 font-mono text-[13px] font-bold tracking-[0.12em] text-foreground">
            {SAMPLE_VEHICLE.plate}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
            Relatório completo
          </span>
        </div>

        <div className="border-b border-border bg-muted/60 px-4 pt-2">
          <img
            src={HERO_CAR_IMAGE}
            srcSet={HERO_CAR_SRCSET}
            sizes={HERO_CAR_SIZES}
            alt=""
            width={800}
            height={472}
            decoding="async"
            fetchPriority="high"
            className={cn(
              "mx-auto block h-auto w-full object-contain",
              compact ? "max-h-[130px]" : "max-h-[168px]",
            )}
          />
          <p className="pb-3 text-center text-[13px] font-semibold text-foreground">
            {SAMPLE_VEHICLE.name}
            <span className="ml-1.5 font-medium text-muted-foreground">
              {SAMPLE_VEHICLE.year} · {SAMPLE_VEHICLE.fuel}
            </span>
          </p>
        </div>

        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-3 px-4 py-2.5">
              <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={2.5} />
              <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                {row.label}
              </span>
              <span className="shrink-0 text-[13px] font-semibold text-foreground">{row.value}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-border px-4 py-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.09em] text-subtle-foreground">
              Score do veículo
            </span>
            <span className="text-[13px] font-semibold text-success">Risco baixo</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-success" style={{ width: `${SCORE}%` }} />
            </div>
            <span className="tabular text-lg font-bold leading-none text-foreground">{SCORE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
