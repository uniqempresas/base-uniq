/**
 * AuthContext funcional — Base UNIQ
 * Autentica via Supabase Auth e carrega perfil (me_usuario) + empresa (me_empresa) reais.
 * Tarefa 1.3
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

const ESTADO_INICIAL: AuthState = {
  user: MOCK_USER,
  session: null,
  perfil: null,
  empresa: null,
  loading: true,
};

async function carregarPerfilEEmpresa(
  userId: string
): Promise<{ perfil: PerfilUsuario | null; empresa: EmpresaAuth | null }> {
  const { data: perfil, error: perfilError } = await supabase
    .from("me_usuario")
    .select("id, nome_usuario, email, cargo, role, ativo, empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (perfilError || !perfil) {
    console.error("[AuthContext] Erro ao carregar perfil:", perfilError);
    return { perfil: null, empresa: null };
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

  return { perfil, empresa };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(ESTADO_INICIAL);

  const aplicarSessao = useCallback(async (sessionAtual: Session | null) => {
    if (sessionAtual?.user) {
      const { perfil, empresa } = await carregarPerfilEEmpresa(sessionAtual.user.id);
      setState({
        user: sessionAtual.user,
        session: sessionAtual,
        perfil,
        empresa,
        loading: false,
      });
    } else {
      setState({
        user: MOCK_USER,
        session: null,
        perfil: null,
        empresa: null,
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: sessionAtual } }) => {
      if (!mounted) return;
      aplicarSessao(sessionAtual);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionAtual) => {
      if (!mounted) return;
      aplicarSessao(sessionAtual);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [aplicarSessao]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState((prev) => ({ ...prev, loading: false }));
      return { error: error.message };
    }

    await aplicarSessao(data.session);
    return {};
  }, [aplicarSessao]);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    await supabase.auth.signOut();
    setState({
      user: MOCK_USER,
      session: null,
      perfil: null,
      empresa: null,
      loading: false,
    });
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
