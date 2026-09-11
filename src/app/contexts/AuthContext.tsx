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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(ESTADO_INICIAL);

  // Restaurar sessão existente ao carregar a aplicação
  useEffect(() => {
    let mounted = true;

    setState((prev) => ({ ...prev, loading: true }));

    const aplicarSessao = (sessionAtual: Session | null) => {
      if (!mounted) return;
      if (sessionAtual?.user) {
        carregarPerfilEEmpresa(sessionAtual.user).then(({ perfil, empresa, authError }) => {
          if (!mounted) return;
          setState({
            user: sessionAtual.user,
            session: sessionAtual,
            perfil,
            empresa,
            loading: false,
            authError,
          });
        });
      } else {
        // Sem sessão = modo demo (mock-first preservado)
        setState({ ...ESTADO_INICIAL, loading: false });
      }
    };

    supabase.auth.getSession().then(({ data: { session: sessionAtual } }) => {
      aplicarSessao(sessionAtual);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionAtual) => {
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
    setState({
      user: data.session.user,
      session: data.session,
      perfil,
      empresa,
      loading: false,
      authError,
    });

    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ ...ESTADO_INICIAL, loading: false });
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