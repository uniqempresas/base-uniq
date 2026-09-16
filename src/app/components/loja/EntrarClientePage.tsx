import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, User, Loader2, MessageCircle, CheckCircle2 } from "lucide-react";
import { maskPhone } from "../../lib/document-mask";
import { telefoneSchema } from "../../lib/validators";
import { useLojaTenant } from "../../hooks/use-loja-tenant";
import { useLojaClientePorTelefone } from "../../hooks/use-loja-cliente";
import { useLojaSessao } from "../../hooks/use-loja-sessao";
import { LojaNaoEncontrada } from "./LojaNaoEncontrada";
import { normalizarTelefoneLoja, whatsappLinkLoja } from "./lojaMockData";

/**
 * [L1] Entrar (/loja/:slug/entrar) — SPEC-LojaVirtual-AreaCliente §4.
 * Porta de entrada da área "Meus pedidos". A navegação da loja é SEMPRE
 * livre — esta tela nunca bloqueia vitrine/produto/sacola.
 */
export function EntrarClientePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tenant, loading: loadingTenant, error: errorTenant } = useLojaTenant(slug);
  const sessao = useLojaSessao(slug);

  const form = useForm<{ telefone: string }>({
    resolver: zodResolver(z.object({ telefone: telefoneSchema })),
    defaultValues: { telefone: "" },
  });

  const telefoneDigitado = form.watch("telefone") || "";
  const digitos = telefoneDigitado.replace(/\D/g, "");

  const { cliente, loading: carregandoCliente, error: erroLookup } = useLojaClientePorTelefone(
    tenant?.empresaId,
    telefoneDigitado
  );

  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [bancoIndisponivel, setBancoIndisponivel] = useState(false);

  // Já logado → área (guardas da área usam o mesmo carregado p/ não redirecionar cedo)
  useEffect(() => {
    if (sessao.carregado && sessao.logado && slug) {
      navigate(`/loja/${slug}/conta`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao.carregado, sessao.logado, slug]);

  if (!loadingTenant && (!tenant || errorTenant)) return <LojaNaoEncontrada />;

  const telefoneValido = digitos.length >= 10;
  const waLink = whatsappLinkLoja(tenant?.whatsapp);

  // Reseta estados visuais ao trocar o número
  useEffect(() => {
    setNaoEncontrado(false);
    setBancoIndisponivel(false);
  }, [telefoneDigitado]);

  // Feedback ao vivo conforme o lookup
  const consultaCompleta = telefoneValido && !carregandoCliente && !erroLookup;
  const temCliente = consultaCompleta && cliente !== null;
  const semCliente = consultaCompleta && cliente === null;

  useEffect(() => {
    if (semCliente) setNaoEncontrado(true);
    if (erroLookup) setBancoIndisponivel(true);
  }, [semCliente, erroLookup]);

  const handleEntrar = form.handleSubmit(async dados => {
    if (carregandoCliente) return; // botão mostra "Verificando..."
    if (erroLookup) {
      setBancoIndisponivel(true);
      return;
    }
    if (cliente) {
      const telefoneNormalizado = normalizarTelefoneLoja(dados.telefone);
      sessao.entrar({
        telefone: telefoneNormalizado,
        clienteId: cliente.id,
        nomeCliente: cliente.nome || "Cliente",
      });
      navigate(`/loja/${slug}/conta`, { replace: true });
      return;
    }
    setNaoEncontrado(true);
  });

  const erroTelefone = form.formState.errors.telefone?.message;

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/loja/${slug}`)}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm truncate" style={{ fontWeight: 700 }}>
              {tenant?.nomeFantasia || "..."}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 flex flex-col items-center">
        {/* Ícone */}
        <div className="w-16 h-16 rounded-3xl bg-white border border-border flex items-center justify-center mb-5">
          <User size={30} className="text-muted-foreground" />
        </div>
        <h1 className="text-foreground text-xl mb-1 text-center" style={{ fontWeight: 800 }}>
          Acompanhe seus pedidos
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Digite o telefone usado na compra
        </p>

        {/* Banner banco indisponível */}
        {bancoIndisponivel && (
          <div className="w-full mb-4 p-4 rounded-2xl text-center" style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
            <p className="text-amber-900 text-sm mb-1" style={{ fontWeight: 700 }}>Loja indisponível no momento</p>
            <p className="text-amber-800 text-xs mb-3">Fale pelo WhatsApp</p>
            <a href={waLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
              style={{ background: "#25D366", color: "white", fontWeight: 700 }}>
              <MessageCircle size={15} /> Falar no WhatsApp
            </a>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleEntrar} className="w-full max-w-sm space-y-4">
          <div>
            <label className="block text-foreground text-xs mb-1.5" style={{ fontWeight: 600 }}>
              Telefone <span className="text-red-500">*</span>
            </label>
            <input inputMode="tel"
              {...form.register("telefone", {
                onChange: e => form.setValue("telefone", maskPhone(e.target.value), { shouldValidate: true }),
              })}
              placeholder="(11) 99999-9999"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border text-foreground text-sm outline-none focus:border-primary bg-white"
              style={{ borderColor: erroTelefone ? "#EF4444" : "#efefef", fontSize: "16px" }} />
            {erroTelefone && <p className="text-red-500 text-[11px] mt-1">{erroTelefone}</p>}
            {carregandoCliente && (
              <p className="text-muted-foreground text-[11px] mt-1 flex items-center gap-1">
                <Loader2 size={11} className="animate-spin" /> Buscando cadastro...
              </p>
            )}
            {temCliente && cliente && (
              <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "#059669", fontWeight: 600 }}>
                <CheckCircle2 size={12} /> Cadastro encontrado — {cliente.nome || "Cliente"}
              </p>
            )}
          </div>

          <button type="submit"
            disabled={!telefoneValido || carregandoCliente}
            className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "#1f2937", fontWeight: 700, fontSize: "0.95rem" }}>
            {carregandoCliente ? (
              <><Loader2 size={17} className="animate-spin" /> Verificando...</>
            ) : (
              <>Entrar</>
            )}
          </button>
        </form>

        {/* Não encontrado */}
        {naoEncontrado && !bancoIndisponivel && (
          <div className="w-full max-w-sm mt-5 p-4 rounded-2xl border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
            <p className="text-red-800 text-sm mb-3" style={{ fontWeight: 600 }}>
              Nenhum cadastro encontrado nesta loja.
            </p>
            <button onClick={() => navigate(`/loja/${slug}`)}
              className="w-full py-2.5 rounded-xl text-xs" style={{ background: "#1f2937", color: "white", fontWeight: 700 }}>
              Ver cardápio e fazer meu primeiro pedido
            </button>
          </div>
        )}

        <p className="text-muted-foreground text-xs mt-8">
          Não tem cadastro?{" "}
          <button onClick={() => navigate(`/loja/${slug}`)} className="underline" style={{ color: "#1f2937", fontWeight: 600 }}>
            Ver cardápio →
          </button>
        </p>
      </div>

      {/* Rodapé discreto */}
      <footer className="pb-6 text-center">
        <p className="text-muted-foreground/70 text-[10px]">Acesso por telefone — versão de testes</p>
      </footer>
    </div>
  );
}