import { useEffect, useState } from "react";
import { Palette, AlertCircle } from "lucide-react";
import type { TemaLoja } from "../../../types/loja";

/**
 * Bloco Tema — as 4 chaves exatas do contrato (WIRE §4.5).
 *
 * `primaryColor` · `secondaryColor` · `borderRadius` · `fontFamily`.
 * - Sem dados os campos já vêm preenchidos com os defaults (`#86cb92`,
 *   `#1f2937`, `8px`, `Poppins`) — o parceiro vê o que está valendo hoje.
 * - Cor: chip de cor + hex editável (padrão visual do DESIGN.md).
 * - `fontFamily`: select com Poppins + alternativas de sistema.
 * - `borderRadius`: input numérico com sufixo `px` (texto local, só dígitos).
 */

const FONTES = [
  "Poppins",
  "Arial",
  "Helvetica",
  "Georgia",
  "Trebuchet MS",
  "Courier New",
  "Verdana",
];

const DEFAULT_RAIO = "8";

/** Chip de cor + hex editável — mesma mecânica da paleta de categorias. */
function CampoCor(props: {
  label: string;
  valor: string;
  onChange: (cor: string) => void;
  inputId: string;
}) {
  const { label, valor, onChange, inputId } = props;
  const corValida = /^#[0-9a-fA-F]{6}$/.test(valor) ? valor : "#86cb92";

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-[#1f2937] text-xs mb-1.5"
        style={{ fontWeight: 500 }}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span className="w-11 h-11 rounded-xl border border-[#efefef] relative overflow-hidden shrink-0">
          <span className="absolute inset-0" style={{ background: corValida }} aria-hidden />
          <input
            type="color"
            value={corValida}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`Selecionar cor — ${label}`}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </span>
        <input
          id={inputId}
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#86cb92"
          aria-label={label}
          className="w-full min-w-0 px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white font-mono"
        />
      </div>
    </div>
  );
}

interface TemaConfigProps {
  tema: TemaLoja;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  onChange: (tema: TemaLoja) => void;
}

export function TemaConfig({
  tema,
  carregando,
  erro,
  recarregar,
  onChange,
}: TemaConfigProps) {
  // Texto local do raio — o contrato guarda `"8px"` (string com sufixo).
  const [raioTexto, setRaioTexto] = useState(DEFAULT_RAIO);

  useEffect(() => {
    const digitos = (tema.borderRadius || DEFAULT_RAIO).replace(/[^0-9]/g, "");
    setRaioTexto(digitos || DEFAULT_RAIO);
  }, [tema.borderRadius]);

  const mudarRaio = (v: string) => {
    const digitos = v.replace(/\D/g, "");
    setRaioTexto(digitos);
    onChange({ ...tema, borderRadius: digitos ? `${digitos}px` : "" });
  };

  const mudarCor =
    (chave: "primaryColor" | "secondaryColor") => (cor: string) =>
      onChange({ ...tema, [chave]: cor });

  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center shrink-0">
          <Palette size={18} className="text-[#627271]" />
        </div>
        <div>
          <h2 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
            Tema — 4 chaves
          </h2>
          <p className="text-[#627271] text-xs mt-0.5">
            Cores, arredondamento e fonte da sua loja.
          </p>
        </div>
      </div>

      {carregando ? (
        <div className="space-y-3">
          <div className="h-11 bg-[#efefef] rounded-xl animate-pulse" />
          <div className="h-11 bg-[#efefef] rounded-xl animate-pulse" />
          <div className="h-11 bg-[#efefef] rounded-xl animate-pulse w-2/3" />
        </div>
      ) : erro ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Não foi possível carregar o tema.
          </p>
          <p className="text-[#627271] text-xs mb-4">{erro}</p>
          <button
            onClick={recarregar}
            className="px-4 py-2 rounded-xl text-[#1f2937] text-sm"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <CampoCor
            label="Cor principal"
            valor={tema.primaryColor || ""}
            onChange={mudarCor("primaryColor")}
            inputId="cor-principal"
          />
          <CampoCor
            label="Cor secundária"
            valor={tema.secondaryColor || ""}
            onChange={mudarCor("secondaryColor")}
            inputId="cor-secundaria"
          />

          <div>
            <label
              htmlFor="raio-tema"
              className="block text-[#1f2937] text-xs mb-1.5"
              style={{ fontWeight: 500 }}
            >
              Arredondamento
            </label>
            <div className="flex items-center gap-2">
              <input
                id="raio-tema"
                type="text"
                inputMode="numeric"
                value={raioTexto}
                onChange={(e) => mudarRaio(e.target.value)}
                aria-label="Arredondamento em pixels"
                className="w-24 px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
              />
              <span className="text-[#627271] text-sm">px</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="fonte-tema"
              className="block text-[#1f2937] text-xs mb-1.5"
              style={{ fontWeight: 500 }}
            >
              Fonte
            </label>
            <select
              id="fonte-tema"
              value={tema.fontFamily || "Poppins"}
              onChange={(e) => onChange({ ...tema, fontFamily: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-white appearance-none"
            >
              {FONTES.map((fonte) => (
                <option key={fonte} value={fonte}>
                  {fonte}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[#627271] text-[11px] leading-relaxed">
            Vazios = padrão da UNIQ. Sua loja usa estes valores até você mudar.
          </p>
        </div>
      )}
    </div>
  );
}