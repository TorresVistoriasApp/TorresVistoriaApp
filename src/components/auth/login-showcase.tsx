import { Camera, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";
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

export function LoginShowcase({ className }: { className?: string }) {
  const [hero, ...secondary] = SHOWCASE_IMAGES;

  return (
    <div className={cn("relative hidden overflow-hidden lg:flex lg:w-[48%] xl:w-[50%]", className)}>
      <div className="absolute inset-2 grid grid-cols-12 grid-rows-6 gap-1.5 rounded-2xl overflow-hidden">
        <div className="relative col-span-7 row-span-6 overflow-hidden">
          <img
            src={hero.src}
            alt={hero.alt}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        {secondary.map((image) => (
          <div key={image.src} className="relative col-span-5 row-span-2 overflow-hidden">
            <img src={image.src} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-slate-950/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(234_88_12_/_0.18),transparent_50%)]" />

      <div className="relative z-10 flex h-full flex-col justify-end p-8 xl:p-11">
        <div className="max-w-md space-y-6 pb-10">
          <p className="inline-flex rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-200">
            Vistoria cautelar profissional
          </p>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-white xl:text-4xl">
            Laudos precisos.
            <br />
            <span className="text-orange-300">Confiança total.</span>
          </h2>
          <p className="text-sm leading-relaxed text-white/70 xl:text-[15px]">
            Inspeções, fotos, checklist, laudos em PDF e financeiro — integrado para equipes de
            vistoria veicular.
          </p>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
            {FEATURES.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2 text-xs font-medium text-white/80">
                <Icon className="h-3.5 w-3.5 text-orange-300" strokeWidth={2} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-8 left-8 flex items-center gap-2.5 text-[11px] text-white/50 xl:bottom-11 xl:left-11">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-orange-300/80" strokeWidth={2} />
          <span>Dados protegidos · Conformidade LGPD</span>
        </div>
      </div>
    </div>
  );
}
