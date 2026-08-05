export interface HelpArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const HELP_CATEGORIES = [
  "Conta",
  "Pagamento",
  "Consultas",
  "Relatórios",
  "Privacidade",
  "LGPD",
  "Segurança",
] as const;

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "conta-1",
    category: "Conta",
    question: "Como criar minha conta?",
    answer:
      "Clique em Entrar e depois em Cadastre-se gratuitamente. Informe nome, e-mail e senha. Você receberá um e-mail de confirmação para ativar a conta.",
    keywords: ["cadastro", "criar conta", "registro"],
  },
  {
    id: "conta-2",
    category: "Conta",
    question: "Esqueci minha senha. O que fazer?",
    answer:
      "Na tela de login, clique em Esqueci minha senha. Enviaremos um link seguro para redefinir sua senha.",
    keywords: ["senha", "recuperar", "login"],
  },
  {
    id: "pagamento-1",
    category: "Pagamento",
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos cartão de crédito e PIX. O pagamento é processado de forma segura por gateway certificado PCI.",
    keywords: ["pix", "cartão", "pagar"],
  },
  {
    id: "pagamento-2",
    category: "Pagamento",
    question: "Recebi cobrança mas não obtive o relatório.",
    answer:
      "Verifique sua área do cliente em Minhas Consultas. Se o status estiver como Processando por mais de 10 minutos, entre em contato pelo formulário de suporte.",
    keywords: ["cobrança", "estorno", "problema pagamento"],
  },
  {
    id: "consultas-1",
    category: "Consultas",
    question: "Posso consultar por placa ou chassi?",
    answer:
      "Sim. Informe a placa (padrão Mercosul) ou o chassi com 17 caracteres. Ambos retornam o mesmo relatório quando vinculados ao mesmo veículo.",
    keywords: ["placa", "chassi", "vin"],
  },
  {
    id: "consultas-2",
    category: "Consultas",
    question: "Quanto tempo demora a consulta?",
    answer:
      "Após a confirmação do pagamento, o relatório é gerado em segundos e fica disponível para download imediato.",
    keywords: ["tempo", "demora", "prazo"],
  },
  {
    id: "relatorios-1",
    category: "Relatórios",
    question: "Em qual formato recebo o relatório?",
    answer:
      "O relatório fica disponível na web e pode ser baixado em PDF. Você também recebe um e-mail com o link de acesso.",
    keywords: ["pdf", "download", "formato"],
  },
  {
    id: "relatorios-2",
    category: "Relatórios",
    question: "Posso ver um exemplo antes de comprar?",
    answer:
      "Sim. Acesse a página Exemplo de Relatório para visualizar exatamente o que você receberá após a compra.",
    keywords: ["exemplo", "amostra", "demonstração"],
  },
  {
    id: "privacidade-1",
    category: "Privacidade",
    question: "Meus dados estão seguros?",
    answer:
      "Utilizamos criptografia TLS, autenticação segura via Supabase e controles de acesso rigorosos. Consulte nossa Política de Privacidade para detalhes.",
    keywords: ["segurança", "dados", "proteção"],
  },
  {
    id: "lgpd-1",
    category: "LGPD",
    question: "Como solicito exclusão dos meus dados?",
    answer:
      "Na Área do Cliente, acesse Configurações e clique em Solicitar exclusão da conta. O pedido será processado conforme prazos legais da LGPD.",
    keywords: ["exclusão", "apagar conta", "lgpd"],
  },
  {
    id: "lgpd-2",
    category: "LGPD",
    question: "Como exporto meus dados?",
    answer:
      "Em Configurações, utilize a opção Exportar meus dados. Enviaremos um arquivo com suas informações em até 15 dias úteis.",
    keywords: ["exportar", "portabilidade", "dados"],
  },
  {
    id: "seguranca-1",
    category: "Segurança",
    question: "A Torres Consulta é confiável?",
    answer:
      "Somos parte do Ecossistema Torres, com atuação em vistoria cautelar e consulta veicular. Utilizamos bases oficiais e infraestrutura em nuvem com alta disponibilidade.",
    keywords: ["confiança", "golpe", "verdadeiro"],
  },
];
