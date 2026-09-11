import React from 'react';
import { 
  Table2, 
  LayoutGrid, 
  Gauge, 
  ArrowLeftRight, 
  Sparkles, 
  BookOpen, 
  Share2, 
  ShieldCheck,
  Search,
  Filter,
  Cpu,
  Briefcase,
  ShoppingBag,
  Layers,
  Upload,
  History,
  Lightbulb,
  FileCode2,
  Menu,
  Wifi,
  WifiOff,
  Activity,
  Zap,
  Award,
  Lock,
  Key,
  Smartphone,
  MessageSquare,
  Code2,
  Database,
  Bot,
  GraduationCap,
  Network
} from 'lucide-react';
import { StoreCategory, CATEGORY_DETAILS, StoreUiMode, UserProfile } from '../types';

export type TabType = 'table' | 'cards' | 'benchmarks' | 'compare' | 'quiz' | 'guide';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: StoreCategory;
  onCategoryChange: (cat: StoreCategory) => void;
  compareCount: number;
  onOpenExport: () => void;
  filteredCount: number;
  totalCount: number;
  uiMode: StoreUiMode;
  onSelectUiMode: (mode: StoreUiMode) => void;
  onOpenCompiler: () => void;
  onOpenPublisher: () => void;
  onOpenAccountDrawer: () => void;
  userProfile: UserProfile;
  onOpenChangelog?: () => void;
  onOpenProposals?: () => void;
  onOpenArchitectureDocs?: () => void;
  onOpenWorkspace?: () => void;
  onToggleMobileDrawer?: () => void;
  isOfflineMode?: boolean;
  onToggleOfflineMode?: () => void;
  onOpenNetworkTraffic?: () => void;
  onOpenSilentInstaller?: () => void;
  onOpenInnovationsHub?: () => void;
  onOpenWebAuthnHsm?: () => void;
  onOpenZeroKnowledgeBackup?: () => void;
  onOpenLightningDonations?: () => void;
  onOpenWebAdbPhysical?: () => void;
  onOpenFailoverTelemetry?: () => void;
  onOpenCrossDeviceSync?: () => void;
  onOpenSocialChat?: () => void;
  onOpenCollabStudio?: () => void;
  onOpenRepoSync?: () => void;
  onOpenAgentOrchestrator?: () => void;
  onOpenAgentAcademy?: () => void;
  onOpenBlueprint?: () => void;
  onOpenAgentAPIExplorer?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenCiCdEvidence?: () => void;
  onOpenAndroidInstall?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  compareCount,
  onOpenExport,
  filteredCount,
  totalCount,
  uiMode,
  onSelectUiMode,
  onOpenCompiler,
  onOpenPublisher,
  onOpenAccountDrawer,
  userProfile,
  onOpenChangelog,
  onOpenProposals,
  onOpenArchitectureDocs,
  onOpenWorkspace,
  onToggleMobileDrawer,
  isOfflineMode = false,
  onToggleOfflineMode,
  onOpenNetworkTraffic,
  onOpenSilentInstaller,
  onOpenInnovationsHub,
  onOpenWebAuthnHsm,
  onOpenZeroKnowledgeBackup,
  onOpenLightningDonations,
  onOpenWebAdbPhysical,
  onOpenFailoverTelemetry,
  onOpenCrossDeviceSync,
  onOpenSocialChat,
  onOpenCollabStudio,
  onOpenRepoSync,
  onOpenAgentOrchestrator,
  onOpenAgentAcademy,
  onOpenBlueprint,
  onOpenAgentAPIExplorer,
  onOpenAdminPanel,
  onOpenCiCdEvidence,
  onOpenAndroidInstall
}) => {
  const tabs = [
    { id: 'table' as TabType, label: 'Matriz Técnica', icon: Table2 },
    { id: 'cards' as TabType, label: 'Fichas de Tiendas', icon: LayoutGrid },
    { id: 'benchmarks' as TabType, label: 'Benchmarks RAM & Sync', icon: Gauge },
    { id: 'compare' as TabType, label: `Comparador (${compareCount})`, icon: ArrowLeftRight },
    { id: 'quiz' as TabType, label: 'Asistente IA / Match', icon: Sparkles },
    { id: 'guide' as TabType, label: 'Guía de Arquitectura', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-3">
            {onToggleMobileDrawer && (
              <button
                onClick={onToggleMobileDrawer}
                className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Abrir menú lateral"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg shadow-inner">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-50 font-sans">
                  Civer App Store
                </h1>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-600/40 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                  Ecosistema FOSS 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Tienda de Software Libre, Compilador CI, Shizuku y Workspace Colaborativo
              </p>
            </div>
          </div>

          {/* Quick mobile account trigger */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={onOpenAccountDrawer}
              className="w-7 h-7 rounded-full bg-emerald-600 font-bold text-xs text-white flex items-center justify-center"
            >
              {userProfile.avatarLetter}
            </button>
          </div>
        </div>

        {/* Global actions & UI Switcher */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Mode Switcher Pill */}
          <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-xl flex items-center gap-0.5 text-xs">
            <button
              onClick={() => onSelectUiMode('ciber_store')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                uiMode === 'ciber_store' || uiMode === 'play_store'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Civer App Store"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Civer App Store</span>
            </button>

            <button
              onClick={() => onSelectUiMode('civer_work_hub')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                uiMode === 'civer_work_hub'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Civer Work Hub: Tu trabajo en línea que sí paga (Testeo Remunerado, Vibe Coding, Shark Tank)"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Trabajo &amp; Ganancias</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold hidden lg:inline">$$$</span>
            </button>

            <button
              onClick={() => onSelectUiMode('php_hydrology')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                uiMode === 'php_hydrology'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-indigo-300'
              }`}
              title="Ríos & Lagunas: PHP 8.2 + WordPress Headless (Elementor & WooCommerce Clones)"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Ríos &amp; Lagunas</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 font-bold hidden lg:inline">PHP/WP</span>
            </button>

            <button
              onClick={() => onSelectUiMode('dev_workspace')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                uiMode === 'dev_workspace'
                  ? 'bg-purple-950 text-purple-300 border border-purple-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ciber Dev Workspace (Obsidian • Jira • Slack)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Workspace</span>
            </button>

            <button
              onClick={() => onSelectUiMode('matrix_pro')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                uiMode === 'matrix_pro'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Matriz Técnica Pro"
            >
              <Table2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Matrix Pro</span>
            </button>

            <button
              onClick={() => {
                if (onOpenAdminPanel) {
                  onOpenAdminPanel();
                } else {
                  onSelectUiMode('admin_catalog_matrix');
                }
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                uiMode === 'admin_catalog_matrix'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Panel de Administración Maestro (Base de Datos, Scraping y Compilaciones)"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Panel Admin</span>
            </button>

            <button
              onClick={() => onSelectUiMode('android_ecosystem')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                uiMode === 'android_ecosystem'
                  ? 'bg-sky-950 text-sky-300 border border-sky-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ecosistema Android: WebAPK, APKs, Flota & Instalación Remota"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">App Android</span>
            </button>

            <button
              onClick={() => onSelectUiMode('connected_devices')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                uiMode === 'connected_devices'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mis Dispositivos & ADB Enlace Directo Samsung Galaxy A06"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Mis Dispositivos</span>
            </button>
          </div>

          {/* Offline / Online Connection Detector Indicator */}
          <button
            onClick={onToggleOfflineMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm ${
              isOfflineMode
                ? 'bg-amber-950/80 text-amber-300 border-amber-600/70 hover:bg-amber-900/80 animate-pulse'
                : 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-800'
            }`}
            title={isOfflineMode ? "Modo Offline Activo (APKs y Docs en Caché) - Clic para reconectar" : "Conexión Activa - Clic para simular modo offline"}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Caché Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">En Línea</span>
              </>
            )}
          </button>

          {/* 1-Click Silent Native Installer Button */}
          {onOpenSilentInstaller && (
            <button
              onClick={onOpenSilentInstaller}
              className="flex items-center space-x-1.5 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Instalador 1-Click Silencioso de Fábrica (Sin Confirmaciones ni Orígenes Desconocidos)"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              <span className="hidden xl:inline">Instalador 1-Click</span>
            </button>
          )}

          {/* 60 Innovations Hub Button */}
          {onOpenInnovationsHub && (
            <button
              onClick={onOpenInnovationsHub}
              className="flex items-center space-x-1.5 bg-purple-950/80 hover:bg-purple-900/80 text-purple-300 border border-purple-700/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Suite de 60 Innovaciones Mundiales (Cosign, NixOS, Nostr, P2P, OLED, IA On-Device, Tor, Forense DEX, MicroG, Web3)"
            >
              <Award className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden xl:inline">60 Innovaciones</span>
            </button>
          )}

          {/* Real-time Network Traffic Monitor Trigger */}
          {onOpenNetworkTraffic && (
            <button
              onClick={onOpenNetworkTraffic}
              className="flex items-center space-x-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Monitor de Tráfico de Red y Sinkhole de Rastreadores"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Tráfico Red</span>
            </button>
          )}

          {/* Changelog & Governance Button */}
          {onOpenChangelog && (
            <button
              onClick={onOpenChangelog}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-800/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Registro de Cambios del Sistema"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Changelog</span>
            </button>
          )}

          {/* Proposals Button */}
          {onOpenProposals && (
            <button
              onClick={onOpenProposals}
              className="flex items-center space-x-1.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Hub de Propuestas y Mejoras"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Propuestas</span>
            </button>
          )}

          {/* Lightning Micro-Mecenazgo WebLN */}
          {onOpenLightningDonations && (
            <button
              onClick={onOpenLightningDonations}
              className="flex items-center space-x-1.5 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Micro-Mecenazgo Bitcoin Lightning (WebLN)"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="hidden md:inline">Mecenazgo</span>
            </button>
          )}

          {/* Hardware HSM FIDO2 */}
          {onOpenWebAuthnHsm && (
            <button
              onClick={onOpenWebAuthnHsm}
              className="flex items-center space-x-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Firma Criptográfica Hardware FIDO2 / YubiKey HSM"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Firma HSM</span>
            </button>
          )}

          {/* Zero-Knowledge E2EE Backup */}
          {onOpenZeroKnowledgeBackup && (
            <button
              onClick={onOpenZeroKnowledgeBackup}
              className="flex items-center space-x-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Respaldo Cifrado Zero-Knowledge (E2EE)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Respaldo E2EE</span>
            </button>
          )}

          {/* Failover Engine & Deep Telemetry Logs */}
          {onOpenFailoverTelemetry && (
            <button
              onClick={onOpenFailoverTelemetry}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-600/50 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
              title="Centro de Failover, Anti-Loop Guard & Telemetría Profunda"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Failover & Logs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline" />
            </button>
          )}

          {/* Sincronización Multi-Dispositivo (Play Store / App Store Fleet Sync) */}
          {onOpenCrossDeviceSync && (
            <button
              onClick={onOpenCrossDeviceSync}
              className="flex items-center space-x-1.5 bg-teal-950/70 hover:bg-teal-900/80 text-teal-300 border border-teal-700/70 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
              title="Sincronización Multi-Dispositivo: Mis dispositivos vinculados & Instalación remota"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">Mis Dispositivos</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse hidden md:inline" />
            </button>
          )}

          {/* Comunidad & Chat Social FOSS */}
          {onOpenSocialChat && (
            <button
              onClick={onOpenSocialChat}
              className="flex items-center space-x-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/70 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
              title="Comunidad & Chat Social: Habla con contactos y comparte aplicaciones"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Chat FOSS</span>
            </button>
          )}

          {/* Estudio Colaborativo Git (Google Docs Style) */}
          {onOpenCollabStudio && (
            <button
              onClick={onOpenCollabStudio}
              className="flex items-center space-x-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/70 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
              title="Estudio Colaborativo: Desarrollo en tiempo real & Versionado Git"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Estudio Colab</span>
            </button>
          )}

          {/* Repo Sync, Heuristics & CI Queue Hub */}
          {onOpenRepoSync && (
            <button
              onClick={onOpenRepoSync}
              className="flex items-center space-x-1.5 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/70 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
              title="Sincronización F-Droid V2, Health Score Heurístico, Cola Persistente de CI y API Specs"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Repo Sync & CI</span>
            </button>
          )}

          {/* Agent Orchestrator Hub */}
          {onOpenAgentOrchestrator && (
            <button
              onClick={onOpenAgentOrchestrator}
              className="flex items-center space-x-1.5 bg-purple-950/80 hover:bg-purple-900/80 text-purple-300 border border-purple-700/70 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
              title="Agent Orchestrator Hub: Monitoreo y control centralizado de agentes y conexiones MCP"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Agent Hub</span>
            </button>
          )}

          {/* Agent API Explorer (Swagger / gRPC Playground) */}
          {onOpenAgentAPIExplorer && (
            <button
              onClick={onOpenAgentAPIExplorer}
              className="flex items-center space-x-1.5 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/70 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
              title="Agent API Explorer: Swagger OpenAPI 3.1, gRPC-web y MCP Interactive Console"
            >
              <Network className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">API Explorer</span>
            </button>
          )}

          {/* Architecture Blueprint (D3) */}
          {onOpenBlueprint && (
            <button
              onClick={onOpenBlueprint}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-800/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Grafo Dinámico de Arquitectura D3.js"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xl:inline">Grafo D3</span>
            </button>
          )}

          {/* Direct Button to Mis Dispositivos & App Nativa Android */}
          <button
            onClick={() => onSelectUiMode('connected_devices')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition border ${
              uiMode === 'connected_devices'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/50'
                : 'bg-emerald-700/80 hover:bg-emerald-600 text-white border-emerald-500/40 shadow-emerald-950/30'
            }`}
            title="Sección Exclusiva: Mis Dispositivos & App Nativa Android"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">Instalar en Android</span>
            <span className="sm:hidden">App Móvil</span>
          </button>

          {/* Mega-Matriz de Evidencias CI/CD Button */}
          {onOpenCiCdEvidence && (
            <button
              onClick={onOpenCiCdEvidence}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              title="Ver Mega-Matriz de Certificación y Evidencias CI/CD en Vivo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Evidencias CI/CD</span>
            </button>
          )}

          {/* GitHub Actions Compiler Button */}
          <button
            onClick={onOpenCompiler}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-sky-950/40 transition"
            title="Abrir Compilador GitHub Actions"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compilador CI</span>
          </button>

          {/* Publisher */}
          <button
            onClick={onOpenPublisher}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
            title="Publicar App"
          >
            <Upload className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden md:inline">Publicar</span>
          </button>

          {/* User Account / Settings Button */}
          <button
            onClick={onOpenAccountDrawer}
            className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-400 text-white font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-emerald-400 transition shadow-md"
            title="Configuración y Cuenta"
          >
            {userProfile.avatarLetter}
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar for Matrix Mode */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 pt-1">
          {/* Tabs */}
          <nav className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search & Category Filter (Visible for table and cards) */}
          {(currentTab === 'table' || currentTab === 'cards') && (
            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por nombre, stack, UI..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value as StoreCategory)}
                  className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none pr-7 cursor-pointer"
                >
                  <option value="ALL">Todas las categorías</option>
                  <option value="FDROID_CLIENT">Clientes F-Droid</option>
                  <option value="PLAY_STORE_CLIENT">Clientes Play Store</option>
                  <option value="DIRECT_GIT_TRACKER">Actualizadores Git</option>
                  <option value="HARDENED_SECURITY">Alta Seguridad</option>
                  <option value="ALL_IN_ONE_MANAGER">Gestores de Paquetes</option>
                </select>
                <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={onOpenExport}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg text-xs transition"
                title="Exportar Markdown"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
