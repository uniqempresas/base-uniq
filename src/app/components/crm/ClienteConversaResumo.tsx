import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, MessageSquare } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import type { ClienteConversaMensagem } from "../../types/clientes";

interface ClienteConversaResumoProps {
  clienteNome: string;
  clienteTelefone?: string;
}

interface DBConversa {
  id: string;
  nome: string | null;
  canal_id: string | null;
}

interface DBMensagem {
  id: string;
  conversa_id: string;
  remetente_tipo: string | null;
  conteudo: string | null;
  criado_em: string | null;
}

export function ClienteConversaResumo({ clienteNome, clienteTelefone }: ClienteConversaResumoProps) {
  const navigate = useNavigate();
  const [mensagens, setMensagens] = useState<ClienteConversaMensagem[]>([]);
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarConversa() {
      setLoading(true);
      setError(null);

      try {
        // Buscar conversa pelo nome do cliente ou telefone
        let query = supabase
          .from("crm_chat_conversas")
          .select("id, nome, canal_id")
          .order("criado_em", { ascending: false })
          .limit(50);

        const { data: conversas, error: conversasError } = await query;

        if (conversasError) throw conversasError;

        const conversasValidas = (conversas as DBConversa[] | null) || [];
        
        // Tentar encontrar conversa pelo nome do cliente
        let conversaEncontrada = conversasValidas.find(
          (c) => c.nome?.toLowerCase().includes(clienteNome.toLowerCase().split(" ")[0].toLowerCase())
        );

        // Se não encontrar pelo nome e tiver telefone, tentar buscar por telefone
        if (!conversaEncontrada && clienteTelefone) {
          const telefoneLimpo = clienteTelefone.replace(/\D/g, "");
          conversaEncontrada = conversasValidas.find(
            (c) => c.canal_id?.includes(telefoneLimpo)
          );
        }

        if (!conversaEncontrada) {
          setMensagens([]);
          setConversaId(null);
          setLoading(false);
          return;
        }

        setConversaId(conversaEncontrada.id);

        // Buscar últimas 5 mensagens da conversa
        const { data: dbMensagens, error: mensagensError } = await supabase
          .from("crm_chat_mensagens")
          .select("id, conversa_id, remetente_tipo, conteudo, criado_em")
          .eq("conversa_id", conversaEncontrada.id)
          .order("criado_em", { ascending: false })
          .limit(5);

        if (mensagensError) throw mensagensError;

        const mensagensValidas = (dbMensagens as DBMensagem[] | null) || [];
        
        setMensagens(
          mensagensValidas
            .reverse()
            .map((m) => ({
              id: m.id,
              conteudo: m.conteudo || "",
              isCliente: m.remetente_tipo === "cliente",
              timestamp: m.criado_em || "",
            }))
        );
      } catch (err) {
        console.error("[ClienteConversaResumo] Erro ao buscar conversa:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar conversa");
      } finally {
        setLoading(false);
      }
    }

    carregarConversa();
  }, [clienteNome, clienteTelefone]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[#efefef] rounded w-3/4"></div>
          <div className="h-4 bg-[#efefef] rounded w-1/2"></div>
          <div className="h-4 bg-[#efefef] rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || mensagens.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-8 text-center">
        <MessageSquare size={32} className="text-[#627271] mx-auto mb-3" />
        <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>
          Nenhuma conversa encontrada
        </h3>
        <p className="text-[#627271] text-sm">
          {error ? "Erro ao carregar conversa" : "Este cliente ainda não tem mensagens no WhatsApp"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
      <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>
        Resumo da Conversa
      </h3>
      <div className="space-y-3">
        {mensagens.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isCliente ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.isCliente
                  ? "bg-[#efefef] text-[#1f2937] rounded-bl-sm"
                  : "bg-[#86cb92] text-[#1f2937] rounded-br-sm"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.conteudo}</p>
              <p className={`text-[10px] mt-1 ${msg.isCliente ? "text-[#627271]" : "text-[#1f2937]/70"}`}>
                {msg.isCliente ? "Cliente" : "MEL"} ·{" "}
                {msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
      {conversaId && (
        <button
          onClick={() => navigate("/chatbot")}
          className="mt-4 flex items-center gap-2 text-sm text-[#1f2937] hover:underline"
          style={{ fontWeight: 500 }}
        >
          Ver conversa completa no Chatbot
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
