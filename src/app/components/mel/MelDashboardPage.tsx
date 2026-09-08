import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router";
import melFull from "../../../assets/mel-full.png";
import {
  ArrowUp,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Clock3,
  MessageSquareText,
  RotateCcw,
  Settings,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  WalletCards,
} from "lucide-react";

type Feedback = "positive" | "negative";

type Message = {
  id: number;
  from: "mel" | "user";
  text: string;
  time: string;
  feedback?: Feedback;
  demo?: boolean;
};

const colors = {
  paper: "#ffffff",
  soft: "#efefef",
  ink: "#1f2937",
  mint: "#86cb92",
  quiet: "#627271",
};

const suggestions = [
  "Como estão minhas vendas?",
  "O que devo pagar esta semana?",
  "Quais clientes precisam de atenção?",
];

const initialMessages: Message[] = [
  {
    id: 1,
    from: "mel",
    text: "Bom dia, Marina. Sou a MEL, sua consultora virtual da Base UNIQ. Posso ajudar a interpretar seus números e organizar os próximos passos.",
    time: "09:12",
    demo: true,
  },
  {
    id: 2,
    from: "mel",
    text: "Para esta conversa, estou usando dados demonstrativos do seu painel. No período de 01 a 15 de maio, as vendas somam R$ 8.420 e o caixa projetado para os próximos 7 dias é de R$ 2.180.",
    time: "09:12",
    demo: true,
  },
  {
    id: 3,
    from: "user",
    text: "Estou preocupada com o caixa desta semana. As vendas parecem boas, mas tenho muitos pagamentos chegando.",
    time: "09:14",
    demo: true,
  },
  {
    id: 4,
    from: "mel",
    text: "Faz sentido olhar os dois lados juntos. Nos dados demonstrativos, entram R$ 1.460 até sexta e saem R$ 1.735 em compromissos já registrados. Eu priorizaria folha e fornecedor com vencimento mais próximo, e evitaria novas compras até confirmar as entradas.",
    time: "09:15",
    demo: true,
  },
  {
    id: 5,
    from: "user",
    text: "Pode me ajudar a entender o que faço primeiro?",
    time: "09:16",
    demo: true,
  },
  {
    id: 6,
    from: "mel",
    text: "Claro. Minha sugestão é: 1) confirmar o recebimento de duas vendas em aberto, 2) separar R$ 980 para a folha de sexta e 3) negociar o vencimento de R$ 420 com o fornecedor. São sugestões baseadas no exemplo, não uma decisão financeira automática.",
    time: "09:16",
    demo: true,
  },
];

function responseFor(question: string) {
  const normalized = question.toLocaleLowerCase("pt-BR");
  if (normalized.includes("venda")) {
    return "Nos dados demonstrativos de 01 a 15 de maio, suas vendas estão em R$ 8.420, 12% acima do mesmo recorte anterior. O ticket médio é de R$ 176. Vale conferir se as duas vendas em aberto, que somam R$ 640, já têm data de recebimento confirmada.";
  }
  if (normalized.includes("pagar") || normalized.includes("caixa") || normalized.includes("pagamento")) {
    return "Para esta semana, o exemplo do painel lista R$ 1.735 em compromissos: R$ 980 de folha na sexta, R$ 420 de fornecedor na quinta e R$ 335 de despesas operacionais. Antes de pagar, confira as datas e mantenha uma reserva para despesas essenciais.";
  }
  if (normalized.includes("cliente") || normalized.includes("atenção") || normalized.includes("atencao")) {
    return "No recorte demonstrativo, três clientes não compram há mais de 30 dias: Ana Souza, Loja Horizonte e Café Central. Eu começaria pela Loja Horizonte, que costumava comprar toda quinzena. Uma mensagem pessoal pode ser um bom primeiro passo.";
  }
  return "Posso ajudar a organizar isso com você. Pelo contexto demonstrativo desta conversa, eu começaria separando o que já está confirmado do que ainda é previsão. Quer olhar vendas, pagamentos da semana ou clientes sem compra recente?";
}

function createConversationId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Mantém o formato UUID em ambientes muito antigos sem Web Crypto.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function MelDashboardPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [nextId, setNextId] = useState(7);
  const conversationRef = useRef<HTMLDivElement>(null);
  const pendingResponseRef = useRef<number | null>(null);
  const conversationTokenRef = useRef(0);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => () => {
    if (pendingResponseRef.current !== null) window.clearTimeout(pendingResponseRef.current);
  }, []);

  const sendMessage = (value = draft) => {
    const text = value.trim();
    if (!text || isTyping) return;
    const userMessage: Message = { id: nextId, from: "user", text, time: "agora" };
    setMessages((current) => [...current, userMessage]);
    setNextId((id) => id + 1);
    setDraft("");
    setIsTyping(true);
    const conversationToken = conversationTokenRef.current;
    pendingResponseRef.current = window.setTimeout(() => {
      if (conversationToken !== conversationTokenRef.current) return;
      setMessages((current) => [
        ...current,
        { id: nextId + 1, from: "mel", text: responseFor(text), time: "agora" },
      ]);
      setNextId((id) => id + 1);
      setIsTyping(false);
      pendingResponseRef.current = null;
    }, 900);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const setFeedback = (id: number, feedback: Feedback) => {
    setMessages((current) => current.map((message) =>
      message.id === id ? { ...message, feedback } : message,
    ));
  };

  const clearConversation = () => {
    if (window.confirm("Limpar esta conversa? O histórico demonstrativo será removido.")) {
      setMessages([]);
    }
  };

  const startNewConversation = () => {
    conversationTokenRef.current += 1;
    if (pendingResponseRef.current !== null) {
      window.clearTimeout(pendingResponseRef.current);
      pendingResponseRef.current = null;
    }
    setMessages([]);
    setDraft("");
    setIsTyping(false);
    setNextId(1);
    navigate(`/mel/conversa/${createConversationId()}`);
  };

  return (
    <main data-od-id="mel-main" className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-3 sm:p-6" style={{ color: colors.ink }}>
      <header data-od-id="mel-header" className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 sm:p-5" style={{ background: colors.paper, borderColor: colors.soft }}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg p-1" style={{ background: colors.paper, color: colors.mint }} aria-hidden="true">
            <img src={melFull} alt="Melissa, consultora virtual da Base UNIQ" className="h-full w-full rounded-lg object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">MEL</h1>
              {conversationId && <span title={`ID completo: ${conversationId}`} aria-label={`ID completo da conversa: ${conversationId}`} className="font-mono text-xs" style={{ color: colors.quiet }}>#{conversationId.slice(0, 8)}</span>}
              <span className="rounded-lg border px-2 py-1 text-xs font-medium" style={{ borderColor: colors.mint, color: colors.quiet }}>Online</span>
            </div>
            <p className="text-sm" style={{ color: colors.quiet }}>Sua consultora virtual da Base UNIQ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button data-od-id="mel-new-conversation" type="button" onClick={startNewConversation} aria-label="Iniciar nova conversa" className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ borderColor: colors.mint, color: colors.ink }}>
            <MessageSquareText size={16} /> Nova conversa
          </button>
          <button type="button" onClick={clearConversation} className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ borderColor: colors.soft, color: colors.quiet }}>
            <RotateCcw size={16} /> Limpar conversa
          </button>
          <button type="button" onClick={() => navigate("/mel/configuracoes")} aria-label="Abrir configurações da MEL" className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ borderColor: colors.soft, color: colors.quiet }}>
            <Settings size={17} />
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-180px)] min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="flex min-h-[600px] min-w-0 flex-col overflow-hidden rounded-lg border" style={{ background: colors.paper, borderColor: colors.soft }}>
          <div data-od-id="mel-message-list" ref={conversationRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {messages.length === 0 && (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center" style={{ color: colors.quiet }}>
                <MessageSquareText size={30} strokeWidth={1.5} />
                <p className="mt-3 text-sm font-medium">Conversa limpa</p>
                <p className="mt-1 max-w-xs text-xs">Faça uma pergunta para começar uma nova conversa demonstrativa.</p>
              </div>
            )}
            {messages.map((message) => (
              <article data-od-id={`mel-message-${message.id}`} key={message.id} className={`flex gap-3 ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                {message.from === "mel" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-0.5" style={{ background: colors.paper, color: colors.mint }}><img src={melFull} alt="Melissa, consultora virtual da Base UNIQ" className="h-full w-full rounded-lg object-contain" /></div>}
                <div className={`max-w-[88%] sm:max-w-[75%] ${message.from === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className="rounded-lg border px-4 py-3 text-sm leading-relaxed" style={{ background: message.from === "user" ? colors.ink : colors.soft, borderColor: message.from === "user" ? colors.ink : colors.soft, color: message.from === "user" ? colors.paper : colors.ink }}>
                    {message.text}
                  </div>
                  <div className="mt-1 flex items-center gap-2 px-1 text-xs" style={{ color: colors.quiet }}>
                    <span>{message.from === "mel" ? "MEL" : "Você"} · {message.time}</span>
                    {message.demo && <span className="rounded-lg border px-1.5 py-0.5" style={{ borderColor: colors.soft }}>demonstração</span>}
                    {message.from === "user" && <CheckCheck size={13} />}
                  </div>
                  {message.from === "mel" && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="mr-1 text-xs" style={{ color: colors.quiet }}>Foi útil?</span>
                      <button type="button" onClick={() => setFeedback(message.id, "positive")} aria-label="Marcar resposta como útil" className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ color: message.feedback === "positive" ? colors.ink : colors.quiet }}><ThumbsUp size={14} fill={message.feedback === "positive" ? colors.mint : "none"} /></button>
                      <button type="button" onClick={() => setFeedback(message.id, "negative")} aria-label="Marcar resposta como não útil" className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ color: message.feedback === "negative" ? colors.ink : colors.quiet }}><ThumbsDown size={14} fill={message.feedback === "negative" ? colors.mint : "none"} /></button>
                    </div>
                  )}
                </div>
                {message.from === "user" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: colors.soft, color: colors.quiet }}><UserRound size={16} /></div>}
              </article>
            ))}
            {isTyping && <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg p-0.5" style={{ background: colors.paper, color: colors.mint }}><img src={melFull} alt="Melissa, consultora virtual da Base UNIQ" className="h-full w-full rounded-lg object-contain" /></div><div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: colors.soft, color: colors.quiet }}>MEL está digitando...</div></div>}
          </div>

          <div data-od-id="mel-composer" className="border-t p-3 sm:p-4" style={{ borderColor: colors.soft }}>
            <div data-od-id="mel-suggestions" className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => sendMessage(suggestion)} className="min-h-10 shrink-0 rounded-lg border px-3 text-left text-xs font-medium transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ borderColor: colors.soft, color: colors.quiet }}>{suggestion}</button>)}
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label htmlFor="mel-message" className="sr-only">Escreva uma mensagem para a MEL</label>
              <textarea data-od-id="mel-input" id="mel-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} disabled={isTyping} rows={1} placeholder="Escreva para a MEL..." className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-lg border px-3 py-3 text-sm outline-none placeholder:text-[#627271] focus:ring-2 focus:ring-[#86cb92] disabled:opacity-60" style={{ borderColor: colors.soft, color: colors.ink }} />
              <button data-od-id="mel-send" type="submit" disabled={!draft.trim() || isTyping} aria-label="Enviar mensagem" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#86cb92] disabled:cursor-not-allowed disabled:opacity-40" style={{ background: colors.ink, color: colors.paper }}><ArrowUp size={19} /></button>
            </form>
            <p className="mt-2 px-1 text-xs" style={{ color: colors.quiet }}>Enter envia · Shift + Enter quebra linha</p>
          </div>
        </section>

        <aside data-od-id="mel-sidebar" className="flex flex-col gap-4">
          <div className="rounded-lg border p-4" style={{ background: colors.paper, borderColor: colors.soft }}>
            <div className="mb-3 flex items-center gap-2"><WalletCards size={17} style={{ color: colors.quiet }} /><h2 className="text-sm font-semibold">Contexto desta conversa</h2></div>
            <p className="text-sm leading-relaxed" style={{ color: colors.quiet }}>Estamos usando informações demonstrativas de vendas, caixa e clientes. Use as respostas como apoio para pensar, não como uma decisão automática.</p>
            <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg border p-3" style={{ borderColor: colors.soft }}><p className="text-xs" style={{ color: colors.quiet }}>Vendas (01–15 mai)</p><p className="mt-1 text-sm font-semibold">R$ 8.420</p></div><div className="rounded-lg border p-3" style={{ borderColor: colors.soft }}><p className="text-xs" style={{ color: colors.quiet }}>Caixa em 7 dias</p><p className="mt-1 text-sm font-semibold">R$ 2.180</p></div></div>
          </div>
          <div className="rounded-lg border p-4" style={{ background: colors.paper, borderColor: colors.soft }}>
            <div className="mb-3 flex items-center gap-2"><Clock3 size={17} style={{ color: colors.quiet }} /><h2 className="text-sm font-semibold">Conversas recentes</h2></div>
            <div className="flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 text-left" style={{ borderColor: colors.soft }}><MessageSquareText size={16} style={{ color: colors.mint }} /><span className="min-w-0 flex-1 truncate text-sm">Vendas e caixa · hoje</span><span className="text-xs" style={{ color: colors.quiet }}>atual</span></div>
            <p className="mt-3 text-xs" style={{ color: colors.quiet }}>O histórico fica disponível apenas nesta tela demonstrativa.</p>
          </div>
          <div className="rounded-lg border p-4" style={{ background: colors.soft, borderColor: colors.soft }}><div className="flex items-start gap-2"><CircleHelp size={17} className="mt-0.5 shrink-0" style={{ color: colors.quiet }} /><p className="text-xs leading-relaxed" style={{ color: colors.quiet }}>Quer ajustar o contexto ou as preferências da MEL?</p></div><button type="button" onClick={() => navigate("/mel/configuracoes")} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ color: colors.ink }}>Abrir configurações <ChevronRight size={15} /></button></div>
        </aside>
      </div>
    </main>
  );
}
