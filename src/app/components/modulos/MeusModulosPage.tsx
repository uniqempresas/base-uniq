// Rota sugerida: /meus-modulos

// Tela SOMENTE LEITURA (SPEC-MenuEnxuto §4 / WIRE-MenuEnxuto §5):
// "Módulos ativados pela UNIQ — o parceiro não escolhe ou configura"
// (CONTEXTO_PROJETO.md:342-344). Sem loja, sem trial, sem cancelar, sem planos.

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Building2,
  Settings,
  Users,
  Package,
  ShoppingCart,
  Store,
  CalendarDays,
  Wallet,
  BarChart3,
  Sparkles,
  MessageSquare,
  ShoppingBag,
  Truck,
  Scissors,
  UserCog,
  SearchX,
  AlertTriangle,
  Check,
  Info,
} from 'lucide-react';

import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../ui/utils';
import { useModulosAtivos, type Modulo, type ModuloStatus } from '../../hooks/useModulosAtivos';
import { MODULO_ROUTES } from '../../lib/moduloRoutes';

// ==================== ÍCONES ====================
const iconeMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  Settings,
  Users,
  Package,
  ShoppingCart,
  Store,
  CalendarDays,
  Wallet,
  BarChart3,
  Sparkles,
  MessageSquare,
  ShoppingBag,
  Truck,
  Scissors,
  UserCog,
};

// ==================== HELPERS ====================
function getRotaModulo(codigo: string): string {
  return MODULO_ROUTES[codigo] || '/';
}

// ==================== SUB-COMPONENTES ====================

function ModuloIcone({ nome, className }: { nome: string; className?: string }) {
  const Icone = iconeMap[nome] || Info;
  return <Icone className={className} />;
}

function StatusBadge({ status }: { status: ModuloStatus }) {
  switch (status) {
    case 'ativo':
      return <Badge className="bg-primary text-primary-foreground hover:bg-primary">Ativo</Badge>;
    case 'trial':
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">Trial</Badge>;
    case 'core':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Incluso</Badge>;
    case 'cancelado':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
    default:
      return null;
  }
}

interface ModuloCardProps {
  modulo: Modulo;
  onDetalhes?: (m: Modulo) => void;
  onUsar?: (m: Modulo) => void;
}

/**
 * Card dos módulos ativos/inclusos — somente leitura.
 * Sem ação de loja (adquirir/preço) e sem cancelar. O corpo do card abre os
 * detalhes; "Usar módulo" apenas navega (WIRE §5.2).
 */
function ModuloCard({ modulo, onDetalhes, onUsar }: ModuloCardProps) {
  const isCore = modulo.status === 'core';
  const isTrial = modulo.status === 'trial';
  const isCancelado = modulo.status === 'cancelado';

  return (
    <Card
      className={cn(
        'flex cursor-pointer flex-col transition-shadow hover:shadow-md',
        isTrial && 'border-amber-200',
        isCancelado && 'opacity-70'
      )}
      onClick={() => onDetalhes?.(modulo)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDetalhes?.(modulo);
        }
      }}
      tabIndex={0}
      aria-label={`Ver detalhes de ${modulo.nome}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <ModuloIcone nome={modulo.icone} className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{modulo.nome}</CardTitle>
              <div className="mt-1">
                <StatusBadge status={modulo.status} />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        <CardDescription className="line-clamp-2 text-sm">
          {modulo.descricao}
        </CardDescription>

        {!isCore && (
          <div className="mt-3 text-xs text-muted-foreground">
            {modulo.status === 'ativo' && modulo.dataRenovacao && (
              <span>Renovação: {modulo.dataRenovacao}</span>
            )}
            {modulo.status === 'trial' && modulo.dataTrialFim && (
              <span>Fim do trial: {modulo.dataTrialFim}</span>
            )}
            {modulo.status === 'cancelado' && modulo.dataRenovacao && (
              <span>Válido até: {modulo.dataRenovacao}</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        {isCancelado ? (
          <Button variant="outline" disabled className="w-full">
            Cancelado
          </Button>
        ) : (
          <Button
            variant={isCore ? 'outline' : 'default'}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onUsar?.(modulo);
            }}
          >
            Usar módulo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Item da seção "Em breve" — discreto, somente leitura, SEM nenhuma ação:
 * sem toque, sem botão, sem preço, sem badge (WIRE §5.2/§5.3, SPEC §4.3).
 */
function ItemEmBreve({ modulo }: { modulo: Modulo }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <ModuloIcone nome={modulo.icone} className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{modulo.nome}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {modulo.descricao}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function EmptyStateBusca({ onLimpar }: { onLimpar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">Nenhum módulo encontrado</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Tente ajustar seus filtros ou termos de busca.
      </p>
      <Button variant="outline" className="mt-6" onClick={onLimpar}>
            Limpar busca
      </Button>
    </div>
  );
}

function ModuloCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 pb-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
      <CardFooter className="pt-2">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function ModulosSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ModuloCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-20" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModalDetalhesModulo({
  modulo,
  open,
  onOpenChange,
  onUsar,
}: {
  modulo: Modulo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsar?: (m: Modulo) => void;
}) {
  if (!modulo) return null;
  const adquirido = modulo.status !== 'nao_adquirido';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ModuloIcone nome={modulo.icone} className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle>{modulo.nome}</DialogTitle>
              <DialogDescription>{modulo.descricao}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Funcionalidades principais</h4>
            <ul className="space-y-2">
              {modulo.funcionalidades.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-foreground" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Preço:</span>
            <span className="font-medium">
              {modulo.preco === 0 ? 'Gratuito' : `R$ ${modulo.preco}/mês`}
            </span>
          </div>
          {adquirido && modulo.status !== 'core' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status={modulo.status} />
            </div>
          )}
          {adquirido && modulo.dataRenovacao && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Renovação:</span>
              <span className="font-medium">{modulo.dataRenovacao}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => modulo && onUsar?.(modulo)}>Usar módulo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== PÁGINA PRINCIPAL ====================

export function MeusModulosPage() {
  const navigate = useNavigate();
  const { modulos } = useModulosAtivos();

  const [busca, setBusca] = useState('');
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [moduloSelecionado, setModuloSelecionado] = useState<Modulo | null>(null);

  // Estados da página — a fonte atual é o localStorage (síncrona), então
  // loading/erro não têm gatilho real hoje (SPEC §10 L2 / WIRE §5.6). As
  // branches existem por regra do projeto (AGENTS.md) e ficam prontas para a
  // Opção B, quando o estado vier do banco (async).
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = () => {
    setCarregando(false);
    setErro(null);
  };

  // Derivados
  const termo = busca.trim().toLowerCase();
  const temBusca = termo.length > 0;

  const modulosVisiveis = useMemo(() => {
    const ativos = modulos.filter((m) => m.status !== 'nao_adquirido');
    if (!temBusca) return ativos;
    return ativos.filter(
      (m) => m.nome.toLowerCase().includes(termo) || m.descricao.toLowerCase().includes(termo)
    );
  }, [modulos, temBusca, termo]);

  const emBreveVisiveis = useMemo(() => {
    const emBreve = modulos.filter((m) => m.status === 'nao_adquirido');
    if (!temBusca) return emBreve;
    return emBreve.filter(
      (m) => m.nome.toLowerCase().includes(termo) || m.descricao.toLowerCase().includes(termo)
    );
  }, [modulos, temBusca, termo]);

  const buscaSemResultado =
    temBusca && modulosVisiveis.length === 0 && emBreveVisiveis.length === 0;

  // Handlers
  const handleDetalhes = (m: Modulo) => {
    setModuloSelecionado(m);
    setModalDetalhesOpen(true);
  };

  const handleUsar = (m: Modulo) => {
    navigate(getRotaModulo(m.codigo));
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Meus Módulos</h1>
        <p className="text-muted-foreground">
          Acompanhe o que está ativo e o que será ativado.
        </p>
      </div>

      {/* Busca */}
      <div className="mb-6 flex items-center gap-2">
        <input
          type="text"
          aria-label="Buscar módulo"
          placeholder="Buscar módulo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {busca && (
          <Button variant="ghost" size="sm" onClick={() => setBusca('')}>
            Limpar
          </Button>
        )}
      </div>

      {/* Loading (skeleton) */}
      {carregando && <ModulosSkeleton />}

      {/* Erro + retry */}
      {!carregando && erro && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Não foi possível carregar os módulos.</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Tente novamente em instantes.
          </p>
          <Button variant="outline" className="mt-6" onClick={recarregar}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Sucesso */}
      {!carregando && !erro && (
        <>
          {buscaSemResultado ? (
            <EmptyStateBusca onLimpar={() => setBusca('')} />
          ) : (
            <div className="space-y-10">
              {/* Seus módulos */}
              {modulosVisiveis.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    Seus módulos ({modulosVisiveis.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {modulosVisiveis.map((m) => (
                      <ModuloCard
                        key={m.id}
                        modulo={m}
                        onDetalhes={handleDetalhes}
                        onUsar={handleUsar}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Em breve — somente leitura, sem nenhuma ação */}
              {(emBreveVisiveis.length > 0 || !temBusca) && (
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    Em breve ({emBreveVisiveis.length})
                  </h2>
                  {emBreveVisiveis.length === 0 ? (
                    <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Todos os módulos da UNIQ já estão ativos.
                    </p>
                  ) : (
                    <>
                      <p className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          Módulos que a UNIQ ativa — você não escolhe nem configura.
                        </span>
                      </p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {emBreveVisiveis.map((m) => (
                          <ItemEmBreve key={m.id} modulo={m} />
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal de detalhes — sem o botão "Adquirir módulo" */}
      <ModalDetalhesModulo
        modulo={moduloSelecionado}
        open={modalDetalhesOpen}
        onOpenChange={setModalDetalhesOpen}
        onUsar={handleUsar}
      />
    </div>
  );
}

export default MeusModulosPage;