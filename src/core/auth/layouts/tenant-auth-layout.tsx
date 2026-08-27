import { Link, Outlet } from "react-router-dom";
import { Check, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { BrandLogo } from "@/shared/components/brand-logo";
import { MAIN_CONTENT_ID, SkipLink } from "@/shared/components/skip-link";

const AUTH_IMAGE = PUBLIC_IMAGES.auth.inspection;

const PERKS = [
  "Checklist técnico por etapa",
  "Fotos com data e local",
  "Laudo em PDF rastreável",
] as const;

/**
 * Layout premium de autenticação do vistoriador.
 * Tablet+: imagem full-bleed à esquerda + formulário na lateral direita.
 * Mobile: faixa de imagem no topo + formulário em largura total.
 */
export function TenantAuthLayout() {
  return (
    <div className="consulta-page relative min-h-dvh bg-[#0a0d12]">
      <SkipLink />

      <div className="hidden min-h-dvh md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(22rem,1fr)] xl:grid-cols-[minmax(0,1.25fr)_minmax(26rem,0.95fr)]">
        <section className="relative isolate min-h-dvh overflow-hidden">
          <img
            src={AUTH_IMAGE}
            alt=""
            width={1200}
            height={800}
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
          />
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgb(10 13 18 / 0.55) 0%, rgb(10 13 18 / 0.28) 45%, rgb(10 13 18 / 0.62) 100%), linear-gradient(180deg, rgb(10 13 18 / 0.35) 0%, transparent 32%, rgb(10 13 18 / 0.82) 100%)",
            }}
          />

          <div className="relative z-10 flex h-full min-h-dvh flex-col justify-between p-8 lg:p-12 xl:p-14">
            <Link to={ROUTES.consultaLanding} aria-label="Torres Vistoria, início" className="w-fit">
              <BrandLogo size="md" />
            </Link>

            <div className="max-w-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Área do vistoriador
              </p>
              <h1 className="mt-4 text-balance text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-white lg:text-[2.5rem] xl:text-[2.75rem]">
                Precisão em cada laudo.
                <span className="mt-1 block text-white/90">Controle em cada vistoria.</span>
              </h1>
              <p className="mt-4 text-pretty text-[15px] font-medium leading-[1.7] text-white/70 lg:text-base">
                Checklist, fotos guiadas e laudo em PDF no mesmo sistema. Feito para quem vive de
                vistoria cautelar.
              </p>

              <ul className="mt-8 space-y-3">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-sm font-medium text-white/85">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-glow">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <p className="mt-10 flex items-center gap-2 text-xs text-white/45">
                <ShieldCheck className="h-3.5 w-3.5 text-success" strokeWidth={2.25} aria-hidden />
                Dados protegidos, conforme a LGPD
              </p>
            </div>
          </div>
        </section>

        <aside className="relative flex min-h-dvh w-full flex-col border-l border-white/5 bg-[#f6f4f1]">
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10 lg:max-w-xl lg:px-10 lg:py-12"
          >
            <Outlet />
          </main>
        </aside>
      </div>

      <div className="flex min-h-dvh flex-col md:hidden">
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-52">
          <img
            src={AUTH_IMAGE}
            alt=""
            width={1200}
            height={800}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          />
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgb(10 13 18 / 0.2) 0%, rgb(10 13 18 / 0.82) 100%)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-between p-5">
            <Link to={ROUTES.consultaLanding} aria-label="Torres Vistoria, início" className="w-fit">
              <BrandLogo size="md" />
            </Link>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Área do vistoriador
              </p>
              <h1 className="mt-1.5 text-[1.375rem] font-bold tracking-[-0.02em] text-white">
                Precisão em cada laudo
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-[#f6f4f1]">
          <main className="flex w-full flex-1 flex-col px-5 py-5 sm:px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
