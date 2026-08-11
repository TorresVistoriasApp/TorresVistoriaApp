import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/shared/lib/utils";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ClipboardCheck,
    title: "Checklist técnico completo",
    description: "Mais de 80 itens avaliados com critérios claros para cada componente do veículo.",
  },
  {
    icon: Camera,
    title: "Fotos guiadas e georreferenciadas",
    description: "Captura orientada por ângulos técnicos, com registro de local e horário da vistoria.",
  },
  {
    icon: FileText,
    title: "Laudo cautelar em PDF",
    description: "Documento profissional com parecer técnico, fotos, score e validação por código QR.",
  },
  {
    icon: QrCode,
    title: "Validação pública do laudo",
    description: "Compradores e parceiros podem verificar a autenticidade do documento online.",
  },
];

const WORKFLOW = [
  { step: 1, label: "Cadastre a vistoria", detail: "Placa, cliente e tipo de serviço" },
  { step: 2, label: "Registre evidências", detail: "Fotos técnicas e checklist" },
  { step: 3, label: "Emita o laudo", detail: "PDF pronto para entrega" },
] as const;

export function InspectorSection() {
  return (
    <section
      id="vistoriadores"
      className="relative overflow-hidden bg-slate-950 py-20 sm:py-28"
      aria-labelledby="vistoriadores-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(14_165_233_/_0.12),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgb(234_88_12_/_0.06),transparent_40%)]" />
      <div className="landing-grid-bg pointer-events-none absolute inset-0 opacity-[0.06]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Torres Vistoria
            </p>
            <h2
              id="vistoriadores-title"
              className="mt-5 text-2xl font-black tracking-tight text-white sm:text-4xl"
            >
              Plataforma profissional para{" "}
              <span className="bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
                laudo cautelar
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Se você é vistoriador ou empresa de vistoria cautelar, a Torres Vistoria é a ferramenta
              certa. Conduza inspeções completas no campo e gere laudos profissionais com poucos cliques
              — sem planilhas, sem retrabalho.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Laudo cautelar veicular com parecer técnico",
                "Gestão de vistorias, clientes e equipe",
                "Indicadores financeiros e relatórios operacionais",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="rounded-xl bg-sky-600 hover:bg-sky-500" asChild>
                <Link to={ROUTES.vistoriaLogin}>
                  Acessar plataforma
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-slate-600 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link to={ROUTES.vistoriaLogin}>
                  <Users className="h-4 w-4" />
                  Sou vistoriador — entrar
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Não confundir com Torres Consulta — aqui é para profissionais que realizam vistorias e
              emitem laudos.
            </p>
          </ScrollReveal>

          <ScrollReveal delayMs={120}>
            <div className="relative">
              {/* Workflow card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400">
                  Como funciona na prática
                </p>
                <ol className="mt-6 space-y-4">
                  {WORKFLOW.map((item, index) => (
                    <li key={item.step} className="flex gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-sm font-black text-white">
                        {item.step}
                      </span>
                      <div className="flex-1 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                        <p className="font-semibold text-white">{item.label}</p>
                        <p className="mt-0.5 text-sm text-slate-400">{item.detail}</p>
                      </div>
                      {index < WORKFLOW.length - 1 && (
                        <div className="absolute left-[2.65rem] hidden sm:block" aria-hidden />
                      )}
                    </li>
                  ))}
                </ol>

                {/* Mini laudo preview */}
                <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      Laudo cautelar
                    </p>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Aprovado
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-white">VW T-Cross · Placa BRA2E19</p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-3xl font-black text-white">94</span>
                    <span className="pb-1 text-xs text-slate-400">/100 score cautelar</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" />
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500">
                    PDF com fotos, checklist e código de validação QR
                  </p>
                </div>
              </div>

              {/* Feature pills */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className={cn(
                      "rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-sky-500/25 hover:bg-white/8",
                    )}
                  >
                    <feature.icon className="h-5 w-5 text-sky-400" strokeWidth={1.75} />
                    <p className="mt-2 text-sm font-semibold text-white">{feature.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
