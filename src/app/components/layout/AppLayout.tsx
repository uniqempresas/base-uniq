import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  DollarSign,
  Settings,
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Sparkles,
  Truck,
  TrendingUp,
  Scissors,
  MessageCircle,
  Store,
  LayoutGrid,
  Building2,
  Search,
  Keyboard,
  ChevronDown,
  Box,
  UserRound,
  Briefcase,
  ChevronsLeft,
  ChevronsRight,
  Fingerprint,
  BarChart3,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { useModulosAtivos } from "../../hooks/useModulosAtivos";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../ui/utils";

interface NavRailItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  moduloCodigo: string;
}

interface SubNavItem {
  id: string;
  label: string;
  path?: string;
  icon?: LucideIcon;
  children?: SubNavItem[];
}

interface SubNavSection {
  railId: string;
  title: string;
  subtitle: string;
  items: SubNavItem[];
}

const RAIL_ITEMS: NavRailItem[] = [
  { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard, path: "/dashboard", moduloCodigo: "dashboard" },
  { id: "minha-empresa", label: "Minha Empresa", icon: Fingerprint, path: "/configuracoes/empresa", moduloCodigo: "minha_empresa" },
  { id: "vendas", label: "Vendas \u0026 PDV", icon: ShoppingCart, path: "/vendas", moduloCodigo: "vendas" },
  { id: "crm", label: "CRM", icon: Users, path: "/crm/dashboard", moduloCodigo: "crm" },
  { id: "loja", label: "Marketplace", icon: Store, path: "/marketplace", moduloCodigo: "loja_virtual" },
  { id: "financeiro", label: "Financeiro", icon: DollarSign, path: "/financeiro", moduloCodigo: "financeiro" },
  { id: "agenda", label: "Agenda", icon: Calendar, path: "/agenda", moduloCodigo: "agenda" },
  { id: "metricas", label: "Métricas", icon: BarChart3, path: "/metricas", moduloCodigo: "metricas" },
  { id: "mel", label: "MEL", icon: Sparkles, path: "/mel", moduloCodigo: "mel" },
  { id: "chatbot", label: "Chatbot", icon: MessageCircle, path: "/chatbot", moduloCodigo: "chatbot" },
  { id: "modulos", label: "Módulos", icon: LayoutGrid, path: "/meus-modulos", moduloCodigo: "meus-modulos" },
  { id: "configuracoes", label: "Configurações", icon: Settings, path: "/configuracoes/empresa", moduloCodigo: "configuracoes" },
];

const SUBNAV_SECTIONS: SubNavSection[] = [
  {
    railId: "minha-empresa",
    title: "Minha Empresa",
    subtitle: "Visão Geral",
    items: [
      { id: "visao-geral", label: "Visão Geral", path: "/dashboard", icon: LayoutDashboard },
      {
        id: "cadastros",
        label: "Cadastros",
        icon: Briefcase,
        children: [
          { id: "produtos", label: "Produtos", path: "/estoque/produtos", icon: Box },
          { id: "servicos", label: "Serviços", path: "/servicos", icon: Scissors },
          { id: "clientes", label: "Clientes", path: "/crm/clientes", icon: UserRound },
          { id: "fornecedores", label: "Fornecedores", path: "/fornecedores", icon: Truck },
          { id: "colaboradores", label: "Colaboradores", path: "/configuracoes/colaboradores", icon: Users },
        ],
      },
    ],
  },
  {
    railId: "vendas",
    title: "Vendas \u0026 PDV",
    subtitle: "Gestão de vendas",
    items: [
      { id: "v-visao-geral", label: "Visão Geral", path: "/vendas/relatorios", icon: LayoutDashboard },
      { id: "v-pedidos", label: "Pedidos", path: "/vendas/pedidos", icon: ShoppingCart },
      { id: "v-cupons", label: "Cupons", path: "/vendas/cupons", icon: Sparkles },
    ],
  },
  {
    railId: "crm",
    title: "CRM",
    subtitle: "Gestão de clientes",
    items: [
      { id: "c-dashboard", label: "Dashboard CRM", path: "/crm/dashboard", icon: LayoutDashboard },
      { id: "c-clientes", label: "Clientes", path: "/crm/clientes", icon: Users },
      { id: "c-pipeline", label: "Pipeline", path: "/crm/pipeline", icon: TrendingUp },
    ],
  },
  {
    railId: "financeiro",
    title: "Financeiro",
    subtitle: "Controle financeiro",
    items: [
      { id: "f-visao", label: "Visão Geral", path: "/financeiro", icon: LayoutDashboard },
      { id: "f-fluxo", label: "Fluxo de Caixa", path: "/financeiro/fluxo-de-caixa", icon: DollarSign },
      { id: "f-contas", label: "Contas a Pagar", path: "/financeiro/contas-pagar", icon: Calendar },
      { id: "f-contas-receber", label: "Contas a Receber", path: "/financeiro/contas-receber", icon: Calendar },
      { id: "f-dre", label: "DRE", path: "/financeiro/dre", icon: BarChart3 },
    ],
  },
  {
    railId: "loja",
    title: "Marketplace",
    subtitle: "Gestão de venda em múltiplos canais",
    items: [
      { id: "mk-dashboard", label: "Lojistas", path: "/marketplace", icon: Store },
      { id: "mk-pedidos", label: "Pedidos do vendedor", path: "/marketplace/vendedor/pedidos", icon: ShoppingCart },
      { id: "mk-dashboard-vendedor", label: "Dashboard do vendedor", path: "/marketplace/vendedor", icon: LayoutDashboard },
    ],
  },
  {
    railId: "agenda",
    title: "Agenda",
    subtitle: "Compromissos e horários",
    items: [
      { id: "a-dashboard", label: "Agenda", path: "/agenda", icon: Calendar },
      { id: "a-novo", label: "Novo agendamento", path: "/agenda/novo", icon: Calendar },
      { id: "a-compromissos", label: "Compromissos", path: "/agenda/compromissos", icon: CheckCircle },
    ],
  },
  {
    railId: "metricas",
    title: "Métricas",
    subtitle: "Indicadores do negócio",
    items: [
      { id: "mt-dashboard", label: "Visão geral", path: "/metricas/dashboard", icon: BarChart3 },
      { id: "mt-vendas", label: "Vendas", path: "/metricas/vendas", icon: TrendingUp },
      { id: "mt-financeiro", label: "Financeiro", path: "/metricas/financeiro", icon: DollarSign },
      { id: "mt-clientes", label: "Clientes", path: "/metricas/clientes", icon: Users },
      { id: "mt-produtos", label: "Produtos", path: "/metricas/produtos", icon: Package },
    ],
  },
  {
    railId: "mel",
    title: "MEL",
    subtitle: "Consultora virtual",
    items: [
      {
        id: "mel-conversas",
        label: "Conversas",
        icon: MessageCircle,
        children: [
          { id: "mel-conversa-vendas", label: "Vendas e caixa · 01", path: "/mel/conversa/11111111-1111-4111-8111-111111111111", icon: DollarSign },
          { id: "mel-conversa-clientes", label: "Clientes e relacionamento · 02", path: "/mel/conversa/22222222-2222-4222-8222-222222222222", icon: Users },
        ],
      },
      { id: "mel-configuracoes", label: "Configurações", path: "/mel/configuracoes", icon: Settings },
    ],
  },
  {
    railId: "chatbot",
    title: "Chatbot",
    subtitle: "Atendimento automatizado",
    items: [
      { id: "cb-conversas", label: "Conversas", path: "/chatbot", icon: MessageCircle },
      { id: "cb-configuracoes", label: "Configurações", path: "/chatbot/configuracoes", icon: Settings },
      { id: "cb-respostas", label: "Respostas automáticas", path: "/chatbot/respostas", icon: Sparkles },
      { id: "cb-faq", label: "FAQ", path: "/chatbot/faq", icon: CheckCircle },
      { id: "cb-estatisticas", label: "Estatísticas", path: "/chatbot/estatisticas", icon: BarChart3 },
    ],
  },
  {
    railId: "modulos",
    title: "Módulos",
    subtitle: "Gerencie seus módulos",
    items: [
      { id: "m-meus", label: "Meus Módulos", path: "/meus-modulos", icon: LayoutGrid },
      { id: "m-marketplace", label: "Marketplace", path: "/marketplace", icon: Store },
    ],
  },
  {
    railId: "configuracoes",
    title: "Configurações",
    subtitle: "Ajustes do sistema",
    items: [
      { id: "cfg-empresa", label: "Empresa", path: "/configuracoes/empresa", icon: Building2 },
      { id: "cfg-usuarios", label: "Usuários", path: "/configuracoes/colaboradores", icon: Users },
      { id: "cfg-integracoes", label: "Conta e integrações", path: "/configuracoes/conta", icon: Sparkles },
    ],
  },
];

const CORE_MODULES = new Set(["dashboard", "configuracoes", "meus-modulos", "minha_empresa", "mel"]);

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>("cadastros");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("uniq:sidebar-expanded");
      return stored === null ? true : stored === "true";
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("uniq:sidebar-expanded", String(isSidebarExpanded));
  }, [isSidebarExpanded]);

  const { modulos: modulosAtivos } = useModulosAtivos();
  const currentPath = location.pathname;

  // Determina qual rail está ativo com base na rota atual
  const activeRailId = useMemo(() => {
    // Ordena por comprimento de path descendente para match mais específico primeiro
    const sorted = [...RAIL_ITEMS].sort((a, b) => b.path.length - a.path.length);
    const matched = sorted.find((item) => currentPath.startsWith(item.path));
    if (matched) return matched.id;
    if (currentPath.startsWith("/configuracoes")) return "configuracoes";
    if (["/estoque", "/servicos", "/fornecedores"].some((path) => currentPath.startsWith(path))) {
      return "minha-empresa";
    }
    if (currentPath.startsWith("/chatbot")) return "chatbot";
    return "dashboard";
  }, [currentPath]);

  const activeSubnav = useMemo(() => {
    return SUBNAV_SECTIONS.find((s) => s.railId === activeRailId) || SUBNAV_SECTIONS[0];
  }, [activeRailId]);

  const visibleRailItems = useMemo(() => {
    return RAIL_ITEMS.filter((item) => {
      if (CORE_MODULES.has(item.moduloCodigo)) return true;
      const modulo = modulosAtivos.find((m) => m.codigo === item.moduloCodigo);
      return modulo && (modulo.status === "core" || modulo.status === "ativo" || modulo.status === "trial");
    });
  }, [modulosAtivos]);

  const [expandedMobileModule, setExpandedMobileModule] = useState<string | null>(null);
  const [expandedMobileSubmenu, setExpandedMobileSubmenu] = useState<string | null>("cadastros");

  // Fecha drawer ao pressionar ESC ou clicar fora
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth/login");
  };

  // Redireciona para login se não estiver autenticado
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#efefef]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#86cb92] flex items-center justify-center animate-pulse">
            <span className="text-[#1f2937] font-bold text-lg">U</span>
          </div>
          <p className="text-[#627271] text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const toggleSubmenu = (id: string) => {
    setExpandedSubmenu((prev) => (prev === id ? null : id));
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  const isItemActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  const toggleMobileModule = (moduleId: string) => {
    setExpandedMobileModule((prev) => (prev === moduleId ? null : moduleId));
  };

  const toggleMobileSubmenu = (submenuId: string) => {
    setExpandedMobileSubmenu((prev) => (prev === submenuId ? null : submenuId));
  };

  const getSubnavForModule = (moduleId: string): SubNavSection | undefined => {
    return SUBNAV_SECTIONS.find((s) => s.railId === moduleId);
  };

  const hasSubmenu = (moduleId: string): boolean => {
    return !!getSubnavForModule(moduleId);
  };

  return (
    <div className="flex h-screen bg-[#efefef]">
      {/* Desktop Double Sidebar */}
      <aside className="hidden lg:flex h-full shrink-0">
        {/* Dark rail - controlled by toggle */}
        <div
          className={cn(
            "bg-[#1F2937] flex flex-col py-4 border-r border-[#627271]/40 transition-all duration-300 ease-in-out overflow-hidden",
            isSidebarExpanded ? "w-[200px]" : "w-[72px] items-center"
          )}
        >
          {/* Logo */}
          <button
            onClick={() => handleNavigation("/dashboard")}
            className={cn(
              "shrink-0 mb-4 transition-all",
              isSidebarExpanded
                ? "flex items-center gap-3 px-4 w-full"
                : "w-10 h-10 rounded-xl bg-[#86cb92] flex items-center justify-center mx-auto shadow-sm"
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-[#86cb92] flex items-center justify-center shadow-sm shrink-0">
              <span className="text-[#1f2937] font-bold text-lg">U</span>
            </div>
            {isSidebarExpanded && (
              <div className="flex flex-col items-start leading-tight">
                <span className="text-white font-bold text-sm">UNIQ</span>
                <span className="text-[#efefef] text-[10px]">Sistema de Gestão</span>
              </div>
            )}
          </button>

          {/* Rail nav */}
          <nav
            className={cn(
              "flex-1 w-full flex flex-col gap-1 overflow-y-auto",
              isSidebarExpanded ? "px-3" : "items-center px-2"
            )}
          >
            {visibleRailItems
              .filter((item) => item.id !== "modulos" && item.id !== "configuracoes")
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeRailId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    title={item.label}
                    className={cn(
                      "flex items-center gap-3 rounded-xl transition-all shrink-0",
                      isSidebarExpanded ? "w-full px-3 py-2.5" : "w-11 h-11 justify-center",
                      isActive
                        ? "bg-[#86cb92]/20 text-[#86cb92] border border-[#86cb92]/30"
                        : "text-[#efefef] hover:bg-[#627271]/40 hover:text-[#efefef]"
                    )}
                  >
                    <Icon size={20} className={cn("shrink-0", isActive && "text-[#86cb92]")} />
                    {isSidebarExpanded && (
                      <span className={cn("text-sm truncate", isActive ? "text-[#86cb92] font-normal" : "font-normal")}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>

          {/* Bottom rail actions */}
          <div
            className={cn(
              "w-full flex flex-col gap-1 pb-2 mt-auto shrink-0",
              isSidebarExpanded ? "px-3" : "items-center px-2"
            )}
          >
            <button
              onClick={() => handleNavigation("/meus-modulos")}
              title="Meus Módulos"
              className={cn(
                "flex items-center gap-3 rounded-xl transition-all shrink-0",
                isSidebarExpanded ? "w-full px-3 py-2.5" : "w-11 h-11 justify-center",
                activeRailId === "modulos"
                  ? "bg-[#86cb92]/20 text-[#86cb92] border border-[#86cb92]/30"
                  : "text-[#efefef] hover:bg-[#627271]/40 hover:text-[#efefef]"
              )}
            >
              <LayoutGrid size={20} className={cn("shrink-0", activeRailId === "modulos" && "text-[#86cb92]")} />
              {isSidebarExpanded && <span className={cn("text-sm truncate", activeRailId === "modulos" ? "text-[#86cb92] font-normal" : "font-normal")}>Meus Módulos</span>}
            </button>
            <button
              onClick={() => handleNavigation("/configuracoes/empresa")}
              title="Configurações"
              className={cn(
                "flex items-center gap-3 rounded-xl transition-all shrink-0",
                isSidebarExpanded ? "w-full px-3 py-2.5" : "w-11 h-11 justify-center",
                activeRailId === "configuracoes"
                  ? "bg-[#86cb92]/20 text-[#86cb92] border border-[#86cb92]/30"
                  : "text-[#efefef] hover:bg-[#627271]/40 hover:text-[#efefef]"
              )}
            >
              <Settings size={20} className={cn("shrink-0", activeRailId === "configuracoes" && "text-[#86cb92]")} />
              {isSidebarExpanded && <span className={cn("text-sm truncate", activeRailId === "configuracoes" ? "text-[#86cb92] font-normal" : "font-normal")}>Configurações</span>}
            </button>
            <button
              onClick={handleLogout}
              title="Sair"
              className={cn(
                "flex items-center gap-3 rounded-xl transition-all shrink-0",
                isSidebarExpanded
                  ? "w-full px-3 py-2 text-[#efefef] hover:text-white hover:bg-[#627271]/40"
                  : "w-11 h-11 justify-center text-[#efefef] hover:bg-red-500/10 hover:text-red-400"
              )}
            >
              {isSidebarExpanded ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-[#efefef] flex items-center justify-center shrink-0">
                    <span className="text-[#1f2937] font-bold text-xs">A</span>
                  </div>
                  <span className="text-sm font-normal truncate">Sair</span>
                </>
              ) : (
                <LogOut size={20} className="shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Light submenu - always visible on desktop */}
        <div className="w-[240px] bg-white border-r border-[#efefef] flex flex-col overflow-hidden shrink-0">
          {/* Section header */}
          <div className="px-5 py-5 border-b border-[#efefef] flex items-start justify-between">
            <div>
              <h2 className="text-[#1f2937] font-semibold text-base">{activeSubnav.title}</h2>
              <p className="text-[#1f2937] text-xs font-medium mt-0.5">{activeSubnav.subtitle}</p>
            </div>
            <button
              onClick={toggleSidebar}
              title={isSidebarExpanded ? "Recolher menu" : "Expandir menu"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#627271] hover:bg-[#efefef] hover:text-[#1f2937] transition-all shrink-0"
            >
              {isSidebarExpanded ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
            </button>
          </div>

          {/* Submenu items */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            {activeSubnav.items.map((item) => {
              const Icon = item.icon;
              const itemHasChildren = item.children && item.children.length > 0;
              const isOpen = expandedSubmenu === item.id;
              const isActive = !itemHasChildren && !!item.path && isItemActive(item.path);

              return (
                <div key={item.id} className="mb-1">
                  <button
                    onClick={() => {
                      if (itemHasChildren) {
                        toggleSubmenu(item.id);
                      } else if (item.path) {
                        handleNavigation(item.path);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#efefef] text-[#1f2937]"
                        : "text-[#1f2937] hover:bg-[#efefef]"
                    }`}
                  >
                    {Icon && <Icon size={17} className={isActive ? "text-[#1f2937]" : "text-[#627271]"} />}
                    <span className="flex-1 text-left">{item.label}</span>
                    {itemHasChildren && (
                      <ChevronDown
                        size={14}
                        className={`text-[#627271] transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {itemHasChildren && isOpen && (
                    <div className="mt-1 ml-2 pl-4 border-l border-[#efefef] space-y-1">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = !!child.path && isItemActive(child.path);
                        return (
                          <button
                            key={child.id}
                            onClick={() => child.path && handleNavigation(child.path)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                              childActive
                                ? "text-[#1f2937] bg-[#efefef]/50"
                                : "text-[#627271] hover:text-[#1f2937] hover:bg-[#efefef]"
                            }`}
                          >
                            {ChildIcon && <ChildIcon size={15} className={childActive ? "text-[#1f2937]" : "text-[#627271]"} />}
                            <span className="flex-1 text-left">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Plan status footer */}
          <div className="p-4 border-t border-[#efefef]">
            <div className="bg-[#1F2937] rounded-xl p-3 text-white">
              <p className="text-[10px] text-[#efefef] uppercase tracking-wide">Status do Plano</p>
              <p className="text-sm font-semibold mt-0.5">UNIQ Pro Enterprise</p>
              <div className="mt-2 h-1.5 w-full bg-[#627271] rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-[#86cb92] rounded-full" />
              </div>
              <p className="text-[10px] text-[#efefef] mt-1">75% da cota usada</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#efefef]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#86cb92] flex items-center justify-center">
              <span className="text-[#1f2937] font-bold">U</span>
            </div>
            <h1 className="text-[#1f2937] font-bold">UNIQ</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-[#627271] hover:bg-[#efefef] rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#627271] hover:bg-[#efefef] rounded-lg"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Modern Accordion Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-[#1f2937]/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer content */}
            <div className="absolute left-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-[#1F2937] flex flex-col overflow-hidden shadow-2xl">
              {/* Header com logo e botão fechar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#627271]/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#86cb92] flex items-center justify-center shadow-sm">
                    <span className="text-[#1f2937] font-bold text-sm">U</span>
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm">UNIQ</span>
                    <span className="text-[#efefef] text-[10px] block">Sistema de Gestão</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#efefef] hover:bg-[#627271]/40 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Lista de Módulos - Accordion */}
              <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                <p className="text-[#efefef] text-[10px] uppercase tracking-wider font-medium mb-3 px-3">
                  Menu Principal
                </p>
                {visibleRailItems
                  .filter((item) => item.id !== "modulos" && item.id !== "configuracoes")
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeRailId === item.id;
                    const moduleHasSubmenu = hasSubmenu(item.id);
                    const isExpanded = expandedMobileModule === item.id;
                    const subnav = getSubnavForModule(item.id);

                    return (
                      <div key={item.id} className="mb-1">
                        <button
                          onClick={() => {
                            if (moduleHasSubmenu) {
                              toggleMobileModule(item.id);
                            } else {
                              handleNavigation(item.path);
                            }
                          }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                          isActive
                            ? "bg-[#86cb92]/20 text-[#86cb92] border border-[#86cb92]/30"
                            : "text-[#efefef] hover:bg-[#627271]/40 hover:text-[#efefef]"
                        )}
                      >
                        <Icon
                          size={20}
                          className={cn("shrink-0", isActive && "text-[#86cb92]")}
                        />
                        <span className={cn("flex-1 text-left font-normal", isActive && "text-[#86cb92]")}>
                          {item.label}
                        </span>
                        {moduleHasSubmenu && (
                          <ChevronDown
                            size={16}
                            className={cn(
                              "text-[#efefef] transition-transform duration-200 shrink-0",
                              isExpanded && "rotate-180"
                            )}
                          />
                        )}
                      </button>

                      {/* Submenu Accordion */}
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        {subnav && (
                          <div className="mt-1 ml-2 bg-[#1f2937] rounded-lg border-l-2 border-[#86cb92]/40 overflow-hidden">
                            {subnav.items.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const subHasChildren = subItem.children && subItem.children.length > 0;
                              const subIsOpen = expandedMobileSubmenu === subItem.id;
                              const subIsActive = !subHasChildren && !!subItem.path && isItemActive(subItem.path);

                              return (
                                <div key={subItem.id}>
                                  <button
                                    onClick={() => {
                                      if (subHasChildren) {
                                        toggleMobileSubmenu(subItem.id);
                                      } else if (subItem.path) {
                                        handleNavigation(subItem.path);
                                      }
                                    }}
                                    className={cn(
                                      "w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                                      subIsActive
                                        ? "text-[#86cb92] bg-[#86cb92]/10"
                                        : "text-[#efefef] hover:text-[#efefef] hover:bg-[#627271]/30"
                                    )}
                                  >
                                    {SubIcon && (
                                      <SubIcon
                                        size={15}
                                        className={cn("shrink-0", subIsActive && "text-[#86cb92]")}
                                      />
                                    )}
                                    <span className="flex-1 text-left">{subItem.label}</span>
                                    {subHasChildren && (
                                      <ChevronDown
                                        size={13}
                                        className={cn(
                                          "text-[#efefef] transition-transform duration-200 shrink-0",
                                          subIsOpen && "rotate-180"
                                        )}
                                      />
                                    )}
                                  </button>

                                  {/* Nested children */}
                                  <div
                                    className={cn(
                                      "overflow-hidden transition-all duration-300 ease-in-out",
                                      subIsOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                                    )}
                                  >
                                    {subItem.children && (
                                      <div className="bg-[#1f2937] border-l border-[#627271]/40 ml-4">
                                        {subItem.children.map((child) => {
                                          const ChildIcon = child.icon;
                                          const childActive = !!child.path && isItemActive(child.path);
                                          return (
                                            <button
                                              key={child.id}
                                              onClick={() => child.path && handleNavigation(child.path)}
                                              className={cn(
                                                "w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-colors",
                                                childActive
                                                  ? "text-[#86cb92] bg-[#86cb92]/10"
                                                  : "text-[#efefef] hover:text-[#efefef] hover:bg-[#627271]/20"
                                              )}
                                            >
                                              {ChildIcon && (
                                                <ChildIcon
                                                  size={14}
                                                  className={cn("shrink-0", childActive && "text-[#86cb92]")}
                                                />
                                              )}
                                              <span className="flex-1 text-left">{child.label}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="shrink-0 p-4 border-t border-[#627271]/40 bg-[#1F2937]">
                {/* Status do Plano */}
                <div className="bg-[#1f2937] rounded-xl p-3 mb-3 border border-[#627271]/30">
                  <p className="text-[10px] text-[#efefef] uppercase tracking-wide font-medium">Status do Plano</p>
                  <p className="text-white text-sm font-semibold mt-0.5">UNIQ Pro Enterprise</p>
                  <div className="mt-2 h-1.5 w-full bg-[#627271] rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-[#86cb92] rounded-full" />
                  </div>
                  <p className="text-[10px] text-[#efefef] mt-1">75% da cota usada</p>
                </div>

                {/* Ações finais */}
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigation("/meus-modulos")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#efefef] hover:bg-[#627271]/40 hover:text-[#efefef] transition-all"
                  >
                    <LayoutGrid size={18} />
                    <span className="flex-1 text-left font-normal">Meus Módulos</span>
                  </button>
                  <button
                    onClick={() => handleNavigation("/configuracoes/empresa")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#efefef] hover:bg-[#627271]/40 hover:text-[#efefef] transition-all"
                  >
                    <Settings size={18} />
                    <span className="flex-1 text-left font-normal">Configurações</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#efefef] hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={18} />
                    <span className="flex-1 text-left font-normal">Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-0 mt-14 lg:mt-0 overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#efefef]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#627271] min-w-[140px]">
            <span>Home</span>
            <ChevronRight size={14} />
            <span className="text-[#1f2937] font-medium capitalize">
              {currentPath.split("/")[1] || "Dashboard"}
            </span>
          </div>

          {/* Centered Search */}
          <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-xl">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
              <input
                type="text"
                readOnly
                placeholder="Buscar produtos, pedidos ou clientes..."
                className="w-full pl-10 pr-12 py-2 rounded-lg bg-[#efefef] border border-[#efefef] text-sm text-[#1f2937] placeholder:text-[#627271] focus:outline-none focus:ring-2 focus:ring-[#86cb92]/20 focus:border-[#86cb92] transition-all cursor-pointer"
                onClick={() => {
                  // Espaço reservado para futura implementação de busca global (Cmd/Ctrl+K)
                }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white border border-[#efefef] text-[10px] font-medium text-[#627271] flex items-center gap-0.5">
                <Keyboard size={10} />
                Ctrl K
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 min-w-[140px] justify-end">
            <button className="relative p-2 text-[#627271] hover:bg-[#efefef] rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#efefef] flex items-center justify-center">
                <span className="text-[#1f2937] font-bold text-sm">
                  {(user?.user_metadata?.nome_completo || user?.email || "A")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-[#1f2937] font-medium hidden xl:block truncate max-w-[120px]">
                {user?.user_metadata?.nome_completo || user?.email || "Usuário"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
