import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car,
  ChevronRight,
  Clock3,
  FileSearch,
  FileText,
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
}

function StatTile({ label, value, icon: Icon }: StatTileProps) {
  return (
    <div className="landing-card p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
            {label}
          </p>
          <p className="tabular mt-1.5 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {value}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
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
      <section className="landing-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="landing-eyebrow">{getGreeting()}</p>
          <span className="landing-badge">Pagamento avulso</span>
        </div>

        <h1 className="mt-3 text-[1.625rem] font-bold leading-[1.1] text-foreground sm:text-[1.875rem]">
          {firstName ? `Olá, ${firstName}` : "Sua área"}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Consulte veículos com preço fixo por plano. Sem créditos e sem pacote — você paga só
          quando for consultar.
        </p>

        <Link
          to={ROUTES.consultaAppNovaConsulta}
          className="group mt-5 flex items-center justify-between gap-4 rounded-lg bg-primary p-4 text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <Car className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <span className="block">
              <span className="block text-sm font-bold">Consultar agora</span>
              <span className="block text-xs text-white/85">
                A partir de R$ 19,90 · PIX ou cartão
              </span>
            </span>
          </span>
          <ArrowRight
            className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </section>

      {/* Resumo */}
      <section aria-label="Resumo da conta">
        <h2 className="mb-3 text-sm font-bold text-foreground">Sua atividade</h2>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
          <StatTile
            label="Consultas"
            value={String(summary?.totalConsultas ?? 0)}
            icon={FileSearch}
          />
          <StatTile
            label="Relatórios"
            value={String(summary?.completedConsultas ?? 0)}
            icon={FileText}
          />
          <StatTile
            label="Em andamento"
            value={String(summary?.processingConsultas ?? 0)}
            icon={Clock3}
          />
          <StatTile
            label="Última placa"
            value={
              summary?.lastConsulta ? getConsumerConsultaIdentifier(summary.lastConsulta) : "—"
            }
            icon={Car}
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
          <ConsumerSurface className="border-dashed px-6 py-10 text-center">
            <div className="landing-icon-box mx-auto h-12 w-12">
              <FileSearch className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 text-base font-bold text-foreground">Nenhuma consulta ainda</p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Escolha um plano avulso e receba o relatório em PDF logo após o pagamento.
            </p>
            <Link
              to={ROUTES.consultaAppNovaConsulta}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Ver planos e consultar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </ConsumerSurface>
        ) : (
          <ConsumerSurface padding="none" className="divide-y divide-border">
            {recentConsultas.map((consulta) => (
              <ConsumerConsultaListItem key={consulta.id} consulta={consulta} variant="flat" />
            ))}
          </ConsumerSurface>
        )}
      </section>
    </div>
  );
}
