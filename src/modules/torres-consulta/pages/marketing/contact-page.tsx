import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const QUICK_FAQ = [
  {
    q: "Qual o prazo de resposta?",
    a: "Respondemos em até 1 dia útil por e-mail.",
  },
  {
    q: "Atendem fins de semana?",
    a: "O suporte por formulário funciona 24h; respostas em dias úteis.",
  },
  {
    q: "Preciso de ajuda com um relatório?",
    a: "Informe o protocolo da consulta na mensagem para agilizar.",
  },
];

export function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <MarketingShell
      seo={{
        title: "Contato",
        description:
          "Entre em contato com a Torres Consulta. Tire dúvidas sobre consultas veiculares, pagamentos e suporte.",
        canonicalPath: ROUTES.contato,
        schema: {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contato Torres Consulta",
        },
      }}
      breadcrumb={[{ label: "Contato" }]}
      hero={{
        eyebrow: "Fale conosco",
        title: "Estamos aqui para ajudar",
        description:
          "Dúvidas sobre consultas, pagamentos ou sua conta? Envie uma mensagem e nossa equipe retorna em breve.",
        compact: true,
      }}
      fullWidth
    >
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {sent ? (
            <div
              role="status"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"
            >
              <p className="text-lg font-bold text-emerald-800">Mensagem enviada!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Retornaremos em até 1 dia útil no e-mail informado.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-border/60 bg-white p-6 shadow-soft sm:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" required placeholder="Seu nome completo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" required placeholder="seu@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" type="tel" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  required
                  rows={5}
                  placeholder="Como podemos ajudar?"
                  className="flex w-full rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Enviar mensagem
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
            <h2 className="font-bold text-foreground">Horário de atendimento</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Segunda a sexta, 9h às 18h
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                contato@torresconsulta.com.br
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                (11) 4000-0000
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                Atendimento 100% digital, em todo o Brasil
              </li>
            </ul>
          </div>

          <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border/60 bg-slate-100 text-sm text-muted-foreground">
            <MapPin className="mr-2 h-5 w-5" />
            Mapa em breve
          </div>

          <div className="rounded-2xl border border-border/60 bg-slate-50 p-6">
            <h2 className="font-bold text-foreground">FAQ rápido</h2>
            <dl className="mt-4 space-y-4">
              {QUICK_FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </MarketingShell>
  );
}
