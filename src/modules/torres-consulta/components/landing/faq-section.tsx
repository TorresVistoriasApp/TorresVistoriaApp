import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
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
    <section id="faq" className="bg-canvas py-16 sm:py-20" aria-labelledby="faq-title">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Dúvidas</p>
          <h2
            id="faq-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
          >
            Perguntas frequentes
          </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={100}>
          <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-soft"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-foreground">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-200",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
