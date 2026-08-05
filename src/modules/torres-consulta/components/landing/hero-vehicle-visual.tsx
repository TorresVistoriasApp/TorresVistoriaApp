import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const FLOATING_CARDS = [
  { label: "Leilão", value: "Sem registros", position: "left-[4%] top-[12%]", delay: 0 },
  { label: "Sinistros", value: "Nenhum encontrado", position: "right-[2%] top-[22%]", delay: 1.4 },
  { label: "Score", value: "97", position: "left-[8%] bottom-[28%]", delay: 2.8 },
  { label: "Recall", value: "Em dia", position: "right-[6%] bottom-[38%]", delay: 0.7 },
  { label: "Roubo/Furto", value: "Sem ocorrências", position: "left-[20%] bottom-[8%]", delay: 2.1 },
] as const;

export function HeroVehicleVisual() {
  return (
    <div className="relative isolate mx-auto aspect-[4/3] w-full max-w-xl" aria-hidden>
      {/* Camada de fundo — glow e linhas ficam ATRÁS do veículo */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(234_88_12_/_0.14)_0%,transparent_68%)]" />
        <div className="absolute inset-x-[10%] top-[28%] h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        <div className="absolute inset-x-[18%] top-[52%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute left-1/2 top-[38%] h-[28%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
      </div>

      {/* Veículo — camada principal */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <svg
          viewBox="0 0 400 220"
          className="h-auto w-full max-w-md drop-shadow-[0_20px_40px_rgb(15_23_42_/_0.12)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="suv-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="suv-glass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="suv-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="200" cy="195" rx="140" ry="12" fill="rgb(15 23 42 / 0.12)" />
          <path
            d="M60 130 Q60 100 90 85 L130 70 Q180 55 220 55 Q280 55 320 75 L350 95 Q370 110 370 130 L370 150 Q370 165 355 165 L45 165 Q30 165 30 150 Z"
            fill="url(#suv-body)"
          />
          <path
            d="M100 85 Q140 60 200 58 Q260 58 300 82 L310 95 L90 95 Z"
            fill="url(#suv-glass)"
          />
          <path
            d="M70 120 L330 120 L330 125 L70 125 Z"
            fill="url(#suv-highlight)"
          />
          <circle cx="110" cy="165" r="28" fill="#0f172a" />
          <circle cx="110" cy="165" r="18" fill="#334155" />
          <circle cx="110" cy="165" r="8" fill="#64748b" />
          <circle cx="290" cy="165" r="28" fill="#0f172a" />
          <circle cx="290" cy="165" r="18" fill="#334155" />
          <circle cx="290" cy="165" r="8" fill="#64748b" />
          <ellipse cx="355" cy="125" rx="8" ry="12" fill="#fef3c7" opacity="0.9" />
          <ellipse cx="45" cy="125" rx="6" ry="10" fill="#fef3c7" opacity="0.7" />
        </svg>
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
