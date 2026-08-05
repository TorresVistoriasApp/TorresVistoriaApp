import { Check, FileSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const PLANS = [
  {
    name: "Básico",
    price: "19,90",
    description: "Essencial para uma primeira verificação.",
    features: ["Consulta por placa", "Histórico básico", "Relatório em PDF", "Entrega imediata"],
    highlighted: false,
  },
  {
    name: "Completo",
    price: "39,90",
    description: "O mais escolhido por compradores exigentes.",
    features: [
      "Tudo do Básico",
      "Sinistros e leilão",
      "Restrições financeiras",
      "Score veicular",
      "Suporte por e-mail",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "69,90",
    description: "Análise máxima antes da compra.",
    features: [
      "Tudo do Completo",
      "Decodificação VIN",
      "Fotos históricas",
      "Histórico de proprietários",
      "Prioridade no suporte",
    ],
    highlighted: false,
  },
] as const;

export function PricingSection() {
  return (
    <section id="planos" className="bg-white py-16 sm:py-20" aria-labelledby="planos-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Planos</p>
          <h2
            id="planos-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
          >
            Escolha o relatório ideal para você
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Preços ilustrativos — serão atualizados em breve.
          </p>
          <Button variant="outline" className="mt-5" asChild>
            <Link to={ROUTES.relatorioExemplo}>
              <FileSearch className="h-4 w-4" />
              Ver Exemplo de Relatório
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated",
                plan.highlighted
                  ? "border-primary/30 bg-gradient-to-b from-primary/5 to-white ring-1 ring-primary/20"
                  : "border-border/60 bg-slate-50/30",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Mais popular
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">Plano {plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-6">
                <span className="text-sm font-medium text-muted-foreground">R$</span>{" "}
                <span className="text-4xl font-black tracking-tight text-foreground">
                  {plan.price}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? "default" : "outline"}
                className="mt-8 w-full"
                asChild
              >
                <a href="#consultar">Consultar Agora</a>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
