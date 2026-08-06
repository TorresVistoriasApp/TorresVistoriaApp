import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const HERO_CAR_IMAGE = "/images/consultations/heroconsultations.webp?v=5";

const FLOATING_CARDS = [
  { label: "Leilão", value: "Sem registros", position: "left-[4%] top-[8%]", delay: 0 },
  { label: "Sinistros", value: "Nenhum encontrado", position: "right-[0%] top-[18%]", delay: 1.4 },
  { label: "Score", value: "97", position: "left-[4%] bottom-[32%]", delay: 2.8 },
  { label: "Recall", value: "Em dia", position: "right-[4%] bottom-[42%]", delay: 0.7 },
  { label: "Roubo/Furto", value: "Sem ocorrências", position: "left-[16%] bottom-[4%]", delay: 2.1 },
] as const;

export function HeroVehicleVisual() {
  return (
    <div className="relative isolate mx-auto w-full max-w-xl min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]" aria-hidden>
      {/* Camada de fundo — glow e linhas ficam ATRÁS do veículo */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(234_88_12_/_0.14)_0%,transparent_68%)]" />
        <div className="absolute inset-x-[10%] top-[32%] h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        <div className="absolute inset-x-[18%] top-[56%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute left-1/2 top-[42%] h-[24%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
      </div>

      {/* Veículo — foto com fundo removido */}
      <div className="relative z-10 flex h-full min-h-[inherit] flex-col items-center justify-center px-2 py-4">
        <img
          src={HERO_CAR_IMAGE}
          alt=""
          width={1432}
          height={989}
          decoding="async"
          fetchPriority="high"
          className="mx-auto block h-auto w-full max-h-[340px] max-w-md object-contain object-bottom drop-shadow-[0_20px_40px_rgb(15_23_42_/_0.14)] lg:max-h-[380px]"
        />
        <div
          className="pointer-events-none mt-2 h-2.5 w-[38%] rounded-[100%] bg-slate-900/[0.08]"
          aria-hidden
        />
      </div>

      {/* Cards de análise — acima do veículo */}
      {FLOATING_CARDS.map((card) => (
        <div
          key={card.label}
          className={cn(
            "absolute z-20 max-w-[140px] rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_8px_24px_rgb(15_23_42_/_0.08)]",
            "landing-float",
            card.position,
          )}
          style={{ animationDelay: `${card.delay}s` }}
        >
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <p className="truncate text-xs font-semibold text-foreground">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
