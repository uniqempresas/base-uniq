import { Building2, AlertCircle } from "lucide-react";
import type { StoreConfigLoja } from "../../../types/loja";

/**
 * Bloco Identidade — `store_config` (WIRE §4.6 + §7).
 *
 * Três campos: `slogan` · `description` · `ramoAtuacao`.
 * Textarea curta para descrição; inputs de linha para slogan/ramo.
 * **Nunca** renderiza nem edita `whatsapp_contact` — o merge do hook preserva
 * chaves que o editor não conhece.
 * Vazio → inputs vazios + placeholders (a vitrine usa nome + ramo).
 */

interface IdentidadeConfigProps {
  storeConfig: StoreConfigLoja;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  onChange: (patch: Partial<StoreConfigLoja>) => void;
}

export function IdentidadeConfig({
  storeConfig,
  carregando,
  erro,
  recarregar,
  onChange,
}: IdentidadeConfigProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-[#627271]" />
        </div>
        <div>
          <h2 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
            Identidade
          </h2>
          <p className="text-[#627271] text-xs mt-0.5">
            Textos que identificam sua loja.
          </p>
        </div>
      </div>

      {carregando ? (
        <div className="space-y-3">
          <div className="h-11 bg-[#efefef] rounded-xl animate-pulse" />
          <div className="h-24 bg-[#efefef] rounded-xl animate-pulse" />
          <div className="h-11 bg-[#efefef] rounded-xl animate-pulse w-2/3" />
        </div>
      ) : erro ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Não foi possível carregar a identidade.
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
          <div>
            <label
              htmlFor="id-slogan"
              className="block text-[#1f2937] text-xs mb-1.5"
              style={{ fontWeight: 500 }}
            >
              Slogan
            </label>
            <input
              id="id-slogan"
              type="text"
              value={storeConfig.slogan || ""}
              onChange={(e) => onChange({ slogan: e.target.value })}
              placeholder="Ex: Doces que abraçam"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="id-descricao"
              className="block text-[#1f2937] text-xs mb-1.5"
              style={{ fontWeight: 500 }}
            >
              Descrição
            </label>
            <textarea
              id="id-descricao"
              rows={3}
              value={storeConfig.description || ""}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Conte em poucas palavras o que sua loja faz."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="id-ramo"
              className="block text-[#1f2937] text-xs mb-1.5"
              style={{ fontWeight: 500 }}
            >
              Ramo
            </label>
            <input
              id="id-ramo"
              type="text"
              value={storeConfig.ramoAtuacao || ""}
              onChange={(e) => onChange({ ramoAtuacao: e.target.value })}
              placeholder="Ex: Confeitaria artesanal"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
            />
          </div>

          <p className="text-[#627271] text-[11px] leading-relaxed">
            Enquanto vazio, a vitrine usa o nome da loja e o ramo. O que você não
            vê aqui (ex.: whatsapp_contact) é preservado ao salvar.
          </p>
        </div>
      )}
    </div>
  );
}