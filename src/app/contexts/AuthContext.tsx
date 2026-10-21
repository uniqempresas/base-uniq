/**
 * AuthContext funcional — Base UNIQ
 * Autentica via Supabase Auth e carrega perfil (me_usuario) + empresa (me_empresa) reais.
 * Tarefa 1.3
 *
 * Hotfix isolamento de tenant (SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant §3):
 * - Com sessão ativa, perfil nunca falha silenciosamente para null:
 *   1) fallback por e-mail quando o lookup por id não encontra linha;
 *   2) se ainda assim não carregar, `authError` é exposto para as telas exibirem banner.
 * - `loading` inicia `true` e só vira `false` após `getSession()` resolver (com ou sem sessão) —
 *   hooks não disparam queries de tenant antes de saber se há sessão.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export interface PerfilUsuario {
  id: string;
  nome_usuario: string;
  email: string;
  cargo: number | null;
  role: string | null;
  ativo: boolean | null;
  empresa_id: string | null;
}

export interface EmpresaAuth {
  id: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  slug: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  perfil: PerfilUsuario | null;
  empresa: EmpresaAuth | null;
  loading: boolean;
  authError: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuário demo: fallback para desenvolvimento/demo quando não há sessão real.
const MOCK_USER = {
  id: "demo-user",
  email: "demo@baseuniq.com.br",
  user_metadata: { nome_completo: "Empreendedor Demo" },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

const COLUNAS_PERFIL = "id, nome_usuario, email, cargo, role, ativo, empresa_id";

const ESTADO_INICIAL: AuthState = {
  user: MOCK_USER,
  session: null,
  perfil: null,
  empresa: null,
  loading: true,
  authError: null,
};

const MENSAGEM_ERRO_PERFIL =
  "Não foi possível carregar seu perfil. Contate o suporte.";

async function carregarPerfilEEmpresa(
  user: User
): Promise<{
  perfil: PerfilUsuario | null;
  empresa: EmpresaAuth | null;
  authError: string | null;
}> {
  const userEmail = user.email?.toLowerCase();

  // QUEBRA A — fallback por id → e-mail
  const { data: perfilPorId, error: perfilError } = await supabase
    .from("me_usuario")
    .select(COLUNAS_PERFIL)
    .eq("id", user.id)
    .maybeSingle();

  if (perfilError) {
    console.error("[AuthContext] Erro ao carregar perfil por id:", perfilError);
  }

  let perfil = perfilPorId as PerfilUsuario | null;

  if (!perfil && userEmail) {
    const { data: perfilPorEmail, error: perfilEmailError } = await supabase
      .from("me_usuario")
      .select(COLUNAS_PERFIL)
      .eq("email", userEmail)
      .maybeSingle();

    if (perfilEmailError) {
      console.error("[AuthContext] Erro ao carregar perfil por e-mail:", perfilEmailError);
    }
    perfil = perfilPorEmail as PerfilUsuario | null;
  }

  if (!perfil) {
    // QUEBRA B — sem perfil, sem empresa: estado de erro explícito (não silencioso)
    console.error("[AuthContext] Perfil não encontrado para o usuário logado:", user.id);
    return { perfil: null, empresa: null, authError: MENSAGEM_ERRO_PERFIL };
  }

  let empresa: EmpresaAuth | null = null;
  if (perfil.empresa_id) {
    const { data: empresaData, error: empresaError } = await supabase
      .from("me_empresa")
      .select("id, nome_fantasia, cnpj, telefone, email, slug")
      .eq("id", perfil.empresa_id)
      .maybeSingle();

    if (empresaError) {
      console.error("[AuthContext] Erro ao carregar empresa:", empresaError);
    } else {
      empresa = empresaData;
    }
  }

  return { perfil, empresa, authError: null };
}

/**
 * N7 (fundador 20/10/2026 — "pisca" nas telas): igualdade de conteúdo por JSON.
 * `perfil` e `empresa` são payloads pequenos; o custo é desprezível e o ganho é
 * estrutural: se a re-aplicação de sessão entrega o MESMO conteúdo em um objeto
 * novo, preservamos a referência anterior. Hooks de dados usam deps
 * `[empresa, session]` — sem preservação, cada `TOKEN_REFRESHED`/`SIGNED_IN`
 * duplicado (abertura da página, sincronização entre abas, retorno de foco)
 * recriava o objeto, refazia o fetch e a tela com gate `!loading` piscava.
 */
function conteudoIgual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/** Merge preservando referências antigas quando o conteúdo não mudou. */
function mesclarEstado(prev: AuthState, novo: AuthState): AuthState {
  return {
    user: prev.user?.id === novo.user?.id ? prev.user : novo.user,
    session: prev.session?.user?.id === novo.session?.user?.id ? prev.session : novo.session,
    perfil: conteudoIgual(prev.perfil, novo.perfil) ? prev.perfil : novo.perfil,
    empresa: conteudoIgual(prev.empresa, novo.empresa) ? prev.empresa : novo.empresa,
    loading: novo.loading,
    authError: novo.authError,
  };
}

/** setState via updater: se nada mudou de fato, devolve `prev` (React bail-out). */
function aplicarEstado(prev: AuthState, novo: AuthState): AuthState {
  const m = mesclarEstado(prev, novo);
  const igual =
    m.user === prev.user &&
    m.session === prev.session &&
    m.perfil === prev.perfil &&
    m.empresa === prev.empresa &&
    m.loading === prev.loading &&
    m.authError === prev.authError;
  return igual ? prev : m;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(ESTADO_INICIAL);

  // Espelho do último estado para INSPEÇÃO síncrona dentro do listener de auth
  // (setState com updater não permite ler `state` de fora do closure).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Restaurar sessão existente ao carregar a aplicação
  useEffect(() => {
    let mounted = true;

    setState((prev) => ({ ...prev, loading: true }));

    const aplicarSessao = (sessionAtual: Session | null) => {
      if (!mounted) return;
      if (sessionAtual?.user) {
        const usuario = sessionAtual.user;
        const prev = stateRef.current;
        // N7: eventos duplicados (INITIAL_SESSION no subscribe, SIGNED_IN de
        // sincronização entre abas/visibilidade) entregam a MESMA sessão num
        // objeto novo. Se já aplicamos este usuário (perfil carregado, sem
        // loading em curso), não há nada a re-buscar — 0 fetch, 0 re-render.
        if (
          !prev.loading &&
          prev.perfil !== null &&
          prev.session?.user?.id === usuario.id &&
          prev.user?.email === usuario.email
        ) {
          return;
        }
        carregarPerfilEEmpresa(usuario).then(({ perfil, empresa, authError }) => {
          if (!mounted) return;
          setState((p) =>
            aplicarEstado(p, {
              user: usuario,
              session: sessionAtual,
              perfil,
              empresa,
              loading: false,
              authError,
            })
          );
        });
      } else {
        // Sem sessão = modo demo (mock-first preservado). Updater + merge:
        // re-entrega de "sem sessão" não gera re-render nem refetch.
        setState((p) => aplicarEstado(p, { ...ESTADO_INICIAL, loading: false }));
      }
    };

    supabase.auth.getSession().then(({ data: { session: sessionAtual } }) => {
      aplicarSessao(sessionAtual);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, sessionAtual) => {
      // HOTFIX (pisca no cadastro): TOKEN_REFRESHED não muda user/perfil/empresa.
      // Antes ele recriava o objeto `empresa` -> todo hook com `useCallback`
      // [empresa, ...] reconsultava -> telas com gate `!loading` desmontavam
      // modais abertos (cadastro de produto perdia tudo). Renovação de token é
      // transparente: nada a recarregar.
      if (event === "TOKEN_REFRESHED") return;
      aplicarSessao(sessionAtual);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session?.user) {
      return { error: error?.message || "Falha no login" };
    }

    const { perfil, empresa, authError } = await carregarPerfilEEmpresa(data.session.user);
    // Local const: preserva o narrowing de `data.session` dentro do updater.
    const sessaoLogin = data.session;
    setState((p) =>
      aplicarEstado(p, {
        user: sessaoLogin.user,
        session: sessaoLogin,
        perfil,
        empresa,
        loading: false,
        authError,
      })
    );

    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState((p) => aplicarEstado(p, { ...ESTADO_INICIAL, loading: false }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}