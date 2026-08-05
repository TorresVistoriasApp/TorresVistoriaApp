import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const FAQ_ITEMS = [
  {
    question: "Quanto tempo leva para receber o relatório?",
    answer:
      "Após a confirmação do pagamento, o relatório fica disponível imediatamente para download em sua área do cliente.",
  },
  {
    question: "Posso consultar por placa ou chassi?",
    answer:
      "Sim. Você pode realizar a consulta informando a placa do veículo ou o número do chassi (VIN) com 17 caracteres.",
  },
  {
    question: "Os dados são confiáveis?",
    answer:
      "Utilizamos bases oficiais e parceiros especializados para consolidar as informações. Os dados são atualizados regularmente.",
  },
  {
    question: "Preciso criar uma conta?",
    answer:
      "Sim. O cadastro é gratuito e permite que você acesse, baixe e gerencie todos os seus relatórios em um só lugar.",
  },
  {
    question: "Qual a diferença entre Torres Consulta e Torres Vistoria?",
    answer:
      "Torres Consulta é destinado a pessoas físicas que desejam consultar veículos antes de comprar. Torres Vistoria é a plataforma profissional para empresas de vistoria cautelar.",
  },
  {
    question: "Como solicito a exclusão dos meus dados?",
    answer:
      "Na área de configurações do cliente, você pode solicitar a exclusão da conta. O pedido será processado conforme os prazos legais da LGPD.",
  },
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-canvas py-16 sm:py-20" aria-labelledby="faq-title">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h2
            id="faq-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
          >
            Perguntas frequentes
          </h2>
        </div>

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
      </div>
    </section>
  );
}
