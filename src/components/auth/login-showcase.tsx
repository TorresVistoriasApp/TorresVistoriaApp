import { Camera, CheckCircle2, ClipboardCheck, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { PUBLIC_IMAGES } from "@/lib/public-images";
import { cn } from "@/lib/utils";

const SHOWCASE_ALTS = [
  "Mecânico inspecionando veículo elevado em oficina",
  "Detalhe do capô aberto durante vistoria técnica",
  "Mecânico inspecionando motor com capô aberto",
  "Inspeção profissional da parte inferior do veículo",
] as const;

const SHOWCASE_IMAGES = PUBLIC_IMAGES.auth.loginShowcase.map((src, index) => ({
  src,
  alt: SHOWCASE_ALTS[index],
}));

const FEATURES = [
  { label: "Fotos guiadas", icon: Camera },
  { label: "Checklist digital", icon: ClipboardCheck },
  { label: "Laudo PDF", icon: FileText },
] as const;

const METRICS = [
  { value: "98%", label: "checklists completos" },
  { value: "LGPD", label: "dados protegidos" },
  { value: "PDF", label: "laudos profissionais" },
] as const;

const PIPELINE = [
  { label: "Identificação", value: "Validada" },
  { label: "Fotos técnicas", value: "24 anexos" },
  { label: "Checklist", value: "89 itens" },
] as const;

export function LoginShowcase({ className }: { className?: string }) {
  const [hero, ...secondary] = SHOWCASE_IMAGES;

  return (
    <div className={cn("relative hidden overflow-hidden bg-[#f6f7f9] lg:flex lg:w-[52%] xl:w-[56%]", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(15_23_42_/_0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42_/_0.045)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-5 grid grid-cols-12 grid-rows-6 gap-2 overflow-hidden rounded-[2rem] border border-white/80 shadow-2xl">
        <div className="relative col-span-7 row-span-6 overflow-hidden rounded-l-[2rem]">
          <img
            src={hero.src}
            alt={hero.alt}
            className="h-full w-full scale-110 object-cover saturate-110"
            loading="eager"
          />
        </div>
        {secondary.map((image, index) => (
          <div key={image.src} className="relative col-span-5 row-span-2 overflow-hidden">
            <img
              src={image.src}
              alt={image.alt}
              className={cn(
                "h-full w-full scale-110 object-cover saturate-110",
                index === 0 && "rounded-tr-[2rem]",
                index === secondary.length - 1 && "rounded-br-[2rem]",
              )}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/82 to-white/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#f6f7f9] via-white/45 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-12 h-96 w-96 rounded-full bg-orange-500/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-16 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="absolute right-10 top-10 z-10 w-72 rounded-[1.6rem] border border-white/80 bg-white/80 p-4 text-slate-950 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          <Sparkles className="h-3.5 w-3.5" />
          Torres Intelligence
        </div>
        <div className="mt-4 space-y-3">
          {PIPELINE.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
              <span className="text-xs text-slate-500">{item.label}</span>
              <span className="text-xs font-bold text-slate-950">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-28 right-10 z-10 w-64 rounded-[1.5rem] border border-white/80 bg-white/82 p-4 text-slate-950 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Score cautelar</p>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
            Aprovado
          </span>
        </div>
        <div className="mt-4 flex items-end gap-3">
          <p className="text-5xl font-black tracking-[-0.08em] text-slate-950">94</p>
          <p className="pb-2 text-xs font-semibold text-slate-500">/100 pontos</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-orange-500 to-emerald-300" />
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end p-8 xl:p-11">
        <div className="max-w-xl space-y-7 pb-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-700 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Vistoria cautelar profissional
          </p>
          <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.055em] text-slate-950 xl:text-6xl">
            Inteligência para
            <br />
            <span className="bg-gradient-to-r from-orange-700 via-orange-500 to-orange-300 bg-clip-text text-transparent">
              vistorias críticas.
            </span>
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-slate-600">
            Uma central premium para conduzir inspeções, evidências fotográficas, checklist técnico,
            laudos e indicadores financeiros com padrão de empresa de tecnologia.
          </p>

          <div className="grid max-w-lg grid-cols-3 gap-3">
            {METRICS.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/80 bg-white/75 p-3 backdrop-blur-xl">
                <p className="text-lg font-black text-slate-950">{metric.value}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
            {FEATURES.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Icon className="h-3.5 w-3.5 text-orange-500" strokeWidth={2.25} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-8 left-8 flex items-center gap-2.5 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-[11px] text-slate-600 backdrop-blur-xl xl:bottom-11 xl:left-11">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-orange-500" strokeWidth={2.25} />
          <span>Dados protegidos · Conformidade LGPD · Acesso auditável</span>
        </div>
      </div>
    </div>
  );
}
