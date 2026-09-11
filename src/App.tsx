import React, { useState, useMemo, useEffect, useRef } from 'react';
import { STORES_DATA } from './data/stores';
import { APPS_CATALOG } from './data/appsCatalogData';
import { INITIAL_BUILD_RUNS } from './data/buildHistoryData';
import { INITIAL_CHANGELOG } from './data/changelogData';
import { INITIAL_PROPOSALS } from './data/proposalsData';
import { MODULE_DOCS } from './data/moduleDocsData';
import { INITIAL_REVIEWS } from './data/reviewsData';
import { INITIAL_KEYSTORES } from './data/keystoresData';
import { INITIAL_CLONED_REPOS } from './data/clonedReposData';
import { 
  INITIAL_NOTEBOOK_DOCS, 
  INITIAL_JIRA_TASKS, 
  INITIAL_SLACK_CHANNELS, 
  INITIAL_SLACK_MESSAGES 
} from './data/workspaceData';
import { 
  AppStoreInfo, 
  StoreCategory, 
  StoreUiMode, 
  AppCatalogItem, 
  GitHubBuildRun, 
  UserProfile, 
  DeviceTelemetry,
  SystemChangelogEntry,
  SystemProposal,
  UserAppReview,
  NotebookDocument,
  JiraDevTask,
  SlackDevChannel,
  SlackDevMessage,
  KeystoreEntry,
  ClonedAppRepo
} from './types';
import { generateRandomHash, verifyGitHubToken } from './services/githubCiService';
import { Navbar, TabType } from './components/Navbar';
import { MatrixTableView } from './components/MatrixTableView';
import { CardsGridView } from './components/CardsGridView';
import { PerformanceBenchmarkView } from './components/PerformanceBenchmarkView';
import { ComparisonView } from './components/ComparisonView';
import { RecommenderQuizView } from './components/RecommenderQuizView';
import { EcosystemGuideView } from './components/EcosystemGuideView';
import { StoreDetailModal } from './components/StoreDetailModal';
import { ExportModal } from './components/ExportModal';

// Modals & Views
import { PlayStoreView } from './components/PlayStoreView';
import { AppStoreView } from './components/AppStoreView';
import { CiberDevWorkspaceView } from './components/CiberDevWorkspaceView';
import { ConnectedDevicesView } from './components/ConnectedDevicesView';
import { CiverWorkEcosystemView } from './components/CiverWorkEcosystemView';
import { AndroidAppEcosystemView } from './components/AndroidAppEcosystemView';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DeveloperSidebar } from './components/DeveloperSidebar';
import { GitHubCompilerModal } from './components/GitHubCompilerModal';
import { BuildsHubView } from './components/BuildsHubView';
import { ApkInstallerModal } from './components/ApkInstallerModal';
import { DeveloperPublishModal } from './components/DeveloperPublishModal';
import { AccountSettingsDrawer } from './components/AccountSettingsDrawer';
import { AppDetailModal } from './components/AppDetailModal';
import { ChangelogLedgerModal } from './components/ChangelogLedgerModal';
import { ProposalsHubModal } from './components/ProposalsHubModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { RepoIndexSyncModal } from './components/RepoIndexSyncModal';
import { DeltaPatchModal } from './components/DeltaPatchModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { CustomRepoManagerModal } from './components/CustomRepoManagerModal';
import { DeviceDiagnosticsModal } from './components/DeviceDiagnosticsModal';
import { KeystoreVaultModal } from './components/KeystoreVaultModal';
import { ToastNotificationCenter, ToastNotification } from './components/ToastNotificationCenter';
import { CommandPalette } from './components/CommandPalette';
import { DesignSystemSettings, FeatureFlagsConfig, FunctionalityPreset } from './types';
import { DEFAULT_DESIGN_SETTINGS, THEME_PROFILES } from './data/themeProfilesData';

import { ALL_FEATURES_ENABLED } from './data/functionalityProfilesData';
import { ThemeAndDesignProfileModal } from './components/ThemeAndDesignProfileModal';
import { FunctionalityProfilesModal } from './components/FunctionalityProfilesModal';
import { DexDecompilerModal } from './components/DexDecompilerModal';
import { GitDiffAndPatchModal } from './components/GitDiffAndPatchModal';
import { RuntimeSandboxInspectorModal } from './components/RuntimeSandboxInspectorModal';
import { NearbyTransferModal } from './components/NearbyTransferModal';
import { VisualDependencyGraphModal } from './components/VisualDependencyGraphModal';
import { LiveVisualCustomizerModal } from './components/LiveVisualCustomizerModal';
import { IntelligentResponsiveHUDModal } from './components/IntelligentResponsiveHUDModal';
import { VisualRegressionGalleryModal } from './components/VisualRegressionGalleryModal';
import { FluidityScoreAuditModal } from './components/FluidityScoreAuditModal';
import { ScreenInventoryNavigatorModal } from './components/ScreenInventoryNavigatorModal';
import { NetworkTrafficModal } from './components/NetworkTrafficModal';
import { NativeSilentInstallerModal } from './components/NativeSilentInstallerModal';
import { WorldClassInnovationsHubModal } from './components/WorldClassInnovationsHubModal';
import { WebAuthnHsmSignerModal } from './components/WebAuthnHsmSignerModal';
import { ZeroKnowledgeBackupModal } from './components/ZeroKnowledgeBackupModal';
import { LightningDonationsModal } from './components/LightningDonationsModal';
import { WebAdbPhysicalInstallerModal } from './components/WebAdbPhysicalInstallerModal';
import { AntiFeaturesAuditModal } from './components/AntiFeaturesAuditModal';
import { WasmPluginsManagerModal } from './components/WasmPluginsManagerModal';
import { OfflinePwaDiagnosticsModal } from './components/OfflinePwaDiagnosticsModal';
import { CiverResilienceFailoverModal } from './components/CiverResilienceFailoverModal';
import { CiverAuthSessionModal } from './components/CiverAuthSessionModal';
import { CrossDeviceSyncModal } from './components/CrossDeviceSyncModal';
import { SocialChatCommunityModal } from './components/SocialChatCommunityModal';
import { CollaborativeAppStudioModal } from './components/CollaborativeAppStudioModal';
import { ArchitectureBlueprintModal } from './components/ArchitectureBlueprintModal';
import { AgentAcademyModal } from './components/AgentAcademyModal';
import { AgentOrchestratorHubModal } from './components/AgentOrchestratorHubModal';
import { AgentTechnicalDocsModal } from './components/AgentTechnicalDocsModal';
import { AgentCommunicationDebuggerModal } from './components/AgentCommunicationDebuggerModal';
import { AgentAPIExplorerModal } from './components/AgentAPIExplorerModal';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { ResponsiveViewportToolbar, PresetViewport } from './components/ResponsiveViewportToolbar';
import { MobileBottomDock } from './components/MobileBottomDock';
import { SourceCodeUploadModal } from './components/SourceCodeUploadModal';
import { CloudMobileTestingStudioModal } from './components/CloudMobileTestingStudioModal';
import { sourceUploadService } from './services/sourceUploadService';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminMasterCatalogView } from './components/AdminMasterCatalogView';
import { OtaReleaseManagementModal } from './components/OtaReleaseManagementModal';
import { CiCdEvidenceMatrixModal } from './components/CiCdEvidenceMatrixModal';

export const App: React.FC = () => {

  // Responsive Layout & Mobile Drawer States
  const responsiveLayout = useResponsiveLayout();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeViewportPreset, setActiveViewportPreset] = useState<PresetViewport>('fluid');
  const [viewportScaleFactor, setViewportScaleFactor] = useState(1);
  const [isViewportToolbarExpanded, setIsViewportToolbarExpanded] = useState(false);
  const [isViewportToolbarVisible, setIsViewportToolbarVisible] = useState(false);
  const [isLiveCustomizerOpen, setIsLiveCustomizerOpen] = useState(false);
  const [isResponsiveHUDOpen, setIsResponsiveHUDOpen] = useState(false);

  // Viewport Sweep Simulation, Heatmap, Stress Test & Grid Debug Mode States
  const [simulatedWidth, setSimulatedWidth] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isGridDebug, setIsGridDebug] = useState(false);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [isStressTestActive, setIsStressTestActive] = useState(false);
  const [stressTestLevel, setStressTestLevel] = useState<'mild' | 'heavy' | 'extreme'>('heavy');

  // Modals for Testing Suite & Screen Inventory Map
  const [isVisualRegressionModalOpen, setIsVisualRegressionModalOpen] = useState(false);
  const [isFluidityAuditModalOpen, setIsFluidityAuditModalOpen] = useState(false);
  const [isScreenInventoryModalOpen, setIsScreenInventoryModalOpen] = useState(false);
  const sweepDirectionRef = React.useRef<'expand' | 'shrink'>('expand');

  // Sweep animation runner
  useEffect(() => {
    if (!isSimulating) return;

    let animFrameId: number;
    let lastTimestamp = performance.now();

    const sweep = (currentTimestamp: number) => {
      const deltaMs = currentTimestamp - lastTimestamp;
      lastTimestamp = currentTimestamp;

      setSimulatedWidth((prev) => {
        const current = prev !== null ? prev : 320;
        // Base speed is ~180px per second at 1x
        const step = (180 * simulationSpeed * deltaMs) / 1000;

        if (sweepDirectionRef.current === 'expand') {
          const next = current + step;
          if (next >= 1440) {
            sweepDirectionRef.current = 'shrink';
            return 1440;
          }
          return next;
        } else {
          const next = current - step;
          if (next <= 320) {
            sweepDirectionRef.current = 'expand';
            return 320;
          }
          return next;
        }
      });

      animFrameId = requestAnimationFrame(sweep);
    };

    animFrameId = requestAnimationFrame(sweep);
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isSimulating, simulationSpeed]);

  // UI Display Mode (Civer App Store, Workspace, App Store, Matrix Pro, Builds Hub)
  const [uiMode, setUiMode] = useState<StoreUiMode>('ciber_store');

  // Matrix Pro Tab State
  const [currentTab, setCurrentTab] = useState<TabType>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>('ALL');
  const [selectedStoreForDetail, setSelectedStoreForDetail] = useState<AppStoreInfo | null>(null);
  const [compareList, setCompareList] = useState<AppStoreInfo[]>([
    STORES_DATA[0], // Droid-ify
    STORES_DATA[1], // Aurora Store
    STORES_DATA[2]  // Obtainium
  ]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // App Catalog & Cloud CI State
  const [catalog, setCatalog] = useState<AppCatalogItem[]>(APPS_CATALOG);
  const [buildHistory, setBuildHistory] = useState<GitHubBuildRun[]>(INITIAL_BUILD_RUNS);
  const [installedAppIds, setInstalledAppIds] = useState<string[]>(['droid-ify', 'obtainium']);
  const [isSourceUploadOpen, setIsSourceUploadOpen] = useState(false);
  const [isCloudTestingOpen, setIsCloudTestingOpen] = useState(false);
  const [cloudTestingTargetApp, setCloudTestingTargetApp] = useState<AppCatalogItem | null>(null);

  const handleOpenCloudTesting = (app?: AppCatalogItem) => {
    setCloudTestingTargetApp(app || null);
    setIsCloudTestingOpen(true);
  };

  // Initialize user uploaded apps or seed OmniComm Hub sample from downloads
  useEffect(() => {
    const savedUserApps = sourceUploadService.getUserUploadedApps();
    if (savedUserApps.length > 0) {
      setCatalog((prev) => {
        const ids = new Set(prev.map((a) => a.id));
        const newApps = savedUserApps.filter((a) => !ids.has(a.id));
        return [...newApps, ...prev];
      });
    } else {
      const sample = sourceUploadService.getSampleOmniCommHubApp();
      sourceUploadService.saveUserUploadedApp(sample);
      setCatalog((prev) => [sample, ...prev]);
    }
  }, []);

  // Keystore Vault & Cloned Repos State
  const [keystores, setKeystores] = useState<KeystoreEntry[]>(INITIAL_KEYSTORES);
  const [selectedKeyId, setSelectedKeyId] = useState<string>(INITIAL_KEYSTORES[0].id);
  const [clonedRepos, setClonedRepos] = useState<Record<string, ClonedAppRepo>>(INITIAL_CLONED_REPOS);
  const [isBuildsHubModalOpen, setIsBuildsHubModalOpen] = useState(false);

  // Global Toast Notifications & Command Palette
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAndroidInstallModalOpen, setIsAndroidInstallModalOpen] = useState(false);

  const handleAddToast = (newToast: Omit<ToastNotification, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const toastItem: ToastNotification = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...newToast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    setToasts((prev) => [toastItem, ...prev]);
  };

  // Admin Root Access & Scraped Apps State
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('civer_admin_auth') === 'true';
  });

  // Load scraped apps from localStorage on boot
  useEffect(() => {
    try {
      const raw = localStorage.getItem('civer_admin_scraped_apps');
      if (raw) {
        const scraped: AppCatalogItem[] = JSON.parse(raw);
        if (Array.isArray(scraped) && scraped.length > 0) {
          setCatalog(prev => {
            const ids = new Set(prev.map(a => a.id));
            const fresh = scraped.filter(a => !ids.has(a.id));
            return [...fresh, ...prev];
          });
        }
      }
    } catch (e) {
      console.warn('Error cargando apps escaneadas de localStorage:', e);
    }
  }, []);

  const handleAddScrapedApp = (newApp: AppCatalogItem) => {
    setCatalog(prev => {
      const filtered = prev.filter(a => a.id !== newApp.id);
      const updated = [newApp, ...filtered];
      try {
        const existingRaw = localStorage.getItem('civer_admin_scraped_apps');
        const existing: AppCatalogItem[] = existingRaw ? JSON.parse(existingRaw) : [];
        const nextList = [newApp, ...existing.filter(a => a.id !== newApp.id)];
        localStorage.setItem('civer_admin_scraped_apps', JSON.stringify(nextList));
      } catch (err) {
        console.warn('Error guardando app escaneada en localStorage:', err);
      }
      return updated;
    });

    handleAddToast({
      title: 'Aplicación Integrada en DB',
      message: `${newApp.name} (${newApp.version}) agregada al catálogo maestro de Civer App Store.`,
      type: 'success'
    });
  };

  const handleOpenAdminPanel = () => {
    if (isAdminAuthenticated) {
      setUiMode('admin_catalog_matrix');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('civer_admin_auth', 'true');
    setIsAdminAuthModalOpen(false);
    setUiMode('admin_catalog_matrix');
    handleAddToast({
      title: 'Acceso de Administrador Concedido',
      message: 'Autenticado con éxito con credenciales Root/Maintainer.',
      type: 'success'
    });
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('civer_admin_auth');
    setUiMode('ciber_store');
    handleAddToast({
      title: 'Sesión Admin Cerrada',
      message: 'Has salido del modo administrador.',
      type: 'info'
    });
  };

  const handleCloseToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleActionToast = (toast: ToastNotification) => {
    if (toast.type === 'build' && toast.buildRun) {
      if (toast.buildRun.status === 'completed' && toast.buildRun.apkDownloadUrl) {
        // Find matching app or create dummy catalog item to trigger install
        const matchedApp = catalog.find((a) => a.id === toast.buildRun?.appId || a.name === toast.buildRun?.appName);
        if (matchedApp) {
          setInstallerApp(matchedApp);
          setIsInstallerOpen(true);
        }
      } else {
        setIsCompilerOpen(true);
      }
    }
  };

  // Keyboard shortcut for Command Palette (Ctrl+K / Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Governance & Lifecycle State (Changelog, Proposals, Reviews)
  const [changelogEntries, setChangelogEntries] = useState<SystemChangelogEntry[]>(INITIAL_CHANGELOG);
  const [proposals, setProposals] = useState<SystemProposal[]>(INITIAL_PROPOSALS);
  const [reviews, setReviews] = useState<UserAppReview[]>(INITIAL_REVIEWS);

  // Collaborative Developer Workspace State (Obsidian Notes, Jira Tasks, Slack Channels)
  const [notebookDocs, setNotebookDocs] = useState<NotebookDocument[]>(INITIAL_NOTEBOOK_DOCS);
  const [devTasks, setDevTasks] = useState<JiraDevTask[]>(INITIAL_JIRA_TASKS);
  const [slackChannels, setSlackChannels] = useState<SlackDevChannel[]>(INITIAL_SLACK_CHANNELS);
  const [slackMessages, setSlackMessages] = useState<SlackDevMessage[]>(INITIAL_SLACK_MESSAGES);

  // User & Device Telemetry
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Oscar Manuel',
    email: 'civer.team.cloud@gmail.com',
    avatarLetter: 'O',
    avatarBg: 'bg-emerald-600',
    playPoints: 0,
    playPointsTier: 'Bronce',
    githubPat: 'ghp_live_ci_actions_auth_token_foss',
    githubUsername: 'oscar-manuel',
    customRepos: [],
    wishlist: [],
    installedAppIds: ['droid-ify', 'obtainium']
  });

  const [deviceTelemetry, setDeviceTelemetry] = useState<DeviceTelemetry>({
    model: 'Xiaomi 14 Ultra (HyperOS)',
    brand: 'Xiaomi',
    androidVersion: 'Android 15 (API 35)',
    apiLevel: 35,
    storageTotalGb: 128,
    storageUsedGb: 44.2,
    ramTotalGb: 12,
    ramUsedGb: 4.8,
    cpuCores: 8,
    shizukuRunning: true,
    playProtectEnabled: true,
    unknownSourcesEnabled: true,
    connectionSpeedKbps: 45000
  });

  // Modal Visibility States
  const [isCompilerOpen, setIsCompilerOpen] = useState(false);
  const [compilerApp, setCompilerApp] = useState<AppCatalogItem | null>(null);

  const [isInstallerOpen, setIsInstallerOpen] = useState(false);
  const [installerApp, setInstallerApp] = useState<AppCatalogItem | null>(null);
  const [installerAppsQueue, setInstallerAppsQueue] = useState<AppCatalogItem[] | null>(null);

  // Real-Time Network Traffic & Sinkhole Modal State
  const [isNetworkTrafficOpen, setIsNetworkTrafficOpen] = useState(false);
  const [networkTrafficApp, setNetworkTrafficApp] = useState<AppCatalogItem | null>(null);

  // Offline Connection Detector & Cached Mode
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      handleAddToast({
        title: 'Conexión Restablecida',
        message: 'Acceso completo a repositorios remotos y telemetría en tiempo real.',
        type: 'success'
      });
    };
    const handleOffline = () => {
      setIsOfflineMode(true);
      handleAddToast({
        title: 'Modo Caché Offline Activado',
        message: 'Sin conexión a internet. Mostrando APKs en caché local, repositorios clonados y documentación sin conexión.',
        type: 'warning'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [isPublisherOpen, setIsPublisherOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<AppCatalogItem | null>(null);

  // Cross-Device Fleet Sync, Social Chat & Real-Time Collab Studio States
  const [isCrossDeviceSyncOpen, setIsCrossDeviceSyncOpen] = useState(false);
  const [crossDeviceTargetApp, setCrossDeviceTargetApp] = useState<AppCatalogItem | undefined>(undefined);
  const [isSocialChatOpen, setIsSocialChatOpen] = useState(false);
  const [socialChatSharedApp, setSocialChatSharedApp] = useState<AppCatalogItem | undefined>(undefined);
  const [isCollabStudioOpen, setIsCollabStudioOpen] = useState(false);

  // Governance Modals
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isProposalsOpen, setIsProposalsOpen] = useState(false);
  const [isArchitectureDocsOpen, setIsArchitectureDocsOpen] = useState(false);
  const [isRepoSyncOpen, setIsRepoSyncOpen] = useState(false);
  const [isArchitectureBlueprintOpen, setIsArchitectureBlueprintOpen] = useState(false);
  const [isAgentAcademyOpen, setIsAgentAcademyOpen] = useState(false);
  const [isAgentOrchestratorOpen, setIsAgentOrchestratorOpen] = useState(false);
  const [isAgentDocsOpen, setIsAgentDocsOpen] = useState(false);
  const [isAgentDebuggerOpen, setIsAgentDebuggerOpen] = useState(false);
  const [isAgentAPIExplorerOpen, setIsAgentAPIExplorerOpen] = useState(false);
  const [isDeltaPatchOpen, setIsDeltaPatchOpen] = useState(false);
  const [deltaPatchApp, setDeltaPatchApp] = useState<AppCatalogItem | null>(null);

  // Security, Decentralized Repos & Hardware Telemetry Modals
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);
  const [securityAuditApp, setSecurityAuditApp] = useState<AppCatalogItem | null>(null);
  const [isRepoManagerOpen, setIsRepoManagerOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isKeystoreVaultOpen, setIsKeystoreVaultOpen] = useState(false);
  const [isOtaModalOpen, setIsOtaModalOpen] = useState(false);
  const [isCiCdEvidenceOpen, setIsCiCdEvidenceOpen] = useState(false);

  // Design & Theme Profiles (8 Palettes, Density, Radius - Non-Destructive)
  const [designSettings, setDesignSettings] = useState<DesignSystemSettings>(() => {
    try {
      const saved = localStorage.getItem('ciber_design_settings');
      return saved ? JSON.parse(saved) : DEFAULT_DESIGN_SETTINGS;
    } catch {
      return DEFAULT_DESIGN_SETTINGS;
    }
  });
  const [isDesignProfilesOpen, setIsDesignProfilesOpen] = useState(false);

  // Functionality Profiles & 16 Granular Feature Flags (Non-Destructive)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagsConfig>(() => {
    try {
      const saved = localStorage.getItem('ciber_feature_flags');
      return saved ? JSON.parse(saved) : ALL_FEATURES_ENABLED;
    } catch {
      return ALL_FEATURES_ENABLED;
    }
  });
  const [activeFunctionalityPreset, setActiveFunctionalityPreset] = useState<FunctionalityPreset>('FULL_POWER_DEV');
  const [isFunctionalityProfilesOpen, setIsFunctionalityProfilesOpen] = useState(false);

  // New Master 5-Area States (Non-Destructive)
  const [isDexDecompilerOpen, setIsDexDecompilerOpen] = useState(false);
  const [dexTargetApp, setDexTargetApp] = useState<{ packageId: string; name: string }>({
    packageId: 'org.civerappstore.app',
    name: 'Civer App Store PRO'
  });

  const [isGitPatchOpen, setIsGitPatchOpen] = useState(false);

  const [isRuntimeSandboxOpen, setIsRuntimeSandboxOpen] = useState(false);
  const [sandboxTargetApp, setSandboxTargetApp] = useState<{ packageId: string; name: string }>({
    packageId: 'org.civerappstore.app',
    name: 'Civer App Store PRO'
  });

  const [isNearbyTransferOpen, setIsNearbyTransferOpen] = useState(false);
  const [isArchitectureGraphOpen, setIsArchitectureGraphOpen] = useState(false);

  // Native Silent 1-Click Installer & 30 World-Class Innovations Modals
  const [isSilentInstallerOpen, setIsSilentInstallerOpen] = useState(false);
  const [isInnovationsHubOpen, setIsInnovationsHubOpen] = useState(false);

  // Community Proposals & New Innovations Modals
  const [isWebAuthnHsmOpen, setIsWebAuthnHsmOpen] = useState(false);
  const [isZeroKnowledgeBackupOpen, setIsZeroKnowledgeBackupOpen] = useState(false);
  const [isLightningDonationsOpen, setIsLightningDonationsOpen] = useState(false);
  const [isWebAdbPhysicalOpen, setIsWebAdbPhysicalOpen] = useState(false);
  const [isAntiFeaturesAuditOpen, setIsAntiFeaturesAuditOpen] = useState(false);
  const [isWasmPluginsOpen, setIsWasmPluginsOpen] = useState(false);
  const [isOfflinePwaDiagnosticsOpen, setIsOfflinePwaDiagnosticsOpen] = useState(false);
  const [isFailoverModalOpen, setIsFailoverModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleInstallAppSilently = (app: AppCatalogItem) => {
    setUserProfile((prev) => ({
      ...prev,
      installedAppIds: prev.installedAppIds.includes(app.id)
        ? prev.installedAppIds
        : [...prev.installedAppIds, app.id]
    }));
    handleAddToast({
      title: '¡Instalación 1-Click Completada!',
      message: `${app.name} (v${app.version}) se instaló en segundo plano con cero diálogos ni confirmaciones.`,
      type: 'success'
    });
  };

  const handleUpdateDesignSettings = (updated: Partial<DesignSystemSettings>) => {
    setDesignSettings((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('ciber_design_settings', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleUpdateFeatureFlags = (updated: Partial<FeatureFlagsConfig>) => {
    setFeatureFlags((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('ciber_feature_flags', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };


  // Filtered stores for Matrix Pro
  const filteredStores = useMemo(() => {
    return STORES_DATA.filter((store) => {
      const matchesCategory = selectedCategory === 'ALL' || store.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        store.name.toLowerCase().includes(q) ||
        store.tagline.toLowerCase().includes(q) ||
        store.keyDifferentiator.toLowerCase().includes(q) ||
        store.techStack.uiArchitecture.toLowerCase().includes(q) ||
        store.techStack.primaryLanguage.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleToggleCompare = (store: AppStoreInfo) => {
    setCompareList((prev) => {
      const exists = prev.some((s) => s.id === store.id);
      if (exists) {
        return prev.filter((s) => s.id !== store.id);
      } else {
        return [...prev, store];
      }
    });
  };

  // App Actions
  const handleSelectApp = (app: AppCatalogItem) => {
    setSelectedAppForDetail(app);
  };

  const handleTriggerInstall = (app: AppCatalogItem) => {
    setInstallerAppsQueue(null);
    setInstallerApp(app);
    setIsInstallerOpen(true);
  };

  const handleTriggerBatchInstall = (apps: AppCatalogItem[]) => {
    if (!apps || apps.length === 0) return;
    setInstallerAppsQueue(apps);
    setInstallerApp(apps[0]);
    setIsInstallerOpen(true);
  };

  const handleTriggerCompile = (app: AppCatalogItem) => {
    setCompilerApp(app);
    setIsCompilerOpen(true);
  };

  const handleAppInstalledSuccess = (appId: string) => {
    if (!installedAppIds.includes(appId)) {
      setInstalledAppIds((prev) => [...prev, appId]);
    }
  };

  const handleNewBuildCreated = (newBuild: GitHubBuildRun) => {
    setBuildHistory((prev) => [newBuild, ...prev]);

    // Dispatch real-time toast notification
    const isSuccess = newBuild.status === 'completed';
    handleAddToast({
      title: isSuccess ? `Compilación Exitosa: ${newBuild.appName}` : `Fallo en Compilación: ${newBuild.appName}`,
      message: isSuccess
        ? `APK versión ${newBuild.versionTag} compilado y firmado correctamente con [${newBuild.signingKeyAlias || 'ciber-release-key'}].`
        : `Ocurrió un error durante el workflow de GitHub Actions: ${newBuild.currentStep}`,
      type: isSuccess ? 'build' : 'error',
      buildRun: newBuild,
      actionLabel: isSuccess ? 'Instalar APK' : 'Ver Logs',
      autoCloseDelayMs: 9000
    });
  };

  const handleAppPublished = (newApp: AppCatalogItem) => {
    setCatalog((prev) => [newApp, ...prev]);
  };

  const handleAppRegisteredFromSource = (newApp: AppCatalogItem, autoCompile?: boolean) => {
    setCatalog((prev) => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
    handleAddToast({
      title: 'Proyecto Open Source Registrado',
      message: `${newApp.name} (${newApp.packageName}) añadido con éxito a "Mis Aplicaciones".`,
      type: 'success'
    });

    if (autoCompile) {
      handleTriggerCompile(newApp);
    }
  };

  // Local Repository Cloning
  const handleCloneRepoLocally = (app: AppCatalogItem) => {
    const existing = clonedRepos[app.id];
    const updatedRepo: ClonedAppRepo = existing ? {
      ...existing,
      lastSyncedAt: 'Justo ahora',
      syncStatus: 'synced',
      uncommittedChangesCount: 0
    } : {
      appId: app.id,
      appName: app.name,
      packageName: app.packageName,
      repoUrl: app.githubUrl,
      branch: app.defaultBranch || 'main',
      commitHash: generateRandomHash(7),
      clonedAt: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastSyncedAt: 'Justo ahora',
      localPath: `/storage/emulated/0/CiberDev/src/${app.id}`,
      sizeMb: Math.round((app.apkSizeMb * 1.6) * 10) / 10,
      filesCount: Math.floor(Math.random() * 200 + 250),
      syncStatus: 'synced',
      uncommittedChangesCount: 0,
      networkPreference: 'WIFI_ONLY'
    };

    setClonedRepos((prev) => ({
      ...prev,
      [app.id]: updatedRepo
    }));

    handleAddToast({
      title: existing ? 'Repositorio Sincronizado' : 'Repositorio Clonado al Dispositivo',
      message: `${app.name} (${app.githubUrl}) almacenado en /storage/emulated/0/CiberDev/src/${app.id}`,
      type: 'success'
    });
  };

  const handleSyncClonedRepo = (appId: string) => {
    setClonedRepos((prev) => {
      const existing = prev[appId];
      if (!existing) return prev;
      return {
        ...prev,
        [appId]: {
          ...existing,
          lastSyncedAt: 'Justo ahora',
          syncStatus: 'synced',
          uncommittedChangesCount: 0
        }
      };
    });

    handleAddToast({
      title: 'Sincronización Git Completada',
      message: `Código fuente de ${appId} actualizado con la rama upstream de GitHub.`,
      type: 'success'
    });
  };

  const handleVerifyGitHubPat = async (token?: string) => {
    const pat = token || userProfile.githubPat;
    const res = await verifyGitHubToken(pat);
    if (res.valid) {
      handleAddToast({
        title: 'GitHub PAT Verificado',
        message: `Conectado como @${res.user} • Scopes: ${res.scopes.slice(0, 3).join(', ')} • Rate Limit: ${res.rateLimit.remaining}/${res.rateLimit.limit}`,
        type: 'success'
      });
    } else {
      handleAddToast({
        title: 'Error de Verificación GitHub',
        message: res.error || 'Token no válido',
        type: 'error'
      });
    }
  };

  // Proposals Handlers
  const handleAddProposal = (newProposal: SystemProposal) => {
    setProposals((prev) => [newProposal, ...prev]);
  };

  const handleVoteProposal = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const hasVoted = p.userHasVoted;
          return {
            ...p,
            userHasVoted: !hasVoted,
            priorityVotes: hasVoted ? p.priorityVotes - 1 : p.priorityVotes + 1
          };
        }
        return p;
      })
    );
  };

  // Reviews Handler
  const handleAddReview = (newReview: UserAppReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  // Workspace Promotion & Message Handlers
  const handlePromoteTaskToChangelog = (task: JiraDevTask) => {
    const newEntry: SystemChangelogEntry = {
      iterationNumber: changelogEntries.length + 1,
      title: `[Workspace Deploy]: ${task.title}`,
      promptSummary: `Promovido desde el Workspace Jira: "${task.title}". ${task.description}`,
      requestDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      author: userProfile.name,
      executiveSummary: `Despliegue verificado del ticket ${task.key} a la infraestructura de Civer App Store.`,
      architecturePhases: [
        { phaseNumber: 1, name: 'Planeación en Obsidian / Jira', description: 'Especificación y asignación de tickets', status: 'COMPLETED', keyDeliverables: ['Doc en Obsidian', 'Ticket Jira'] },
        { phaseNumber: 2, name: 'Validación en Slack', description: 'Revisión por pares del equipo core', status: 'COMPLETED', keyDeliverables: ['Aprobación en canal dev'] },
        { phaseNumber: 3, name: 'Despliegue a Civer App Store', description: 'Verificación e integración en producción', status: 'COMPLETED', keyDeliverables: ['Código compilado', 'Cero telemetría'] }
      ],
      implementedFeatures: [
        {
          id: `feat-${Date.now()}`,
          title: task.title,
          category: task.type,
          description: task.description,
          status: 'VERIFIED',
          module: task.tags[0] || 'Civer Core Engine',
          verifiedDate: new Date().toISOString().split('T')[0]
        }
      ],
      pendingRoadmap: [
        {
          id: `pending-${Date.now()}`,
          title: 'Monitoreo de telemetría cero en producción',
          priority: 'HIGH',
          targetIteration: `Iteración #${changelogEntries.length + 2}`,
          description: 'Asegurar que no se filtren endpoints de telemetría de terceros.',
          technicalRequirements: ['Auditoría eBPF de tráfico de red', 'Verificación de firmas Ed25519']
        }
      ],
      architecturalImpact: `Integración del ticket ${task.key} en la arquitectura de Civer App Store.`,
      modulesAffected: task.tags.length > 0 ? task.tags : ['Civer App Store Core']
    };

    setChangelogEntries((prev) => [newEntry, ...prev]);
    setDevTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'DONE' as const } : t))
    );
  };

  const handleSendSlackMessage = (msg: SlackDevMessage) => {
    setSlackMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-emerald-950 selection:text-emerald-300 font-sans relative">
      
      {/* GLOBAL DEVELOPER SIDEBAR (Desktop Sticky Aside + Mobile Drawer) */}
      <DeveloperSidebar
        currentMode={uiMode}
        onSwitchMode={(mode) => {
          setUiMode(mode);
          setIsMobileSidebarOpen(false);
        }}
        onOpenCompiler={() => {
          setCompilerApp(null);
          setIsCompilerOpen(true);
        }}
        onOpenShizukuInstaller={() => {
          setInstallerApp(catalog[0]);
          setIsInstallerOpen(true);
        }}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenProposals={() => setIsProposalsOpen(true)}
        onOpenArchitectureDocs={() => setIsArchitectureDocsOpen(true)}
        onOpenRepoSync={() => setIsRepoSyncOpen(true)}
        onOpenAccountDrawer={() => setIsAccountDrawerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSecurityAudit={() => {
          setSecurityAuditApp(null);
          setIsSecurityAuditOpen(true);
        }}
        onOpenRepoManager={() => setIsRepoManagerOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenBuildsHub={() => setIsBuildsHubModalOpen(true)}
        onOpenKeystoreVault={() => setIsKeystoreVaultOpen(true)}
        onOpenOtaReleases={() => setIsOtaModalOpen(true)}
        onOpenDesignProfiles={() => setIsDesignProfilesOpen(true)}
        onOpenFunctionalityProfiles={() => setIsFunctionalityProfilesOpen(true)}
        onOpenDexDecompiler={() => setIsDexDecompilerOpen(true)}
        onOpenGitPatch={() => setIsGitPatchOpen(true)}
        onOpenRuntimeSandbox={() => setIsRuntimeSandboxOpen(true)}
        onOpenNearbyTransfer={() => setIsNearbyTransferOpen(true)}
        onOpenArchitectureGraph={() => setIsArchitectureGraphOpen(true)}
        onOpenWebAuthnHsm={() => setIsWebAuthnHsmOpen(true)}
        onOpenZeroKnowledgeBackup={() => setIsZeroKnowledgeBackupOpen(true)}
        onOpenLightningDonations={() => setIsLightningDonationsOpen(true)}
        onOpenWebAdbPhysical={() => setIsWebAdbPhysicalOpen(true)}
        onOpenAntiFeaturesAudit={() => setIsAntiFeaturesAuditOpen(true)}
        onOpenWasmPlugins={() => setIsWasmPluginsOpen(true)}
        onOpenOfflinePwaDiagnostics={() => setIsOfflinePwaDiagnosticsOpen(true)}
        onOpenFailoverTelemetry={() => setIsFailoverModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLiveCustomizer={() => setIsLiveCustomizerOpen(true)}
        onOpenResponsiveHUD={() => setIsResponsiveHUDOpen(true)}
        onToggleViewportToolbar={() => setIsViewportToolbarVisible((prev) => !prev)}
        isViewportToolbarVisible={isViewportToolbarVisible}
        isSimulating={isSimulating}
        onToggleSimulation={() => {
          if (!isSimulating && simulatedWidth === null) {
            setSimulatedWidth(320);
          }
          setIsSimulating((prev) => !prev);
        }}
        isGridDebug={isGridDebug}
        onToggleGridDebug={() => setIsGridDebug((prev) => !prev)}
        isHeatmapMode={isHeatmapMode}
        onToggleHeatmapMode={() => setIsHeatmapMode((prev) => !prev)}
        isStressTestActive={isStressTestActive}
        onToggleStressTest={() => setIsStressTestActive((prev) => !prev)}
        onOpenVisualRegression={() => setIsVisualRegressionModalOpen(true)}
        onOpenFluidityScore={() => setIsFluidityAuditModalOpen(true)}
        onOpenScreenInventory={() => setIsScreenInventoryModalOpen(true)}
        onOpenCrossDeviceSync={() => {
          setCrossDeviceTargetApp(undefined);
          setIsCrossDeviceSyncOpen(true);
        }}
        onOpenSocialChat={() => {
          setSocialChatSharedApp(undefined);
          setIsSocialChatOpen(true);
        }}
        onOpenCollabStudio={() => setIsCollabStudioOpen(true)}
        userProfile={userProfile}
        activeBuildCount={buildHistory.filter((b) => b.status === 'in_progress').length}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Dynamic Container with Max-W and MX-Auto Fluidity + Elementor Live Customizer Styles + Viewport Simulation Frame) */}
      <div 
        className={`flex-1 flex flex-col min-w-0 overflow-x-hidden w-full mx-auto pb-16 md:pb-0 ${
          isSimulating ? 'transition-none' : 'transition-all duration-200'
        } ${isGridDebug ? 'grid-debug-active' : ''} ${isHeatmapMode ? 'heatmap-mode-active' : ''} ${isStressTestActive ? 'stress-test-active' : ''} ${simulatedWidth !== null ? 'viewport-simulation-frame bg-slate-950/95 my-2 rounded-2xl border border-sky-500/40 shadow-2xl' : ''}`}
        style={{
          width: simulatedWidth !== null ? `${Math.min(simulatedWidth, window.innerWidth || 1440)}px` : '100%',
          maxWidth: simulatedWidth !== null ? `${simulatedWidth}px` : designSettings.containerMaxWidth === 'fluid' ? '100%' : `${designSettings.customMaxWidthPx || 1440}px`,
          fontSize: `${((designSettings.fontScalingPercent || 100) / 100) * (designSettings.baseFontSizePx || 15)}px`,
          lineHeight: designSettings.lineHeightRatio || 1.5,
          letterSpacing: designSettings.letterSpacingMode === 'tight' ? '-0.025em' : designSettings.letterSpacingMode === 'wide' ? '0.035em' : 'normal',
          paddingLeft: `${designSettings.contentPaddingPx ? Math.max(0, designSettings.contentPaddingPx - 16) : 0}px`,
          paddingRight: `${designSettings.contentPaddingPx ? Math.max(0, designSettings.contentPaddingPx - 16) : 0}px`
        }}
      >
        {/* Simulation Mode Top Telemetry Banner */}
        {simulatedWidth !== null && (
          <div className="bg-sky-950/90 border-b border-sky-800/80 text-sky-200 px-3 py-1.5 flex items-center justify-between text-xs font-mono shadow-sm sticky top-0 z-30 backdrop-blur-md">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
              <span className="font-bold text-sky-100">SIMULANDO: {Math.round(simulatedWidth)}px</span>
              <span className="text-slate-400 hidden xs:inline">• Breakpoint:</span>
              <span className="px-2 py-0.5 rounded bg-sky-900 text-sky-200 font-bold border border-sky-700">
                {simulatedWidth >= 1536 ? '2XL (≥1536px)' : simulatedWidth >= 1280 ? 'XL (≥1280px)' : simulatedWidth >= 1024 ? 'LG (≥1024px)' : simulatedWidth >= 768 ? 'MD (≥768px)' : simulatedWidth >= 640 ? 'SM (≥640px)' : 'XS (<640px)'}
              </span>
              {isSimulating && (
                <span className="text-[10px] text-emerald-400 animate-pulse font-sans font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  ⚡ Barrido Activo ({simulationSpeed}x)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-2 py-1 rounded text-[11px] font-sans font-semibold transition ${
                  isSimulating ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSimulating ? 'Pausar' : 'Reanudar'}
              </button>
              <button
                onClick={() => {
                  setIsSimulating(false);
                  setSimulatedWidth(null);
                  setActiveViewportPreset('fluid');
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white text-[11px] font-sans font-semibold transition"
              >
                Salir
              </button>
            </div>
          </div>
        )}

        {/* Grid Debug Banner */}
        {isGridDebug && (
          <div className="bg-amber-950/90 border-b border-amber-800/80 text-amber-200 px-3 py-1 flex items-center justify-between text-[11px] font-mono sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="font-bold text-amber-100">MODO GRID DEBUG:</span>
              <span className="text-amber-300/80 text-[10px] hidden sm:inline">
                Verde: Contenedores • Cian: Grillas • Ámbar: Tarjetas • Púrpura: Headers • Rosa: Botones
              </span>
            </div>
            <button
              onClick={() => setIsGridDebug(false)}
              className="text-[10px] text-amber-300 hover:text-white underline font-sans"
            >
              Desactivar Debug
            </button>
          </div>
        )}
        {/* 1. CIVER DEV WORKSPACE MODE (Obsidian • Jira • Slack • Vision) */}
        {uiMode === 'dev_workspace' && (
          <CiberDevWorkspaceView
            userProfile={userProfile}
            notebookDocs={notebookDocs}
            onUpdateNotebookDocs={setNotebookDocs}
            tasks={devTasks}
            onUpdateTasks={setDevTasks}
            channels={slackChannels}
            messages={slackMessages}
            changelogEntries={changelogEntries}
            proposals={proposals}
            onSendMessage={handleSendSlackMessage}
            onPromoteTaskToChangelog={handlePromoteTaskToChangelog}
            onSwitchUiMode={setUiMode}
            onOpenCompiler={() => {
              setCompilerApp(null);
              setIsCompilerOpen(true);
            }}
            onOpenPublisher={() => setIsPublisherOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
        )}

        {/* 2. CIVER APP STORE MODE (Full Modern Google Play Style with Zero Trackers) */}
        {(uiMode === 'ciber_store' || uiMode === 'play_store') && (
          <PlayStoreView
            catalog={catalog}
            userProfile={userProfile}
            deviceTelemetry={deviceTelemetry}
            onSelectApp={handleSelectApp}
            onInstallApp={handleTriggerInstall}
            onBatchInstall={handleTriggerBatchInstall}
            onCompileApp={handleTriggerCompile}
            onOpenAccountDrawer={() => setIsAccountDrawerOpen(true)}
            onOpenCompiler={() => {
              setCompilerApp(null);
              setIsCompilerOpen(true);
            }}
            onOpenPublisher={() => setIsPublisherOpen(true)}
            onOpenChangelog={() => setIsChangelogOpen(true)}
            onOpenProposals={() => setIsProposalsOpen(true)}
            onOpenArchitectureDocs={() => setIsArchitectureDocsOpen(true)}
            onOpenRepoSync={() => setIsRepoSyncOpen(true)}
            onOpenWorkspace={() => setUiMode('dev_workspace')}
            onOpenAdminPanel={handleOpenAdminPanel}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenSecurityAudit={() => {
              setSecurityAuditApp(null);
              setIsSecurityAuditOpen(true);
            }}
            onOpenRepoManager={() => setIsRepoManagerOpen(true)}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
            onOpenBuildsHub={() => setIsBuildsHubModalOpen(true)}
            onOpenKeystoreVault={() => setIsKeystoreVaultOpen(true)}
            onOpenDesignProfiles={() => setIsDesignProfilesOpen(true)}
            onOpenFunctionalityProfiles={() => setIsFunctionalityProfilesOpen(true)}
            clonedRepos={clonedRepos}
            onCloneRepoLocally={handleCloneRepoLocally}
            onOpenSidebarDrawer={() => setIsMobileSidebarOpen(true)}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={() => setIsOfflineMode(prev => !prev)}
            onOpenNetworkTraffic={() => {
              setNetworkTrafficApp(null);
              setIsNetworkTrafficOpen(true);
            }}
            onOpenSilentInstaller={() => setIsSilentInstallerOpen(true)}
            onOpenInnovationsHub={() => setIsInnovationsHubOpen(true)}
            onOpenCrossDeviceSync={(app) => {
              setCrossDeviceTargetApp(app);
              setIsCrossDeviceSyncOpen(true);
            }}
            onOpenSocialChat={() => {
              setSocialChatSharedApp(undefined);
              setIsSocialChatOpen(true);
            }}
            onOpenCollabStudio={() => setIsCollabStudioOpen(true)}
            onOpenSourceUpload={() => setIsSourceUploadOpen(true)}
            onOpenCloudTesting={handleOpenCloudTesting}
            onOpenCiCdEvidence={() => setIsCiCdEvidenceOpen(true)}
          />
        )}

        {/* 3. APPLE APP STORE MODE */}
        {uiMode === 'app_store' && (
          <AppStoreView
            catalog={catalog}
            userProfile={userProfile}
            onSelectApp={handleSelectApp}
            onInstallApp={handleTriggerInstall}
            onCompileApp={handleTriggerCompile}
            onOpenAccountDrawer={() => setIsAccountDrawerOpen(true)}
            onOpenCompiler={() => {
              setCompilerApp(null);
              setIsCompilerOpen(true);
            }}
            onOpenPublisher={() => setIsPublisherOpen(true)}
            onOpenChangelog={() => setIsChangelogOpen(true)}
            onOpenProposals={() => setIsProposalsOpen(true)}
            onOpenArchitectureDocs={() => setIsArchitectureDocsOpen(true)}
            onOpenCrossDeviceSync={(app) => {
              setCrossDeviceTargetApp(app);
              setIsCrossDeviceSyncOpen(true);
            }}
            onOpenSocialChat={() => {
              setSocialChatSharedApp(undefined);
              setIsSocialChatOpen(true);
            }}
            onOpenCollabStudio={() => setIsCollabStudioOpen(true)}
            onOpenRepoSync={() => setIsRepoSyncOpen(true)}
            onOpenAgentOrchestrator={() => setIsAgentOrchestratorOpen(true)}
            onOpenAgentAcademy={() => setIsAgentAcademyOpen(true)}
            onOpenBlueprint={() => setIsArchitectureBlueprintOpen(true)}
            onOpenCiCdEvidence={() => setIsCiCdEvidenceOpen(true)}
          />
        )}

        {/* 4. PRO TECHNICAL MATRIX MODE */}
        {uiMode === 'matrix_pro' && (
          <>
            {/* Top Navigation */}
            <Navbar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              compareCount={compareList.length}
              onOpenExport={() => setIsExportOpen(true)}
              filteredCount={filteredStores.length}
              totalCount={STORES_DATA.length}
              uiMode={uiMode}
              onSelectUiMode={setUiMode}
              onOpenCompiler={() => {
                setCompilerApp(null);
                setIsCompilerOpen(true);
              }}
              onOpenPublisher={() => setIsPublisherOpen(true)}
              onOpenAccountDrawer={() => setIsAccountDrawerOpen(true)}
              userProfile={userProfile}
              onOpenChangelog={() => setIsChangelogOpen(true)}
              onOpenProposals={() => setIsProposalsOpen(true)}
              onOpenArchitectureDocs={() => setIsArchitectureDocsOpen(true)}
              onOpenWorkspace={() => setUiMode('dev_workspace')}
              onOpenAdminPanel={handleOpenAdminPanel}
              isOfflineMode={isOfflineMode}
              onToggleOfflineMode={() => setIsOfflineMode(prev => !prev)}
              onOpenNetworkTraffic={() => {
                setNetworkTrafficApp(null);
                setIsNetworkTrafficOpen(true);
              }}
              onOpenSilentInstaller={() => setIsSilentInstallerOpen(true)}
              onOpenInnovationsHub={() => setIsInnovationsHubOpen(true)}
              onOpenWebAuthnHsm={() => setIsWebAuthnHsmOpen(true)}
              onOpenZeroKnowledgeBackup={() => setIsZeroKnowledgeBackupOpen(true)}
              onOpenLightningDonations={() => setIsLightningDonationsOpen(true)}
              onOpenWebAdbPhysical={() => setIsWebAdbPhysicalOpen(true)}
              onOpenFailoverTelemetry={() => setIsFailoverModalOpen(true)}
              onOpenCrossDeviceSync={() => {
                setCrossDeviceTargetApp(undefined);
                setIsCrossDeviceSyncOpen(true);
              }}
              onOpenSocialChat={() => {
                setSocialChatSharedApp(undefined);
                setIsSocialChatOpen(true);
              }}
              onOpenCollabStudio={() => setIsCollabStudioOpen(true)}
              onOpenRepoSync={() => setIsRepoSyncOpen(true)}
              onOpenAgentOrchestrator={() => setIsAgentOrchestratorOpen(true)}
              onOpenAgentAcademy={() => setIsAgentAcademyOpen(true)}
              onOpenBlueprint={() => setIsArchitectureBlueprintOpen(true)}
              onOpenAgentAPIExplorer={() => setIsAgentAPIExplorerOpen(true)}
              onOpenCiCdEvidence={() => setIsCiCdEvidenceOpen(true)}
              onOpenAndroidInstall={() => setIsAndroidInstallModalOpen(true)}
            />

            {/* Main Tab Content */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {currentTab === 'table' && (
              <MatrixTableView
                stores={filteredStores}
                onSelectStore={setSelectedStoreForDetail}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
              />
            )}

            {currentTab === 'cards' && (
              <CardsGridView
                stores={filteredStores}
                onSelectStore={setSelectedStoreForDetail}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
              />
            )}

            {currentTab === 'benchmarks' && (
              <PerformanceBenchmarkView 
                stores={STORES_DATA} 
                onSelectStore={setSelectedStoreForDetail}
              />
            )}

            {currentTab === 'compare' && (
              <ComparisonView
                compareList={compareList}
                onRemoveFromCompare={(store: AppStoreInfo) => setCompareList((prev) => prev.filter((s) => s.id !== store.id))}
                onClearCompare={() => setCompareList([])}
                onSelectStore={setSelectedStoreForDetail}
              />
            )}

            {currentTab === 'quiz' && (
              <RecommenderQuizView
                stores={STORES_DATA}
                onSelectStore={setSelectedStoreForDetail}
              />
            )}

            {currentTab === 'guide' && <EcosystemGuideView />}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>⚡ FOSS Store Matrix</span>
                <span>•</span>
                <button
                  onClick={() => setIsChangelogOpen(true)}
                  className="text-emerald-400 hover:underline"
                >
                  Changelog Ledger (v3.0)
                </button>
                <span>•</span>
                <button
                  onClick={() => setIsProposalsOpen(true)}
                  className="text-purple-400 hover:underline"
                >
                  Hub de Propuestas
                </button>
                <span>•</span>
                <button
                  onClick={() => setIsArchitectureDocsOpen(true)}
                  className="text-blue-400 hover:underline"
                >
                  Planos de Arquitectura
                </button>
              </div>
              <span>Android 15 SDK Ready • 100% Cero Rastreadores</span>
            </div>
          </footer>
        </>
      )}

      {/* 5. MASTER ADMIN CATALOG MATRIX & SCRAPER VIEW */}
      {uiMode === 'admin_catalog_matrix' && (
        <AdminMasterCatalogView
          catalog={catalog}
          onAddScrapedApp={handleAddScrapedApp}
          onBackToStore={() => setUiMode('ciber_store')}
          onLogoutAdmin={handleLogoutAdmin}
          onSelectAppDetail={handleSelectApp}
          onCompileAppVersion={(app, version) => {
            setCompilerApp({ ...app, version });
            setIsCompilerOpen(true);
          }}
          onInstallAdbOnDevice={(app, version) => {
            handleAddToast({
              title: 'Instalación ADB en Samsung Galaxy A06',
              message: `Desplegando ${app.name} (${version}) en el dispositivo físico mediante el Gateway ThinkPad.`,
              type: 'info'
            });
          }}
        />
      )}

      {/* 5. DEDICATED ANDROID ECOSYSTEM & NATIVE APP VIEW (WebAPK • TWA • Fleet • Remote Install) */}
      {uiMode === 'android_ecosystem' && (
        <AndroidAppEcosystemView
          userProfile={userProfile}
          catalog={catalog}
          onSwitchUiMode={setUiMode}
          onSelectApp={handleSelectApp}
          onTriggerInstall={handleTriggerInstall}
          onOpenAccountDrawer={() => setIsAccountDrawerOpen(true)}
          onAddToast={handleAddToast}
        />
      )}

      {/* 6. MIS DISPOSITIVOS & APP NATIVA ANDROID (Fleet & Remote Deployment) */}
      {uiMode === 'connected_devices' && (
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <ConnectedDevicesView
            catalogApps={catalog}
            onSelectApp={handleSelectApp}
          />
        </main>
      )}

      {/* 7. CIVER WORK & SHARK TANK HUB ("Tu trabajo en línea que sí paga") */}
      {uiMode === 'civer_work_hub' && (
        <CiverWorkEcosystemView />
      )}
      </div>

      {/* ======================================================== */}
      {/* GLOBAL MODALS & DRAWERS */}
      {/* ======================================================== */}

      {/* Admin PIN Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={handleAdminAuthenticated}
      />

      {/* 1. GitHub Actions Compiler & Live CI Terminal Modal */}
      <GitHubCompilerModal
        isOpen={isCompilerOpen}
        onClose={() => setIsCompilerOpen(false)}
        targetApp={compilerApp}
        catalog={catalog}
        buildHistory={buildHistory}
        onNewBuildCompleted={handleNewBuildCreated}
        onInstallApk={(app) => {
          setIsCompilerOpen(false);
          handleTriggerInstall(app);
        }}
        githubPat={userProfile.githubPat}
        onOpenKeystoreVault={() => setIsKeystoreVaultOpen(true)}
        keystores={keystores}
        selectedKeyId={selectedKeyId}
        onSelectKeyId={setSelectedKeyId}
        onVerifyGitHubPat={handleVerifyGitHubPat}
        onAddToast={handleAddToast}
        clonedRepos={clonedRepos}
        onCloneRepoLocally={handleCloneRepoLocally}
        onSyncClonedRepo={handleSyncClonedRepo}
        telegramChatId={userProfile.telegramChatId}
        onOpenCloudTesting={handleOpenCloudTesting}
      />

      {/* 1.1 Dedicated Builds & CI Artifacts Management Hub Modal */}
      {isBuildsHubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] max-h-[880px] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <BuildsHubView
                catalog={catalog}
                buildHistory={buildHistory}
                clonedRepos={clonedRepos}
                keystores={keystores}
                selectedKeyId={selectedKeyId}
                onOpenCompiler={(app) => {
                  setIsBuildsHubModalOpen(false);
                  if (app) setCompilerApp(app);
                  setIsCompilerOpen(true);
                }}
                onOpenKeystoreVault={() => {
                  setIsBuildsHubModalOpen(false);
                  setIsKeystoreVaultOpen(true);
                }}
                onInstallApk={(app) => {
                  setIsBuildsHubModalOpen(false);
                  handleTriggerInstall(app);
                }}
                onCloneRepoLocally={handleCloneRepoLocally}
                onSyncClonedRepo={handleSyncClonedRepo}
                onRetryBuild={(run) => {
                  const target = catalog.find((c) => c.id === run.appId) || catalog[0];
                  setIsBuildsHubModalOpen(false);
                  setCompilerApp(target);
                  setIsCompilerOpen(true);
                }}
                onAddToast={handleAddToast}
                onVerifyGitHubToken={() => handleVerifyGitHubPat()}
                githubPat={userProfile.githubPat}
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsBuildsHubModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                Cerrar Gestor de Compilaciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Shizuku / Direct APK Installer Modal */}
      <ApkInstallerModal
        isOpen={isInstallerOpen}
        onClose={() => {
          setIsInstallerOpen(false);
          setInstallerAppsQueue(null);
        }}
        app={installerApp}
        appsQueue={installerAppsQueue || undefined}
        onAppInstalled={handleAppInstalledSuccess}
      />

      {/* 3. Developer Portal Publisher Modal */}
      <DeveloperPublishModal
        isOpen={isPublisherOpen}
        onClose={() => setIsPublisherOpen(false)}
        onAppPublished={handleAppPublished}
        onOpenCompilerForApp={(app) => {
          setIsPublisherOpen(false);
          handleTriggerCompile(app);
        }}
      />

      {/* 3.1 Source Code Upload & Ingestion Modal */}
      <SourceCodeUploadModal
        isOpen={isSourceUploadOpen}
        onClose={() => setIsSourceUploadOpen(false)}
        onAppRegistered={handleAppRegisteredFromSource}
      />

      {/* 4. Google Play / Account & Telemetry Settings Drawer */}
      <AccountSettingsDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
        deviceTelemetry={deviceTelemetry}
        uiMode={uiMode}
        onSelectUiMode={setUiMode}
        onOpenCompiler={() => {
          setCompilerApp(null);
          setIsCompilerOpen(true);
        }}
        onOpenPublisher={() => setIsPublisherOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenProposals={() => setIsProposalsOpen(true)}
        onOpenArchitectureDocs={() => setIsArchitectureDocsOpen(true)}
        onOpenDesignProfiles={() => setIsDesignProfilesOpen(true)}
        onOpenFunctionalityProfiles={() => setIsFunctionalityProfilesOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCrossDeviceSync={() => {
          setCrossDeviceTargetApp(undefined);
          setIsCrossDeviceSyncOpen(true);
        }}
        onOpenSocialChat={() => {
          setSocialChatSharedApp(undefined);
          setIsSocialChatOpen(true);
        }}
        onOpenCollabStudio={() => setIsCollabStudioOpen(true)}
      />


      {/* 5. App Catalog Detail Modal (With Reviews & Ratings & Delta Patch & Local Clone) */}
      <AppDetailModal
        app={selectedAppForDetail}
        isOpen={!!selectedAppForDetail}
        onClose={() => setSelectedAppForDetail(null)}
        onInstall={handleTriggerInstall}
        onCompile={handleTriggerCompile}
        onOpenDeltaPatch={(app) => {
          setDeltaPatchApp(app);
          setIsDeltaPatchOpen(true);
        }}
        onOpenSecurityAudit={(app) => {
          setSecurityAuditApp(app);
          setIsSecurityAuditOpen(true);
        }}
        onOpenNetworkTraffic={(app) => {
          setNetworkTrafficApp(app);
          setIsNetworkTrafficOpen(true);
        }}
        onCloneRepoLocally={handleCloneRepoLocally}
        isClonedLocally={selectedAppForDetail ? !!clonedRepos[selectedAppForDetail.id] : false}
        isInstalled={selectedAppForDetail ? installedAppIds.includes(selectedAppForDetail.id) : false}
        reviews={reviews}
        onAddReview={handleAddReview}
        userEmail={userProfile.email}
        userName={userProfile.name}
        onOpenSilentInstaller={() => {
          setSelectedAppForDetail(null);
          setIsSilentInstallerOpen(true);
        }}
        onOpenInnovationsHub={() => {
          setSelectedAppForDetail(null);
          setIsInnovationsHubOpen(true);
        }}
        onOpenLightningDonations={(_app) => {
          setIsLightningDonationsOpen(true);
        }}
        onOpenAntiFeaturesAudit={(_app) => {
          setIsAntiFeaturesAuditOpen(true);
        }}
        onOpenWebAdbPhysical={(_app) => {
          setIsWebAdbPhysicalOpen(true);
        }}
        onOpenCrossDeviceSync={(app) => {
          setCrossDeviceTargetApp(app);
          setIsCrossDeviceSyncOpen(true);
        }}
        onShareAppToChat={(app) => {
          setSocialChatSharedApp(app);
          setIsSocialChatOpen(true);
        }}
        onOpenCollabStudio={() => setIsCollabStudioOpen(true)}
        onOpenCloudTesting={handleOpenCloudTesting}
      />

      {/* 6. System Changelog Ledger Modal */}
      <ChangelogLedgerModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
        onOpenProposals={() => {
          setIsChangelogOpen(false);
          setIsProposalsOpen(true);
        }}
        onOpenArchitectureDocs={() => {
          setIsChangelogOpen(false);
          setIsArchitectureDocsOpen(true);
        }}
      />

      {/* 7. Community & Agent Proposals Hub Modal */}
      <ProposalsHubModal
        isOpen={isProposalsOpen}
        onClose={() => setIsProposalsOpen(false)}
        proposals={proposals}
        onAddProposal={handleAddProposal}
        onVoteProposal={handleVoteProposal}
        userEmail={userProfile.email}
        userName={userProfile.name}
      />

      {/* 8. System Architecture Blueprints & Module Docs Modal */}
      <ArchitectureDocsModal
        isOpen={isArchitectureDocsOpen}
        onClose={() => setIsArchitectureDocsOpen(false)}
        onOpenChangelog={() => {
          setIsArchitectureDocsOpen(false);
          setIsChangelogOpen(true);
        }}
        onOpenProposals={() => {
          setIsArchitectureDocsOpen(false);
          setIsProposalsOpen(true);
        }}
      />

      {/* 9. F-Droid Index V2 Realtime Worker Sync Modal */}
      <RepoIndexSyncModal
        isOpen={isRepoSyncOpen}
        onClose={() => setIsRepoSyncOpen(false)}
        onOpenBlueprint={() => {
          setIsRepoSyncOpen(false);
          setIsArchitectureBlueprintOpen(true);
        }}
        onOpenAcademy={() => {
          setIsRepoSyncOpen(false);
          setIsAgentAcademyOpen(true);
        }}
        onAddAppToCatalog={(newApp) => {
          setCatalog((prev) => [newApp, ...prev]);
          handleAddToast({
            title: 'Aplicación Importada',
            message: `${newApp.name} se ha añadido al catálogo con éxito.`,
            type: 'success'
          });
        }}
      />

      {/* 10. Bsdiff / Zstd Binary Delta Patch Modal */}
      <DeltaPatchModal
        isOpen={isDeltaPatchOpen}
        onClose={() => setIsDeltaPatchOpen(false)}
        app={deltaPatchApp}
      />

      {/* 11. Deep Security & Exodus Privacy Scanner Modal */}
      <SecurityAuditModal
        isOpen={isSecurityAuditOpen}
        onClose={() => setIsSecurityAuditOpen(false)}
        apps={catalog}
        selectedApp={securityAuditApp}
        onSelectApp={(app) => setSecurityAuditApp(app)}
        onOpenInstaller={(app) => {
          setIsSecurityAuditOpen(false);
          setInstallerApp(app);
          setIsInstallerOpen(true);
        }}
      />

      {/* 12. Decentralized FOSS Repository Manager Modal */}
      <CustomRepoManagerModal
        isOpen={isRepoManagerOpen}
        onClose={() => setIsRepoManagerOpen(false)}
        onAddToast={handleAddToast}
      />

      {/* 13. Real-Time Hardware & Device Telemetry Modal */}
      <DeviceDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        telemetry={deviceTelemetry}
        onAddToast={handleAddToast}
      />

      {/* 14. Keystore & Signing Key Vault Modal */}
      <KeystoreVaultModal
        isOpen={isKeystoreVaultOpen}
        onClose={() => setIsKeystoreVaultOpen(false)}
        onAddToast={handleAddToast}
        keystores={keystores}
        onUpdateKeystores={setKeystores}
        selectedKeyId={selectedKeyId}
        onSelectKeyId={setSelectedKeyId}
        onOpenWebAuthnHsm={() => setIsWebAuthnHsmOpen(true)}
      />

      {/* 14b. Panel de Publicación y Auto-Actualización Móvil OTA */}
      <OtaReleaseManagementModal
        isOpen={isOtaModalOpen}
        onClose={() => setIsOtaModalOpen(false)}
      />

      {/* 14c. Mega-Matriz de Certificación y Evidencias CI/CD */}
      <CiCdEvidenceMatrixModal
        isOpen={isCiCdEvidenceOpen}
        onClose={() => setIsCiCdEvidenceOpen(false)}
        onOpenOtaModal={() => setIsOtaModalOpen(true)}
        onOpenCompiler={() => {
          setCompilerApp(null);
          setIsCompilerOpen(true);
        }}
      />

      {/* 15. Legacy Store Detail Modal */}
      <StoreDetailModal
        store={selectedStoreForDetail}
        onClose={() => setSelectedStoreForDetail(null)}
        onToggleCompare={handleToggleCompare}
        isComparing={selectedStoreForDetail ? compareList.some((s) => s.id === selectedStoreForDetail.id) : false}
      />

      {/* 16. Export Markdown Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        stores={filteredStores}
      />

      {/* 17. Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSwitchUiMode={setUiMode}
        onOpenCompiler={() => {
          setCompilerApp(null);
          setIsCompilerOpen(true);
        }}
        onOpenPublisher={() => setIsPublisherOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenProposals={() => setIsProposalsOpen(true)}
        onOpenArchDocs={() => setIsArchitectureDocsOpen(true)}
        onOpenRepoSync={() => setIsRepoSyncOpen(true)}
        onOpenSecurityAudit={() => {
          setSecurityAuditApp(null);
          setIsSecurityAuditOpen(true);
        }}
        onOpenRepoManager={() => setIsRepoManagerOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenKeystoreVault={() => setIsKeystoreVaultOpen(true)}
        onOpenOtaReleases={() => setIsOtaModalOpen(true)}
        onOpenBuildsHub={() => setIsBuildsHubModalOpen(true)}
        onOpenDesignProfiles={() => setIsDesignProfilesOpen(true)}
        onOpenFunctionalityProfiles={() => setIsFunctionalityProfilesOpen(true)}
        onOpenDexDecompiler={() => setIsDexDecompilerOpen(true)}
        onOpenGitPatch={() => setIsGitPatchOpen(true)}
        onOpenRuntimeSandbox={() => setIsRuntimeSandboxOpen(true)}
        onOpenNearbyTransfer={() => setIsNearbyTransferOpen(true)}
        onOpenArchitectureGraph={() => setIsArchitectureGraphOpen(true)}
        onOpenLiveCustomizer={() => setIsLiveCustomizerOpen(true)}
        onOpenResponsiveHUD={() => setIsResponsiveHUDOpen(true)}
        onOpenSilentInstaller={() => setIsSilentInstallerOpen(true)}
        onOpenInnovationsHub={() => setIsInnovationsHubOpen(true)}
        onOpenWebAuthnHsm={() => setIsWebAuthnHsmOpen(true)}
        onOpenZeroKnowledgeBackup={() => setIsZeroKnowledgeBackupOpen(true)}
        onOpenLightningDonations={() => setIsLightningDonationsOpen(true)}
        onOpenWebAdbPhysical={() => setIsWebAdbPhysicalOpen(true)}
        onOpenAntiFeaturesAudit={() => setIsAntiFeaturesAuditOpen(true)}
        onOpenWasmPlugins={() => setIsWasmPluginsOpen(true)}
        onOpenOfflinePwaDiagnostics={() => setIsOfflinePwaDiagnosticsOpen(true)}
        onOpenFailoverTelemetry={() => setIsFailoverModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCrossDeviceSync={() => {
          setCrossDeviceTargetApp(undefined);
          setIsCrossDeviceSyncOpen(true);
        }}
        onOpenSocialChat={() => {
          setSocialChatSharedApp(undefined);
          setIsSocialChatOpen(true);
        }}
        onOpenCollabStudio={() => setIsCollabStudioOpen(true)}
        onOpenAgentOrchestrator={() => setIsAgentOrchestratorOpen(true)}
        onOpenAgentAcademy={() => setIsAgentAcademyOpen(true)}
        onOpenBlueprint={() => setIsArchitectureBlueprintOpen(true)}
        onOpenAgentDocs={() => setIsAgentDocsOpen(true)}
        onOpenAgentDebugger={() => setIsAgentDebuggerOpen(true)}
        onOpenAgentAPIExplorer={() => setIsAgentAPIExplorerOpen(true)}
        onToggleSimulation={() => {
          if (!isSimulating && simulatedWidth === null) {
            setSimulatedWidth(320);
          }
          setIsSimulating((prev) => !prev);
        }}
        onToggleGridDebug={() => setIsGridDebug((prev) => !prev)}
        onToggleViewportToolbar={() => setIsViewportToolbarVisible((prev) => !prev)}
        onAddToast={handleAddToast}
      />

      {/* 18. Theme and Design Profiles Modal (8 Palettes, Density, Radius) */}
      <ThemeAndDesignProfileModal
        isOpen={isDesignProfilesOpen}
        onClose={() => setIsDesignProfilesOpen(false)}
        settings={designSettings}
        onUpdateSettings={handleUpdateDesignSettings}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 19. Functionality Profiles & 16 Granular Feature Flags Modal */}
      <FunctionalityProfilesModal
        isOpen={isFunctionalityProfilesOpen}
        onClose={() => setIsFunctionalityProfilesOpen(false)}
        flags={featureFlags}
        onUpdateFlags={handleUpdateFeatureFlags}
        activePreset={activeFunctionalityPreset}
        onSelectPreset={setActiveFunctionalityPreset}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 20. Descompilador DEX & Smali WebAssembly Modal */}
      <DexDecompilerModal
        isOpen={isDexDecompilerOpen}
        onClose={() => setIsDexDecompilerOpen(false)}
        targetPackage={dexTargetApp.packageId}
        appName={dexTargetApp.name}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 21. Visor de Diff Git & Gestor de Parches .patch */}
      <GitDiffAndPatchModal
        isOpen={isGitPatchOpen}
        onClose={() => setIsGitPatchOpen(false)}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 22. Runtime Sandbox & Inspector de Permisos */}
      <RuntimeSandboxInspectorModal
        isOpen={isRuntimeSandboxOpen}
        onClose={() => setIsRuntimeSandboxOpen(false)}
        targetPackage={sandboxTargetApp.packageId}
        appName={sandboxTargetApp.name}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 23. Compartición P2P Wi-Fi Direct & WebRTC Mesh */}
      <NearbyTransferModal
        isOpen={isNearbyTransferOpen}
        onClose={() => setIsNearbyTransferOpen(false)}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 24. Mapa Topológico de Arquitectura & Audit Trail */}
      <VisualDependencyGraphModal
        isOpen={isArchitectureGraphOpen}
        onClose={() => setIsArchitectureGraphOpen(false)}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 25. Real-time CI/CD & System Toast Notifications */}
      <ToastNotificationCenter
        toasts={toasts}
        onCloseToast={handleCloseToast}
        onActionToast={handleActionToast}
      />

      {/* 26. Touch-First Mobile Bottom Dock Navigation (< 768px) */}
      <MobileBottomDock
        currentMode={uiMode}
        onChangeMode={(mode) => {
          setUiMode(mode);
          setIsMobileSidebarOpen(false);
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSidebarDrawer={() => setIsMobileSidebarOpen(true)}
        onOpenNearbyTransfer={() => setIsNearbyTransferOpen(true)}
        onOpenBuildsHub={() => setIsBuildsHubModalOpen(true)}
        activeBuildCount={buildHistory.filter((b) => b.status === 'in_progress').length}
      />

      {/* 27. Live Visual Customizer Studio Modal (Elementor Style) */}
      <LiveVisualCustomizerModal
        isOpen={isLiveCustomizerOpen}
        onClose={() => setIsLiveCustomizerOpen(false)}
        settings={designSettings}
        onUpdateSettings={handleUpdateDesignSettings}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 28. Intelligent Responsive Engine Diagnostics HUD Modal */}
      <IntelligentResponsiveHUDModal
        isOpen={isResponsiveHUDOpen}
        onClose={() => setIsResponsiveHUDOpen(false)}
        layout={responsiveLayout}
        onSelectPreset={(preset) => {
          setActiveViewportPreset(preset);
          setIsResponsiveHUDOpen(false);
        }}
        onAddToast={(title, message, type) => {
          handleAddToast({
            title,
            message,
            type: type === 'warning' ? 'warning' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
          });
        }}
      />

      {/* 29. Floating Viewport Simulation & Responsiveness Inspector Toolbar (With X dismiss & minimize) */}
      <ResponsiveViewportToolbar
        layout={responsiveLayout}
        activePreset={activeViewportPreset}
        onSelectPreset={setActiveViewportPreset}
        scaleFactor={viewportScaleFactor}
        onChangeScaleFactor={setViewportScaleFactor}
        isExpanded={isViewportToolbarExpanded}
        onToggleExpanded={() => setIsViewportToolbarExpanded((prev) => !prev)}
        isVisible={isViewportToolbarVisible}
        onClose={() => setIsViewportToolbarVisible(false)}
        onOpenLiveCustomizer={() => setIsLiveCustomizerOpen(true)}
        onOpenResponsiveHUD={() => setIsResponsiveHUDOpen(true)}
        simulatedWidth={simulatedWidth}
        onSetSimulatedWidth={setSimulatedWidth}
        isSimulating={isSimulating}
        onToggleSimulation={() => {
          if (!isSimulating && simulatedWidth === null) {
            setSimulatedWidth(320);
          }
          setIsSimulating((prev) => !prev);
        }}
        simulationSpeed={simulationSpeed}
        onChangeSimulationSpeed={setSimulationSpeed}
        isGridDebug={isGridDebug}
        onToggleGridDebug={() => setIsGridDebug((prev) => !prev)}
        isHeatmapMode={isHeatmapMode}
        onToggleHeatmapMode={() => setIsHeatmapMode((prev) => !prev)}
        isStressTestActive={isStressTestActive}
        onToggleStressTest={() => setIsStressTestActive((prev) => !prev)}
        stressTestLevel={stressTestLevel}
        onChangeStressTestLevel={setStressTestLevel}
        onOpenVisualRegression={() => setIsVisualRegressionModalOpen(true)}
        onOpenFluidityScore={() => setIsFluidityAuditModalOpen(true)}
        onOpenScreenInventory={() => setIsScreenInventoryModalOpen(true)}
      />

      {/* 30. Visual Regression Capture Gallery Modal (Automated Multi-Breakpoint Snapshots) */}
      <VisualRegressionGalleryModal
        isOpen={isVisualRegressionModalOpen}
        onClose={() => setIsVisualRegressionModalOpen(false)}
        currentUiMode={uiMode}
        onNavigateToView={(mode) => {
          setUiMode(mode);
          setIsVisualRegressionModalOpen(false);
        }}
        onTriggerSimulatedCapture={(width) => {
          setSimulatedWidth(width);
          handleAddToast({
            title: 'Snapshot de Regresión Capturado',
            message: `Viewport configurado en ${width}px para análisis de estabilidad.`,
            type: 'info'
          });
        }}
        onAddToast={handleAddToast}
      />

      {/* 31. Fluidity Score Calculator & CSS Clamp() Audit Modal */}
      <FluidityScoreAuditModal
        isOpen={isFluidityAuditModalOpen}
        onClose={() => setIsFluidityAuditModalOpen(false)}
        viewportWidth={simulatedWidth !== null ? simulatedWidth : responsiveLayout.width}
        onApplyFluidRuleFix={(ruleId) => {
          handleAddToast({
            title: 'Regla Clamp() Aplicada',
            message: `Optimización fluida ${ruleId} inyectada al motor de renderizado.`,
            type: 'success'
          });
        }}
        onAddToast={handleAddToast}
      />

      {/* 32. Central Screen Inventory & Internal Linking Matrix Modal (38 Screens) */}
      <ScreenInventoryNavigatorModal
        isOpen={isScreenInventoryModalOpen}
        onClose={() => setIsScreenInventoryModalOpen(false)}
        currentUiMode={uiMode}
        onNavigateToScreen={(actionKey) => {
          setIsScreenInventoryModalOpen(false);
          switch (actionKey) {
            case 'open_dev_workspace':
              setUiMode('dev_workspace');
              break;
            case 'open_ciber_store':
              setUiMode('ciber_store');
              break;
            case 'open_app_store':
              setUiMode('app_store');
              break;
            case 'open_matrix_pro':
              setUiMode('matrix_pro');
              break;
            case 'open_builds_hub':
              setIsBuildsHubModalOpen(true);
              break;
            case 'open_compiler':
              setIsCompilerOpen(true);
              break;
            case 'open_apk_installer':
              setInstallerApp(catalog[0]);
              setIsInstallerOpen(true);
              break;
            case 'open_developer_publish':
              setIsPublisherOpen(true);
              break;
            case 'open_changelog_ledger':
              setIsChangelogOpen(true);
              break;
            case 'open_proposals_hub':
              setIsProposalsOpen(true);
              break;
            case 'open_architecture_docs':
              setIsArchitectureDocsOpen(true);
              break;
            case 'open_repo_sync':
              setIsRepoSyncOpen(true);
              break;
            case 'open_delta_patch':
              setIsDeltaPatchOpen(true);
              break;
            case 'open_security_audit':
              setIsSecurityAuditOpen(true);
              break;
            case 'open_repo_manager':
              setIsRepoManagerOpen(true);
              break;
            case 'open_device_diagnostics':
              setIsDiagnosticsOpen(true);
              break;
            case 'open_keystore_vault':
              setIsKeystoreVaultOpen(true);
              break;
            case 'open_theme_designer':
              setIsDesignProfilesOpen(true);
              break;
            case 'open_functionality_profiles':
              setIsFunctionalityProfilesOpen(true);
              break;
            case 'open_dex_decompiler':
              setIsDexDecompilerOpen(true);
              break;
            case 'open_git_diff_patch':
              setIsGitPatchOpen(true);
              break;
            case 'open_runtime_sandbox':
              setIsRuntimeSandboxOpen(true);
              break;
            case 'open_nearby_transfer':
              setIsNearbyTransferOpen(true);
              break;
            case 'open_visual_dependency_graph':
              setIsArchitectureGraphOpen(true);
              break;
            case 'open_live_customizer':
              setIsLiveCustomizerOpen(true);
              break;
            case 'open_responsive_hud':
              setIsResponsiveHUDOpen(true);
              break;
            case 'open_visual_regression':
              setIsVisualRegressionModalOpen(true);
              break;
            case 'open_fluidity_score':
              setIsFluidityAuditModalOpen(true);
              break;
            case 'open_screen_inventory':
              setIsScreenInventoryModalOpen(true);
              break;
            case 'toggle_heatmap':
              setIsHeatmapMode((prev) => !prev);
              break;
            case 'toggle_stress_test':
              setIsStressTestActive((prev) => !prev);
              break;
            case 'toggle_grid_debug':
              setIsGridDebug((prev) => !prev);
              break;
            case 'toggle_viewport_sweep':
              if (!isSimulating && simulatedWidth === null) setSimulatedWidth(320);
              setIsSimulating((prev) => !prev);
              break;
            case 'open_account_settings':
              setIsAccountDrawerOpen(true);
              break;
            case 'open_command_palette':
              setIsCommandPaletteOpen(true);
              break;
            case 'open_network_traffic':
              setIsNetworkTrafficOpen(true);
              break;
            case 'open_silent_installer':
              setIsSilentInstallerOpen(true);
              break;
            case 'open_innovations_hub':
              setIsInnovationsHubOpen(true);
              break;
            case 'open_webauthn_hsm':
              setIsWebAuthnHsmOpen(true);
              break;
            case 'open_zero_knowledge_backup':
            case 'open_zk_backup':
              setIsZeroKnowledgeBackupOpen(true);
              break;
            case 'open_lightning_donations':
              setIsLightningDonationsOpen(true);
              break;
            case 'open_webadb_physical':
              setIsWebAdbPhysicalOpen(true);
              break;
            case 'open_anti_features_audit':
              setIsAntiFeaturesAuditOpen(true);
              break;
            case 'open_wasm_plugins':
              setIsWasmPluginsOpen(true);
              break;
            case 'open_offline_pwa':
            case 'open_offline_pwa_diagnostics':
              setIsOfflinePwaDiagnosticsOpen(true);
              break;
            case 'open_failover_telemetry':
            case 'open_resilience_hub':
              setIsFailoverModalOpen(true);
              break;
            case 'open_auth_sessions':
            case 'open_auth_modal':
              setIsAuthModalOpen(true);
              break;
            case 'open_cross_device_sync':
              setCrossDeviceTargetApp(undefined);
              setIsCrossDeviceSyncOpen(true);
              break;
            case 'open_social_chat':
              setSocialChatSharedApp(undefined);
              setIsSocialChatOpen(true);
              break;
            case 'open_collab_studio':
              setIsCollabStudioOpen(true);
              break;
            default:
              break;
          }
        }}
        onAddToast={handleAddToast}
      />

      {/* 33. Real-Time Network Traffic & Privacy Sinkhole Modal */}
      <NetworkTrafficModal
        isOpen={isNetworkTrafficOpen}
        onClose={() => setIsNetworkTrafficOpen(false)}
        selectedApp={networkTrafficApp}
        catalog={catalog}
        isOffline={isOfflineMode}
      />

      {/* 34. 1-Click Silent Native Installer Privilege Engine Modal */}
      <NativeSilentInstallerModal
        isOpen={isSilentInstallerOpen}
        onClose={() => setIsSilentInstallerOpen(false)}
        catalog={catalog}
        onInstallAppSilently={handleInstallAppSilently}
      />

      {/* 35. 30 World-Class Innovations Hub Modal */}
      <WorldClassInnovationsHubModal
        isOpen={isInnovationsHubOpen}
        onClose={() => setIsInnovationsHubOpen(false)}
        catalog={catalog}
        onApplyOledTheme={() => {
          handleUpdateDesignSettings({
            palette: 'oled_pure_black'
          });
          handleAddToast({
            title: 'Tema True OLED Activado',
            message: 'Píxeles negros #000000 100% apagados para ahorro máximo de batería.',
            type: 'success'
          });
        }}
      />

      {/* 36. FIDO2 / YubiKey Hardware HSM Signer Modal */}
      <WebAuthnHsmSignerModal
        isOpen={isWebAuthnHsmOpen}
        onClose={() => setIsWebAuthnHsmOpen(false)}
        catalog={catalog}
        onAddToast={handleAddToast}
      />

      {/* 37. Zero-Knowledge E2EE Encrypted Backup Modal */}
      <ZeroKnowledgeBackupModal
        isOpen={isZeroKnowledgeBackupOpen}
        onClose={() => setIsZeroKnowledgeBackupOpen(false)}
        userProfile={userProfile}
        onUpdateUserProfile={(profile) => setUserProfile((prev) => ({ ...prev, ...profile }))}
        notebookDocs={notebookDocs}
        onUpdateNotebookDocs={setNotebookDocs}
        devTasks={devTasks}
        onUpdateDevTasks={setDevTasks}
        designSettings={designSettings}
        onUpdateDesignSettings={handleUpdateDesignSettings}
        featureFlags={featureFlags}
        onUpdateFeatureFlags={handleUpdateFeatureFlags}
        onAddToast={handleAddToast}
      />

      {/* 38. Bitcoin Lightning Network / WebLN Micro-Mecenazgo Modal */}
      <LightningDonationsModal
        isOpen={isLightningDonationsOpen}
        onClose={() => setIsLightningDonationsOpen(false)}
        catalog={catalog}
        onAddToast={handleAddToast}
      />

      {/* 39. Physical WebUSB ADB Installer Modal */}
      <WebAdbPhysicalInstallerModal
        isOpen={isWebAdbPhysicalOpen}
        onClose={() => setIsWebAdbPhysicalOpen(false)}
        catalog={catalog}
        onInstallAppSilently={handleInstallAppSilently}
      />

      {/* 40. Anti-Features Strict Audit Modal */}
      <AntiFeaturesAuditModal
        isOpen={isAntiFeaturesAuditOpen}
        onClose={() => setIsAntiFeaturesAuditOpen(false)}
        catalog={catalog}
        onOpenAppDetail={(app) => setSelectedAppForDetail(app)}
      />

      {/* 41. Community WASM Plugins Manager Modal */}
      <WasmPluginsManagerModal
        isOpen={isWasmPluginsOpen}
        onClose={() => setIsWasmPluginsOpen(false)}
        onAddToast={handleAddToast}
      />

      {/* 42. Offline PWA Storage & Cache Diagnostics Modal */}
      <OfflinePwaDiagnosticsModal
        isOpen={isOfflinePwaDiagnosticsOpen}
        onClose={() => setIsOfflinePwaDiagnosticsOpen(false)}
        catalog={catalog}
      />

      {/* 43. Resilience, Failover & Deep Flight Recorder Telemetry Modal */}
      <CiverResilienceFailoverModal
        isOpen={isFailoverModalOpen}
        onClose={() => setIsFailoverModalOpen(false)}
        onAddToast={handleAddToast}
      />

      {/* 44. Comprehensive Auth, Civer ID & Security Sessions Modal */}
      <CiverAuthSessionModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
        onAddToast={handleAddToast}
      />

      {/* 45. Cross-Device Fleet Sync Modal (Play Store / App Store Multi-Device Sync) */}
      <CrossDeviceSyncModal
        isOpen={isCrossDeviceSyncOpen}
        onClose={() => {
          setIsCrossDeviceSyncOpen(false);
          setCrossDeviceTargetApp(undefined);
        }}
        userProfile={userProfile}
        onUpdateProfile={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
        onOpenAppDetail={(app) => {
          setSelectedAppForDetail(app);
          setIsCrossDeviceSyncOpen(false);
        }}
        onAddToast={(toast) => {
          handleAddToast({
            title: toast.title,
            message: toast.description,
            type: toast.type
          });
        }}
      />

      {/* 46. FOSS Social Network, Chat & App Sharing Community Modal */}
      <SocialChatCommunityModal
        isOpen={isSocialChatOpen}
        onClose={() => {
          setIsSocialChatOpen(false);
          setSocialChatSharedApp(undefined);
        }}
        userProfile={userProfile}
        onOpenAppDetail={(app) => {
          setSelectedAppForDetail(app);
          setIsSocialChatOpen(false);
        }}
        onAddToast={(toast) => {
          handleAddToast({
            title: toast.title,
            message: toast.description,
            type: toast.type
          });
        }}
      />

      {/* 47. Real-Time Collaborative App Studio (Google Docs Style & Git Versioning) */}
      <CollaborativeAppStudioModal
        isOpen={isCollabStudioOpen}
        onClose={() => setIsCollabStudioOpen(false)}
        userProfile={userProfile}
        onAddToast={(toast) => {
          handleAddToast({
            title: toast.title,
            message: toast.description,
            type: toast.type
          });
        }}
      />

      {/* 48. Dynamic Visual Architecture Blueprint Graph (D3.js Force-Directed) */}
      <ArchitectureBlueprintModal
        isOpen={isArchitectureBlueprintOpen}
        onClose={() => setIsArchitectureBlueprintOpen(false)}
        onOpenAcademy={() => {
          setIsArchitectureBlueprintOpen(false);
          setIsAgentAcademyOpen(true);
        }}
        onOpenDebugger={() => {
          setIsArchitectureBlueprintOpen(false);
          setIsAgentDebuggerOpen(true);
        }}
        onAddToast={handleAddToast}
      />

      {/* 49. Agent Academy Tutorial & Interactive Simulator */}
      <AgentAcademyModal
        isOpen={isAgentAcademyOpen}
        onClose={() => setIsAgentAcademyOpen(false)}
        onOpenBlueprint={() => {
          setIsAgentAcademyOpen(false);
          setIsArchitectureBlueprintOpen(true);
        }}
      />

      {/* 50. Agent Orchestrator Hub & MCP Telemetry Dashboard */}
      <AgentOrchestratorHubModal
        isOpen={isAgentOrchestratorOpen}
        onClose={() => setIsAgentOrchestratorOpen(false)}
        onOpenAcademy={() => {
          setIsAgentOrchestratorOpen(false);
          setIsAgentAcademyOpen(true);
        }}
        onOpenBlueprint={() => {
          setIsAgentOrchestratorOpen(false);
          setIsArchitectureBlueprintOpen(true);
        }}
        onOpenDocs={() => {
          setIsAgentOrchestratorOpen(false);
          setIsAgentDocsOpen(true);
        }}
      />

      {/* 51. Dedicated Technical Documentation for AI Agents (WebSocket, gRPC, MCP, REST) */}
      <AgentTechnicalDocsModal
        isOpen={isAgentDocsOpen}
        onClose={() => setIsAgentDocsOpen(false)}
        onOpenOrchestrator={() => {
          setIsAgentDocsOpen(false);
          setIsAgentOrchestratorOpen(true);
        }}
        onOpenBlueprint={() => {
          setIsAgentDocsOpen(false);
          setIsArchitectureBlueprintOpen(true);
        }}
        onOpenAcademy={() => {
          setIsAgentDocsOpen(false);
          setIsAgentAcademyOpen(true);
        }}
      />

      {/* 52. Agent Communication Debugger & Wire Sniffer Modal */}
      <AgentCommunicationDebuggerModal
        isOpen={isAgentDebuggerOpen}
        onClose={() => setIsAgentDebuggerOpen(false)}
        onAddToast={handleAddToast}
      />

      {/* 53. Agent API Explorer & Interactive Swagger / gRPC Console Modal */}
      <AgentAPIExplorerModal
        isOpen={isAgentAPIExplorerOpen}
        onClose={() => setIsAgentAPIExplorerOpen(false)}
        onAddToast={(toast) => {
          handleAddToast({
            title: toast.title,
            message: toast.message,
            type: toast.type || 'info'
          });
        }}
      />

      {/* 54. Laboratorio de Pruebas Móviles en la Nube & Captura de Pantallas Modal */}
      <CloudMobileTestingStudioModal
        isOpen={isCloudTestingOpen}
        onClose={() => setIsCloudTestingOpen(false)}
        selectedApp={cloudTestingTargetApp}
        catalogApps={catalog}
        userProfile={userProfile}
        onAddToast={handleAddToast}
      />

      {/* 55. Android Native & PWA Installation Modal */}
      <AndroidInstallModal
        isOpen={isAndroidInstallModalOpen}
        onClose={() => setIsAndroidInstallModalOpen(false)}
        onAddToast={handleAddToast}
      />

      {/* Persistent Offline Status Indicator */}
      <OfflineIndicator />

    </div>
  );
};
