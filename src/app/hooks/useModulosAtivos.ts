import { useModulosContext } from '../contexts/ModulosContext';

export {
  MODULOS_ATIVOS_INICIAIS,
  MODULOS_STORAGE_KEY,
  type Modulo,
  type ModuloStatus,
  type ModuloCategoria,
} from '../lib/modulos';

export function useModulosAtivos() {
  return useModulosContext();
}
