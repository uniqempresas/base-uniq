// Rota sugerida: /meus-modulos

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
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
  Gift,
  SearchX,
  AlertTriangle,
  Check,
  Info,
  FileText,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
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

// ==================== TIPOS LOCAIS ====================
interface Assinatura {
  plano: string;
  precoBase: number;
}

const ASSINATURA_MOCK: Assinatura = {
  plano: 'Business',
  precoBase: 149,
};

const PLANOS_COMPARATIVO = [
  {
    nome: 'Starter',
    preco: 0,
    modulos: ['Dashboard', 'Minha Empresa', 'Configurações'],
  },
  {
    nome: 'Business',
    preco: 149,
    modulos: [
      'Dashboard',
      'Minha Empresa',
      'Configurações',
      'CRM',
      'Estoque',
      'Vendas',
      'Agenda',
      'Financeiro',
      'Métricas',
      'Catálogo de Serviços',
      'Colaboradores',
    ],
  },
  {
    nome: 'Pro',
    preco: 299,
    modulos: 'Todos os módulos',
  },
];

// ==================== HELPERS ====================
function calcularFatura(modulos: Modulo[], assinatura: Assinatura): number {
  const totalModulos = modulos
    .filter((m) => m.status === 'ativo')
    .reduce((acc, m) => acc + m.preco, 0);
  return assinatura.precoBase + totalModulos;
}

function contarModulosAtivos(modulos: Modulo[]): number {
  return modulos.filter((m) => m.status === 'ativo' || m.status === 'trial').length;
}

function formatarDataFutura(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toLocaleDateString('pt-BR');
}

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
  onAdquirir?: (m: Modulo) => void;
  onCancelar?: (m: Modulo) => void;
  onDetalhes?: (m: Modulo) => void;
  onUsar?: (m: Modulo) => void;
}

function ModuloCard({ modulo, onAdquirir, onCancelar, onDetalhes, onUsar }: ModuloCardProps) {
  const isLoja = modulo.status === 'nao_adquirido';
  const isCore = modulo.status === 'core';
  const isTrial = modulo.status === 'trial';
  const isCancelado = modulo.status === 'cancelado';

  return (
    <Card
      className={cn(
        'flex flex-col transition-shadow hover:shadow-md',
        isTrial && 'border-amber-200',
        isCancelado && 'opacity-70'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center rounded-lg bg-muted',
                isLoja ? 'h-12 w-12' : 'h-10 w-10'
              )}
            >
              <ModuloIcone
                nome={modulo.icone}
                className={cn('text-muted-foreground', isLoja ? 'h-6 w-6' : 'h-5 w-5')}
              />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{modulo.nome}</CardTitle>
              {!isLoja && (
                <div className="mt-1">
                  <StatusBadge status={modulo.status} />
                </div>
              )}
            </div>
          </div>
          {isLoja && modulo.preco > 0 && (
            <div className="text-right">
              <span className="text-sm font-semibold text-foreground">
                R$ {modulo.preco}/mês
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        <CardDescription className="line-clamp-2 text-sm">
          {modulo.descricao}
        </CardDescription>

        {!isLoja && !isCore && (
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

        {isLoja && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{modulo.categoria}</Badge>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary">14 dias grátis</Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        {isLoja ? (
          <div className="flex w-full items-center gap-2">
            <Button className="flex-1" onClick={() => onAdquirir?.(modulo)}>
              Adquirir
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDetalhes?.(modulo)}>
              Saiba mais
            </Button>
          </div>
        ) : isCore ? (
          <Button variant="outline" className="w-full" onClick={() => onUsar?.(modulo)}>
            Usar módulo
          </Button>
        ) : isCancelado ? (
          <Button variant="outline" disabled className="w-full">
            Cancelado
          </Button>
        ) : (
          <div className="flex w-full items-center gap-2">
            <Button className="flex-1" onClick={() => onUsar?.(modulo)}>
              Usar módulo
            </Button>
            <Button variant="outline" size="sm" onClick={() => onCancelar?.(modulo)}>
              Cancelar
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function EmptyStateMeusModulos({ onExplorar }: { onExplorar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Store className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">Comece a expandir sua UNIQ</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Você tem acesso aos módulos básicos. Adquira novos módulos para potencializar seu negócio.
      </p>
      <Button className="mt-6" onClick={onExplorar}>
        Explorar loja de módulos
      </Button>
    </div>
  );
}

function EmptyStateLojaCompleta({ onVerMeus }: { onVerMeus: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Gift className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">Você tem todos os módulos!</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Parabéns, sua empresa está aproveitando tudo que a UNIQ oferece.
      </p>
      <Button variant="outline" className="mt-6" onClick={onVerMeus}>
        Ver meus módulos ativos
      </Button>
    </div>
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
        Limpar filtros
      </Button>
    </div>
  );
}

function ModalAdquirirModulo({
  modulo,
  open,
  onOpenChange,
  onConfirm,
}: {
  modulo: Modulo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  if (!modulo) return null;
  const dataFim = formatarDataFutura(14);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:mx-0">
            <ModuloIcone nome={modulo.icone} className="h-6 w-6 text-muted-foreground" />
          </div>
          <DialogTitle>Iniciar trial de {modulo.nome}?</DialogTitle>
          <DialogDescription>
            Você terá <strong>14 dias grátis</strong> para testar o módulo {modulo.nome}. Após o
            trial, o valor de <strong>R$ {modulo.preco}/mês</strong> será adicionado à sua próxima
            fatura.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 text-foreground" />
            <span>Acesso completo a todas as funcionalidades</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 text-foreground" />
            <span>Sem compromisso durante o trial</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 text-foreground" />
            <span>Cancelamento gratuito antes do fim do trial</span>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Valor após trial:</div>
            <div className="font-medium">R$ {modulo.preco}/mês</div>
            <div className="text-muted-foreground">Início do trial:</div>
            <div className="font-medium">Hoje</div>
            <div className="text-muted-foreground">Fim do trial:</div>
            <div className="font-medium">{dataFim}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Iniciar trial agora</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModalCancelarModulo({
  modulo,
  open,
  onOpenChange,
  onConfirm,
}: {
  modulo: Modulo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const [checked, setChecked] = useState(false);
  if (!modulo) return null;
  const dataFim = modulo.dataRenovacao || 'fim do ciclo atual';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 sm:mx-0">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle>Cancelar {modulo.nome}?</DialogTitle>
          <DialogDescription>
            O módulo deixará de aparecer no menu e não estará mais disponível a partir do dia{' '}
            <strong>{dataFim}</strong> (fim do ciclo atual).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="entendo-cancelamento"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
            />
            <label htmlFor="entendo-cancelamento" className="text-sm leading-relaxed">
              Entendo que os dados do módulo ficarão inacessíveis após essa data.
            </label>
          </div>
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Você não será reembolsado do valor já pago neste ciclo.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button variant="destructive" disabled={!checked} onClick={onConfirm}>
            Confirmar cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModalDetalhesModulo({
  modulo,
  open,
  onOpenChange,
  onAdquirir,
  onUsar,
}: {
  modulo: Modulo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdquirir?: (m: Modulo) => void;
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
          {!adquirido && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trial:</span>
              <span className="font-medium">14 dias grátis</span>
            </div>
          )}
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
          {!adquirido ? (
            <Button onClick={() => modulo && onAdquirir?.(modulo)}>Adquirir módulo</Button>
          ) : (
            <Button onClick={() => modulo && onUsar?.(modulo)}>Usar módulo</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ComparadorPlanos({ planoAtual, modulos }: { planoAtual: string; modulos: Modulo[] }) {
  const todosModulos = modulos.map((m) => m.nome);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3 text-left font-medium text-muted-foreground">Recurso</th>
            {PLANOS_COMPARATIVO.map((p) => (
              <th key={p.nome} className="py-3 text-center font-medium">
                <span
                  className={cn(
                    'inline-block rounded-full px-3 py-1',
                    p.nome === planoAtual ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  {p.nome}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {todosModulos.map((nomeModulo) => (
            <tr key={nomeModulo} className="border-b last:border-b-0">
              <td className="py-2.5 font-medium">{nomeModulo}</td>
              {PLANOS_COMPARATIVO.map((p) => {
                const incluido =
                  p.modulos === 'Todos os módulos' || p.modulos.includes(nomeModulo);
                return (
                  <td key={p.nome} className="py-2.5 text-center">
                    {incluido ? (
                      <Check className="mx-auto h-4 w-4 text-foreground" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-t bg-muted/30 font-semibold">
            <td className="py-3">Preço mensal</td>
            {PLANOS_COMPARATIVO.map((p) => (
              <td key={p.nome} className="py-3 text-center">
                R$ {p.preco}/mês
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================

export function MeusModulosPage() {
  const navigate = useNavigate();
  const { modulos, setModulos, iniciarTrial, cancelarModulo } = useModulosAtivos();
  const [activeTab, setActiveTab] = useState<'meus' | 'loja' | 'plano'>('meus');
  const [filtroMeus, setFiltroMeus] = useState<'todos' | 'ativos' | 'trial' | 'cancelados'>('todos');
  const [buscaLoja, setBuscaLoja] = useState('');

  // Modais
  const [modalAdquirirOpen, setModalAdquirirOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [moduloSelecionado, setModuloSelecionado] = useState<Modulo | null>(null);

  // Derivados
  const faturaAtual = useMemo(() => calcularFatura(modulos, ASSINATURA_MOCK), [modulos]);
  const qtdAtivos = useMemo(() => contarModulosAtivos(modulos), [modulos]);

  const modulosMeus = useMemo(() => {
    let lista = modulos.filter((m) => m.status !== 'nao_adquirido');
    if (filtroMeus === 'ativos') lista = lista.filter((m) => m.status === 'ativo');
    if (filtroMeus === 'trial') lista = lista.filter((m) => m.status === 'trial');
    if (filtroMeus === 'cancelados') lista = lista.filter((m) => m.status === 'cancelado');
    return lista;
  }, [modulos, filtroMeus]);

  const modulosLoja = useMemo(() => {
    const naoAdquiridos = modulos.filter((m) => m.status === 'nao_adquirido');
    if (!buscaLoja.trim()) return naoAdquiridos;
    const termo = buscaLoja.toLowerCase();
    return naoAdquiridos.filter(
      (m) =>
        m.nome.toLowerCase().includes(termo) || m.descricao.toLowerCase().includes(termo)
    );
  }, [modulos, buscaLoja]);

  const temApenasCore =
    modulos.filter((m) => m.status === 'ativo' || m.status === 'trial' || m.status === 'cancelado')
      .length === 0;

  // Handlers
  const handleAdquirir = (m: Modulo) => {
    setModuloSelecionado(m);
    setModalAdquirirOpen(true);
  };

  const handleCancelar = (m: Modulo) => {
    setModuloSelecionado(m);
    setModalCancelarOpen(true);
  };

  const handleDetalhes = (m: Modulo) => {
    setModuloSelecionado(m);
    setModalDetalhesOpen(true);
  };

  const handleUsar = (m: Modulo) => {
    navigate(getRotaModulo(m.codigo));
  };

  const confirmarAdquirir = () => {
    if (!moduloSelecionado) return;
    iniciarTrial(moduloSelecionado.codigo);
    toast.success(`${moduloSelecionado.nome} adquirido! Aproveite seus 14 dias de trial.`);
    setModalAdquirirOpen(false);
    setActiveTab('meus');
  };

  const confirmarCancelar = () => {
    if (!moduloSelecionado) return;
    cancelarModulo(moduloSelecionado.codigo);
    toast.info(
      `${moduloSelecionado.nome} será cancelado no fim do ciclo atual (${moduloSelecionado.dataRenovacao || '—'}).`
    );
    setModalCancelarOpen(false);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Módulos</h1>
          <p className="text-muted-foreground">Você tem {qtdAtivos} módulos ativos</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Sua fatura atual</p>
            <p className="text-lg font-semibold">R$ {faturaAtual}/mês</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Ver faturas
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="meus">Meus Módulos</TabsTrigger>
          <TabsTrigger value="loja">Loja de Módulos</TabsTrigger>
          <TabsTrigger value="plano">Meu Plano</TabsTrigger>
        </TabsList>

        {/* Tab Meus Módulos */}
        <TabsContent value="meus" className="space-y-4">
          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2">
            {(['todos', 'ativos', 'trial', 'cancelados'] as const).map((f) => (
              <Button
                key={f}
                variant={filtroMeus === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroMeus(f)}
              >
                {f === 'todos' && 'Todos'}
                {f === 'ativos' && 'Ativos'}
                {f === 'trial' && 'Em trial'}
                {f === 'cancelados' && 'Cancelados'}
              </Button>
            ))}
          </div>

          {temApenasCore && filtroMeus !== 'cancelados' && (
            <EmptyStateMeusModulos onExplorar={() => setActiveTab('loja')} />
          )}

          {!temApenasCore && modulosMeus.length === 0 && (
            <EmptyStateBusca onLimpar={() => setFiltroMeus('todos')} />
          )}

          {!temApenasCore && modulosMeus.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modulosMeus.map((m) => (
                <ModuloCard
                  key={m.id}
                  modulo={m}
                  onCancelar={handleCancelar}
                  onDetalhes={handleDetalhes}
                  onUsar={handleUsar}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Loja de Módulos */}
        <TabsContent value="loja" className="space-y-6">
          {/* Banner planos */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PLANOS_COMPARATIVO.map((plano) => (
              <Card
                key={plano.nome}
                className={cn(
                  'relative',
                  ASSINATURA_MOCK.plano === plano.nome && 'border-primary'
                )}
              >
                {ASSINATURA_MOCK.plano === plano.nome && (
                  <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                    Plano atual
                  </Badge>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plano.nome}</CardTitle>
                  <CardDescription>
                    {plano.preco === 0 ? 'Gratuito' : `R$ ${plano.preco}/mês`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    {plano.modulos === 'Todos os módulos'
                      ? 'Acesso a todos os módulos disponíveis'
                      : `${plano.modulos.length} módulos inclusos`}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={ASSINATURA_MOCK.plano === plano.nome}
                  >
                    {ASSINATURA_MOCK.plano === plano.nome ? 'Seu plano atual' : 'Ver detalhes'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Busca */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar módulo..."
              value={buscaLoja}
              onChange={(e) => setBuscaLoja(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {buscaLoja && (
              <Button variant="ghost" size="sm" onClick={() => setBuscaLoja('')}>
                Limpar
              </Button>
            )}
          </div>

          {/* Grid loja */}
          {modulosLoja.length === 0 ? (
            modulos.every((m) => m.status !== 'nao_adquirido') ? (
              <EmptyStateLojaCompleta onVerMeus={() => setActiveTab('meus')} />
            ) : (
              <EmptyStateBusca onLimpar={() => setBuscaLoja('')} />
            )
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modulosLoja.map((m) => (
                <ModuloCard
                  key={m.id}
                  modulo={m}
                  onAdquirir={handleAdquirir}
                  onDetalhes={handleDetalhes}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Meu Plano */}
        <TabsContent value="plano" className="space-y-6">
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Plano {ASSINATURA_MOCK.plano}</CardTitle>
                  <CardDescription>Seu plano atual com todos os benefícios</CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground">Plano atual</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor mensal do plano</p>
                  <p className="text-2xl font-bold">R$ {ASSINATURA_MOCK.precoBase}/mês</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Próxima cobrança</p>
                  <p className="font-medium">15/05/2026</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Fazer upgrade</Button>
                <Button variant="ghost">Falar com suporte</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparar planos</CardTitle>
              <CardDescription>Veja o que cada plano oferece</CardDescription>
            </CardHeader>
            <CardContent>
              <ComparadorPlanos planoAtual={ASSINATURA_MOCK.plano} modulos={modulos} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modais */}
      <ModalAdquirirModulo
        modulo={moduloSelecionado}
        open={modalAdquirirOpen}
        onOpenChange={setModalAdquirirOpen}
        onConfirm={confirmarAdquirir}
      />
      <ModalCancelarModulo
        modulo={moduloSelecionado}
        open={modalCancelarOpen}
        onOpenChange={setModalCancelarOpen}
        onConfirm={confirmarCancelar}
      />
      <ModalDetalhesModulo
        modulo={moduloSelecionado}
        open={modalDetalhesOpen}
        onOpenChange={setModalDetalhesOpen}
        onAdquirir={handleAdquirir}
        onUsar={handleUsar}
      />
    </div>
  );
}

export default MeusModulosPage;
