import { Images } from "lucide-react";
import { AlertCircle } from "lucide-react";

/**
 * Bloco Carrossel (WIRE §4.4 + §7).
 *
 * - Autoplay: chips Ligado/Desligado (alvo ≥ 44px, `aria-pressed`).
 * - Intervalo: input numérico step 500, sufixo "ms", mínimo 2000.
 *   `intervalo < 2000` → erro inline SELF-CONTAINED (borda vermelha + mensagem,
 *   `role="alert"`); a página também bloqueia o salvar.
 * - Sem dados salvos os valores chegam dos defaults de `use-loja-appearance`
 *   (a página resolve origem "gerado" → autoplay ligado + 5000ms, WIRE §4.4).
 */

interface CarrosselConfigProps {
  autoplay: boolean;
  intervalo: number;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  onChangeAutoplay: (on: boolean) => void;
  onChangeIntervalo: (ms: number) => void;
}

export function CarrosselConfig({
  autoplay,
  intervalo,
  carregando,
  erro,
  recarregar,
  onChangeAutoplay,
  onChangeIntervalo,
}: CarrosselConfigProps) {
  const invalido = !Number.isFinite(intervalo) || intervalo < 2000;

  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center shrink-0">
          <Images size={18} className="text-[#627271]" />
        </div>
        <div>
          <h2 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
            Carrossel
          </h2>
          <p className="text-[#627271] text-xs mt-0.5">
            Transição automática entre os banners.
          </p>
        </div>
      </div>

      {carregando ? (
        <div className="space-y-3">
          <div className="h-11 bg-[#efefef] rounded-xl animate-pulse" />
          <div className="h-11 bg-[#efefef] rounded-xl animate-pulse w-2/3" />
        </div>
      ) : erro ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Não foi possível carregar o carrossel.
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
          {/* Autoplay */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-2" style={{ fontWeight: 500 }}>
              Autoplay
            </label>
            <div className="flex gap-2">
              {(["Ligado", "Desligado"] as const).map((opcao) => {
                const ligado = opcao === "Ligado";
                const ativo = ligado === autoplay;
                return (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => onChangeAutoplay(ligado)}
                    aria-pressed={ativo}
                    className="flex-1 min-h-11 px-3 py-2.5 rounded-xl border text-xs transition-all"
                    style={{
                      background: ativo ? "#86cb92" : "white",
                      borderColor: ativo ? "#86cb92" : "#efefef",
                      color: ativo ? "#1f2937" : "#627271",
                      fontWeight: ativo ? 600 : 400,
                    }}
                  >
                    {opcao}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intervalo */}
          <div>
            <label
              htmlFor="intervalo-carrossel"
              className="block text-[#1f2937] text-xs mb-2"
              style={{ fontWeight: 500 }}
            >
              Intervalo
            </label>
            <div className="flex items-center gap-2">
              <input
                id="intervalo-carrossel"
                type="number"
                value={Number.isFinite(intervalo) ? intervalo : 0}
                min={2000}
                step={500}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  onChangeIntervalo(Number.isFinite(n) ? n : 0);
                }}
                aria-describedby={invalido ? "erro-intervalo" : "dica-intervalo"}
                className={`w-32 px-3.5 py-2.5 rounded-xl border text-[#1f2937] text-sm outline-none focus:ring-2 bg-white ${
                  invalido
                    ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                    : "border-[#efefef] focus:border-[#86cb92] focus:ring-[#86cb92]/20"
                }`}
              />
              <span className="text-[#627271] text-sm">ms</span>
            </div>
            {invalido ? (
              <p
                id="erro-intervalo"
                role="alert"
                className="mt-1.5 text-xs text-red-600"
                style={{ fontWeight: 500 }}
              >
                O intervalo mínimo é de 2000ms.
              </p>
            ) : (
              <p id="dica-intervalo" className="mt-1.5 text-[#627271] text-[11px]">
                mínimo 2000
              </p>
            )}
          </div>

          <p className="text-[#627271] text-[11px] leading-relaxed">
            Autoplay só tem efeito com 2+ banners.
          </p>
        </div>
      )}
    </div>
  );
}