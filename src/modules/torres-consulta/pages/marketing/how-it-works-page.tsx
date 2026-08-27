import { Link } from "react-router-dom";
import {
  CreditCard,
  Download,
  FileText,
  Mail,
  Search,
  UserPlus,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import { ConversionCta } from "@/modules/torres-consulta/components/marketing/conversion-cta";

const STEPS = [
  {
    icon: Search,
    title: "1. Informe placa ou chassi",
    description:
      "Digite o identificador do veículo na página inicial. Validamos o formato antes de seguir.",
  },
  {
    icon: UserPlus,
    title: "2. Crie sua conta",
    description:
      "Cadastro grátis com email. Você precisa estar logado para acessar e baixar relatórios.",
  },
  {
    icon: FileText,
    title: "3. Escolha o relatório",
    description:
      "Selecione o plano que atende sua necessidade: Básico, Completo ou Premium.",
  },
  {
    icon: CreditCard,
    title: "4. Realize o pagamento",
    description:
      "Pagamento seguro via cartão ou PIX. Confirmação na hora após a aprovação.",
  },
  {
    icon: Download,
    title: "5. Acesse o relatório",
    description:
      "O relatório fica disponível na hora na área do cliente, com download em PDF.",
  },
  {
    icon: Mail,
    title: "6. Receba por email",
    description:
      "Enviamos um email com o link de acesso e o resumo da consulta para o seu registro.",
  },
];

export function HowItWorksPage() {
  return (
    <MarketingShell
      seo={{
        title: "Como Funciona",
        description:
          "Entenda como consultar um veículo na Torres Consulta: da busca ao download do relatório completo em poucos minutos.",
        canonicalPath: ROUTES.comoFunciona,
        schema: {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Como consultar um veículo na Torres Consulta",
          step: STEPS.map((s, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: s.title,
            text: s.description,
          })),
        },
      }}
      breadcrumb={[{ label: "Como funciona" }]}
      hero={{
        eyebrow: "Simples e transparente",
        title: "Do cadastro ao relatório em minutos",
        description:
          "Um fluxo pensado para quem quer segurança na compra do carro usado, sem burocracia e com a clareza da Torres.",
      }}
      fullWidth
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step) => (
          <article
            key={step.title}
            className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <step.icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 font-bold text-foreground">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
        <p className="text-lg font-bold text-foreground">Quer ver o resultado antes de comprar?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Confira nosso relatório de exemplo com dados fictícios.
        </p>
        <Link
          to={ROUTES.relatorioExemplo}
          className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          Ver relatório de exemplo
        </Link>
      </div>

      <div className="mt-12">
        <ConversionCta />
      </div>
    </MarketingShell>
  );
}
