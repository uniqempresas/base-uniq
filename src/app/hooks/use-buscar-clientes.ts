import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { normalizarTelefoneLoja } from "../components/loja/lojaMockData";

/**
 * Busca de clientes reais (me_cliente) escopada pela empresa logada.
 *
 * - Nome digitado  → busca parcial, case-insensitive (ilike).
 * - Telefone digitado → busca EXATA pelo telefone normalizado (eq), porque o
 *   banco normaliza na escrita via trg_me_cliente_normaliza_telefone e tem o
 *   índice único ux_me_cliente_empresa_telefone (empresa_id, telefone).
 *
 * Com debounce e sem sessão/empresa resolve para lista vazia (nunca mock).
 */
export interface ClienteSugestao {
  id: string;
  nome: string;
  telefone: string | null;
}

const LIMITE_SUGESTOES = 5;
const DEBOUNCE_MS = 250;

/** Formata o telefone normalizado do banco (ex.: "5511999998888" → "(11) 99999-8888") */
export function formatTelefoneSugestao(telefone: string | null): string {
  if (!telefone) return "sem telefone";
  const digitos = telefone.replace(/\D/g, "");
  // Dois padrões possíveis no banco: com DDI 55 (12/13 dígitos) ou só DDD+número (10/11)
  const base = digitos.length === 12 || digitos.length === 13 ? digitos.slice(2) : digitos;
  if (base.length === 11) {
    return `(${base.slice(0, 2)}) ${base.slice(2, 7)}-${base.slice(7)}`;
  }
  if (base.length === 10) {
    return `(${base.slice(0, 2)}) ${base.slice(2, 6)}-${base.slice(6)}`;
  }
  return telefone;
}

interface ClienteDB {
  id: string;
  nome_cliente: string | null;
  telefone: string | null;
}

export function useBuscarClientes(termo: string) {
  const { empresa } = useAuth();
  const [sugestoes, setSugestoes] = useState<ClienteSugestao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const termoLimpo = termo.trim();
    const empresaId = empresa?.id;

    if (!empresaId || termoLimpo.length < 2) {
      setSugestoes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const digitos = termoLimpo.replace(/\D/g, "");

        // Busca por nome (parcial, case-insensitive) sempre; por telefone apenas
        // quando há dígitos. Resultados são mesclados — digitar nome OU telefone
        // mostra o cliente certo.
        const porNome = supabase
          .from("me_cliente")
          .select("id, nome_cliente, telefone")
          .eq("empresa_id", empresaId)
          .ilike("nome_cliente", `%${termoLimpo}%`)
          .limit(LIMITE_SUGESTOES);

        const porTelefone =
          digitos.length > 0
            ? supabase
                .from("me_cliente")
                .select("id, nome_cliente, telefone")
                .eq("empresa_id", empresaId)
                .eq("telefone", normalizarTelefoneLoja(digitos))
                .limit(LIMITE_SUGESTOES)
            : Promise.resolve({ data: null, error: null });

        const [rNome, rTel] = await Promise.all([porNome, porTelefone]);

        if (cancelado) return;

        if (rNome.error || rTel.error) {
          console.error("[useBuscarClientes] Erro na busca:", rNome.error || rTel.error);
          setSugestoes([]);
          return;
        }

        // Mescla (dedupe por id) e limita
        const unicos = new Map<string, ClienteSugestao>();
        for (const r of [rNome, rTel]) {
          for (const c of (r.data as ClienteDB[] | null) || []) {
            if (!unicos.has(c.id)) {
              unicos.set(c.id, {
                id: c.id,
                nome: c.nome_cliente || "Sem nome",
                telefone: c.telefone,
              });
            }
          }
        }

        setSugestoes(Array.from(unicos.values()).slice(0, LIMITE_SUGESTOES));
      } catch (err) {
        console.error("[useBuscarClientes] Erro inesperado na busca:", err);
        if (!cancelado) setSugestoes([]);
      } finally {
        if (!cancelado) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [termo, empresa?.id]);

  return { sugestoes, loading };
}