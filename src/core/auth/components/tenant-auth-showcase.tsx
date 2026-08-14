import { Link } from "react-router-dom";
import { Camera, ClipboardCheck, FileText } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { TenantAuthBadge } from "@/core/auth/components/tenant-auth-badge";
import { BrandLogo } from "@/shared/components/brand-logo";
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { cn } from "@/shared/lib/utils";

const FEATURES = [
  { label: "Fotos guiadas", icon: Camera },
  { label: "Checklist digital", icon: ClipboardCheck },
  { label: "Laudo em PDF", icon: FileText },
] as const;

export function TenantAuthShowcase({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "tenant-auth-showcase relative min-w-0 flex-col justify-between gap-8 overflow-hidden p-10 xl:p-14",
        className,
      )}
    >
      <Link
        to={ROUTES.consultaLanding}
        className="relative w-fit shrink-0 transition-opacity hover:opacity-80"
        aria-label="Torres Vistorias, ir para Torres Consulta"
      >
        <BrandLogo size="lg" />
      </Link>

      <div className="relative shrink-0 space-y-5">
        <TenantAuthBadge className="border-orange-500/30 bg-orange-500/10 text-orange-400" />
        <h2 className="max-w-lg text-[2.35rem] font-black leading-[1.05] tracking-[-0.04em] text-white xl:text-[2.75rem]">
          Precisão em cada{" "}
          <span className="text-primary">laudo cautelar.</span>
        </h2>
        <p className="max-w-md text-[0.95rem] leading-relaxed text-neutral-400">
          Ambiente exclusivo para profissionais: evidências fotográficas, checklist técnico e emissão
          de laudos com rastreabilidade.
        </p>
      </div>

      <figure className="relative min-h-0 flex-1 overflow-hidden rounded-[1.75rem] ring-1 ring-white/10">
        <img
          src={PUBLIC_IMAGES.auth.inspection}
          alt="Vistoriador realizando inspeção técnica sob um veículo elevado"
          className="h-full w-full object-cover object-[center_40%] saturate-[0.92] contrast-[1.03]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-orange-950/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/15 to-transparent" />
      </figure>

      <ul className="relative flex shrink-0 flex-wrap items-center gap-x-7 gap-y-3">
        {FEATURES.map(({ label, icon: Icon }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm font-medium text-neutral-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-4 w-4" strokeWidth={2.25} />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
