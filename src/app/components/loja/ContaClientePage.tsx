import { useNavigate, useParams, Navigate } from "react-router";
import { ArrowLeft, Package, LogOut, ShoppingBag } from "lucide-react";
import { useLojaTenant } from "../../hooks/use-loja-tenant";
import { useLojaSessao } from "../../hooks/use-loja-sessao";
import { useLojaMeusPedidos } from "../../hooks/use-loja-meus-pedidos";
import { LojaNaoEncontrada } from "./LojaNaoEncontrada";
import { PedidoTenantCard } from "./MeusPedidosPage";

/**
 * [L2] Área do cliente (/loja/:slug/conta) — SPEC-LojaVirtual-AreaCliente §5.
 * Guarda: sem sessão → redirect /entrar; com sessão → saudação + pedidos.
 * Carrinho preservado no logout (useLojaSessao.sair não toca no carrinho).
 */
export function ContaClientePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tenant, loading: loadingTenant, error: errorTenant } = useLojaTenant(slug);
  const { sessao, logado, carregado, sair } = useLojaSessao(slug);
  const { pedidos, loading, error } = useLojaMeusPedidos(tenant?.empresaId, sessao?.telefone ?? "");

  // ── Guarda: sem sessão → /entrar ──
  if (carregado && !logado) {
    return <Navigate to={`/loja/${slug}/entrar`} replace />;
  }

  // ── Tenant inexistente ──
  if (!loadingTenant && (!tenant || errorTenant)) return <LojaNaoEncontrada />;

  // ── Loading inicial (sessão + tenant) ──
  if (!carregado || loadingTenant) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <header className="bg-white border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-3 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-6 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleSair = () => {
    if (!window.confirm("Deseja sair da sua conta?")) return;
    sair();
    navigate(`/loja/${slug}`, { replace: true });
  };

  const nomeCliente = sessao?.nomeCliente || "Cliente";

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
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

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {/* ── Saudação + Sair ── */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-foreground text-lg" style={{ fontWeight: 800 }}>
            Olá, {nomeCliente} 👋
          </p>
          <button onClick={handleSair}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-white hover:text-foreground border border-border transition-colors"
            style={{ fontWeight: 600 }}>
            <LogOut size={14} />
            Sair
          </button>
        </div>
        <div className="h-px bg-border mb-5" />

        {/* ── Seção: Meus Pedidos ── */}
        <p className="text-muted-foreground text-xs mb-3" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
          MEUS PEDIDOS
        </p>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-border p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={() => navigate(`/loja/${slug}`)}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm"
              style={{ fontWeight: 600 }}>
              Voltar para a loja
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && pedidos.length === 0 && (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <Package size={40} className="text-muted mx-auto mb-3" />
            <p className="text-foreground mb-1" style={{ fontWeight: 600 }}>
              Você ainda não tem pedidos nesta loja.
            </p>
            <p className="text-muted-foreground text-sm mb-5">Faça sua primeira compra para acompanhar aqui.</p>
            <button onClick={() => navigate(`/loja/${slug}`)}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm"
              style={{ fontWeight: 600 }}>
              Ver cardápio
            </button>
          </div>
        )}

        {/* Lista de pedidos */}
        {!loading && !error && pedidos.length > 0 && (
          <div className="space-y-3">
            {pedidos.map(p => (
              <PedidoTenantCard key={p.idVenda} pedido={p} />
            ))}
          </div>
        )}

        {/* ── CTA: Voltar para a loja ── */}
        <div className="mt-6 flex justify-center">
          <button onClick={() => navigate(`/loja/${slug}`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm"
            style={{ fontWeight: 600 }}>
            <ShoppingBag size={15} />
            Voltar para a loja
          </button>
        </div>
      </div>

      {/* ── Rodapé ── */}
      <footer className="py-4 text-center">
        <p className="text-muted-foreground text-[11px]">Acesso por telefone — versão de testes</p>
      </footer>
    </div>
  );
}
