import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowUp, Check, CheckCheck, MessageSquareText, RotateCcw, Settings, ThumbsDown, ThumbsUp, UserRound } from "lucide-react";
import melFull from "../../../assets/mel-full.png";

type Feedback = "útil" | "não útil";
type Message = { id: number; from: "mel" | "user"; text: string; time: string; feedback?: Feedback; demo?: boolean };

const initialMessages: Message[] = [
  { id: 1, from: "mel", text: "Olá, Marina. Eu sou a MEL, assistente da Base UNIQ. Posso ajudar a interpretar vendas, caixa e relacionamento com clientes.", time: "09:12", demo: true },
  { id: 2, from: "user", text: "Como estão minhas vendas e o caixa nesta semana?", time: "09:13", demo: true },
  { id: 3, from: "mel", text: "Nesta conversa demonstrativa, as vendas de 01 a 15 de maio somam R$ 8.420. O caixa projetado para os próximos 7 dias é de R$ 2.180, com R$ 1.735 em compromissos já registrados.", time: "09:13", demo: true },
  { id: 4, from: "user", text: "Tenho clientes que precisam de atenção?", time: "09:15", demo: true },
  { id: 5, from: "mel", text: "Sim. No recorte demonstrativo, três clientes estão há mais de 30 dias sem comprar: Ana Souza, Loja Horizonte e Café Central. Eu começaria pela Loja Horizonte, que costumava comprar a cada quinzena.", time: "09:15", demo: true },
];

const suggestions = ["Vendas", "Contas a pagar", "Clientes"];

function simulatedResponse(question: string) {
  const value = question.toLocaleLowerCase("pt-BR");
  if (value.includes("venda")) return "Nos dados demonstrativos, as vendas estão em R$ 8.420 no período de 01 a 15 de maio, 12% acima do recorte anterior. Vale confirmar as duas vendas em aberto, que somam R$ 640.";
  if (value.includes("pagar") || value.includes("caixa")) return "O exemplo do painel lista R$ 1.735 em compromissos nesta semana: R$ 980 de folha, R$ 420 de fornecedor e R$ 335 de despesas operacionais. Confira os vencimentos antes de programar os pagamentos.";
  if (value.includes("cliente")) return "No recorte demonstrativo, Ana Souza, Loja Horizonte e Café Central estão há mais de 30 dias sem comprar. Uma mensagem pessoal para a Loja Horizonte pode ser um bom primeiro passo.";
  return "Posso ajudar com os dados demonstrativos de vendas, contas a pagar e clientes. Para começar, escolha uma sugestão ou me conte o que você quer entender.";
}

const colors = { paper: "#ffffff", soft: "#efefef", ink: "#1f2937", mint: "#86cb92", quiet: "#627271" };

export function MelConversaPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [nextId, setNextId] = useState(6);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const sendMessage = (value = draft) => {
    const text = value.trim();
    if (!text || isTyping) return;
    setMessages((current) => [...current, { id: nextId, from: "user", text, time: "agora" }]);
    setNextId((id) => id + 1);
    setDraft("");
    setIsTyping(true);
    timerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, { id: nextId + 1, from: "mel", text: simulatedResponse(text), time: "agora" }]);
      setNextId((id) => id + 1);
      setIsTyping(false);
    }, 700);
  };

  const submit = (event: FormEvent) => { event.preventDefault(); sendMessage(); };
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); }
  };
  const setFeedback = (id: number, feedback: Feedback) => setMessages((current) => current.map((message) => message.id === id ? { ...message, feedback: message.feedback === feedback ? undefined : feedback } : message));
  const clearConversation = () => {
    if (window.confirm("Limpar esta conversa demonstrativa?")) setMessages([]);
  };

  return (
    <main data-od-id="mel-conversa-region" className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 p-3 sm:p-6" style={{ color: colors.ink }}>
      <header data-od-id="mel-conversa-header" className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 sm:p-5" style={{ background: colors.paper, borderColor: colors.soft }}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-semibold" style={{ background: colors.ink, color: colors.mint }}><img src={melFull} alt="Avatar da MEL" className="h-full w-full rounded-lg object-contain" /></div>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-semibold tracking-tight">MEL <span className="font-normal" style={{ color: colors.quiet }}>· Melissa</span></h1><span className="rounded-lg border px-2 py-1 text-xs font-medium" style={{ borderColor: colors.mint, color: colors.quiet }}>Online</span></div><p className="text-sm" style={{ color: colors.quiet }}>Assistente da Base UNIQ · conversa demonstrativa</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button data-od-id="mel-clear-button" type="button" onClick={clearConversation} className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ borderColor: colors.soft, color: colors.quiet }}><RotateCcw size={16} /> <span className="hidden sm:inline">Limpar conversa</span></button>
          <button data-od-id="mel-settings-button" type="button" onClick={() => navigate("/mel/configuracoes")} aria-label="Abrir configurações da MEL" className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ borderColor: colors.soft, color: colors.quiet }}><Settings size={17} /></button>
        </div>
      </header>

      <section data-od-id="mel-conversa" className="flex min-h-[min(680px,calc(100vh-190px))] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border" style={{ background: colors.paper, borderColor: colors.soft }}>
        <div data-od-id="mel-message-list" ref={listRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7" aria-live="polite">
          {messages.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center" style={{ color: colors.quiet }}><MessageSquareText size={32} strokeWidth={1.5} /><p className="mt-3 text-sm font-semibold">Sua conversa está vazia</p><p className="mt-1 max-w-sm text-xs">Escolha uma sugestão abaixo para iniciar uma nova conversa demonstrativa com a MEL.</p></div>}
          {messages.map((message) => <article data-od-id="mel-message" key={message.id} className={`flex gap-3 ${message.from === "user" ? "justify-end" : "justify-start"}`}>
            {message.from === "mel" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold" style={{ background: colors.ink, color: colors.mint }}>M</div>}
            <div className={`flex max-w-[88%] flex-col ${message.from === "user" ? "items-end sm:max-w-[70%]" : "items-start sm:max-w-[76%]"}`}><div className="rounded-lg border px-4 py-3 text-sm leading-relaxed" style={{ background: message.from === "user" ? colors.ink : colors.soft, borderColor: message.from === "user" ? colors.ink : colors.soft, color: message.from === "user" ? colors.paper : colors.ink }}>{message.text}</div><div className="mt-1 flex items-center gap-2 px-1 text-xs" style={{ color: colors.quiet }}><span>{message.from === "mel" ? "MEL" : "Você"} · {message.time}</span>{message.demo && <span className="rounded-lg border px-1.5 py-0.5" style={{ borderColor: colors.soft }}>demonstração</span>}{message.from === "user" && <CheckCheck size={13} />}</div>{message.from === "mel" && <div className="mt-1 flex items-center gap-1"><span className="mr-1 text-xs" style={{ color: colors.quiet }}>Foi útil?</span><button type="button" onClick={() => setFeedback(message.id, "útil")} aria-label="Marcar resposta como útil" aria-pressed={message.feedback === "útil"} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ color: message.feedback === "útil" ? colors.ink : colors.quiet }}><ThumbsUp size={14} fill={message.feedback === "útil" ? colors.mint : "none"} /></button><button type="button" onClick={() => setFeedback(message.id, "não útil")} aria-label="Marcar resposta como não útil" aria-pressed={message.feedback === "não útil"} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92]" style={{ color: message.feedback === "não útil" ? colors.ink : colors.quiet }}><ThumbsDown size={14} fill={message.feedback === "não útil" ? colors.mint : "none"} /></button>{message.feedback && <span className="text-xs" style={{ color: colors.quiet }}><Check size={13} /></span>}</div>}</div>
            {message.from === "user" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: colors.soft, color: colors.quiet }}><UserRound size={16} /></div>}
          </article>)}
          {isTyping && <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold" style={{ background: colors.ink, color: colors.mint }}>M</div><div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: colors.soft, color: colors.quiet }}>MEL está digitando...</div></div>}
        </div>

        <div className="border-t p-3 sm:p-4" style={{ borderColor: colors.soft }}>
          <div data-od-id="mel-suggestions" className="mb-3 flex gap-2 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => sendMessage(suggestion)} disabled={isTyping} className="min-h-10 shrink-0 rounded-lg border px-3 text-left text-xs font-medium transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#86cb92] disabled:opacity-50" style={{ borderColor: colors.soft, color: colors.quiet }}>{suggestion}</button>)}</div>
          <form onSubmit={submit} className="flex items-end gap-2"><label htmlFor="mel-conversa-input" className="sr-only">Escreva uma mensagem para a MEL</label><textarea data-od-id="mel-input" id="mel-conversa-input" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} disabled={isTyping} rows={1} placeholder="Escreva para a MEL..." className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-lg border px-3 py-3 text-sm outline-none placeholder:text-[#627271] focus:ring-2 focus:ring-[#86cb92] disabled:opacity-60" style={{ borderColor: colors.soft, color: colors.ink }} /><button data-od-id="mel-send-button" type="submit" disabled={!draft.trim() || isTyping} aria-label="Enviar mensagem" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#86cb92] disabled:cursor-not-allowed disabled:opacity-40" style={{ background: colors.ink, color: colors.paper }}><ArrowUp size={19} /></button></form><p className="mt-2 px-1 text-xs" style={{ color: colors.quiet }}>Enter envia · Shift + Enter quebra linha · respostas demonstrativas, sem conexão com backend</p>
        </div>
      </section>
    </main>
  );
}
