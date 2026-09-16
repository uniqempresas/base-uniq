import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { normalizarTelefoneLoja } from "../components/loja/lojaMockData";

export interface ClienteLoja {
  id: string;
  nome: string;
  telefone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
}

export interface UseLojaClienteReturn {
  cliente: ClienteLoja | null;
  loading: boolean;
  error: string | null;
}

/**
 * Lookup de cliente por telefone normalizado (SPEC §2.3). Sem fallback — null = não encontrado.
 * Dispara quando o telefone completa (>= 10 dígitos), evitando re-query do mesmo número.
 */
export function useLojaClientePorTelefone(empresaId: string | undefined, telefone: string): UseLojaClienteReturn {
  const [cliente, setCliente] = useState<ClienteLoja | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const consultadoRef = useRef("");

  useEffect(() => {
    if (!empresaId) {
      setCliente(null);
      return;
    }

    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length < 10) {
      setCliente(null);
      return;
    }

    if (digitos === consultadoRef.current) return;
    consultadoRef.current = digitos;

    let cancelado = false;
    setLoading(true);
    setError(null);

    const telefoneNormalizado = normalizarTelefoneLoja(digitos);

    (async () => {
      const { data, error: err } = await supabase
        .from("me_cliente")
        .select("id, nome_cliente, telefone, cep, endereco, numero, complemento, bairro, cidade, estado")
        .eq("empresa_id", empresaId)
        .eq("telefone", telefoneNormalizado)
        .maybeSingle();

      if (cancelado) return;

      if (err) {
        console.error("[useLojaClientePorTelefone] Erro na consulta:", err);
        setError(err.message);
        setCliente(null);
        setLoading(false);
        return;
      }
      if (!data) {
        setCliente(null);
        setLoading(false);
        return;
      }
      setCliente({
        id: data.id,
        nome: data.nome_cliente || "",
        telefone: data.telefone,
        cep: data.cep,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      });
      setLoading(false);
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId, telefone]);

  return { cliente, loading, error };
}