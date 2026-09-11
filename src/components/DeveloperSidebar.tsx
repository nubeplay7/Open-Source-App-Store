import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Layers, 
  Terminal, 
  Cpu, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight, 
  Kanban, 
  BookOpen, 
  MessageSquare, 
  History, 
  Lightbulb, 
  FileCode2, 
  GitBranch, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Settings,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Apple,
  Database,
  Lock,
  Key,
  BarChart3,
  FolderDown,
  Palette,
  Sliders,
  FileCode,
  GitPullRequest,
  ShieldAlert,
  Radio,
  Network,
  Play,
  Grid,
  Camera,
  TrendingUp,
  Coins,
  WifiOff,
  Usb,
  Users,
  Code2
} from 'lucide-react';
import { StoreUiMode, UserProfile } from '../types';
import { X } from 'lucide-react';

interface DeveloperSidebarProps {
  currentMode: StoreUiMode;
  onSwitchMode: (mode: StoreUiMode) => void;
  onOpenCompiler: () => void;
  onOpenShizukuInstaller: () => void;
  onOpenChangelog: () => void;
  onOpenProposals: () => void;
  onOpenArchitectureDocs: () => void;
  onOpenRepoSync: () => void;
  onOpenAccountDrawer: () => void;
  onOpenCommandPalette?: () => void;
  onOpenSecurityAudit?: () => void;
  onOpenRepoManager?: () => void;
  onOpenDiagnostics?: () => void;
  onOpenBuildsHub?: () => void;
  onOpenKeystoreVault?: () => void;
  onOpenOtaReleases?: () => void;
  onOpenDesignProfiles?: () => void;
  onOpenFunctionalityProfiles?: () => void;
  onOpenDexDecompiler?: () => void;
  onOpenGitPatch?: () => void;
  onOpenRuntimeSandbox?: () => void;
  onOpenNearbyTransfer?: () => void;
  onOpenArchitectureGraph?: () => void;
  onOpenLiveCustomizer?: () => void;
  onOpenResponsiveHUD?: () => void;
  onToggleViewportToolbar?: () => void;
  isViewportToolbarVisible?: boolean;
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
  isGridDebug?: boolean;
  onToggleGridDebug?: () => void;
  isHeatmapMode?: boolean;
  onToggleHeatmapMode?: () => void;
  isStressTestActive?: boolean;
  onToggleStressTest?: () => void;
  onOpenVisualRegression?: () => void;
  onOpenFluidityScore?: () => void;
  onOpenScreenInventory?: () => void;
  onOpenWebAuthnHsm?: () => void;
  onOpenZeroKnowledgeBackup?: () => void;
  onOpenLightningDonations?: () => void;
  onOpenWebAdbPhysical?: () => void;
  onOpenAntiFeaturesAudit?: () => void;
  onOpenWasmPlugins?: () => void;
  onOpenOfflinePwaDiagnostics?: () => void;
  onOpenFailoverTelemetry?: () => void;
  onOpenAuthModal?: () => void;
  onOpenCrossDeviceSync?: () => void;
  onOpenSocialChat?: () => void;
  onOpenCollabStudio?: () => void;
  userProfile: UserProfile;
  activeBuildCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const DeveloperSidebar: React.FC<DeveloperSidebarProps> = ({
  currentMode,
  onSwitchMode,
  onOpenCompiler,
  onOpenShizukuInstaller,
  onOpenChangelog,
  onOpenProposals,
  onOpenArchitectureDocs,
  onOpenRepoSync,
  onOpenAccountDrawer,
  onOpenCommandPalette,
  onOpenSecurityAudit,
  onOpenRepoManager,
  onOpenDiagnostics,
  onOpenBuildsHub,
  onOpenKeystoreVault,
  onOpenOtaReleases,
  onOpenDesignProfiles,
  onOpenFunctionalityProfiles,
  onOpenDexDecompiler,
  onOpenGitPatch,
  onOpenRuntimeSandbox,
  onOpenNearbyTransfer,
  onOpenArchitectureGraph,
  onOpenLiveCustomizer,
  onOpenResponsiveHUD,
  onToggleViewportToolbar,
  isViewportToolbarVisible = true,
  isSimulating = false,
  onToggleSimulation,
  isGridDebug = false,
  onToggleGridDebug,
  isHeatmapMode = false,
  onToggleHeatmapMode,
  isStressTestActive = false,
  onToggleStressTest,
  onOpenVisualRegression,
  onOpenFluidityScore,
  onOpenScreenInventory,
  onOpenWebAuthnHsm,
  onOpenZeroKnowledgeBackup,
  onOpenLightningDonations,
  onOpenWebAdbPhysical,
  onOpenAntiFeaturesAudit,
  onOpenWasmPlugins,
  onOpenOfflinePwaDiagnostics,
  onOpenFailoverTelemetry,
  onOpenAuthModal,
  onOpenCrossDeviceSync,
  onOpenSocialChat,
  onOpenCollabStudio,
  userProfile,
  activeBuildCount = 1,
  isMobileOpen = false,
  onCloseMobile
}) => {

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('ciber_sidebar_collapsed');
    return saved === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('ciber_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navModes = [
    {
      id: 'ciber_store' as StoreUiMode,
      name: 'Civer App Store',
      tag: 'Play Modern Style',
      icon: ShoppingBag,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300 shadow-sm'
    },
    {
      id: 'civer_work_hub' as StoreUiMode,
      name: 'Civer Work Hub',
      tag: 'Trabajo Online que Sí Paga',
      icon: Briefcase,
      color: 'text-amber-400',
      activeBg: 'bg-amber-950/80 border-amber-700/80 text-amber-300 shadow-sm'
    },
    {
      id: 'php_hydrology' as StoreUiMode,
      name: 'Ríos & Lagunas (PHP/WP)',
      tag: 'Headless WP • Elementor • WC',
      icon: Code2,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300 shadow-sm'
    },
    {
      id: 'dev_workspace' as StoreUiMode,
      name: 'Dev Workspace',
      tag: 'Obsidian • Jira • Slack',
      icon: Terminal,
      color: 'text-purple-400',
      activeBg: 'bg-purple-950/80 border-purple-700/80 text-purple-300 shadow-sm'
    },
    {
      id: 'matrix_pro' as StoreUiMode,
      name: 'Matrix Pro',
      tag: 'Auditoría & Benchmarks',
      icon: Layers,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-950/80 border-cyan-700/80 text-cyan-300 shadow-sm'
    },
    {
      id: 'app_store' as StoreUiMode,
      name: 'App Store FOSS',
      tag: 'Cupertino Style',
      icon: Apple,
      color: 'text-sky-400',
      activeBg: 'bg-sky-950/80 border-sky-700/80 text-sky-300 shadow-sm'
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
          />
          <div className="relative w-80 max-w-[85vw] bg-[#0b0e14] border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-slideRight overflow-y-auto">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950">
                  <Zap className="w-4 h-4 fill-current text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white">Civer App Store PRO</h1>
                  <p className="text-[10px] text-slate-400 font-mono">Herramientas & Subsistemas</p>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content for mobile drawer */}
            <div className="flex-1 p-3 space-y-4">
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                  Vistas Principales
                </div>
                {navModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = currentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        onSwitchMode(mode.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full rounded-xl p-3 text-left transition flex items-center gap-3 border ${
                        isActive
                          ? mode.activeBg
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${mode.color}`} />
                      <div className="flex-1 truncate">
                        <div className="text-xs font-bold text-white">{mode.name}</div>
                        <div className="text-[10px] text-slate-400">{mode.tag}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                  Dev Hub & Módulos
                </div>
                <button
                  onClick={() => {
                    onOpenCompiler();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                >
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Compilador CI/CD (WASM/Cloud)</span>
                </button>
                <button
                  onClick={() => {
                    onOpenShizukuInstaller();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Instalador Shizuku & Rootless</span>
                </button>
                {onOpenDexDecompiler && (
                  <button
                    onClick={() => {
                      onOpenDexDecompiler();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                  >
                    <FileCode className="w-4 h-4 text-sky-400" />
                    <span>Descompilador DEX / Smali</span>
                  </button>
                )}
                {onOpenGitPatch && (
                  <button
                    onClick={() => {
                      onOpenGitPatch();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                  >
                    <GitPullRequest className="w-4 h-4 text-pink-400" />
                    <span>Gestor de Parches Git .patch</span>
                  </button>
                )}
                {onOpenRuntimeSandbox && (
                  <button
                    onClick={() => {
                      onOpenRuntimeSandbox();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>Runtime Sandbox & Permisos</span>
                  </button>
                )}
                {onOpenNearbyTransfer && (
                  <button
                    onClick={() => {
                      onOpenNearbyTransfer();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                  >
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>Nearby Transfer P2P</span>
                  </button>
                )}
                {onOpenArchitectureGraph && (
                  <button
                    onClick={() => {
                      onOpenArchitectureGraph();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                  >
                    <Network className="w-4 h-4 text-indigo-400" />
                    <span>Grafo de Arquitectura & Audit</span>
                  </button>
                )}
                {onOpenDesignProfiles && (
                  <button
                    onClick={() => {
                      onOpenDesignProfiles();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                  >
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Diseño & Paletas de Color</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenChangelog();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full rounded-xl p-2.5 text-left text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-3"
                >
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Registro de Cambios & Fases</span>
                </button>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onOpenAccountDrawer();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900 text-left flex items-center gap-2.5 text-xs text-white"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 font-bold flex items-center justify-center">
                  {userProfile.avatarLetter}
                </div>
                <div className="truncate flex-1">
                  <div className="font-bold">{userProfile.name}</div>
                  <div className="text-[10px] text-slate-400">{userProfile.email}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#0b0e14]/95 backdrop-blur-xl border-r border-slate-800/80 z-40 transition-all duration-300 select-none shrink-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
      {/* Sidebar Header & Brand */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950">
              <Zap className="w-4 h-4 fill-current text-white" />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Civer App Store</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  v3.4
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono truncate">0 Telemetría • FOSS Suite</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950">
            <Zap className="w-4 h-4 fill-current text-white" />
          </div>
        )}

        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Navigation Views Section */}
      <div className="p-2 space-y-1 border-b border-slate-800/80">
        {!isCollapsed && (
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Vistas Principales
          </div>
        )}

        {navModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id || (mode.id === 'ciber_store' && currentMode === 'play_store');

          return (
            <button
              key={mode.id}
              onClick={() => onSwitchMode(mode.id)}
              title={isCollapsed ? `${mode.name} - ${mode.tag}` : undefined}
              className={`w-full rounded-xl transition flex items-center gap-3 p-2.5 text-left border ${
                isSelected
                  ? mode.activeBg
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-950/80' : 'bg-slate-900'} ${mode.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>

              {!isCollapsed && (
                <div className="truncate flex-1">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>{mode.name}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{mode.tag}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Engineering & System Tools Section */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Novedad Clave: Sincronización Multi-Dispositivo & Social */}
        {!isCollapsed && (
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center justify-between">
            <span>Sincronización & Red FOSS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* 0.1 Sincronización Multi-Dispositivo & App Nativa */}
        <button
          onClick={() => onSwitchMode('connected_devices')}
          title={isCollapsed ? 'Mis Dispositivos & App Nativa (Flota Conectada & Descargas)' : undefined}
          className={`w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 group border mb-1 ${
            currentMode === 'connected_devices'
              ? 'bg-teal-900/80 text-white border-teal-500 shadow-md'
              : 'bg-teal-950/40 hover:bg-teal-900/60 text-teal-300 hover:text-white border-teal-800/50 hover:border-teal-500'
          }`}
        >
          <div className="p-1.5 rounded-lg bg-teal-900/80 border border-teal-700/60 text-teal-300 shrink-0 group-hover:scale-105 transition">
            <Smartphone className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Mis Dispositivos</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-teal-900 text-teal-200 border border-teal-700">
                  Sync
                </span>
              </div>
              <p className="text-[10px] text-teal-300/80 truncate">Flota conectada & Installs remotas</p>
            </div>
          )}
        </button>

        {/* 0.2 Comunidad & Chat Social Interno */}
        {onOpenSocialChat && (
          <button
            onClick={onOpenSocialChat}
            title={isCollapsed ? 'Comunidad & Chat Social (Compartir Apps y Contactos)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-white group border border-indigo-800/50 hover:border-indigo-500 mb-1"
          >
            <div className="p-1.5 rounded-lg bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 shrink-0 group-hover:scale-105 transition">
              <MessageSquare className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Chat & Amigos FOSS</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-indigo-900 text-indigo-200 border border-indigo-700">
                    Social
                  </span>
                </div>
                <p className="text-[10px] text-indigo-300/80 truncate">Canales, DM y envío de apps</p>
              </div>
            )}
          </button>
        )}

        {/* 0.3 Estudio Colaborativo Git */}
        {onOpenCollabStudio && (
          <button
            onClick={onOpenCollabStudio}
            title={isCollapsed ? 'Estudio Colaborativo Git (Edición en Vivo Google Docs Style)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white group border border-emerald-800/50 hover:border-emerald-500 mb-1.5"
          >
            <div className="p-1.5 rounded-lg bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 shrink-0 group-hover:scale-105 transition">
              <Code2 className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Estudio Colaborativo</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-900 text-emerald-200 border border-emerald-700">
                    Docs Style
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/80 truncate">Código en vivo & Git branches</p>
              </div>
            )}
          </button>
        )}

        {!isCollapsed && (
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Herramientas Dev & CI
          </div>
        )}

        {/* 0. Command Palette (Ctrl+K) */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            title={isCollapsed ? 'Command Palette (Ctrl+K)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 bg-purple-950/30 hover:bg-purple-950/70 text-purple-300 hover:text-white group border border-purple-900/40 hover:border-purple-700/80 mb-1"
          >
            <div className="p-1.5 rounded-lg bg-purple-900/80 border border-purple-700/60 text-purple-300 shrink-0 group-hover:scale-105 transition">
              <Terminal className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Command Palette</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-900/80 text-purple-200 border border-purple-700/60">
                    Ctrl+K
                  </span>
                </div>
                <p className="text-[10px] text-purple-300/80 truncate">Terminal rápida de acciones</p>
              </div>
            )}
          </button>
        )}

        {/* 1. CI/CD Cloud Compiler */}
        <button
          onClick={onOpenCompiler}
          title={isCollapsed ? 'Compilador CI/CD (GitHub Actions)' : undefined}
          className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
        >
          <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 shrink-0 group-hover:scale-105 transition">
            <Cpu className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Compilador CI/CD</span>
                {activeBuildCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-indigo-900 text-indigo-300 font-bold animate-pulse">
                    {activeBuildCount} activo
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">GitHub Actions & APK</p>
            </div>
          )}
        </button>

        {/* 1.1 Gestor de Compilaciones & Hub de Builds */}
        {onOpenBuildsHub && (
          <button
            onClick={onOpenBuildsHub}
            title={isCollapsed ? 'Gestor de Compilaciones & Historial CI' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 shrink-0 group-hover:scale-105 transition">
              <BarChart3 className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Gestor de Builds</div>
                <p className="text-[10px] text-slate-400 truncate">Historial & Descargas APK</p>
              </div>
            )}
          </button>
        )}

        {/* 1.2 Bóveda de Llaves Keystore */}
        {onOpenKeystoreVault && (
          <button
            onClick={onOpenKeystoreVault}
            title={isCollapsed ? 'Bóveda de Llaves de Firma (Keystore Vault)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400 shrink-0 group-hover:scale-105 transition">
              <Key className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Bóveda de Llaves</div>
                <p className="text-[10px] text-slate-400 truncate">Firma Scheme v1-v4</p>
              </div>
            )}
          </button>
        )}

        {/* 1.3 Panel de Auto-Actualización Móvil OTA */}
        {onOpenOtaReleases && (
          <button
            onClick={onOpenOtaReleases}
            title={isCollapsed ? 'Panel de Auto-Actualización Móvil OTA' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0 group-hover:scale-105 transition">
              <Smartphone className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Releases Móviles OTA</div>
                <p className="text-[10px] text-slate-400 truncate">Auto-Update Continuo</p>
              </div>
            )}
          </button>
        )}
        <button
          onClick={onOpenShizukuInstaller}
          title={isCollapsed ? 'Instalador Silencioso Shizuku' : undefined}
          className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
        >
          <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0 group-hover:scale-105 transition">
            <Smartphone className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Instalador Shizuku</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">Rootless ADB Bridge</p>
            </div>
          )}
        </button>

        {/* 3. Changelog & Architecture Ledger */}
        <button
          onClick={onOpenChangelog}
          title={isCollapsed ? 'Registro de Cambios (Changelog Ledger)' : undefined}
          className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
        >
          <div className="p-1.5 rounded-lg bg-teal-950/80 border border-teal-800/60 text-teal-400 shrink-0 group-hover:scale-105 transition">
            <History className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-slate-200">Registro de Cambios</div>
              <p className="text-[10px] text-slate-400 truncate">Iteración 4 • Ledger</p>
            </div>
          )}
        </button>

        {/* 4. Ecosystem Proposals */}
        <button
          onClick={onOpenProposals}
          title={isCollapsed ? 'Propuestas de la Comunidad' : undefined}
          className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
        >
          <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400 shrink-0 group-hover:scale-105 transition">
            <Lightbulb className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-slate-200">Hub de Propuestas</div>
              <p className="text-[10px] text-slate-400 truncate">Votación y RFCs</p>
            </div>
          )}
        </button>

        {/* 5. Architecture Docs ADRs */}
        <button
          onClick={onOpenArchitectureDocs}
          title={isCollapsed ? 'Documentación y Decisiones ADR' : undefined}
          className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
        >
          <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400 shrink-0 group-hover:scale-105 transition">
            <BookOpen className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-slate-200">Documentación ADR</div>
              <p className="text-[10px] text-slate-400 truncate">Decisiones de Diseño</p>
            </div>
          )}
        </button>

        {/* 6. Git Repositories Sync */}
        <button
          onClick={onOpenRepoSync}
          title={isCollapsed ? 'Sincronizador de Repositorios' : undefined}
          className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
        >
          <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400 shrink-0 group-hover:scale-105 transition">
            <GitBranch className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-slate-200">Repositorios FOSS</div>
              <p className="text-[10px] text-slate-400 truncate">F-Droid & GitHub Sync</p>
            </div>
          )}
        </button>

        {/* 7. Security & Exodus Privacy Auditor */}
        {onOpenSecurityAudit && (
          <button
            onClick={onOpenSecurityAudit}
            title={isCollapsed ? 'Auditor de Seguridad Criptográfica & Exodus' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shrink-0 group-hover:scale-105 transition">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Auditor de Seguridad</div>
                <p className="text-[10px] text-slate-400 truncate">Exodus & Certificados</p>
              </div>
            )}
          </button>
        )}

        {/* 7.1 Failover & Deep Telemetry Center */}
        {onOpenFailoverTelemetry && (
          <button
            onClick={onOpenFailoverTelemetry}
            title={isCollapsed ? 'Centro de Resiliencia, Failover & Telemetría Profunda' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-300 hover:text-white group border border-emerald-800/50 hover:border-emerald-600"
          >
            <div className="p-1.5 rounded-lg bg-emerald-900/80 border border-emerald-600 text-emerald-300 shrink-0 group-hover:scale-105 transition">
              <Zap className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Failover & Telemetría</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-900 text-emerald-300 border border-emerald-600">
                    Anti-Loop
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/80 truncate">Circuit Breakers & Logs</p>
              </div>
            )}
          </button>
        )}

        {/* 7.2 Sistema de Login, Identidad & Sesiones */}
        {onOpenAuthModal && (
          <button
            onClick={onOpenAuthModal}
            title={isCollapsed ? 'Sistema de Login, Identidad Civer ID & Sesiones' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-indigo-300 hover:text-white bg-indigo-950/30 hover:bg-indigo-900/50 group border border-indigo-800/40 hover:border-indigo-600"
          >
            <div className="p-1.5 rounded-lg bg-indigo-900/80 border border-indigo-600/70 text-indigo-300 shrink-0 group-hover:scale-105 transition">
              <Key className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Login & Civer ID</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-indigo-900 text-indigo-300 border border-indigo-700">
                    FIDO2
                  </span>
                </div>
                <p className="text-[10px] text-indigo-300/80 truncate">GitHub CI & Bitácora Forense</p>
              </div>
            )}
          </button>
        )}

        {/* 8. Custom FOSS Repo Manager */}
        {onOpenRepoManager && (
          <button
            onClick={onOpenRepoManager}
            title={isCollapsed ? 'Gestor de Fuentes & Repos FOSS' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-sky-950/80 border border-sky-700/60 text-sky-400 shrink-0 group-hover:scale-105 transition">
              <Database className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Gestor de Fuentes</div>
                <p className="text-[10px] text-slate-400 truncate">Índices FOSS V2 & GPG</p>
              </div>
            )}
          </button>
        )}

        {/* 9. Perfiles de Diseño & Paletas */}
        {onOpenDesignProfiles && (
          <button
            onClick={onOpenDesignProfiles}
            title={isCollapsed ? 'Perfiles de Diseño & 8 Paletas' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shrink-0 group-hover:scale-105 transition">
              <Palette className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Perfiles de Diseño</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                    8 Temas
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Paletas, Bordes & Densidad</p>
              </div>
            )}
          </button>
        )}

        {/* 10. Perfiles de Funcionalidades & Feature Flags */}
        {onOpenFunctionalityProfiles && (
          <button
            onClick={onOpenFunctionalityProfiles}
            title={isCollapsed ? 'Perfiles de Funcionalidades & Feature Flags' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-400 shrink-0 group-hover:scale-105 transition">
              <Sliders className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Perfiles & Flags</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                    16 Flags
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Presets & Matriz Modular</p>
              </div>
            )}
          </button>
        )}

        {/* 11. Descompilador DEX / Smali WASM */}
        {onOpenDexDecompiler && (
          <button
            onClick={onOpenDexDecompiler}
            title={isCollapsed ? 'Descompilador DEX / Smali' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-sky-950/80 border border-sky-700/60 text-sky-400 shrink-0 group-hover:scale-105 transition">
              <FileCode className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Descompilador DEX</div>
                <p className="text-[10px] text-slate-400 truncate">Smali & AndroidManifest</p>
              </div>
            )}
          </button>
        )}

        {/* 12. Gestor de Parches Git Diff */}
        {onOpenGitPatch && (
          <button
            onClick={onOpenGitPatch}
            title={isCollapsed ? 'Gestor de Parches Git Diff' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-pink-950/80 border border-pink-700/60 text-pink-400 shrink-0 group-hover:scale-105 transition">
              <GitPullRequest className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Parches Git .patch</div>
                <p className="text-[10px] text-slate-400 truncate">Visor de Diffs Locales</p>
              </div>
            )}
          </button>
        )}

        {/* 13. Runtime Sandbox & Permisos */}
        {onOpenRuntimeSandbox && (
          <button
            onClick={onOpenRuntimeSandbox}
            title={isCollapsed ? 'Runtime Sandbox & Permisos' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shrink-0 group-hover:scale-105 transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Runtime Sandbox</div>
                <p className="text-[10px] text-slate-400 truncate">Permisos & Anti-Tampering</p>
              </div>
            )}
          </button>
        )}

        {/* 14. P2P Mesh & Nearby Share */}
        {onOpenNearbyTransfer && (
          <button
            onClick={onOpenNearbyTransfer}
            title={isCollapsed ? 'P2P Mesh & Nearby Share' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 shrink-0 group-hover:scale-105 transition">
              <Radio className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Nearby Transfer P2P</div>
                <p className="text-[10px] text-slate-400 truncate">Wi-Fi Direct & WebRTC</p>
              </div>
            )}
          </button>
        )}

        {/* 15. Grafo de Arquitectura Topológico */}
        {onOpenArchitectureGraph && (
          <button
            onClick={onOpenArchitectureGraph}
            title={isCollapsed ? 'Mapa Topológico de Arquitectura' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 shrink-0 group-hover:scale-105 transition">
              <Network className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200">Grafo de Arquitectura</div>
                <p className="text-[10px] text-slate-400 truncate">11 Nodos & Audit Trail</p>
              </div>
            )}
          </button>
        )}

        {/* 15.1. Firma Hardware FIDO2 / YubiKey HSM */}
        {onOpenWebAuthnHsm && (
          <button
            onClick={onOpenWebAuthnHsm}
            title={isCollapsed ? 'Firma Hardware FIDO2 / YubiKey HSM' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400 shrink-0 group-hover:scale-105 transition">
              <Key className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Firma Hardware HSM</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-purple-900 text-purple-200 border border-purple-700">
                    FIDO2
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">WebAuthn / YubiKey CTAP2</p>
              </div>
            )}
          </button>
        )}

        {/* 15.2. Respaldo Cifrado Zero-Knowledge E2EE */}
        {onOpenZeroKnowledgeBackup && (
          <button
            onClick={onOpenZeroKnowledgeBackup}
            title={isCollapsed ? 'Respaldo Cifrado Zero-Knowledge (E2EE)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0 group-hover:scale-105 transition">
              <Lock className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Respaldo Zero-Knowledge</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-900 text-emerald-200 border border-emerald-700">
                    E2EE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">AES-GCM 256 / PBKDF2</p>
              </div>
            )}
          </button>
        )}

        {/* 15.3. Micro-Mecenazgo Bitcoin Lightning (WebLN) */}
        {onOpenLightningDonations && (
          <button
            onClick={onOpenLightningDonations}
            title={isCollapsed ? 'Micro-Mecenazgo Bitcoin Lightning (WebLN)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-400 shrink-0 group-hover:scale-105 transition">
              <Zap className="w-4 h-4 fill-amber-400/30" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Mecenazgo Lightning</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-amber-900 text-amber-200 border border-amber-700">
                    WebLN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">BOLT11 / Donaciones Sats</p>
              </div>
            )}
          </button>
        )}

        {/* 15.4. Instalador Físico WebUSB ADB */}
        {onOpenWebAdbPhysical && (
          <button
            onClick={onOpenWebAdbPhysical}
            title={isCollapsed ? 'Instalador Físico Cable WebUSB ADB' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 shrink-0 group-hover:scale-105 transition">
              <Usb className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Instalador Cable USB</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-cyan-900 text-cyan-200 border border-cyan-700">
                    WebUSB
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">ADB Streaming por Cable</p>
              </div>
            )}
          </button>
        )}

        {/* 15.5. Auditoría Anti-Features F-Droid */}
        {onOpenAntiFeaturesAudit && (
          <button
            onClick={onOpenAntiFeaturesAudit}
            title={isCollapsed ? 'Auditoría Estricta de Anti-Features (F-Droid)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400 shrink-0 group-hover:scale-105 transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Anti-Features Audit</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-rose-900 text-rose-200 border border-rose-700">
                    F-Droid
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Rastreadores y NonFreeNet</p>
              </div>
            )}
          </button>
        )}

        {/* 15.6. Hub de Plugins WASM */}
        {onOpenWasmPlugins && (
          <button
            onClick={onOpenWasmPlugins}
            title={isCollapsed ? 'Hub de Plugins Comunitarios WASM' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 shrink-0 group-hover:scale-105 transition">
              <Cpu className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Plugins WebAssembly</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-indigo-900 text-indigo-200 border border-indigo-700">
                    WASM
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Módulos Sandbox en Memoria</p>
              </div>
            )}
          </button>
        )}

        {/* 15.7. Diagnóstico Caché PWA Offline */}
        {onOpenOfflinePwaDiagnostics && (
          <button
            onClick={onOpenOfflinePwaDiagnostics}
            title={isCollapsed ? 'Diagnósticos de Caché PWA y Almacenamiento Offline' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400 shrink-0 group-hover:scale-105 transition">
              <WifiOff className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Diagnóstico PWA Offline</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-amber-900 text-amber-200 border border-amber-700">
                    Storage
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">StorageManager & Workbox</p>
              </div>
            )}
          </button>
        )}

        {/* 16. Diseñador Visual & Editor de Dimensiones (Elementor UI) */}
        {onOpenLiveCustomizer && (
          <button
            onClick={onOpenLiveCustomizer}
            title={isCollapsed ? 'Diseñador Visual & Dimensiones (Elementor UI)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-purple-300 hover:text-white bg-purple-950/30 hover:bg-purple-900/50 group border border-purple-800/40 hover:border-purple-600"
          >
            <div className="p-1.5 rounded-lg bg-purple-900/80 border border-purple-700/60 text-purple-300 shrink-0 group-hover:scale-105 transition">
              <Sliders className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Diseñador Visual</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-purple-900 text-purple-300 border border-purple-700">
                    Elementor UI
                  </span>
                </div>
                <p className="text-[10px] text-purple-300/80 truncate">Anchos, Tipografía e Imágenes</p>
              </div>
            )}
          </button>
        )}

        {/* 17. Motor de Responsividad Inteligente (Auto-Adapt HUD) */}
        {onOpenResponsiveHUD && (
          <button
            onClick={onOpenResponsiveHUD}
            title={isCollapsed ? 'Motor de Responsividad Inteligente (Auto-Adapt HUD)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 group border border-emerald-800/50 hover:border-emerald-500"
          >
            <div className="p-1.5 rounded-lg bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 shrink-0 group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Responsividad Inteligente</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-900 text-emerald-300 border border-emerald-700">
                    Auto-Adapt
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/80 truncate">Detección y Escala Fluida</p>
              </div>
            )}
          </button>
        )}

        {/* 18. Barra Flotante de Resoluciones Toggle */}
        {onToggleViewportToolbar && (
          <button
            onClick={onToggleViewportToolbar}
            title={isCollapsed ? 'Barra de Resoluciones & Dispositivos' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 group border border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0 group-hover:scale-105 transition">
              <Smartphone className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Barra de Resolución</span>
                  <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${isViewportToolbarVisible ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {isViewportToolbarVisible ? 'Visible' : 'Oculta'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Móvil / Tablet / Laptop / 4K</p>
              </div>
            )}
          </button>
        )}

        {/* 19. Simulador de Barrido Fluido Toggle */}
        {onToggleSimulation && (
          <button
            onClick={onToggleSimulation}
            title={isCollapsed ? 'Simulador de Barrido Fluido (320px - 1440px)' : undefined}
            className={`w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 group border ${
              isSimulating
                ? 'bg-sky-950/80 text-sky-200 border-sky-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border-transparent hover:border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 group-hover:scale-105 transition border ${
              isSimulating ? 'bg-sky-900 text-sky-200 border-sky-600' : 'bg-slate-900 text-sky-400 border-slate-800'
            }`}>
              <Play className={`w-4 h-4 ${isSimulating ? 'animate-pulse' : ''}`} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Barrido Fluido</span>
                  <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                    isSimulating
                      ? 'bg-sky-900 text-sky-200 border-sky-600 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isSimulating ? '320↔1440' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Animación 320px a 1440px</p>
              </div>
            )}
          </button>
        )}

        {/* 20. Modo Grid Debug Toggle */}
        {onToggleGridDebug && (
          <button
            onClick={onToggleGridDebug}
            title={isCollapsed ? 'Modo Grid Debug (Contornos de alineación)' : undefined}
            className={`w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 group border ${
              isGridDebug
                ? 'bg-amber-950/80 text-amber-200 border-amber-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border-transparent hover:border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 group-hover:scale-105 transition border ${
              isGridDebug ? 'bg-amber-900 text-amber-200 border-amber-600' : 'bg-slate-900 text-amber-400 border-slate-800'
            }`}>
              <Grid className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Modo Grid Debug</span>
                  <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                    isGridDebug
                      ? 'bg-amber-900 text-amber-200 border-amber-600'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isGridDebug ? 'Activo' : 'Off'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Outlines de Layout y Grillas</p>
              </div>
            )}
          </button>
        )}

        {/* 21. Heatmap Mode Breakpoints */}
        {onToggleHeatmapMode && (
          <button
            onClick={onToggleHeatmapMode}
            title={isCollapsed ? 'Modo Heatmap (Sombreado por Breakpoint)' : undefined}
            className={`w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 group border ${
              isHeatmapMode
                ? 'bg-indigo-950/80 text-indigo-200 border-indigo-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border-transparent hover:border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 group-hover:scale-105 transition border ${
              isHeatmapMode ? 'bg-indigo-900 text-indigo-200 border-indigo-600' : 'bg-slate-900 text-indigo-400 border-slate-800'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Breakpoint Heatmap</span>
                  <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                    isHeatmapMode
                      ? 'bg-indigo-900 text-indigo-200 border-indigo-600'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isHeatmapMode ? 'Activo' : 'Off'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Coloreado dinámico de layout</p>
              </div>
            )}
          </button>
        )}

        {/* 22. Stress Test Mode Toggle */}
        {onToggleStressTest && (
          <button
            onClick={onToggleStressTest}
            title={isCollapsed ? 'Stress Test de Layout (Strings gigantes sin espacio)' : undefined}
            className={`w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 group border ${
              isStressTestActive
                ? 'bg-rose-950/80 text-rose-200 border-rose-700 shadow-sm animate-pulse'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border-transparent hover:border-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 group-hover:scale-105 transition border ${
              isStressTestActive ? 'bg-rose-900 text-rose-200 border-rose-600' : 'bg-slate-900 text-rose-400 border-slate-800'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Stress Test Strings</span>
                  <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                    isStressTestActive
                      ? 'bg-rose-900 text-rose-200 border-rose-600 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isStressTestActive ? 'Inyectando' : 'Off'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Prueba desbordamiento de texto</p>
              </div>
            )}
          </button>
        )}

        {/* 23. Visual Regression Capture Tool */}
        {onOpenVisualRegression && (
          <button
            onClick={onOpenVisualRegression}
            title={isCollapsed ? 'Capturador de Regresión Visual (Multi-Breakpoint)' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 group border text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg shrink-0 group-hover:scale-105 transition border bg-slate-900 text-cyan-400 border-slate-800">
              <Camera className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Regresión Visual</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    4 Resoluciones
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Snapshots 320/640/1024/1440</p>
              </div>
            )}
          </button>
        )}

        {/* 24. Fluidity Score Calculator */}
        {onOpenFluidityScore && (
          <button
            onClick={onOpenFluidityScore}
            title={isCollapsed ? 'Calculador de Puntuación de Fluidez y Auditoría Clamp()' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 group border text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg shrink-0 group-hover:scale-105 transition border bg-slate-900 text-emerald-400 border-slate-800">
              <TrendingUp className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Score de Fluidez</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    98.4 / 100
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Auditoría clamp() y escalas</p>
              </div>
            )}
          </button>
        )}

        {/* 25. Screen Inventory Matrix */}
        {onOpenScreenInventory && (
          <button
            onClick={onOpenScreenInventory}
            title={isCollapsed ? 'Inventario de 38 Pantallas y Enlaces Internos' : undefined}
            className="w-full rounded-xl p-2.5 text-left transition flex items-center gap-3 group border text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border-transparent hover:border-slate-800"
          >
            <div className="p-1.5 rounded-lg shrink-0 group-hover:scale-105 transition border bg-slate-900 text-purple-400 border-slate-800">
              <Layers className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Mapa de Pantallas</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                    38 Vistas
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Matriz de enlaces y estado</p>
              </div>
            )}
          </button>
        )}
      </div>


      {/* Bottom Profile & Hardware Telemetry Widget */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0e121a]/80">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* Device Telemetry Pill (Clickable) */}
            <button
              onClick={onOpenDiagnostics}
              title="Abrir Centro de Diagnóstico & Telemetría"
              className="w-full p-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono space-y-1 text-left transition group"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1 group-hover:text-purple-300 transition">
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                  <span>Xiaomi 14 Ultra</span>
                </span>
                <span className="text-emerald-400 font-bold">ARM64</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Shizuku Daemon:</span>
                <span className="text-emerald-300">Conectado</span>
              </div>
            </button>

            {/* Profile Drawer Trigger */}
            <button
              onClick={onOpenAccountDrawer}
              className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 border border-emerald-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {userProfile.avatarLetter}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-white truncate">{userProfile.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{userProfile.email}</p>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAccountDrawer}
            title="Configuración de Cuenta & Dispositivo"
            className="w-9 h-9 mx-auto rounded-full bg-emerald-600 border border-emerald-400 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-950"
          >
            {userProfile.avatarLetter}
          </button>
        )}
      </div>
    </aside>
    </>
  );
};
