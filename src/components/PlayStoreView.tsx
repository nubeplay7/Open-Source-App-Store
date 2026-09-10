import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  Star, 
  Download, 
  Cpu, 
  Gamepad2, 
  LayoutGrid, 
  User, 
  Sparkles, 
  Flame, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  Play,
  Upload,
  History,
  Lightbulb,
  FileCode2,
  Layers,
  ArrowRight,
  Terminal,
  Key,
  FolderDown,
  BarChart3,
  Palette,
  Sliders,
  Menu,
  Award,
  Camera,
  Smartphone,
  MessageSquare,
  Code2,
  Database,
  GitBranch,
  Globe,
  Server,
  ExternalLink,
  Check
} from 'lucide-react';
import { AppCatalogItem, UserProfile, DeviceTelemetry, ClonedAppRepo, CatalogOwnershipFilter, STACK_DETAILS } from '../types';

interface PlayStoreViewProps {
  catalog: AppCatalogItem[];
  userProfile: UserProfile;
  deviceTelemetry: DeviceTelemetry;
  onSelectApp: (app: AppCatalogItem) => void;
  onInstallApp: (app: AppCatalogItem) => void;
  onCompileApp: (app: AppCatalogItem) => void;
  onOpenAccountDrawer: () => void;
  onOpenCompiler: () => void;
  onOpenPublisher: () => void;
  onOpenSourceUpload?: () => void;
  onOpenCloudTesting?: (app?: AppCatalogItem) => void;
  onOpenChangelog?: () => void;
  onOpenProposals?: () => void;
  onOpenArchitectureDocs?: () => void;
  onOpenRepoSync?: () => void;
  onOpenWorkspace?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenSecurityAudit?: () => void;
  onOpenRepoManager?: () => void;
  onOpenDiagnostics?: () => void;
  onOpenBuildsHub?: () => void;
  onOpenKeystoreVault?: () => void;
  onOpenDesignProfiles?: () => void;
  onOpenFunctionalityProfiles?: () => void;
  onOpenNetworkTraffic?: (app?: AppCatalogItem) => void;
  onBatchInstall?: (apps: AppCatalogItem[]) => void;
  clonedRepos?: Record<string, ClonedAppRepo>;
  onCloneRepoLocally?: (app: AppCatalogItem) => void;
  onOpenSidebarDrawer?: () => void;
  isOfflineMode?: boolean;
  onToggleOfflineMode?: () => void;
  onOpenSilentInstaller?: () => void;
  onOpenInnovationsHub?: () => void;
  onOpenCrossDeviceSync?: (app?: AppCatalogItem) => void;
  onOpenSocialChat?: () => void;
  onOpenCollabStudio?: () => void;
  onOpenCiCdEvidence?: () => void;
}


type PlayBottomTab = 'GAMES' | 'APPS' | 'COMPILER' | 'DEV_HUB' | 'YOU';
type PlaySubTab = 'FOR_YOU' | 'TOP_CHARTS' | 'KIDS' | 'CATEGORIES';

export type ArchFilterType = 'ALL' | 'arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'universal';
export type SecurityFilterType = 'ALL' | 'ZERO_TRACKERS' | 'REPRODUCIBLE' | 'VERIFIED_CLEAN' | 'NO_SENSITIVE';
export type PermissionFilterType = 'ALL' | 'OFFLINE' | 'STORAGE' | 'INSTALL_PACKAGES' | 'NOTIFICATIONS' | 'CAMERA_MIC';

export const PlayStoreView: React.FC<PlayStoreViewProps> = ({
  catalog,
  userProfile,
  deviceTelemetry,
  onSelectApp,
  onInstallApp,
  onCompileApp,
  onOpenAccountDrawer,
  onOpenCompiler,
  onOpenPublisher,
  onOpenChangelog,
  onOpenProposals,
  onOpenArchitectureDocs,
  onOpenRepoSync,
  onOpenWorkspace,
  onOpenAdminPanel,
  onOpenCommandPalette,
  onOpenSecurityAudit,
  onOpenRepoManager,
  onOpenDiagnostics,
  onOpenBuildsHub,
  onOpenKeystoreVault,
  onOpenDesignProfiles,
  onOpenFunctionalityProfiles,
  onOpenNetworkTraffic,
  onBatchInstall,
  clonedRepos = {},
  onCloneRepoLocally,
  onOpenSidebarDrawer,
  isOfflineMode = false,
  onToggleOfflineMode,
  onOpenSilentInstaller,
  onOpenInnovationsHub,
  onOpenCrossDeviceSync,
  onOpenSocialChat,
  onOpenCollabStudio,
  onOpenSourceUpload,
  onOpenCloudTesting,
  onOpenCiCdEvidence
}) => {

  const [bottomTab, setBottomTab] = useState<PlayBottomTab>('APPS');
  const [subTab, setSubTab] = useState<PlaySubTab>('FOR_YOU');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<CatalogOwnershipFilter>('ALL');

  // Counts of My Apps vs Community Apps
  const myAppsCount = useMemo(() => catalog.filter(a => a.isUserApp).length, [catalog]);
  const communityAppsCount = useMemo(() => catalog.filter(a => !a.isUserApp).length, [catalog]);

  // Batch Select State
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedBatchAppIds, setSelectedBatchAppIds] = useState<Set<string>>(new Set());

  // Persistent Catalog Filters (Architecture, Security, Permissions)
  const [archFilter, setArchFilter] = useState<ArchFilterType>(() => {
    const saved = localStorage.getItem('ciber_store_filter_arch');
    return (saved as ArchFilterType) || 'ALL';
  });

  const [securityFilter, setSecurityFilter] = useState<SecurityFilterType>(() => {
    const saved = localStorage.getItem('ciber_store_filter_security');
    return (saved as SecurityFilterType) || 'ALL';
  });

  const [permissionFilter, setPermissionFilter] = useState<PermissionFilterType>(() => {
    const saved = localStorage.getItem('ciber_store_filter_permission');
    return (saved as PermissionFilterType) || 'ALL';
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [compilerSearchQuery, setCompilerSearchQuery] = useState('');

  const toggleAppSelection = (appId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBatchAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedBatchAppIds(new Set(filteredApps.map((a) => a.id)));
  };

  const handleClearSelection = () => {
    setSelectedBatchAppIds(new Set());
  };

  const handleTriggerBatchInstall = () => {
    const selectedApps = catalog.filter((a) => selectedBatchAppIds.has(a.id));
    if (selectedApps.length === 0) return;
    if (onBatchInstall) {
      onBatchInstall(selectedApps);
    } else {
      // Fallback
      onInstallApp(selectedApps[0]);
    }
  };

  // Sync filters to localStorage
  const handleSetArchFilter = (val: ArchFilterType) => {
    setArchFilter(val);
    localStorage.setItem('ciber_store_filter_arch', val);
  };

  const handleSetSecurityFilter = (val: SecurityFilterType) => {
    setSecurityFilter(val);
    localStorage.setItem('ciber_store_filter_security', val);
  };

  const handleSetPermissionFilter = (val: PermissionFilterType) => {
    setPermissionFilter(val);
    localStorage.setItem('ciber_store_filter_permission', val);
  };

  const handleResetFilters = () => {
    handleSetArchFilter('ALL');
    handleSetSecurityFilter('ALL');
    handleSetPermissionFilter('ALL');
    setSelectedInterest('ALL');
    setSearchQuery('');
  };

  const activeFiltersCount = 
    (archFilter !== 'ALL' ? 1 : 0) + 
    (securityFilter !== 'ALL' ? 1 : 0) + 
    (permissionFilter !== 'ALL' ? 1 : 0) +
    (selectedInterest !== 'ALL' ? 1 : 0);

  const interestsList = [
    { id: 'ALL', label: 'Todos' },
    { id: 'STORES', label: 'Tiendas FOSS' },
    { id: 'MULTIMEDIA', label: 'Multimedia & Música' },
    { id: 'PRIVACY', label: 'Privacidad & Cripto' },
    { id: 'PRODUCTIVITY', label: 'Productividad' },
    { id: 'TOOLS', label: 'Herramientas & Root' },
    { id: 'CUSTOMIZATION', label: 'Personalización' }
  ];

  // Filter catalog with all persistent dimensions
  const filteredApps = useMemo(() => {
    return catalog.filter((app) => {
      // 0. Ownership Filter
      if (ownershipFilter === 'MY_APPS' && !app.isUserApp) return false;
      if (ownershipFilter === 'COMMUNITY' && app.isUserApp) return false;

      // 1. Search Query
      const matchesSearch = 
        !searchQuery || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Category Interest
      const matchesInterest = selectedInterest === 'ALL' || app.category === selectedInterest;
      if (!matchesInterest) return false;

      // 3. Architecture Filter
      if (archFilter !== 'ALL') {
        const appArchs = app.supportedArchs || ['arm64-v8a', 'universal'];
        const matchesArch = 
          archFilter === 'universal' 
            ? appArchs.includes('universal') || appArchs.length > 2
            : appArchs.includes(archFilter) || appArchs.includes('universal');
        if (!matchesArch) return false;
      }

      // 4. Security Status Filter
      if (securityFilter !== 'ALL') {
        if (securityFilter === 'ZERO_TRACKERS' && app.trackersCount > 0) return false;
        if (securityFilter === 'REPRODUCIBLE' && !app.canCompileWithCi) return false;
        if (securityFilter === 'VERIFIED_CLEAN' && !app.developer.verified) return false;
        if (securityFilter === 'NO_SENSITIVE') {
          const hasDangerousPerms = app.permissions.some(p => 
            p.includes('ROOT') || p.includes('INSTALL_PACKAGES') || p.includes('LOCATION') || p.includes('CAMERA')
          );
          if (hasDangerousPerms) return false;
        }
      }

      // 5. Permission Filter
      if (permissionFilter !== 'ALL') {
        if (permissionFilter === 'OFFLINE') {
          const hasInternet = app.permissions.includes('INTERNET') || app.permissions.includes('ACCESS_NETWORK_STATE');
          if (hasInternet) return false;
        } else if (permissionFilter === 'STORAGE') {
          const hasStorage = app.permissions.some(p => p.includes('STORAGE') || p.includes('MEDIA') || p.includes('MANAGE_EXTERNAL_STORAGE'));
          if (!hasStorage) return false;
        } else if (permissionFilter === 'INSTALL_PACKAGES') {
          const hasInstall = app.permissions.some(p => p.includes('INSTALL') || p.includes('SHIZUKU') || p.includes('PACKAGE'));
          if (!hasInstall) return false;
        } else if (permissionFilter === 'NOTIFICATIONS') {
          const hasNotif = app.permissions.some(p => p.includes('NOTIFICATION') || p.includes('POST_NOTIFICATIONS'));
          if (!hasNotif) return false;
        } else if (permissionFilter === 'CAMERA_MIC') {
          const hasMediaHardware = app.permissions.some(p => p.includes('CAMERA') || p.includes('RECORD_AUDIO') || p.includes('AUDIO'));
          if (!hasMediaHardware) return false;
        }
      }

      return true;
    });
  }, [catalog, searchQuery, selectedInterest, archFilter, securityFilter, permissionFilter, ownershipFilter]);

  // Featured apps for carousel
  const featuredApps = useMemo(() => catalog.filter(a => a.isFeatured), [catalog]);
  const editorChoiceApps = useMemo(() => catalog.filter(a => a.isEditorChoice), [catalog]);

  return (
    <div className="flex flex-col min-h-screen bg-[#111318] text-slate-100 pb-20 select-none">
      {/* Offline Mode Cached Banner */}
      {isOfflineMode && (
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-b border-amber-600/60 px-4 py-2 text-amber-200 text-xs flex items-center justify-between sticky top-0 z-40 shadow-lg">
          <div className="flex items-center gap-2 max-w-4xl">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="font-semibold">📦 Modo Caché Offline Activo:</span>
            <span className="text-amber-300/90 hidden sm:inline">Sin conexión a internet detectada. Se muestran los APKs descargados, repositorios locales y documentación técnica en caché.</span>
          </div>
          {onToggleOfflineMode && (
            <button
              onClick={onToggleOfflineMode}
              className="px-2.5 py-0.5 rounded-full bg-amber-800/80 hover:bg-amber-700 text-[11px] font-bold text-white border border-amber-500/50 shrink-0 transition"
            >
              Reconectar
            </button>
          )}
        </div>
      )}

      {/* Top Search Bar & Profile Header (Google Play Style - Screenshot 1/2) */}
      <header className="sticky top-0 z-30 bg-[#111318]/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 pt-3 pb-2 border-b border-slate-900/80">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Sidebar Trigger Button */}
          {onOpenSidebarDrawer && (
            <button
              onClick={onOpenSidebarDrawer}
              className="md:hidden p-2.5 rounded-full bg-[#1e2025] hover:bg-[#252830] text-slate-300 transition shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center border border-slate-800/80"
              title="Abrir menú de herramientas"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Search Pill */}
          <div className="flex-1 bg-[#1e2025] hover:bg-[#252830] transition rounded-full px-4 py-2.5 flex items-center gap-3 border border-slate-800/80 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-xs tracking-wider shrink-0">
              {/* Google Play Quad-Color Logo */}
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M3.6 1.8l10.8 10.2L3.6 22.2c-.4-.4-.6-1-.6-1.7V3.5c0-.7.2-1.3.6-1.7z"/>
                  <path fill="#FBBC05" d="M18.2 8.3L14.4 12l3.8 3.7 4.3-2.5c.8-.5.8-1.9 0-2.4l-4.3-2.5z"/>
                  <path fill="#EA4335" d="M14.4 12L3.6 1.8c.4-.4 1.1-.4 1.7 0l12.9 6.5-3.8 3.7z"/>
                  <path fill="#34A853" d="M14.4 12l3.8 3.7-12.9 6.5c-.6.4-1.3.4-1.7 0L14.4 12z"/>
                </svg>
              </div>
            </div>

            <input
              type="text"
              placeholder="Buscar apps de código abierto, clientes y juegos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-400 w-full"
            />

            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-200 p-1">
                ×
              </button>
            )}
          </div>

          {/* Batch Selection Mode Trigger */}
          <button
            onClick={() => {
              setIsBatchMode(prev => !prev);
              if (isBatchMode) {
                setSelectedBatchAppIds(new Set());
              }
            }}
            title={isBatchMode ? "Desactivar modo selección en lote" : "Activar selección múltiple de apps"}
            className={`p-2.5 rounded-full transition flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px] border ${
              isBatchMode || selectedBatchAppIds.size > 0
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/60'
                : 'bg-[#1e2025] hover:bg-[#252830] text-slate-300 border-slate-800/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          {/* 1-Click Silent Native Installer Trigger */}
          {onOpenSilentInstaller && (
            <button
              onClick={onOpenSilentInstaller}
              title="Instalador 1-Click Silencioso (Sin Diálogos de Orígenes Desconocidos)"
              className="p-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 shadow-md shadow-emerald-950/60 transition flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px] group"
            >
              <Zap className="w-4 h-4 group-hover:scale-110 text-emerald-400 fill-emerald-400/20" />
            </button>
          )}

          {/* 30 World-Class Innovations Hub Trigger */}
          {onOpenInnovationsHub && (
            <button
              onClick={onOpenInnovationsHub}
              title="Suite de 30 Innovaciones de Clase Mundial (Cosign, NixOS, Nostr, P2P, OLED)"
              className="p-2.5 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/60 shadow-md shadow-purple-950/60 transition flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px] group"
            >
              <Award className="w-4 h-4 group-hover:scale-110 text-purple-300" />
            </button>
          )}

          {/* Sincronización Multi-Dispositivo (Play Store Fleet Sync) */}
          {onOpenCrossDeviceSync && (
            <button
              onClick={() => onOpenCrossDeviceSync()}
              title="Sincronización Multi-Dispositivo: Mis dispositivos vinculados & Enviar apps"
              className="p-2.5 rounded-full bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-700/60 shadow-md shadow-teal-950/60 transition flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px] group"
            >
              <Smartphone className="w-4 h-4 group-hover:scale-110 text-teal-300" />
            </button>
          )}

          {/* Comunidad FOSS & Chat Social */}
          {onOpenSocialChat && (
            <button
              onClick={onOpenSocialChat}
              title="Comunidad & Chat: Habla con contactos y comparte aplicaciones"
              className="p-2.5 rounded-full bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 shadow-md shadow-indigo-950/60 transition flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px] group"
            >
              <MessageSquare className="w-4 h-4 group-hover:scale-110 text-indigo-300" />
            </button>
          )}

          {/* Estudio Colaborativo Git */}
          {onOpenCollabStudio && (
            <button
              onClick={onOpenCollabStudio}
              title="Estudio Colaborativo: Desarrollo en tiempo real & Git"
              className="p-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 shadow-md shadow-emerald-950/60 transition flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px] group"
            >
              <Code2 className="w-4 h-4 group-hover:scale-110 text-emerald-300" />
            </button>
          )}

          {/* Command Palette Terminal Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              title="Abrir Command Palette (Ctrl+K)"
              className="p-2.5 rounded-full bg-[#1e2025] hover:bg-purple-950/80 text-purple-300 border border-transparent hover:border-purple-800 transition flex items-center justify-center group shrink-0 min-w-[40px] min-h-[40px]"
            >
              <Terminal className="w-4 h-4 group-hover:scale-110 transition" />
            </button>
          )}

          {/* Admin Panel Quick Access Button */}
          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              title="Panel de Administración Maestro (Base de Datos & Scraper)"
              className="p-2 rounded-full bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 transition min-w-[38px] min-h-[38px] flex items-center justify-center border border-amber-600/50 shadow-sm shrink-0"
            >
              <Database className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Notification Bell with Badge (3) */}
          <div className="relative shrink-0">
            <button
              onClick={() => onOpenCompiler()}
              title="Notificaciones y compilaciones activas"
              className="p-2.5 rounded-full bg-[#1e2025] hover:bg-[#252830] text-slate-300 transition min-w-[40px] min-h-[40px] flex items-center justify-center border border-slate-800/80"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
              3
            </span>
          </div>

          {/* User Profile Avatar with Level Ring (Screenshot 6 trigger) */}
          <button
            onClick={onOpenAccountDrawer}
            title="Abrir configuración y perfil"
            className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-emerald-400 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-950/50 shrink-0 hover:scale-105 transition"
          >
            {userProfile.avatarLetter}
          </button>
        </div>

        {/* Subtabs Header (Screenshot 1: Para ti, Listas de éxitos, Categorías) */}
        {bottomTab === 'APPS' && (
          <div className="max-w-7xl mx-auto flex items-center gap-6 px-1 pt-3 text-xs font-semibold border-t border-slate-900 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSubTab('FOR_YOU')}
              className={`pb-2.5 transition relative whitespace-nowrap min-h-[36px] flex items-center ${
                subTab === 'FOR_YOU' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Para ti</span>
              {subTab === 'FOR_YOU' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setSubTab('TOP_CHARTS')}
              className={`pb-2.5 transition relative whitespace-nowrap min-h-[36px] flex items-center ${
                subTab === 'TOP_CHARTS' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Listas de éxitos</span>
              {subTab === 'TOP_CHARTS' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setSubTab('CATEGORIES')}
              className={`pb-2.5 transition relative whitespace-nowrap min-h-[36px] flex items-center ${
                subTab === 'CATEGORIES' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Categorías</span>
              {subTab === 'CATEGORIES' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>
        )}
      </header>

      {/* Main View Area */}
      <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 space-y-6 max-w-7xl mx-auto w-full">
        {/* ======================================================== */}
        {/* VIEW 1: APPS TAB (MAIN GOOGLE PLAY FEED) */}
        {/* ======================================================== */}
        {bottomTab === 'APPS' && (
          <>
            {/* Banner Oficial: Descarga Civer App Store Mobile */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/50 p-5 shadow-2xl relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                      Civer App Store Mobile • APK Oficial v1.0.4
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Build 4 • 21.59 MB</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Instala Civer App Store en tu dispositivo Android
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Experiencia de Play Store nativa 100% de código abierto. Descargas directas, instalador silencioso Shizuku, compilador en la nube y sincronización OTA sin cables USB ni comandos ADB.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap">
                  <a
                    href="/downloads/com.civer.appstore-v1.0.4-release.apk"
                    download="com.civer.appstore-v1.0.4-release.apk"
                    className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition hover:scale-105"
                  >
                    <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Descargar APK v1.0.4</span>
                  </a>

                  {onOpenCiCdEvidence && (
                    <button
                      onClick={onOpenCiCdEvidence}
                      className="px-5 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md"
                      title="Ver Mega-Matriz de Certificación y Evidencias CI/CD"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Evidencias CI/CD</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Event Hero Carousel (Screenshot 1 Style) */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-[#111318] border border-emerald-800/30 p-5 shadow-xl relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Evento de Compilación Cloud
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Android 15 SDK Ready</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                    Compila cualquier APK FOSS en Servidores GitHub Actions
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    Aprovecha la potencia de la nube para compilar binarios firmados, limpios y libres de rastreadores con 1 solo toque.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onOpenCompiler}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Lanzar Compilación</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ownership Tabs & Source Upload Bar (Mis Aplicaciones vs Comunidad) */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('ALL')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    ownershipFilter === 'ALL'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Todas las Apps</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-900 text-slate-300">
                    {catalog.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnershipFilter('MY_APPS')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    ownershipFilter === 'MY_APPS'
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white shadow-md shadow-amber-950/60'
                      : 'bg-slate-950 text-amber-300 hover:text-amber-200 border border-amber-900/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Mis Aplicaciones (Creadas por mí)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/60 font-bold">
                    {myAppsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnershipFilter('COMMUNITY')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    ownershipFilter === 'COMMUNITY'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-950/60'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Comunidad FOSS</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-900 text-slate-300">
                    {communityAppsCount}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Cloud Testing & Screencap Studio Button */}
                {onOpenCloudTesting && (
                  <button
                    type="button"
                    onClick={() => onOpenCloudTesting()}
                    className="px-3.5 py-2 rounded-2xl bg-indigo-950/90 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/60 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/60 shrink-0"
                    title="Abrir Laboratorio de Pruebas en la Nube con Emulador KVM y Capturas de Pantalla"
                  >
                    <Camera className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Pruebas Cloud & Capturas</span>
                  </button>
                )}

                {/* Source Upload Button */}
                {onOpenSourceUpload && (
                  <button
                    type="button"
                    onClick={onOpenSourceUpload}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir Código Fuente / ZIP</span>
                  </button>
                )}
              </div>
            </div>

            {/* Interest Chips Filter (Screenshot 3 Style: ¿Cuáles son sus intereses?) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>¿Cuáles son tus intereses?</span>
                </h4>

                {/* Quick links to Changelog, Proposals, Design & Feature Flags */}
                <div className="flex items-center flex-wrap gap-1.5">
                  {onOpenDesignProfiles && (
                    <button
                      onClick={onOpenDesignProfiles}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60 transition"
                      title="Personalizar Paleta de Diseño y Densidad"
                    >
                      <Palette className="w-3 h-3 text-emerald-400" />
                      <span className="hidden sm:inline">Diseño & Paletas</span>
                    </button>
                  )}
                  {onOpenFunctionalityProfiles && (
                    <button
                      onClick={onOpenFunctionalityProfiles}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/60 transition"
                      title="Configurar Flags y Perfiles de Funcionalidades"
                    >
                      <Sliders className="w-3 h-3 text-purple-400" />
                      <span className="hidden sm:inline">Funcionalidades</span>
                    </button>
                  )}
                  {onOpenChangelog && (
                    <button
                      onClick={onOpenChangelog}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-800/60 transition"
                    >
                      <History className="w-3 h-3" />
                      <span>Changelog</span>
                    </button>
                  )}
                  {onOpenProposals && (
                    <button
                      onClick={onOpenProposals}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/60 transition"
                    >
                      <Lightbulb className="w-3 h-3" />
                      <span>Propuestas</span>
                    </button>
                  )}
                </div>

              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {interestsList.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => setSelectedInterest(interest.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap border ${
                      selectedInterest === interest.id
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : 'bg-[#1e2025] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {interest.label}
                  </button>
                ))}
              </div>

              {/* Advanced Persistent Filters Bar (Architecture, Security Status, Required Permissions) */}
              <div className="bg-[#161920] border border-slate-800/90 rounded-2xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200">Filtros Técnicos Persistentes</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {filteredApps.length} de {catalog.length} apps compatibles
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Batch Selection Controls */}
                    <button
                      onClick={() => {
                        setIsBatchMode(prev => !prev);
                        if (isBatchMode) setSelectedBatchAppIds(new Set());
                      }}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                        isBatchMode 
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' 
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isBatchMode ? 'Modo Selección ON' : 'Selección Múltiple'}</span>
                    </button>

                    {isBatchMode && (
                      <>
                        <button
                          onClick={handleSelectAll}
                          className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 transition"
                        >
                          Seleccionar Todo ({filteredApps.length})
                        </button>
                        {selectedBatchAppIds.size > 0 && (
                          <button
                            onClick={handleClearSelection}
                            className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 transition"
                          >
                            Limpiar ({selectedBatchAppIds.size})
                          </button>
                        )}
                      </>
                    )}

                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleResetFilters}
                        className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-900/60 transition flex items-center gap-1"
                      >
                        <span>Limpiar ({activeFiltersCount})</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsFilterPanelOpen(prev => !prev)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl border transition flex items-center gap-1.5 ${
                        isFilterPanelOpen || activeFiltersCount > 0
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-950'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>{isFilterPanelOpen ? 'Ocultar Filtros' : 'Ajustar Filtros'}</span>
                      {activeFiltersCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-slate-950 text-emerald-300 text-[10px] font-mono flex items-center justify-center font-bold">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Filter Selectors */}
                {(isFilterPanelOpen || activeFiltersCount > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                    {/* 1. Architecture Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-purple-400" />
                        <span>Arquitectura (ARM / x86)</span>
                      </label>
                      <select
                        value={archFilter}
                        onChange={(e) => handleSetArchFilter(e.target.value as ArchFilterType)}
                        className="w-full bg-[#111318] text-xs text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500 font-mono"
                      >
                        <option value="ALL">Todas las Arquitecturas</option>
                        <option value="arm64-v8a">ARM64 (arm64-v8a) • Xiaomi/Pixel</option>
                        <option value="armeabi-v7a">ARM32 (armeabi-v7a) • Dispositivos Legacy</option>
                        <option value="x86_64">Intel / AMD (x86_64) • Emuladores/PC</option>
                        <option value="universal">Binario Universal (Fat APK)</option>
                      </select>
                    </div>

                    {/* 2. Security Audit Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Estado de Seguridad</span>
                      </label>
                      <select
                        value={securityFilter}
                        onChange={(e) => handleSetSecurityFilter(e.target.value as SecurityFilterType)}
                        className="w-full bg-[#111318] text-xs text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option value="ALL">Todos los Estados</option>
                        <option value="ZERO_TRACKERS">0 Rastreadores Exodus Privacy</option>
                        <option value="REPRODUCIBLE">Build Reproducible (CI/CD Verificado)</option>
                        <option value="VERIFIED_CLEAN">Desarrollador FOSS Verificado</option>
                        <option value="NO_SENSITIVE">Sin Permisos Invasivos/Root</option>
                      </select>
                    </div>

                    {/* 3. Permissions Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>Permisos Requeridos</span>
                      </label>
                      <select
                        value={permissionFilter}
                        onChange={(e) => handleSetPermissionFilter(e.target.value as PermissionFilterType)}
                        className="w-full bg-[#111318] text-xs text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="ALL">Cualquier Combinación de Permisos</option>
                        <option value="OFFLINE">100% Offline (Sin Acceso a Internet)</option>
                        <option value="STORAGE">Almacenamiento Local & Media</option>
                        <option value="INSTALL_PACKAGES">Instalación de Paquetes / Shizuku</option>
                        <option value="NOTIFICATIONS">Solo Notificaciones Push</option>
                        <option value="CAMERA_MIC">Hardware Cámara / Micrófono</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Sugerencias para ti (Horizontal List - Screenshot 1/2 Style) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-100">Sugerencias para ti</h3>
                  <p className="text-[11px] text-slate-400">Seleccionadas por seguridad y cero rastreadores</p>
                </div>
                <button
                  onClick={() => setSubTab('TOP_CHARTS')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                >
                  <span>Ver más</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {filteredApps.slice(0, 12).map((app) => {
                  const isSelected = selectedBatchAppIds.has(app.id);
                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        if (isBatchMode) {
                          toggleAppSelection(app.id);
                        } else {
                          onSelectApp(app);
                        }
                      }}
                      className={`border rounded-2xl p-2.5 sm:p-3.5 transition flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md relative ${
                        isSelected 
                          ? 'bg-[#1e2a22] border-emerald-500 ring-2 ring-emerald-500/40' 
                          : 'bg-[#1a1c22] hover:bg-[#22252e] border-slate-800/80'
                      }`}
                    >
                      {/* Selection Checkbox Overlay */}
                      {(isBatchMode || isSelected) && (
                        <div 
                          onClick={(e) => toggleAppSelection(app.id, e)}
                          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 hover:scale-110 transition shadow"
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-600'}`}>
                            {isSelected && '✓'}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl ${app.iconBg} flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-md group-hover:scale-105 transition shrink-0`}>
                            {app.name.charAt(0)}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {app.isUserApp && (
                              <span className="text-[9px] bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full font-mono shadow-sm">
                                Creada por mí
                              </span>
                            )}
                            {app.stackType && (
                              <span className={`text-[8px] font-mono px-1 py-0.2 rounded border ${STACK_DETAILS[app.stackType]?.badgeBg} ${STACK_DETAILS[app.stackType]?.badgeText} ${STACK_DETAILS[app.stackType]?.badgeBorder}`}>
                                {app.stackType === 'ANDROID_NATIVE' ? 'Android' : app.stackType === 'FLUTTER' ? 'Flutter' : app.stackType === 'REACT_NATIVE' ? 'RN' : 'PWA'}
                              </span>
                            )}
                            {!isBatchMode && !isSelected && app.badgeTag && !app.isUserApp && (
                              <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono truncate max-w-[65px] sm:max-w-[75px] shrink-0">
                                {app.badgeTag}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-semibold text-slate-100 text-xs mt-2.5 line-clamp-1 group-hover:text-emerald-300 transition">
                          {app.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{app.developer.name}</p>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-1.5 flex-wrap">
                          <span className="flex items-center gap-0.5 font-semibold text-slate-300 shrink-0">
                            <span>{app.rating}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </span>
                          <span className="shrink-0">•</span>
                          <span className="shrink-0">{app.apkSizeMb} MB</span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between gap-1">
                        <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono truncate">0 Trackers</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isBatchMode) {
                              toggleAppSelection(app.id);
                            } else {
                              onInstallApp(app);
                            }
                          }}
                          className={`px-2.5 sm:px-3 py-1 rounded-full font-semibold text-[10px] transition flex items-center gap-1 shrink-0 whitespace-nowrap ${
                            isSelected 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'bg-slate-800 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Elegido</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>Instalar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Aplicaciones Más Populares y Clientes F-Droid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-100">Imprescindibles del Código Abierto</h3>
                  <p className="text-[11px] text-slate-400">Listas para compilar o instalar directamente</p>
                </div>
              </div>

              <div className="space-y-2">
                {filteredApps.slice(8, 16).map((app, index) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    className="bg-[#1a1c22] hover:bg-[#22252e] border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <span className="text-xs font-mono font-bold text-slate-500 w-4 text-center shrink-0">
                        {index + 9}
                      </span>
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${app.iconBg} flex items-center justify-center text-white text-lg sm:text-xl font-bold shrink-0 shadow`}>
                        {app.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-slate-100 text-xs truncate max-w-[150px] sm:max-w-none">{app.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{app.version}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{app.tagline}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5 flex-wrap">
                          <span className="text-amber-400 font-semibold shrink-0">★ {app.rating}</span>
                          <span className="shrink-0">•</span>
                          <span className="shrink-0">{app.downloads} descargas</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompileApp(app);
                        }}
                        title="Compilar en GitHub CI"
                        className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition shrink-0"
                      >
                        <Cpu className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInstallApp(app);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Instalar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: GAMES TAB */}
        {/* ======================================================== */}
        {bottomTab === 'GAMES' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 border border-purple-800/40">
              <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                <Gamepad2 className="w-6 h-6" /> Emuladores y Juegos FOSS para Android
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Descubre motores de juego de código abierto, emuladores retro y juegos nativos sin micropagos ni anuncios.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {catalog.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  className="bg-[#1a1c22] border border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-purple-500/50 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${app.iconBg} flex items-center justify-center text-white text-xl font-bold shrink-0`}>
                        {app.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-100 text-xs truncate">{app.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{app.developer.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{app.description}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInstallApp(app);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      Instalar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: COMPILER CI TAB (100% REAL GITHUB ACTIONS CLOUD ENGINE) */}
        {/* ======================================================== */}
        {bottomTab === 'COMPILER' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                      <Cpu className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                      GitHub Actions Cloud Runners • Ubuntu 24.04 LTS
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      100% Real • Cero Mocks
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[11px] font-bold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-purple-400" />
                      Credenciales Transparentes
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Compilador Cloud y Distribución FOSS en la Nube
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Envía a compilar cualquier aplicación Android directamente en runners de GitHub Actions (16 GB RAM, JDK 17, Gradle 9.3.1). Los usuarios no necesitan configurar tokens ni cuentas personales: la plataforma utiliza las credenciales maestras para compilar, firmar con Scheme v2+v3+v4 y publicar de forma permanente en la nube y OTA.
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenCompiler}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-950/60 flex items-center gap-2 transition"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Abrir Consola & Logs en Vivo</span>
                  </button>
                  <a
                    href="https://appstore.civer.cloud/downloads/com.civer.appstore-v1.0.4-release.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>APK v1.0.4 Directo (21.59 MB)</span>
                  </a>
                </div>
              </div>

              {/* Badges strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-5 border-t border-slate-800/80 text-[11px]">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-200 truncate">Runners Cloud</p>
                    <p className="text-[10px] text-slate-400 truncate">16 GB RAM / 4 vCPUs</p>
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-200 truncate">Toolchain Gradle</p>
                    <p className="text-[10px] text-slate-400 truncate">AGP 9.1.1 • Gradle 9.3.1</p>
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-200 truncate">Firma Criptográfica</p>
                    <p className="text-[10px] text-slate-400 truncate">Scheme v2+v3+v4 (fs-verity)</p>
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-200 truncate">Alojamiento Permanente</p>
                    <p className="text-[10px] text-slate-400 truncate">appstore.civer.cloud</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Hero Target: Civer App Store Mobile v1.0.4 */}
            <div className="bg-[#1a1c22] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-950/60 border border-emerald-400/40 shrink-0">
                    C
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-100 text-base">Civer App Store Mobile (Oficial)</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono text-[10px] border border-emerald-500/30">
                        v1.0.4 • Build 4
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] border border-sky-500/30">
                        21.59 MB
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Cliente nativo de Civer App Store para Android. Compilado con Compose TopBar, accesibilidad 44dp, cero rastreadores y soporte Shizuku/ADB silencioso.
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 truncate max-w-xl">
                      SHA-256: 72568ce3f49253ff34a4d0666b4cf18e846c2f86be8c4eb2007f12212b32bbad
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => {
                      const civerApp = catalog.find(a => a.id === 'civer-app-store' || a.packageName === 'com.civer.appstore') || catalog[0];
                      if (civerApp) onCompileApp(civerApp);
                    }}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 transition"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Compilar en Nube (1 Clic)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const civerApp = catalog.find(a => a.id === 'civer-app-store' || a.packageName === 'com.civer.appstore') || catalog[0];
                      if (civerApp) onInstallApp(civerApp);
                    }}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar APK v1.0.4</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Catalog Apps Ready for One-Click Cloud Compilation */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    Catálogo FOSS Listo para Compilar en Servidores Cloud
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona cualquier app para despachar su compilación en GitHub Actions. Verás el progreso en tiempo real de cada paso de Gradle.
                  </p>
                </div>

                {/* Filter Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre o paquete..."
                    value={compilerSearchQuery}
                    onChange={(e) => setCompilerSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {catalog
                  .filter(app => {
                    if (!compilerSearchQuery) return true;
                    const q = compilerSearchQuery.toLowerCase();
                    return app.name.toLowerCase().includes(q) || app.packageName.toLowerCase().includes(q) || app.category.toLowerCase().includes(q);
                  })
                  .map((app) => (
                    <div
                      key={app.id}
                      className="bg-[#1a1c22] border border-slate-800/90 hover:border-sky-500/50 rounded-2xl p-4 transition flex flex-col justify-between space-y-3 shadow-md group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-xl ${app.iconBg || 'bg-slate-700'} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow`}>
                            {app.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-slate-100 text-xs truncate group-hover:text-sky-300 transition">{app.name}</h4>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">v{app.version}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{app.packageName}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span className="text-amber-400">★ {app.rating}</span>
                              <span>•</span>
                              <span>{app.apkSizeMb || '15.0'} MB</span>
                              <span>•</span>
                              <span className="text-emerald-400">{app.license || 'GPL-3.0'}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {app.description || app.tagline}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80">
                        {app.githubUrl ? (
                          <a
                            href={app.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 transition"
                          >
                            <GitBranch className="w-3 h-3" />
                            <span>Repo</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Monorepo FOSS</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onCompileApp(app)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                            title="Compilar en GitHub Actions con credenciales de la plataforma"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Compilar Nube</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onInstallApp(app)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1 transition"
                            title="Instalar versión disponible"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Instalar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Architectural Pipeline Explainer */}
            <div className="bg-[#14161c] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Flujo de Compilación y Distribución Segura de Extremo a Extremo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-200">Despacho en 1 Clic</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    La app activa el webhook de GitHub Actions usando el token maestro de la plataforma. Cero fricción o registros requeridos.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-200">Compilación Real</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Runner aislado de GitHub ejecuta Gradle assembleRelease, Kotlin DSL y ProGuard/R8 con 16 GB de RAM en la nube.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-slate-200">Firma Criptográfica</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Firma Scheme v2, v3 y v4 con fs-verity y cálculo de SHA-256 inmutable verificado contra el repositorio oficial.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-slate-200">Distribución & OTA</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Alojamiento permanente en CDN Cloudflare /downloads/, actualización del manifest OTA y alerta directa al bot Telegram.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: DEV HUB TAB */}
        {/* ======================================================== */}
        {bottomTab === 'DEV_HUB' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">Portal para Desarrolladores</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Registra tus propias aplicaciones, vincula repositorios de GitHub y distribuye tus APKs a la comunidad FOSS.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenPublisher}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-xl shadow-purple-950/60 inline-flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Publicar Nueva Aplicación</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: YOU / TÚ TAB (SCREENSHOT 5 STYLE) */}
        {/* ======================================================== */}
        {bottomTab === 'YOU' && (
          <div className="space-y-5">
            {/* User Profile Card */}
            <div className="bg-[#1a1c22] rounded-3xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-600 border-2 border-emerald-400 text-white text-xl font-bold flex items-center justify-center shadow-lg">
                    {userProfile.avatarLetter}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{userProfile.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{userProfile.email}</p>
                  </div>
                </div>

                <button
                  onClick={onOpenAccountDrawer}
                  className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Configuración
                </button>
              </div>

              {/* Play Points Level (Screenshot 5) */}
              <div className="bg-[#111318] rounded-2xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    <span>Nivel {userProfile.playPointsTier} • {userProfile.playPoints} pts</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">0 pts este año</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-full w-1/12" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Gana puntos compilando e instalando aplicaciones verificadas sin telemetría.
                </p>
              </div>

              {/* Quick Actions: Changelog, Proposals & Blueprints */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {onOpenCrossDeviceSync && (
                  <button
                    onClick={() => onOpenCrossDeviceSync()}
                    className="p-3 rounded-2xl bg-gradient-to-br from-teal-950/90 via-slate-900 to-slate-900 hover:bg-[#1e2025] border border-teal-800/80 transition text-left space-y-1 shadow-md shadow-teal-950/40"
                  >
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                      <Smartphone className="w-4 h-4 text-teal-400" />
                      <span>Mis Dispositivos (Sync)</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Sincroniza datos, apps y gestiona tu flota en tiempo real.
                    </p>
                  </button>
                )}

                {onOpenSocialChat && (
                  <button
                    onClick={onOpenSocialChat}
                    className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 hover:bg-[#1e2025] border border-indigo-800/80 transition text-left space-y-1 shadow-md shadow-indigo-950/40"
                  >
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Comunidad & Chat Social</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Habla con amigos, comparte apps y participa en canales.
                    </p>
                  </button>
                )}

                {onOpenCollabStudio && (
                  <button
                    onClick={onOpenCollabStudio}
                    className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 hover:bg-[#1e2025] border border-emerald-800/80 transition text-left space-y-1 shadow-md shadow-emerald-950/40"
                  >
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      <span>Estudio Colaborativo Git</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Desarrollo de apps en vivo estilo Google Docs y control de versiones.
                    </p>
                  </button>
                )}

                {onOpenWorkspace && (
                  <button
                    onClick={onOpenWorkspace}
                    className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/90 via-slate-900 to-slate-900 hover:bg-[#1e2025] border border-purple-800/80 transition text-left space-y-1 shadow-md shadow-purple-950/40"
                  >
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Civer Dev Workspace</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Obsidian Notebook • Jira Kanban • Slack Channels.
                    </p>
                  </button>
                )}

                {onOpenAdminPanel && (
                  <button
                    onClick={onOpenAdminPanel}
                    className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-900 hover:bg-[#1e2025] border border-amber-800/80 transition text-left space-y-1 shadow-md shadow-amber-950/40"
                  >
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <Database className="w-4 h-4 text-amber-400" />
                      <span>Panel Admin Maestro</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Base de Datos 15+ cols • Web Scraper GitHub • Hub Multi-Versión.
                    </p>
                  </button>
                )}

                {onOpenChangelog && (
                  <button
                    onClick={onOpenChangelog}
                    className="p-3 rounded-2xl bg-[#111318] hover:bg-[#1e2025] border border-slate-800 transition text-left space-y-1"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <History className="w-4 h-4" />
                      <span>Registro de Cambios</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Historial completo de prompts, fases y roadmap.
                    </p>
                  </button>
                )}

                {onOpenProposals && (
                  <button
                    onClick={onOpenProposals}
                    className="p-3 rounded-2xl bg-[#111318] hover:bg-[#1e2025] border border-slate-800 transition text-left space-y-1"
                  >
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                      <Lightbulb className="w-4 h-4" />
                      <span>Sugerir Mejoras</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Envía propuestas analizadas por el agente IA.
                    </p>
                  </button>
                )}

                {onOpenArchitectureDocs && (
                  <button
                    onClick={onOpenArchitectureDocs}
                    className="p-3 rounded-2xl bg-[#111318] hover:bg-[#1e2025] border border-slate-800 transition text-left space-y-1"
                  >
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                      <Layers className="w-4 h-4" />
                      <span>Planos Modulares</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Especificaciones técnicas y flujos I/O.
                    </p>
                  </button>
                )}

                {onOpenRepoSync && (
                  <button
                    onClick={onOpenRepoSync}
                    className="p-3 rounded-2xl bg-[#111318] hover:bg-[#1e2025] border border-cyan-900/60 transition text-left space-y-1"
                  >
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                      <Zap className="w-4 h-4" />
                      <span>F-Droid Index V2</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Worker de sincronización en streaming.
                    </p>
                  </button>
                )}

                {onOpenBuildsHub && (
                  <button
                    onClick={onOpenBuildsHub}
                    className="p-3 rounded-2xl bg-gradient-to-br from-sky-950/80 via-slate-900 to-slate-900 hover:bg-[#1e2025] border border-sky-800/80 transition text-left space-y-1 shadow-md shadow-sky-950/40"
                  >
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                      <BarChart3 className="w-4 h-4 text-sky-400" />
                      <span>Gestor de Compilaciones</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Historial CI, evidencias SHA-256 y descarga de APKs.
                    </p>
                  </button>
                )}

                {onOpenKeystoreVault && (
                  <button
                    onClick={onOpenKeystoreVault}
                    className="p-3 rounded-2xl bg-[#111318] hover:bg-[#1e2025] border border-amber-900/60 transition text-left space-y-1"
                  >
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Bóveda de Llaves</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Firma de APKs con Scheme v1-v4 y RSA 4096.
                    </p>
                  </button>
                )}

                {onOpenSecurityAudit && (
                  <button
                    onClick={onOpenSecurityAudit}
                    className="p-3 rounded-2xl bg-[#111318] hover:bg-[#1e2025] border border-emerald-900/60 transition text-left space-y-1"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Auditoría Exodus</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Escaneo de rastreadores y firmas APK.
                    </p>
                  </button>
                )}

                {onOpenRepoManager && (
                  <button
                    onClick={onOpenRepoManager}
                    className="p-3 rounded-2xl bg-[#111318] hover:bg-[#1e2025] border border-sky-900/60 transition text-left space-y-1"
                  >
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                      <Zap className="w-4 h-4" />
                      <span>Gestor de Fuentes</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      F-Droid, IzzyOnDroid & Claves GPG.
                    </p>
                  </button>
                )}
              </div>
            </div>

            {/* Device Diagnostics & Shizuku Status (Interactive) */}
            <div 
              onClick={onOpenDiagnostics}
              className={`bg-[#1a1c22] rounded-3xl p-5 border border-slate-800 space-y-3 ${onOpenDiagnostics ? 'cursor-pointer hover:border-slate-700 transition' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Estado de Seguridad y Dispositivo</span>
                </h4>
                {onOpenDiagnostics && (
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 hover:underline">
                    Ver Telemetría Completa →
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-[#111318] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Modelo</span>
                  <span className="text-slate-200 font-bold">{deviceTelemetry.model}</span>
                </div>

                <div className="bg-[#111318] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Almacenamiento</span>
                  <span className="text-emerald-400 font-bold">{deviceTelemetry.storageUsedGb} / {deviceTelemetry.storageTotalGb} GB</span>
                </div>

                <div className="bg-[#111318] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Shizuku Daemon</span>
                  <span className="text-emerald-400 font-bold">Activo (ADB)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Batch Install Dock (Visible when in batch mode or apps selected) */}
      {(isBatchMode || selectedBatchAppIds.size > 0) && (
        <div className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-6 sm:w-auto z-40 animate-slide-up">
          <div className="bg-[#1e2025]/95 backdrop-blur-xl border-2 border-emerald-500/80 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xl shadow-emerald-950/80 flex flex-wrap items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {selectedBatchAppIds.size}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">
                  {selectedBatchAppIds.size} {selectedBatchAppIds.size === 1 ? 'app seleccionada' : 'apps seleccionadas'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Lista para instalación en lote Shizuku
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
              >
                Todas ({filteredApps.length})
              </button>

              {selectedBatchAppIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-xl bg-rose-950/60 border border-rose-900/60 transition"
                >
                  Limpiar
                </button>
              )}

              <button
                type="button"
                disabled={selectedBatchAppIds.size === 0}
                onClick={handleTriggerBatchInstall}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
                  selectedBatchAppIds.size > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 cursor-pointer animate-pulse'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Instalar Lote con Shizuku ({selectedBatchAppIds.size})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsBatchMode(false);
                  setSelectedBatchAppIds(new Set());
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Cerrar modo de selección"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar (Google Play Style - Screenshots 1-5) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#111318]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Games */}
          <button
            onClick={() => setBottomTab('GAMES')}
            className="flex flex-col items-center gap-1 group transition"
          >
            <div className={`px-4 py-1 rounded-full transition ${bottomTab === 'GAMES' ? 'bg-[#004a77] text-white' : 'text-slate-400'}`}>
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${bottomTab === 'GAMES' ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
              Juegos
            </span>
          </button>

          {/* Apps */}
          <button
            onClick={() => setBottomTab('APPS')}
            className="flex flex-col items-center gap-1 group transition"
          >
            <div className={`px-4 py-1 rounded-full transition ${bottomTab === 'APPS' ? 'bg-[#004a77] text-white' : 'text-slate-400'}`}>
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${bottomTab === 'APPS' ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
              Apps
            </span>
          </button>

          {/* Compiler CI */}
          <button
            onClick={() => setBottomTab('COMPILER')}
            className="flex flex-col items-center gap-1 group transition"
          >
            <div className={`px-4 py-1 rounded-full transition ${bottomTab === 'COMPILER' ? 'bg-[#004a77] text-white' : 'text-slate-400'}`}>
              <Cpu className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${bottomTab === 'COMPILER' ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
              Compilador CI
            </span>
          </button>

          {/* Dev Hub */}
          <button
            onClick={() => setBottomTab('DEV_HUB')}
            className="flex flex-col items-center gap-1 group transition"
          >
            <div className={`px-4 py-1 rounded-full transition ${bottomTab === 'DEV_HUB' ? 'bg-[#004a77] text-white' : 'text-slate-400'}`}>
              <Upload className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${bottomTab === 'DEV_HUB' ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
              Dev Hub
            </span>
          </button>

          {/* You / Tú */}
          <button
            onClick={() => setBottomTab('YOU')}
            className="flex flex-col items-center gap-1 group transition"
          >
            <div className={`px-4 py-1 rounded-full transition ${bottomTab === 'YOU' ? 'bg-[#004a77] text-white' : 'text-slate-400'}`}>
              <User className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${bottomTab === 'YOU' ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
              Tú
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
