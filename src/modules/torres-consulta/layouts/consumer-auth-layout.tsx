import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { MAIN_CONTENT_ID, SkipLink } from "@/shared/components/skip-link";

const AUTH_IMAGE = PUBLIC_IMAGES.consultations.auth;
const AUTH_IMAGE_FALLBACK = "/images/consultations/auth-bg-source.jpg";
const AUTH_SRCSET =
  "/images/consultations/auth-bg-960.webp 960w, /images/consultations/auth-bg-1600.webp 1600w, /images/consultations/auth-bg-source.jpg 1600w";

const PERKS = [
  "Relatórios salvos na conta",
  "PDF disponível na hora",
  "Consulta por placa ou chassi",
] as const;

/**
 * Layout de autenticação do consumidor.
 * Desktop/tablet: imagem à esquerda + formulário preenchendo a lateral direita.
 * Mobile: faixa de imagem no topo + formulário em largura total.
 */
export function ConsumerAuthLayout() {
  return (
    <div className="consulta-page relative min-h-dvh bg-[#0e0c0a]">
      <SkipLink />

      {/* Tablet+: split full-bleed nas laterais */}
      <div className="hidden min-h-dvh md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(22rem,1fr)] xl:grid-cols-[minmax(0,1.25fr)_minmax(26rem,0.95fr)]">
        <section className="relative isolate min-h-dvh overflow-hidden">
          <img
            src={AUTH_IMAGE}
            srcSet={AUTH_SRCSET}
            sizes="(min-width: 1280px) 55vw, 50vw"
            alt=""
            width={1600}
            height={1066}
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src !== AUTH_IMAGE_FALLBACK) el.src = AUTH_IMAGE_FALLBACK;
            }}
          />
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgb(14 12 10 / 0.35) 0%, rgb(14 12 10 / 0.12) 55%, rgb(14 12 10 / 0.45) 100%), linear-gradient(180deg, rgb(14 12 10 / 0.25) 0%, transparent 35%, rgb(14 12 10 / 0.72) 100%)",
            }}
          />

          <div className="relative z-10 flex h-full min-h-dvh flex-col justify-between p-8 lg:p-12 xl:p-14">
            <Link
              to={ROUTES.consultaLanding}
              aria-label="Torres Consulta, início"
              className="w-fit"
            >
              <ConsultaBrandLogo size="sm" showSubtitle={false} onDark />
            </Link>

            <div className="max-w-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Área do cliente Torres
              </p>
              <h1 className="mt-4 text-balance text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-white lg:text-[2.5rem] xl:text-[2.75rem]">
                Consulte com segurança.
                <span className="mt-1 block text-white/90">Decida com clareza.</span>
              </h1>
              <p className="mt-4 text-pretty text-[15px] font-medium leading-[1.7] text-white/70 lg:text-base">
                Histórico veicular completo na sua conta: leilão, sinistro, restrições e score.
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

            <p className="text-xs text-white/40">
              Emite laudo cautelar?{" "}
              <Link
                to={ROUTES.vistoriaLogin}
                className="font-semibold text-primary transition-colors hover:text-[#ffb087]"
              >
                Acesse a Torres Vistoria
              </Link>
            </p>
          </div>
        </section>

        <aside className="relative flex min-h-dvh w-full flex-col border-l border-white/5 bg-[#f6f4f1]">
          <header className="flex shrink-0 items-center justify-end px-6 pt-6 lg:px-10 lg:pt-8">
            <Link
              to={ROUTES.consultaLanding}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold tracking-wide text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Voltar ao site
            </Link>
          </header>

          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-8 lg:max-w-xl lg:px-10 lg:py-10"
          >
            <Outlet />
          </main>

          <footer className="shrink-0 px-6 pb-6 text-center text-xs text-muted-foreground lg:px-10 lg:pb-8">
            Precisa consultar agora?{" "}
            <Link to={ROUTES.consultar} className="font-semibold text-primary hover:underline">
              Ir para consulta
            </Link>
          </footer>
        </aside>
      </div>

      {/* Mobile: formulário em largura total, sem card flutuante */}
      <div className="flex min-h-dvh flex-col md:hidden">
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-52">
          <img
            src={AUTH_IMAGE}
            srcSet={AUTH_SRCSET}
            sizes="100vw"
            alt=""
            width={1600}
            height={1066}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src !== AUTH_IMAGE_FALLBACK) el.src = AUTH_IMAGE_FALLBACK;
            }}
          />
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgb(14 12 10 / 0.15) 0%, rgb(14 12 10 / 0.78) 100%)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-between p-5">
            <ConsultaBrandLogo size="sm" showSubtitle={false} onDark />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Área do cliente Torres
              </p>
              <h1 className="mt-1.5 text-[1.375rem] font-bold tracking-[-0.02em] text-white">
                Consulte com segurança
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-[#f6f4f1]">
          <div className="flex justify-end px-5 pt-4">
            <Link
              to={ROUTES.consultaLanding}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Voltar ao site
            </Link>
          </div>
          <main className="flex w-full flex-1 flex-col px-5 py-5 sm:px-6">
            <Outlet />
            <p className="mt-8 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-muted-foreground">
              Precisa consultar agora?{" "}
              <Link to={ROUTES.consultar} className="font-semibold text-primary hover:underline">
                Ir para consulta
              </Link>
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
