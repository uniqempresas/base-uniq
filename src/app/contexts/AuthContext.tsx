import {
  createContext,
  useContext,
  useState,
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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  perfil: PerfilUsuario | null;
  empresa: EmpresaAuth | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER = {
  id: "demo-user",
  email: "demo@baseuniq.com.br",
  user_metadata: { nome_completo: "Empreendedor Demo" },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

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
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaAuth | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session?.user) {
      setLoading(false);
      return { error: error?.message || "Falha no login" };
    }

    setUser(data.session.user);
    setSession(data.session);

    const { perfil: p, empresa: e } = await carregarPerfilEEmpresa(data.session.user.id);
    setPerfil(p);
    setEmpresa(e);
    setLoading(false);

    return {};
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(MOCK_USER);
    setSession(null);
    setPerfil(null);
    setEmpresa(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, perfil, empresa, loading, signIn, signOut }}>
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
