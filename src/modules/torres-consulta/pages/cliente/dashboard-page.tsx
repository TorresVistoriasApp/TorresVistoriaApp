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
import { ConsumerSectionHeading } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
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
    <div className="ui-panel flex h-full flex-col justify-between gap-4 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="ui-microlabel pt-0.5">{label}</p>
        <span className="ui-icon-box h-9 w-9">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      <p className="ui-metric truncate text-[1.5rem] font-bold leading-none text-foreground sm:text-[1.75rem]">
        {value}
      </p>
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
    <div className="mx-auto max-w-lg space-y-6 md:max-w-none md:space-y-8">
      <section className="ui-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="ui-eyebrow">{getGreeting()}</p>
          <span className="landing-badge">Pagamento avulso</span>
        </div>

        <h1 className="mt-3 text-balance text-[1.625rem] font-bold leading-[1.1] text-foreground sm:text-[1.875rem]">
          {firstName ? `Olá, ${firstName}` : "Sua área"}
        </h1>
        <p className="mt-2 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">
          Consulte veículos com preço fixo por plano. Você paga só quando for consultar.
        </p>

        <Link
          to={ROUTES.consultaAppNovaConsulta}
          className="group mt-5 flex items-center justify-between gap-4 rounded-lg bg-primary p-4 text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <Car className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <span className="block">
              <span className="block text-sm font-bold">Consultar agora</span>
              <span className="block text-xs text-primary-foreground/85">
                A partir de R$ 19,90 · PIX ou cartão
              </span>
            </span>
          </span>
          <ArrowRight
            className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </section>

      <section aria-label="Resumo da conta">
        <ConsumerSectionHeading title="Sua atividade" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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

      <ConsumerPlanOffersSection />

      <section aria-label="Consultas recentes">
        <ConsumerSectionHeading
          title="Consultas recentes"
          action={
            hasConsultas ? (
              <Link
                to={ROUTES.consultaAppConsultas}
                className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-primary"
              >
                Ver todas
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : undefined
          }
        />

        {!hasConsultas ? (
          <ConsumerSurface className="border-dashed px-6 py-10 text-center">
            <div className="ui-icon-box mx-auto h-12 w-12">
              <FileSearch className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 text-[17px] font-bold text-foreground">Nenhuma consulta ainda</p>
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
