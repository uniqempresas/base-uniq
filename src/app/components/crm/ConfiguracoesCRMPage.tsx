import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Tags,
  CheckCircle2,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  Pencil,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTags, CORES_TAG, getTagPalette, type Tag } from "../../hooks/use-tags";
import {
  useEtapasPipeline,
  CORES_ETAPA,
  corDeExibicao,
  normHex,
  type EtapaPipeline,
} from "../../hooks/use-etapas-pipeline";

// ── Padrões compartilhados entre as seções de Tags e Etapas ──────────────────
// (fundador 16/10: seção de etapas deve ficar estrutural/visualmente IGUAL à
//  de tags — reusamos o mesmo bloco de título, mesma linha de item, mesma
//  paleta de chips e o mesmo skeleton/erro/vazio.)

function SecaoTitulo({
  icone: Icone,
  titulo,
  descricao,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center shrink-0">
        <Icone size={18} className="text-[#627271]" />
      </div>
      <div>
        <h2 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
          {titulo}
        </h2>
        <p className="text-[#627271] text-xs mt-0.5">{descricao}</p>
      </div>
    </div>
  );
}

function PaletteCores({
  cores,
  valor,
  onChange,
}: {
  cores: string[];
  valor: string;
  onChange: (c: string) => void;
}) {
  return (
    <>
      {cores.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Cor ${c}`}
          className="w-7 h-7 rounded-full transition-all"
          style={{
            background: c,
            outline: valor === c ? `2px solid ${c}` : "none",
            outlineOffset: 2,
            boxShadow: valor === c ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px ${c}44` : "none",
          }}
        />
      ))}
    </>
  );
}

// Skeleton / erro / vazio idênticos aos usados no bloco de tags
function ListaVazia({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#efefef] flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 size={24} className="text-[#627271]" />
      </div>
      <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
        {titulo}
      </p>
      <p className="text-[#627271] text-xs">{descricao}</p>
    </div>
  );
}

function ListaErro({
  titulo,
  mensagem,
  onRetry,
}: {
  titulo: string;
  mensagem: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
        {titulo}
      </p>
      <p className="text-[#627271] text-xs mb-4">{mensagem}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-xl text-[#1f2937] text-sm"
        style={{ background: "#86cb92", fontWeight: 600 }}
      >
        Tentar novamente
      </button>
    </div>
  );
}

function ListaSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-[#efefef] animate-pulse" />
      ))}
    </div>
  );
}

function TileAcao({
  children,
  onClick,
  disabled,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      title={title}
      className="w-8 h-8 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#e2e2e2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function TagRow({ tag, onRemover, removendo }: { tag: Tag; onRemover: () => void; removendo: boolean }) {
  const colors = getTagPalette(tag.cor);
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#efefef] bg-white">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ background: colors.text }}
        aria-hidden
      />
      <span
        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px]"
        style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 600 }}
      >
        {tag.nome}
      </span>
      <span className="text-[#627271] text-xs ml-1">{tag.nome}</span>
      <button
        onClick={onRemover}
        disabled={removendo}
        aria-label={`Remover tag ${tag.nome}`}
        className="ml-auto w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {removendo ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}

// ── Linha de etapa: MESMA estrutura/visual da TagRow + setas ↑↓ e editar ─────
function EtapaRow({
  etapa,
  idx,
  total,
  editando,
  operando,
  onEditar,
  onMover,
  onExcluir,
}: {
  etapa: EtapaPipeline;
  idx: number;
  total: number;
  editando: boolean;
  operando: boolean;
  onEditar: () => void;
  onMover: (direcao: -1 | 1) => void;
  onExcluir: () => void;
}) {
  const colors = getTagPalette(corDeExibicao(etapa.cor));

  // excluir em 2 toques (armar → confirmar), desarma sozinho em 3s
  const [armado, setArmado] = useState(false);
  useEffect(() => {
    if (!armado) return;
    const t = setTimeout(() => setArmado(false), 3000);
    return () => clearTimeout(t);
  }, [armado]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#efefef] bg-white">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ background: colors.text }}
        aria-hidden
      />
      <span
        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px]"
        style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 600 }}
      >
        {etapa.nome}
      </span>
      <span className="text-[#627271] text-xs ml-1">{etapa.nome}</span>
      {etapa.fixa && (
        <span className="text-[#627271] text-[10px] shrink-0" title="Etapa padrão do pipeline">
          fixa
        </span>
      )}

      <div className="ml-auto flex items-center gap-1.5 shrink-0">
        <TileAcao title="Mover para cima" onClick={() => onMover(-1)} disabled={operando || idx === 0}>
          <ArrowUp size={13} />
        </TileAcao>
        <TileAcao title="Mover para baixo" onClick={() => onMover(1)} disabled={operando || idx === total - 1}>
          <ArrowDown size={13} />
        </TileAcao>
        <TileAcao title={editando ? "Editando" : "Editar etapa"} onClick={onEditar} disabled={operando}>
          {editando ? <Check size={13} className="text-[#86cb92]" /> : <Pencil size={13} />}
        </TileAcao>

        {armado ? (
          <>
            <button
              onClick={() => setArmado(false)}
              disabled={operando}
              aria-label="Cancelar exclusão"
              className="h-8 px-2.5 rounded-lg bg-[#efefef] text-[#627271] flex items-center gap-1 hover:bg-[#e2e2e2] transition-colors disabled:opacity-40 text-[11px]"
              style={{ fontWeight: 600 }}
            >
              <X size={12} /> Não
            </button>
            <button
              onClick={onExcluir}
              disabled={operando}
              aria-label={`Confirmar exclusão da etapa ${etapa.nome}`}
              className="h-8 px-2.5 rounded-lg bg-red-50 text-red-500 flex items-center gap-1 hover:bg-red-100 transition-colors disabled:opacity-50 text-[11px]"
              style={{ fontWeight: 600 }}
            >
              {operando ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Sim
            </button>
          </>
        ) : (
          <button
            onClick={() => setArmado(true)}
            disabled={operando}
            aria-label={`Excluir etapa ${etapa.nome}`}
            title="Excluir etapa"
            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {operando ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function ConfiguracoesCRMPage() {
  const navigate = useNavigate();
  const { tags, loading, error, isFallback, recarregar, criarTag, desativarTag } = useTags();
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState<string>(CORES_TAG[0]);
  const [criando, setCriando] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const handleAdicionar = async () => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      toast.error("Informe o nome da tag.");
      return;
    }
    setCriando(true);
    const res = await criarTag(nomeLimpo, cor);
    setCriando(false);
    if (res.success) {
      toast.success(`Tag "${nomeLimpo}" criada!`);
      setNome("");
    } else {
      toast.error(res.error || "Erro ao criar tag.");
    }
  };

  const handleRemover = async (tag: Tag) => {
    setRemovendoId(tag.id);
    const res = await desativarTag(tag.id);
    setRemovendoId(null);
    if (res.success) {
      toast.success(`Tag "${tag.nome}" removida.`);
    } else {
      toast.error(res.error || "Erro ao remover tag.");
    }
  };

  // ── Etapas do Pipeline (SPEC-CRM-Config-Etapas-Pipeline) ───────────────────
  const {
    etapas,
    carregando: carregandoEtapas,
    erro: erroEtapas,
    recarregar: recarregarEtapas,
    criar: criarEtapa,
    atualizar: atualizarEtapa,
    mover: moverEtapa,
    excluir: excluirEtapa,
  } = useEtapasPipeline();
  const [etapaEdicaoId, setEtapaEdicaoId] = useState<string | null>(null);
  const [etapaNome, setEtapaNome] = useState("");
  const [etapaCor, setEtapaCor] = useState<string>(CORES_ETAPA[0]);
  const [salvandoEtapa, setSalvandoEtapa] = useState(false);
  const [operandoEtapaId, setOperandoEtapaId] = useState<string | null>(null);

  const limparFormEtapa = () => {
    setEtapaEdicaoId(null);
    setEtapaNome("");
    setEtapaCor(CORES_ETAPA[0]);
  };

  const iniciarEdicaoEtapa = (etapa: EtapaPipeline) => {
    setEtapaEdicaoId(etapa.id);
    setEtapaNome(etapa.nome);
    // normHex garante #rrggbb válido p/ o <input type="color">;
    // se a cor da etapa não é hex (classe tailwind antiga), cai na 1ª da paleta.
    setEtapaCor(normHex(etapa.cor, CORES_ETAPA[0]));
  };

  const submitEtapa = async () => {
    const nomeLimpo = etapaNome.trim();
    if (!nomeLimpo) {
      toast.error("Informe o nome da etapa.");
      return;
    }
    setSalvandoEtapa(true);
    const res = etapaEdicaoId
      ? await atualizarEtapa(etapaEdicaoId, nomeLimpo, etapaCor)
      : await criarEtapa(nomeLimpo, etapaCor);
    setSalvandoEtapa(false);
    if (res.success) {
      if (etapaEdicaoId) {
        toast.success(`Etapa "${nomeLimpo}" salva!`);
        // renomeou mas a migração de negociações falhou → aviso (regra 1)
        if (res.aviso) toast.warning(res.aviso);
      } else {
        toast.success(`Etapa "${nomeLimpo}" criada!`);
      }
      limparFormEtapa();
    } else {
      toast.error(res.error || "Erro ao salvar etapa.");
    }
  };

  const handleMoverEtapa = async (id: string, direcao: -1 | 1) => {
    setOperandoEtapaId(id);
    const res = await moverEtapa(id, direcao);
    setOperandoEtapaId(null);
    if (!res.success) {
      toast.error(res.error || "Erro ao reordenar etapa.");
    }
  };

  const handleExcluirEtapa = async (etapa: EtapaPipeline) => {
    setOperandoEtapaId(etapa.id);
    const res = await excluirEtapa(etapa.id);
    setOperandoEtapaId(null);
    if (res.success) {
      toast.success(`Etapa "${etapa.nome}" excluída.`);
      if (etapaEdicaoId === etapa.id) limparFormEtapa();
    } else {
      toast.error(res.error || "Erro ao excluir etapa.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/crm/clientes")}
            className="w-9 h-9 rounded-xl bg-white border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors"
            aria-label="Voltar para clientes"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Configurações do CRM
            </h1>
            <p className="text-[#627271] text-sm">
              {loading ? "Carregando..." : `${tags.length} tag${tags.length !== 1 ? "s" : ""} configurada${tags.length !== 1 ? "s" : ""}`}
              {isFallback && !loading && <span className="ml-2 text-xs text-amber-600">(dados de demonstração)</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Card de tags */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 sm:p-6">
        <SecaoTitulo
          icone={Tags}
          titulo="Tags / Etiquetas dos clientes"
          descricao="As tags aparecem nos cards e filtros da lista de clientes e podem ser aplicadas ao cadastrar um cliente."
        />

        {/* Formulário nova tag */}
        <div className="mb-5 p-4 rounded-xl border border-[#efefef]" style={{ background: "#FAFAFA" }}>
          <label className="block text-[#1f2937] text-xs mb-2" style={{ fontWeight: 600 }}>
            Nova tag
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
              placeholder="Ex: Aniversariante"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
            />
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
          <div className="mt-3">
            <p className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>
              Cor
            </p>
            <div className="flex flex-wrap gap-2">
              <PaletteCores cores={CORES_TAG} valor={cor} onChange={setCor} />
              <span
                className="ml-auto inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] self-center"
                style={getTagPalette(cor)}
              >
                Preview
              </span>
            </div>
          </div>
        </div>

        {/* Lista de tags (skeleton/erro/vazio = mesmos blocos reutilizados nas etapas) */}
        {loading ? (
          <ListaSkeleton />
        ) : error && !isFallback ? (
          <ListaErro titulo="Erro ao carregar tags" mensagem={error} onRetry={recarregar} />
        ) : tags.length === 0 ? (
          <ListaVazia
            titulo="Nenhuma tag ainda"
            descricao="Adicione a primeira tag acima para começar a organizar seus clientes."
          />
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                removendo={removendoId === tag.id}
                onRemover={() => handleRemover(tag)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card de etapas do pipeline — MESMA estrutura do card de tags */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 sm:p-6">
        <SecaoTitulo
          icone={ListOrdered}
          titulo="Etapas do Pipeline"
          descricao="As colunas do quadro em CRM → Pipeline, na ordem exibida. Renomear uma etapa move as negociações dela; excluir só funciona com a etapa vazia."
        />

        {/* Formulário nova/editar etapa — mesmo bloco do "Nova tag" */}
        <div className="mb-5 p-4 rounded-xl border border-[#efefef]" style={{ background: "#FAFAFA" }}>
          <label className="block text-[#1f2937] text-xs mb-2" style={{ fontWeight: 600 }}>
            {etapaEdicaoId ? "Editar etapa" : "Nova etapa"}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={etapaNome}
              onChange={(e) => setEtapaNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitEtapa();
                }
              }}
              placeholder="Ex: Prospecção"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
            />
            <button
              onClick={submitEtapa}
              disabled={salvandoEtapa}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm transition-all disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {salvandoEtapa ? (
                <Loader2 size={15} className="animate-spin" />
              ) : etapaEdicaoId ? (
                <Check size={15} />
              ) : (
                <Plus size={15} />
              )}
              {etapaEdicaoId ? "Salvar" : "Adicionar"}
            </button>
            {etapaEdicaoId && (
              <button
                onClick={limparFormEtapa}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
                style={{ fontWeight: 500 }}
              >
                <X size={14} />
                Cancelar
              </button>
            )}
          </div>
          <div className="mt-3">
            <p className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>
              Cor
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <PaletteCores cores={CORES_ETAPA} valor={etapaCor} onChange={setEtapaCor} />
              {/* regra 4 da SPEC: paleta + input type="color" nativo; sempre salva hex #rrggbb */}
              <label
                className="relative w-7 h-7 rounded-full overflow-hidden border border-[#efefef] cursor-pointer shrink-0"
                title="Cor personalizada"
                aria-label="Cor personalizada"
              >
                <input
                  type="color"
                  value={etapaCor}
                  onChange={(e) => setEtapaCor(e.target.value)}
                  className="absolute -inset-2 w-12 h-12 cursor-pointer border-0 p-0 bg-transparent"
                />
              </label>
              <span
                className="ml-auto inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] self-center"
                style={getTagPalette(etapaCor)}
              >
                Preview
              </span>
            </div>
          </div>
        </div>

        {/* Lista de etapas (skeleton/erro/vazio = mesmos blocos do card de tags) */}
        {carregandoEtapas ? (
          <ListaSkeleton />
        ) : erroEtapas ? (
          <ListaErro titulo="Erro ao carregar etapas" mensagem={erroEtapas} onRetry={recarregarEtapas} />
        ) : etapas.length === 0 ? (
          <ListaVazia
            titulo="Nenhuma etapa ainda"
            descricao="Adicione a primeira etapa acima — ela vira a 1ª coluna do pipeline."
          />
        ) : (
          <div className="space-y-2">
            {etapas.map((etapa, idx) => (
              <EtapaRow
                key={etapa.id}
                etapa={etapa}
                idx={idx}
                total={etapas.length}
                editando={etapaEdicaoId === etapa.id}
                operando={operandoEtapaId === etapa.id}
                onEditar={() =>
                  etapaEdicaoId === etapa.id ? limparFormEtapa() : iniciarEdicaoEtapa(etapa)
                }
                onMover={(direcao) => handleMoverEtapa(etapa.id, direcao)}
                onExcluir={() => handleExcluirEtapa(etapa)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nota */}
      <p className="text-[#627271] text-xs px-1">
        Tags removidas deixam de aparecer em novos cadastros, mas continuam valendo nos clientes já cadastrados. Renomear uma etapa atualiza automaticamente as negociações que estão nela; a ordem das linhas é a ordem das colunas do pipeline.
      </p>
    </div>
  );
}