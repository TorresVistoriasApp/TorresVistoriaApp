import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
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

export function LoginShowcase({ className }: { className?: string }) {
  return (
    <div className={cn("relative hidden overflow-hidden lg:flex lg:w-[52%] xl:w-[55%]", className)}>
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {SHOWCASE_IMAGES.map((image, index) => (
          <div key={image.src} className="relative overflow-hidden">
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/75 to-orange-950/85" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(234_88_12_/_0.25),transparent_45%)]" />

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="rounded-2xl border border-white/20 bg-white px-6 py-4 shadow-elevated backdrop-blur-sm">
          <BrandLogo size="lg" showTagline />
        </div>

        <div className="max-w-lg space-y-5">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-200 ring-1 ring-white/15">
            Vistoria cautelar profissional
          </p>
          <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
            Laudos precisos.
            <br />
            <span className="text-orange-300">Confiança total.</span>
          </h2>
          <p className="text-sm leading-relaxed text-white/75 xl:text-base">
            Gestão completa de inspeções, fotos, checklist, laudos em PDF e financeiro — tudo
            integrado para equipes de vistoria veicular.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {["Fotos guiadas", "Checklist digital", "Laudo PDF"].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center text-[11px] font-semibold text-white/90 backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/60">
          <ShieldCheck className="h-4 w-4 text-orange-300" strokeWidth={2} />
          <span>Dados protegidos · Conformidade LGPD</span>
        </div>
      </div>
    </div>
  );
}
