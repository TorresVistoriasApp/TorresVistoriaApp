import { useState } from "react";
import { Plus } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { SectionHeader } from "./section-header";
import { LandingSection } from "./landing-ui";
import { cn } from "@/shared/lib/utils";

const FAQ_ITEMS = [
  {
    question: "Quanto tempo demora para sair o relatório?",
    answer:
      "Assim que o pagamento é confirmado, o relatório já fica disponível para download na sua conta.",
  },
  {
    question: "Posso consultar por placa ou chassi?",
    answer:
      "Sim. Use a placa do carro ou o chassi com 17 caracteres. Os dois levam ao mesmo veículo.",
  },
  {
    question: "Posso confiar nos dados?",
    answer:
      "Trabalhamos com bases oficiais e parceiros do setor. As informações são atualizadas com frequência.",
  },
  {
    question: "Preciso criar conta?",
    answer:
      "Sim, mas o cadastro é grátis. Assim você guarda, baixa e consulta seus relatórios quando quiser.",
  },
  {
    question: "Qual a diferença entre Torres Consulta e Torres Vistoria?",
    answer:
      "A Torres Consulta é para quem vai comprar um carro e quer ver o histórico antes de fechar negócio. A Torres Vistoria é para profissionais e empresas que fazem vistoria cautelar e precisam emitir laudo em PDF.",
  },
  {
    question: "Como peço para apagar meus dados?",
    answer:
      "Nas configurações da sua conta você pode solicitar a exclusão. O pedido segue os prazos da LGPD.",
  },
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <LandingSection id="faq" tone="surface" aria-labelledby="faq-title">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <SectionHeader eyebrow="Dúvidas" title="Perguntas frequentes" titleId="faq-title" />
        </ScrollReveal>

        <div className="mt-9 overflow-hidden rounded-2xl border border-border bg-card">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;

            return (
              <div
                key={item.question}
                className={cn(index > 0 && "border-t border-border")}
              >
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span
                      className={cn(
                        "text-[15px] font-semibold transition-colors sm:text-base",
                        isOpen ? "text-foreground" : "text-foreground/90",
                      )}
                    >
                      {item.question}
                    </span>
                    <Plus
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-45 text-primary" : "text-subtle-foreground",
                      )}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-hidden={!isOpen}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl px-5 pb-4 pr-12 text-sm leading-relaxed text-muted-foreground sm:px-6">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LandingSection>
  );
}
