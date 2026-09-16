import { useCallback, useEffect, useState } from "react";

/**
 * Sessão local do cliente final por loja (SPEC-LojaVirtual-AreaCliente §2).
 *
 * Decisão do fundador: sessão expira em **24 horas** (não 30 dias), com
 * renovação sliding — cada leitura válida renova o `expiraEm`.
 *
 * Chave: `uniq_loja_sessao_<slug>` (localStorage) — nunca cruza lojas;
 * `sair()` preserva o carrinho (`uniq_loja_carrinho_<slug>` não é tocado).
 */
export interface SessaoClienteLoja {
  /** telefone normalizado (só dígitos, DDI 55) */
  telefone: string;
  /** me_cliente.id */
  clienteId: string;
  /** nome para a saudação na área (me_cliente.nome_cliente) */
  nomeCliente: string;
  /** epoch ms — agora + 24h (renovado a cada leitura válida) */
  expiraEm: number;
}

export const DURACAO_SESSAO_MS = 24 * 60 * 60 * 1000; // 24 horas (decisão do fundador)

const PREFIXO_SESSAO = "uniq_loja_sessao_";

export interface UseLojaSessaoReturn {
  sessao: SessaoClienteLoja | null;
  logado: boolean;
  /** true após a primeira leitura do localStorage (evita redirect prematuro nas guardas) */
  carregado: boolean;
  entrar: (dados: Omit<SessaoClienteLoja, "expiraEm">) => void;
  sair: () => void;
}

function lerSessaoDoStorage(slug: string): SessaoClienteLoja | null {
  try {
    const armazenado = localStorage.getItem(`${PREFIXO_SESSAO}${slug}`);
    if (!armazenado) return null;

    const dados = JSON.parse(armazenado) as unknown;
    if (!dados || typeof dados !== "object") throw new Error("sessão inválida");

    const raw = dados as Partial<SessaoClienteLoja>;
    if (
      typeof raw.telefone !== "string" ||
      typeof raw.clienteId !== "string" ||
      typeof raw.nomeCliente !== "string"
    ) {
      throw new Error("sessão inválida");
    }

    const expiraEm = typeof raw.expiraEm === "number" ? raw.expiraEm : 0;
    if (Number.isNaN(expiraEm) || expiraEm <= Date.now()) {
      throw new Error("sessão expirada");
    }

    return {
      telefone: raw.telefone,
      clienteId: raw.clienteId,
      nomeCliente: raw.nomeCliente,
      expiraEm,
    };
  } catch (e) {
    console.info("[useLojaSessao] Sessão inválida/expirada — removendo:", e);
    try {
      localStorage.removeItem(`${PREFIXO_SESSAO}${slug}`);
    } catch (erroStorage) {
      console.error("[useLojaSessao] Erro ao remover sessão corrompida:", erroStorage);
    }
    return null;
  }
}

function salvarSessao(slug: string, sessao: SessaoClienteLoja): void {
  try {
    localStorage.setItem(`${PREFIXO_SESSAO}${slug}`, JSON.stringify(sessao));
  } catch (e) {
    console.error("[useLojaSessao] Erro ao salvar sessão:", e);
  }
}

/** Sessão renovada com expiração 24h a partir de agora (sliding) */
function renovarSessao(sessao: SessaoClienteLoja): SessaoClienteLoja {
  return { ...sessao, expiraEm: Date.now() + DURACAO_SESSAO_MS };
}

export function useLojaSessao(slug: string | undefined): UseLojaSessaoReturn {
  const [sessao, setSessao] = useState<SessaoClienteLoja | null>(null);
  const [carregado, setCarregado] = useState(!slug);

  // Carrega e renova (sliding) sempre que trocar de loja
  useEffect(() => {
    if (!slug) {
      setSessao(null);
      setCarregado(true);
      return;
    }

    setCarregado(false);
    const lida = lerSessaoDoStorage(slug);
    if (lida) {
      const renovada = renovarSessao(lida);
      salvarSessao(slug, renovada);
      setSessao(renovada);
    } else {
      setSessao(null);
    }
    setCarregado(true);
  }, [slug]);

  const entrar = useCallback(
    (dados: Omit<SessaoClienteLoja, "expiraEm">) => {
      if (!slug) return;
      const nova: SessaoClienteLoja = {
        telefone: dados.telefone,
        clienteId: dados.clienteId,
        nomeCliente: dados.nomeCliente,
        expiraEm: Date.now() + DURACAO_SESSAO_MS,
      };
      salvarSessao(slug, nova);
      setSessao(nova);
    },
    [slug]
  );

  const sair = useCallback(() => {
    if (!slug) return;
    try {
      localStorage.removeItem(`${PREFIXO_SESSAO}${slug}`);
    } catch (e) {
      console.error("[useLojaSessao] Erro ao remover sessão:", e);
    }
    setSessao(null);
    setCarregado(true);
  }, [slug]);

  return {
    sessao,
    logado: sessao !== null,
    carregado,
    entrar,
    sair,
  };
}