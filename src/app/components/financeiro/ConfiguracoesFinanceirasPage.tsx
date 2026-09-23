import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Plus, Trash2, Loader2, AlertCircle, CheckCircle2,
  Wallet, Pencil, X, Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCategoriasFinanceiras,
  type CategoriaFinanceira,
  type TipoCategoriaFinanceira,
} from "../../hooks/use-categorias-financeiras";
import { CORES_TAG, getTagPalette } from "../../hooks/use-tags";

/**
 * Configurações do Financeiro — CRUD de categorias de contas.
 *
 * Espelha `ConfiguracoesProdutosPage` (categorias de produto), o padrão
 * aprovado pelo fundador (SPEC B9 §3.3). Diferenças deliberadas:
 *  - seletor de `tipo` no create E no edit inline (operacional | mercadoria | receita)
 *  - sem categoria global — esta tabela é por tenant (empresa_id not null)
 *  - `contarContas` soma me_contas_pagar + me_contas_receber
 *  - remoção é SOFT DELETE: a categoria sai dos selects, mas a conta que já a
 *    usava mantém o rótulo
 */
export function ConfiguracoesFinanceirasPage() {
  const navigate = useNavigate();
  const {
    categorias, loading, error, isFallback, recarregar,
    criarCategoria, atualizarCategoria, desativarCategoria, contarContas,
  } = useCategoriasFinanceiras();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoCategoriaFinanceira>("operacional");
  const [cor, setCor] = useState<string>(CORES_TAG[0]);
  const [criando, setCriando] = useState(false);

  // Edição inline
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTipo, setEditTipo] = useState<TipoCategoriaFinanceira>("operacional");
  const [editCor, setEditCor] = useState<string>(CORES_TAG[0]);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Confirmação de remoção
  const [aRemover, setARemover] = useState<{ categoria: CategoriaFinanceira; total: number } | null>(null);
  const [removendo, setRemovendo] = useState(false);

  // Dois agrupamentos na tela — os 3 valores de «tipo» continuam existindo
  // (o DRE distingue mercadoria de operacional nas linhas do custo). Tipo
  // nulo/legado cai na despesa — mesmo fallback do rótulo da linha.
  const receitas = categorias.filter((cat) => cat.tipo === "receita");
  const despesas = categorias.filter(
    (cat) => cat.tipo === "operacional" || cat.tipo === "mercadoria" || cat.tipo === null
  );

  const handleAdicionar = async () => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    setCriando(true);
    const res = await criarCategoria(nomeLimpo, tipo, cor);
    setCriando(false);
    if (res.success) {
      toast.success(`Categoria "${nomeLimpo}" criada!`);
      setNome("");
      setTipo("operacional");
    } else {
      toast.error(res.error || "Erro ao criar categoria.");
    }
  };

  const abrirEdicao = (cat: CategoriaFinanceira) => {
    setEditandoId(cat.id);
    setEditNome(cat.nome);
    setEditTipo(
      cat.tipo === "operacional" || cat.tipo === "mercadoria" || cat.tipo === "receita"
        ? cat.tipo
        : "operacional"
    );
    setEditCor(cat.cor || CORES_TAG[0]);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditNome("");
  };

  const salvarEdicao = async () => {
    if (editandoId === null) return;
    const nomeLimpo = editNome.trim();
    if (!nomeLimpo) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    setSalvandoEdicao(true);
    const res = await atualizarCategoria(editandoId, { nome: nomeLimpo, tipo: editTipo, cor: editCor });
    setSalvandoEdicao(false);
    if (res.success) {
      toast.success("Categoria atualizada.");
      cancelarEdicao();
    } else {
      toast.error(res.error || "Erro ao atualizar categoria.");
    }
  };

  const pedirRemocao = async (cat: CategoriaFinanceira) => {
    const total = await contarContas(cat.id);
    setARemover({ categoria: cat, total });
  };

  const confirmarRemocao = async () => {
    if (!aRemover) return;
    setRemovendo(true);
    const res = await desativarCategoria(aRemover.categoria.id);
    setRemovendo(false);
    if (res.success) {
      toast.success(`Categoria "${aRemover.categoria.nome}" removida.`);
      setARemover(null);
    } else {
      toast.error(res.error || "Erro ao remover categoria.");
    }
  };

  /** Item da lista (visualização ou edição inline) — mesmo markup da versão única. */
  const renderCategoria = (cat: CategoriaFinanceira) => {
    const colors = getTagPalette(cat.cor);

    if (editandoId === cat.id) {
      return (
        <div
          key={cat.id}
          className="px-4 py-3 rounded-xl border border-[#86cb92] bg-white space-y-3"
        >
          <input
            type="text"
            value={editNome}
            autoFocus
            onChange={(e) => setEditNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                salvarEdicao();
              }
              if (e.key === "Escape") cancelarEdicao();
            }}
            aria-label={`Novo nome para ${cat.nome}`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={editTipo}
              onChange={(e) => setEditTipo(e.target.value as TipoCategoriaFinanceira)}
              aria-label="Tipo da categoria"
              className="px-3.5 py-2 rounded-xl border border-[#efefef] text-[#627271] text-xs outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
            >
              <option value="operacional">Custo operacional</option>
              <option value="mercadoria">Custo de mercadoria</option>
              <option value="receita">Receita</option>
            </select>
            {CORES_TAG.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setEditCor(c)}
                aria-label={`Cor ${c}`}
                className="w-6 h-6 rounded-full transition-all"
                style={{
                  background: c,
                  outline: editCor === c ? `2px solid ${c}` : "none",
                  outlineOffset: 2,
                }}
              />
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={cancelarEdicao}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#efefef] text-[#627271] text-xs hover:bg-[#efefef] transition-colors"
                style={{ fontWeight: 500 }}
              >
                <X size={13} /> Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                disabled={salvandoEdicao}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-[#1f2937] text-xs disabled:opacity-70"
                style={{ background: "#86cb92", fontWeight: 600 }}
              >
                {salvandoEdicao ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={cat.id}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#efefef] bg-white"
      >
        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: colors.text }} aria-hidden />
        <span
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px]"
          style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 600 }}
        >
          {cat.nome}
        </span>
        <span className="text-[#627271] text-[11px]" style={{ fontWeight: 500 }}>
          {rotuloTipo(cat.tipo)}
        </span>
        <button
          onClick={() => abrirEdicao(cat)}
          aria-label={`Editar categoria ${cat.nome}`}
          className="ml-auto w-8 h-8 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#e2e2e2] transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => pedirRemocao(cat)}
          aria-label={`Remover categoria ${cat.nome}`}
          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/financeiro/dashboard")}
            className="w-9 h-9 rounded-xl bg-white border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors"
            aria-label="Voltar para o financeiro"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Configurações do Financeiro
            </h1>
            <p className="text-[#627271] text-sm">
              {loading
                ? "Carregando..."
                : `${categorias.length} categoria${categorias.length !== 1 ? "s" : ""}`}
              {isFallback && !loading && (
                <span className="ml-2 text-xs text-amber-600">(dados de demonstração)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Card de categorias */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-[#627271]" />
          </div>
          <div>
            <h2 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              Categorias de contas
            </h2>
            <p className="text-[#627271] text-xs mt-0.5">
              As categorias agrupam as contas a pagar e a receber e alimentam as linhas do DRE.
            </p>
          </div>
        </div>

        {/* Formulário nova categoria */}
        <div className="mb-5 p-4 rounded-xl border border-[#efefef]" style={{ background: "#FAFAFA" }}>
          <label className="block text-[#1f2937] text-xs mb-2" style={{ fontWeight: 600 }}>
            Nova categoria
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdicionar();
                }
              }}
              placeholder="Ex: Aluguel"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoCategoriaFinanceira)}
              aria-label="Tipo da categoria"
              className="sm:w-56 px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
            >
              <option value="operacional">Custo operacional</option>
              <option value="mercadoria">Custo de mercadoria</option>
              <option value="receita">Receita</option>
            </select>
            <button
              onClick={handleAdicionar}
              disabled={criando}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm transition-all disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {criando ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Adicionar
            </button>
          </div>
          <p className="block text-[#627271] text-xs mt-3 mb-2" style={{ fontWeight: 500 }}>
            Cor
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {CORES_TAG.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                aria-label={`Cor ${c}`}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: c,
                  outline: cor === c ? `2px solid ${c}` : "none",
                  outlineOffset: 2,
                  boxShadow: cor === c ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px ${c}44` : "none",
                }}
              />
            ))}
            <span
              className="ml-auto inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] self-center"
              style={getTagPalette(cor)}
            >
              Preview
            </span>
          </div>
          <p className="text-[#627271] text-[11px] mt-3">
            {tipo === "operacional" && "ex.: aluguel, luz, internet"}
            {tipo === "mercadoria" && "ex.: insumos, chocolate, embalagem"}
            {tipo === "receita" && "ex.: vendas, serviços"}
          </p>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-[#efefef] animate-pulse" />
            ))}
          </div>
        ) : error && !isFallback ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
              Erro ao carregar categorias
            </p>
            <p className="text-[#627271] text-xs mb-4">{error}</p>
            <button
              onClick={recarregar}
              className="px-4 py-2 rounded-xl text-[#1f2937] text-sm"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              Tentar novamente
            </button>
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#efefef] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-[#627271]" />
            </div>
            <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
              Nenhuma categoria ainda
            </p>
            <p className="text-[#627271] text-xs">
              Adicione a primeira categoria acima para começar a organizar suas contas.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Receita — tipo === "receita" */}
            <section aria-labelledby="titulo-secao-receita" className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h3 id="titulo-secao-receita" className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
                  Categorias de receita
                </h3>
                <span className="text-[#627271] text-xs" style={{ fontWeight: 500 }}>
                  {receitas.length} categoria{receitas.length !== 1 ? "s" : ""}
                </span>
              </div>
              {receitas.length === 0 ? (
                <div className="px-4 py-5 rounded-xl border border-[#efefef] bg-white text-center">
                  <p className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
                    Nenhuma categoria de receita ainda
                  </p>
                  <p className="text-[#627271] text-xs mt-0.5">
                    Crie a primeira no formulário acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">{receitas.map(renderCategoria)}</div>
              )}
            </section>

            {/* Despesa — operacional + mercadoria (o DRE mantém as linhas separadas) */}
            <section aria-labelledby="titulo-secao-despesa" className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h3 id="titulo-secao-despesa" className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
                  Categorias de despesa
                </h3>
                <span className="text-[#627271] text-xs" style={{ fontWeight: 500 }}>
                  {despesas.length} categoria{despesas.length !== 1 ? "s" : ""}
                </span>
              </div>
              {despesas.length === 0 ? (
                <div className="px-4 py-5 rounded-xl border border-[#efefef] bg-white text-center">
                  <p className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
                    Nenhuma categoria de despesa ainda
                  </p>
                  <p className="text-[#627271] text-xs mt-0.5">
                    Crie a primeira no formulário acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">{despesas.map(renderCategoria)}</div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Nota */}
      <p className="text-[#627271] text-xs px-1">
        Categorias removidas deixam de aparecer em novos cadastros, mas continuam valendo nas contas já
        cadastradas (soft delete).
      </p>

      {/* Confirmação de remoção */}
      {aRemover && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !removendo && setARemover(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-remover-categoria-financeira"
          >
            <h2 id="titulo-remover-categoria-financeira" className="text-[#1f2937] text-base mb-3" style={{ fontWeight: 700 }}>
              Remover “{aRemover.categoria.nome}”?
            </h2>
            <p className="text-[#627271] text-sm mb-5">
              {aRemover.total > 0
                ? `${aRemover.total} conta${aRemover.total !== 1 ? "s" : ""} (a pagar + a receber) usa${aRemover.total !== 1 ? "m" : ""} esta categoria. Ela deixa de aparecer em novos cadastros, mas as contas mantêm a categoria.`
                : "Nenhuma conta usa esta categoria. Ela deixará de aparecer em novos cadastros."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setARemover(null)}
                disabled={removendo}
                className="px-4 py-2.5 rounded-xl border border-[#efefef] text-[#627271] text-sm hover:bg-[#efefef] transition-colors disabled:opacity-70"
                style={{ fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRemocao}
                disabled={removendo}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-70"
                style={{ fontWeight: 600 }}
              >
                {removendo ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TIPOS_CATEGORIA: { valor: TipoCategoriaFinanceira; rotulo: string }[] = [
  { valor: "operacional", rotulo: "Custo operacional" },
  { valor: "mercadoria", rotulo: "Custo de mercadoria" },
  { valor: "receita", rotulo: "Receita" },
];

const ROTULOS_TIPO: Record<TipoCategoriaFinanceira, string> = {
  operacional: "Custo operacional",
  mercadoria: "Custo de mercadoria",
  receita: "Receita",
};

/** Rótulo amigável do tipo; tipo nulo/desconhecido (legado) cai em operacional. */
function rotuloTipo(tipo: string | null | undefined): string {
  if (tipo === "operacional" || tipo === "mercadoria" || tipo === "receita") {
    return ROTULOS_TIPO[tipo];
  }
  return ROTULOS_TIPO.operacional;
}