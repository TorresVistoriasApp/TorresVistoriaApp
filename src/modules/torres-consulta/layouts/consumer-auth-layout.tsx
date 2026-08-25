import { Outlet } from "react-router-dom";
import { ConsumerAuthHeader } from "@/modules/torres-consulta/layouts/consumer-auth-header";
import { ConsumerAuthShowcase } from "@/modules/torres-consulta/components/consumer-app/consumer-auth-showcase";

function AuthBrandIntro() {
  return (
    <>
      <p className="ui-eyebrow">Login Torres Consulta</p>
      <h1 className="mt-2 text-balance text-[1.75rem] font-bold leading-[1.12] text-foreground sm:text-[2rem] lg:text-[2.125rem]">
        Entre na sua conta de <span className="text-primary">cliente</span>
      </h1>
      <p className="mt-2 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        Acesse relatórios salvos e consulte novos veículos. Esta área é da Torres Consulta — não é o
        painel da Torres Vistoria.
      </p>
    </>
  );
}

export function ConsumerAuthLayout() {
  return (
    <div className="consulta-page flex min-h-dvh flex-col">
      <ConsumerAuthHeader />

      <main className="landing-hero-bg relative flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,24.5rem)] lg:gap-x-10">
            <div className="lg:col-span-2">
              <AuthBrandIntro />
            </div>

            <div className="hidden lg:col-start-1 lg:row-start-2 lg:block">
              <ConsumerAuthShowcase />
            </div>

            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
