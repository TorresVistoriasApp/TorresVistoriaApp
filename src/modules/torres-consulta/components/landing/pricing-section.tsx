import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/shared/lib/utils";

const PLANS = [
  {
    name: "Básico",
    price: "19,90",
    originalPrice: null,
    description: "Primeira verificação essencial.",
    features: ["Consulta por placa", "Histórico básico", "Relatório em PDF", "Entrega imediata"],
    highlighted: false,
  },
  {
    name: "Completo",
    price: "39,90",
    originalPrice: "59,90",
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
    originalPrice: "99,90",
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
    <section id="planos" className="bg-canvas py-20 sm:py-28" aria-labelledby="planos-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Planos</p>
          <h2
            id="planos-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-4xl"
          >
            Escolha o nível de análise ideal
          </h2>
          <p className="mt-4 text-muted-foreground">
            Preços ilustrativos. Compare e escolha com transparência.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <ScrollReveal key={plan.name} delayMs={index * 100}>
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-300",
                  plan.highlighted
                    ? "landing-shimmer-border border-primary/30 bg-white shadow-elevated lg:-translate-y-2"
                    : "border-border/60 bg-white/80 shadow-soft hover:-translate-y-1 hover:shadow-elevated",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-glow">
                    <Sparkles className="h-3 w-3" />
                    Mais escolhido
                  </span>
                )}

                <h3 className="text-xl font-bold text-foreground">Plano {plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mt-6 flex items-end gap-2">
                  {plan.originalPrice && (
                    <span className="pb-1 text-sm text-muted-foreground line-through">
                      R$ {plan.originalPrice}
                    </span>
                  )}
                  <p>
                    <span className="text-sm font-medium text-muted-foreground">R$</span>{" "}
                    <span className="text-4xl font-black tracking-tight text-foreground">
                      {plan.price}
                    </span>
                  </p>
                </div>
                {plan.originalPrice && (
                  <p className="mt-1 text-xs font-semibold text-emerald-600">
                    Economia de R${" "}
                    {(parseFloat(plan.originalPrice.replace(",", ".")) -
                      parseFloat(plan.price.replace(",", ".")))
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>
                )}

                <ul className="mt-6 flex-1 space-y-3 border-t border-border/40 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-8 h-12 w-full rounded-xl font-semibold"
                  asChild
                >
                  <Link to={ROUTES.consultar}>Consultar Veículo</Link>
                </Button>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-10 text-center" delayMs={200}>
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem download imediato e armazenamento na área do cliente.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
