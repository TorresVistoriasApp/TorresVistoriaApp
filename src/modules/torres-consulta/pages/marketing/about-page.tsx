import { Building2, Clock, Mail, MapPin, Shield, Target, Users, Zap } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import { ConversionCta } from "@/modules/torres-consulta/components/marketing/conversion-cta";

const VALUES = [
  { icon: Shield, title: "Transparência", desc: "Informação clara, sem letras miúdas ou surpresas." },
  { icon: Zap, title: "Agilidade", desc: "Relatórios disponíveis em segundos após o pagamento." },
  { icon: Users, title: "Acessibilidade", desc: "Consulta veicular para qualquer pessoa física." },
  { icon: Target, title: "Precisão", desc: "Dados consolidados de fontes oficiais e parceiros." },
];

const TIMELINE = [
  { year: "2018", event: "Fundação da Torres Vistorias em operação cautelar." },
  { year: "2021", event: "Expansão para gestão digital de laudos e vistorias." },
  { year: "2024", event: "Lançamento do Ecossistema Torres com integrações avançadas." },
  { year: "2026", event: "Lançamento da Torres Consulta para o consumidor final." },
];

export function AboutPage() {
  return (
    <MarketingShell
      seo={{
        title: "Sobre a Torres Consulta",
        description:
          "Conheça a Torres Consulta: tecnologia, segurança e compromisso com transparência na consulta veicular para pessoa física.",
        canonicalPath: ROUTES.sobre,
        schema: {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Torres Consulta",
          description: "Plataforma de consulta veicular para pessoa física.",
          url: "https://torresconsulta.com.br",
        },
      }}
      breadcrumb={[{ label: "Sobre" }]}
      hero={{
        eyebrow: "Quem somos",
        title: "Tecnologia que protege quem compra veículo",
        description:
          "A Torres Consulta nasceu dentro do Ecossistema Torres, referência em vistoria cautelar, para levar a mesma seriedade ao consumidor que vai comprar um carro.",
      }}
      fullWidth
    >
      <div className="grid gap-12 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Nossa missão</h2>
          <p className="leading-relaxed text-muted-foreground">
            Democratizar o acesso a informações veiculares confiáveis, permitindo que qualquer
            pessoa tome decisões seguras na compra de um carro usado, sem depender só da
            palavra do vendedor.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Nossa visão</h2>
          <p className="leading-relaxed text-muted-foreground">
            Ser a plataforma de consulta veicular mais confiável do Brasil, reconhecida pela
            clareza dos relatórios, pela proteção de dados e pela experiência premium em cada
            interação.
          </p>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-foreground">Nossos valores</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-foreground">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
          <Building2 className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-foreground">Tecnologia e infraestrutura</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Operamos em nuvem com alta disponibilidade, criptografia TLS em todas as comunicações e
            autenticação segura via Supabase Auth. Nossos relatórios consolidam dados de bases
            oficiais e parceiros especializados em tempo real.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
          <Shield className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-foreground">Compromisso com segurança e LGPD</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tratamos dados pessoais com base legal, minimização e transparência. Você controla suas
            informações: exportação, correção e exclusão conforme a Lei 13.709/2018.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-foreground">Nossa história</h2>
        <ol className="relative mt-6 space-y-0 border-l-2 border-primary/20 pl-6">
          {TIMELINE.map((item) => (
            <li key={item.year} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-canvas" />
              <p className="text-sm font-black text-primary">{item.year}</p>
              <p className="mt-0.5 text-foreground">{item.event}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-slate-100 text-sm text-muted-foreground"
          >
            Foto institucional {n}
          </div>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-foreground">Contato institucional</h2>
        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-8">
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            contato@torresconsulta.com.br
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Brasil, atendimento 100% digital
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Seg a sex, 9h às 18h
          </span>
        </div>
      </section>

      <ConversionCta className="mt-14" />
    </MarketingShell>
  );
}
