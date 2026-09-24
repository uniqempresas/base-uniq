/**
 * Deck comercial UNIQ Empresas — conteúdo verbatim do PPTX
 * (fonte: C:\Users\henri\AppData\Local\Temp\opencode\pptx_extract\deck_texto.txt)
 *
 * Texto fiel ao deck. `Run` permite marcar trechos destacados no original
 * como { forte: "..." }; qualquer adaptação está registrada em comentário.
 */

export type SlideLayout =
  | "hero"
  | "conteudo"
  | "beneficios"
  | "pricing"
  | "encerramento";

/** Trecho de texto: string comum ou destaque tipográfico ({ forte }). */
export type Run = string | { forte: string };

export type Paragrafo = string | Run[];

export interface SlideItem {
  /** Rótulo curto (ex.: "01", "1", "Nas grandes empresas"). */
  numero?: string;
  titulo?: Paragrafo;
  descricao?: Paragrafo;
}

export interface PlanoPreco {
  rotulo: string;
  setup: string;
  mensal: string;
  destaque?: boolean;
}

export interface Slide {
  id: number;
  layout: SlideLayout;
  eyebrow?: string;
  titulo?: Paragrafo;
  subtitulo?: Paragrafo;
  corpo?: Paragrafo;
  itens?: SlideItem[];
  destaque?: Paragrafo;
  fecho?: Paragrafo;
  rodape?: string;
  planos?: PlanoPreco[];
  check?: string[];
}

export const TOTAL_SLIDES = 13;

export const SLIDES: Slide[] = [
  {
    id: 1,
    layout: "hero",
    eyebrow: "ALTO TIETÊ · CONSULTORIA",
    titulo: "Sua empresa merece as mesmas ferramentas das grandes.",
    subtitulo:
      "Consultoria para pequenas e médias empresas — faturamento, margem e transformação do empreendedor.",
  },
  {
    id: 2,
    layout: "conteudo",
    titulo: "VOCÊ RECONHECE ESSE DIA?",
    subtitulo: "O dia inteiro apagando incêndio. E o negócio sem sair do lugar.",
    itens: [
      {
        descricao:
          "Atendimento, operação, fornecedor, caixa: tudo passa por você",
      },
      {
        descricao:
          "Não sobra tempo para estudar o mercado ou planejar o crescimento",
      },
      {
        descricao:
          "E não sobra caixa para contratar quem tenha esse conhecimento",
      },
    ],
    // Adaptação: os "—" do deck viraram separadores visuais da lista.
    destaque:
      "Não falta força de vontade. Não falta qualidade. Faltam ferramentas e conhecimento.",
  },
  {
    id: 3,
    layout: "conteudo",
    titulo: "O CUSTO DE CONTINUAR ASSIM",
    subtitulo: "Trabalhar mais não resolve",
    itens: [
      {
        titulo: "Vender",
        descricao: [
          "sem saber a margem real de cada produto pode significar ",
          { forte: "lucrar menos vendendo mais" },
          ".",
        ],
      },
      {
        titulo: "Decidir",
        descricao: [
          "sem dados de mercado transforma cada escolha em ",
          { forte: "aposta" },
          " — preço, estoque, investimento.",
        ],
      },
      {
        titulo: "Crescer",
        descricao: [
          "preso à operação mantém o dono como ",
          { forte: "funcionário do próprio negócio" },
          ".",
        ],
      },
    ],
    destaque: "O problema não é esforço. É a falta de estrutura para crescer.",
  },
  {
    id: 4,
    layout: "conteudo",
    titulo: "POR QUE A UNIQ EXISTE",
    subtitulo: "Eu vi os dois lados desse jogo",
    itens: [
      {
        numero: "Nas grandes empresas",
        titulo: [
          "Analista de sistemas desde 2011, em empresas como ",
          { forte: "Banco Santander" },
          " e ",
          { forte: "Ultragaz" },
          ", em contato com a alta diretoria.",
        ],
        descricao: [
          "Lá ficou claro o quanto ",
          { forte: "conhecimento de mercado, estratégia e boas ferramentas" },
          " fazem diferença no resultado.",
        ],
      },
      {
        numero: "Na minha gráfica B2B",
        titulo: [
          "Atendendo pequenos e médios empreendedores, vi o contraponto: gente talentosa e esforçada, ",
          { forte: "sem acesso às mesmas ferramentas e ao mesmo conhecimento" },
          ".",
        ],
      },
    ],
    fecho:
      "Foi dessa diferença que nasceu a UNIQ. Levar para o pequeno o que a grande empresa já usa para vencer.",
  },
  {
    id: 5,
    layout: "beneficios",
    titulo: "A UNIQ EMPRESAS",
    subtitulo: "3 objetivos claros, um só parceiro",
    corpo:
      "A UNIQ atua no Alto Tietê com consultoria para pequenas e médias empresas. Não somos uma empresa de tecnologia — usamos a tecnologia a favor do objetivo.",
    itens: [
      {
        numero: "01",
        titulo: "Aumento de Faturamento",
        descricao:
          "Sua empresa vendendo todos os dias — inclusive quando você não está lá.",
      },
      {
        numero: "02",
        titulo: "Aumento de Margem",
        descricao:
          "Lucrar mais em cada venda, sabendo exatamente onde está o dinheiro.",
      },
      {
        numero: "03",
        titulo: "Transformação do Empreendedor",
        descricao:
          "De dono atolado na operação a empresário que decide com clareza.",
      },
    ],
    destaque:
      "Consultoria + tecnologia a serviço do objetivo — nunca o contrário.",
  },
  {
    id: 6,
    layout: "beneficios",
    eyebrow: "01",
    titulo: "Aumento de Faturamento",
    subtitulo:
      "Sua empresa vendendo todos os dias — inclusive quando você não está lá.",
    itens: [
      {
        titulo: "UNIQ — Conhecimento de mercado",
        descricao:
          "Trazer conhecimento externo e de mercado para dentro da sua operação.",
      },
      {
        titulo: "Melissa — Atendimento que converte",
        descricao:
          "Atendimento estruturado para transformar contato em venda.",
      },
      {
        titulo: "Base UNIQ — Funil de Vendas",
        descricao: "Pipeline claro, do primeiro contato ao fechamento.",
      },
      {
        titulo: "Base UNIQ — Loja Virtual",
        descricao: "Um novo canal de receita, aberto todos os dias.",
      },
    ],
  },
  {
    id: 7,
    layout: "beneficios",
    eyebrow: "02",
    titulo: "Aumento de Margem",
    subtitulo:
      "Lucrar mais em cada venda, sabendo exatamente onde está o dinheiro.",
    itens: [
      {
        titulo: "UNIQ — Análise profunda de mercado",
        descricao:
          "Entender preço, concorrência e posicionamento para decidir com dados.",
      },
      {
        titulo: "Base UNIQ — Visão total da operação",
        descricao: "Custos, margens e processos enxergados de ponta a ponta.",
      },
      {
        titulo: "Base UNIQ — Parcerias com empreendedores",
        descricao:
          "Rede de parceiros para dividir custos e multiplicar oportunidades.",
      },
    ],
  },
  {
    id: 8,
    layout: "beneficios",
    eyebrow: "03",
    titulo: "Transformação do Empreendedor",
    subtitulo:
      "De dono atolado na operação a empresário que decide com clareza.",
    itens: [
      {
        titulo: "UNIQ — Transformação duradoura",
        descricao:
          "Levar o parceiro de um ponto a outro, com mudança que permanece.",
      },
      {
        titulo: "Empreender e gerir são coisas diferentes",
        descricao:
          "E gerir se aprende — com método, não com tentativa e erro.",
      },
      {
        titulo: "UNIQ — Trilhas de aprendizagem",
        descricao: "Desenvolvimento contínuo, passo a passo.",
      },
      {
        titulo: "Melissa — Guia diário",
        descricao: "Acompanhamento por todo o processo, todos os dias.",
      },
    ],
  },
  {
    id: 9,
    layout: "conteudo",
    titulo: "O DIFERENCIAL",
    subtitulo: "Melissa, sua consultora todos os dias",
    corpo:
      "Consultoria tradicional é uma reunião por mês e um relatório. A UNIQ é diferente.",
    destaque: [
      "A Melissa acompanha o seu negócio ",
      { forte: "diariamente" },
      ": atende, orienta, organiza o funil e guia cada etapa do processo.",
    ],
    fecho: [
      "O conhecimento de uma consultoria, ",
      { forte: "com a presença de um sócio." },
    ],
  },
  {
    id: 10,
    layout: "beneficios",
    titulo: "COMO TRABALHAMOS",
    subtitulo: "Um método, não promessas",
    itens: [
      {
        numero: "1",
        titulo: "Diagnóstico",
        descricao:
          "Análise profunda da operação, do mercado e dos números da empresa.",
      },
      {
        numero: "2",
        titulo: "Plano de ação",
        descricao:
          "Metas claras de faturamento e margem, com ferramentas definidas.",
      },
      {
        numero: "3",
        titulo: "Execução acompanhada",
        descricao:
          "Melissa no dia a dia, UNIQ ao lado — até o resultado aparecer.",
      },
    ],
    destaque:
      "O que você recebe nos primeiros 90 dias: diagnóstico completo da operação, funil de vendas estruturado, visão clara de margens e um plano de crescimento com metas.",
  },
  {
    id: 11,
    layout: "conteudo",
    titulo: "FASE ALPHA · APENAS 4 EMPRESAS",
    subtitulo: "Por que entrar agora",
    itens: [
      {
        titulo: "Preço de fundador",
        descricao: [
          "R$ 500 de setup e R$ 197/mês — condição que ",
          { forte: "nunca mais" },
          " vai existir. Depois da Alpha, o valor sobe para R$ 1.500 + R$ 297/mês.",
        ],
      },
      {
        titulo: "Atenção máxima",
        descricao:
          "São apenas 4 empresas. Dedicação quase individual — algo que uma consultoria com dezenas de clientes não consegue oferecer.",
      },
      {
        titulo: "Co-construção",
        descricao:
          "Você participa da construção do método — e colhe os resultados primeiro.",
      },
    ],
    destaque:
      "O caminho: Fase Alpha (4 empresas) → Fase Beta (+4) → Fase Prod (+4) → lançamento oficial em 07/2027.",
    fecho:
      "Cada fase fortalece a base da próxima — e a sua empresa entra na frente.",
  },
  {
    id: 12,
    layout: "pricing",
    titulo: "INVESTIMENTO",
    subtitulo: "Menos que um dia de faturamento parado",
    corpo: "Uma venda a mais por mês já paga a consultoria. O resto é lucro.",
    planos: [
      {
        rotulo: "VALOR CHEIO (APÓS A ALPHA)",
        setup: "R$ 1.500",
        mensal: "R$ 297",
      },
      {
        rotulo: "FASE ALPHA · 4 VAGAS",
        setup: "R$ 500",
        mensal: "R$ 197",
        destaque: true,
      },
    ],
    check: [
      "Pagamento na inicialização",
      "Sem fidelidade: se não enxergar valor, você sai quando quiser",
      "Quando as 4 vagas acabarem, vale o valor cheio",
    ],
  },
  {
    id: 13,
    layout: "encerramento",
    titulo: [
      "Vamos tirar a sua empresa do lugar — ",
      { forte: "juntos" },
      ".",
    ],
    subtitulo: "Fase Alpha: apenas 4 empresas. R$ 500 de setup + R$ 197/mês.",
    rodape: "UNIQ Empresas · Consultoria para pequenas e médias empresas · Alto Tietê",
  },
];