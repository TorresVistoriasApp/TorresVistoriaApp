import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car,
  ChevronRight,
  Clock3,
  FileSearch,
  FileText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { ConsumerConsultaListItem } from "@/modules/torres-consulta/components/consumer-app/consumer-consulta-list-item";
import { ConsumerDashboardSkeleton } from "@/modules/torres-consulta/components/consumer-app/consumer-dashboard-skeleton";
import { ConsumerPlanOffersSection } from "@/modules/torres-consulta/components/consumer-app/consumer-plan-offers";
import { ConsumerSurface } from "@/modules/torres-consulta/components/consumer-app/consumer-surface";
import {
  useConsumerConsultas,
  useConsumerDashboardSummary,
} from "@/modules/torres-consulta/hooks/use-consumer-consultas";
import { getConsumerConsultaIdentifier } from "@/modules/torres-consulta/utils/consumer-consulta-presentation";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}

function StatTile({ label, value, icon: Icon, accent }: StatTileProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/90 bg-white/90 p-3.5 shadow-[0_4px_16px_rgb(15_23_42_/_0.04)] backdrop-blur-sm sm:p-4">
      <div className={`pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full blur-2xl ${accent}`} />
      <div className="relative flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-black tabular-nums tracking-tight text-foreground sm:text-2xl">
            {value}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900/[0.04] text-primary sm:h-9 sm:w-9 sm:rounded-xl">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

export function ClienteDashboardPage() {
  const { resolution } = usePrincipal();
  const { data: summary, isLoading: summaryLoading } = useConsumerDashboardSummary();
  const { data: consultas, isLoading: consultasLoading } = useConsumerConsultas();

  const firstName =
    resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER
      ? resolution.consumerProfile.full_name.split(" ")[0]
      : null;

  const recentConsultas = consultas?.slice(0, 5) ?? [];
  const isLoading = summaryLoading || consultasLoading;
  const hasConsultas = recentConsultas.length > 0;

  if (isLoading) {
    return <ConsumerDashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-7 md:max-w-none md:space-y-9">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-[linear-gradient(145deg,rgb(255_255_255/0.98)_0%,rgb(255_247_237/0.92)_48%,rgb(255_255_255/0.95)_100%)] p-5 shadow-[0_20px_50px_rgb(15_23_42_/_0.08)] sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/90">
              {getGreeting()}
            </p>
            <span className="rounded-full border border-primary/15 bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-primary">
              Pagamento avulso
            </span>
          </div>

          <h1 className="mt-2 text-[1.75rem] font-black leading-[1.1] tracking-tight text-foreground sm:text-[2rem]">
            {firstName ? (
              <>
                Olá, <span className="text-gradient-brand">{firstName}</span>
              </>
            ) : (
              "Sua área"
            )}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Consulte veículos com preço fixo por plano. Sem créditos, sem pacote — pague só quando
            for consultar.
          </p>

          <Link
            to={ROUTES.consultaAppNovaConsulta}
            className="group mt-5 flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#c2410c_0%,#ea580c_50%,#f97316_100%)] p-4 text-white shadow-[0_16px_40px_rgb(234_88_12_/_0.35)] transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
                <Car className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-bold">Consultar agora</p>
                <p className="text-xs text-white/85">A partir de R$ 19,90 · PIX ou cartão</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Resumo */}
      <section aria-label="Resumo da conta">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Sua atividade</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground ring-1 ring-border/60">
            <Sparkles className="h-3 w-3 text-primary" />
            Resumo
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
          <StatTile
            label="Consultas"
            value={String(summary?.totalConsultas ?? 0)}
            icon={FileSearch}
            accent="bg-orange-400/25"
          />
          <StatTile
            label="Relatórios"
            value={String(summary?.completedConsultas ?? 0)}
            icon={FileText}
            accent="bg-emerald-400/25"
          />
          <StatTile
            label="Em andamento"
            value={String(summary?.processingConsultas ?? 0)}
            icon={Clock3}
            accent="bg-amber-400/25"
          />
          <StatTile
            label="Última placa"
            value={
              summary?.lastConsulta
                ? getConsumerConsultaIdentifier(summary.lastConsulta)
                : "—"
            }
            icon={Car}
            accent="bg-violet-400/25"
          />
        </div>
      </section>

      {/* Planos avulsos */}
      <ConsumerPlanOffersSection />

      {/* Consultas recentes */}
      <section aria-label="Consultas recentes">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-foreground">Consultas recentes</h2>
          {hasConsultas && (
            <Link
              to={ROUTES.consultaAppConsultas}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary"
            >
              Ver todas
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {!hasConsultas ? (
          <ConsumerSurface className="border-dashed border-primary/20 bg-white/60 px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileSearch className="h-6 w-6" />
            </div>
            <p className="mt-4 text-base font-bold text-foreground">Nenhuma consulta ainda</p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Escolha um plano avulso e receba o relatório em PDF logo após o pagamento.
            </p>
            <Link
              to={ROUTES.consultaAppNovaConsulta}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Ver planos e consultar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ConsumerSurface>
        ) : (
          <ConsumerSurface padding="none" className="divide-y divide-border/40">
            {recentConsultas.map((consulta) => (
              <ConsumerConsultaListItem key={consulta.id} consulta={consulta} variant="flat" />
            ))}
          </ConsumerSurface>
        )}
      </section>
    </div>
  );
}
