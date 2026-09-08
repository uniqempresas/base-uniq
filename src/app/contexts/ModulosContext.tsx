import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  MODULOS_ATIVOS_INICIAIS,
  MODULOS_STORAGE_KEY,
  type Modulo,
  type ModuloStatus,
} from '../lib/modulos';

const REATIVACAO_MIGRATION_KEY = 'uniq-modulos-cancelados-reativados-v1';
const AGENDA_INCLUSA_MIGRATION_KEY = 'uniq-agenda-inclusa-v1';

type ModulosContextValue = {
  modulos: Modulo[];
  setModulos: (updater: Modulo[] | ((prev: Modulo[]) => Modulo[])) => void;
  ativarModulo: (codigo: string) => void;
  cancelarModulo: (codigo: string) => void;
  iniciarTrial: (codigo: string) => void;
  getStatus: (codigo: string) => ModuloStatus;
};

const ModulosContext = createContext<ModulosContextValue | null>(null);

function formatarDataFutura(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toLocaleDateString('pt-BR');
}

function carregarModulos(): Modulo[] {
  if (typeof window === 'undefined') return MODULOS_ATIVOS_INICIAIS;
  try {
    const raw = localStorage.getItem(MODULOS_STORAGE_KEY);
    if (!raw) return MODULOS_ATIVOS_INICIAIS;
    const parsed = JSON.parse(raw) as Modulo[];
    const existentes = new Map(parsed.map((modulo) => [modulo.id, modulo]));
    const mesclados = MODULOS_ATIVOS_INICIAIS.map((modulo) => existentes.get(modulo.id) || modulo);

    let resultado = mesclados;
    if (!localStorage.getItem(REATIVACAO_MIGRATION_KEY)) {
      resultado = resultado.map((modulo) =>
        modulo.status === 'cancelado'
          ? { ...modulo, status: 'core' as ModuloStatus, dataRenovacao: undefined, dataTrialFim: undefined }
          : modulo,
      );
      localStorage.setItem(REATIVACAO_MIGRATION_KEY, 'true');
    }
    if (!localStorage.getItem(AGENDA_INCLUSA_MIGRATION_KEY)) {
      resultado = resultado.map((modulo) => modulo.codigo === 'agenda' && modulo.status === 'nao_adquirido'
        ? { ...modulo, status: 'core' as ModuloStatus, dataRenovacao: undefined, dataTrialFim: undefined }
        : modulo);
      localStorage.setItem(AGENDA_INCLUSA_MIGRATION_KEY, 'true');
    }
    return resultado;
  } catch {
    return MODULOS_ATIVOS_INICIAIS;
  }
}

export function ModulosProvider({ children }: { children: ReactNode }) {
  const [modulos, setModulosState] = useState<Modulo[]>(carregarModulos);

  useEffect(() => {
    try {
      localStorage.setItem(MODULOS_STORAGE_KEY, JSON.stringify(modulos));
    } catch {
      // Persistência local é opcional para o protótipo.
    }
  }, [modulos]);

  const setModulos = useCallback((updater: Modulo[] | ((prev: Modulo[]) => Modulo[])) => {
    setModulosState((prev) => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  const ativarModulo = useCallback((codigo: string) => {
    setModulosState((prev) => prev.map((modulo) => modulo.codigo === codigo
      ? { ...modulo, status: 'ativo' as ModuloStatus, dataTrialFim: undefined }
      : modulo));
  }, []);

  const cancelarModulo = useCallback((codigo: string) => {
    setModulosState((prev) => prev.map((modulo) => modulo.codigo === codigo
      ? { ...modulo, status: 'cancelado' as ModuloStatus }
      : modulo));
  }, []);

  const iniciarTrial = useCallback((codigo: string) => {
    setModulosState((prev) => prev.map((modulo) => modulo.codigo === codigo
      ? { ...modulo, status: 'trial' as ModuloStatus, dataTrialFim: formatarDataFutura(14) }
      : modulo));
  }, []);

  const getStatus = useCallback(
    (codigo: string) => modulos.find((modulo) => modulo.codigo === codigo)?.status || 'nao_adquirido',
    [modulos],
  );

  const value = useMemo(() => ({ modulos, setModulos, ativarModulo, cancelarModulo, iniciarTrial, getStatus }), [
    modulos, setModulos, ativarModulo, cancelarModulo, iniciarTrial, getStatus,
  ]);

  return <ModulosContext.Provider value={value}>{children}</ModulosContext.Provider>;
}

export function useModulosContext() {
  const context = useContext(ModulosContext);
  if (!context) throw new Error('useModulosAtivos deve ser usado dentro de ModulosProvider.');
  return context;
}
