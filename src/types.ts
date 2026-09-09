export type StoreCategory =
  | 'ALL'
  | 'PLAY_STORE_CLIENT'
  | 'FDROID_CLIENT'
  | 'DIRECT_GIT_TRACKER'
  | 'HARDENED_SECURITY'
  | 'ALL_IN_ONE_MANAGER';

export interface CategoryInfo {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const CATEGORY_DETAILS: Record<StoreCategory, CategoryInfo> = {
  ALL: {
    label: 'Todas las categorías',
    badgeBg: 'bg-indigo-950/60',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-800/60'
  },
  PLAY_STORE_CLIENT: {
    label: 'Cliente de Google Play',
    badgeBg: 'bg-teal-950/60',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-800/60'
  },
  FDROID_CLIENT: {
    label: 'Cliente F-Droid / FOSS',
    badgeBg: 'bg-sky-950/60',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-800/60'
  },
  DIRECT_GIT_TRACKER: {
    label: 'Actualizador Directo Git/Releases',
    badgeBg: 'bg-pink-950/60',
    badgeText: 'text-pink-400',
    badgeBorder: 'border-pink-800/60'
  },
  HARDENED_SECURITY: {
    label: 'Alta Seguridad Criptográfica',
    badgeBg: 'bg-purple-950/60',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-800/60'
  },
  ALL_IN_ONE_MANAGER: {
    label: 'Gestor de Paquetes & Auditor',
    badgeBg: 'bg-rose-950/60',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-800/60'
  }
};

export type ProjectStatus = 'HIGHLY_ACTIVE' | 'ACTIVE' | 'MAINTENANCE' | 'DISCONTINUED';

export interface ProjectStatusInfo {
  label: string;
  isHealthy: boolean;
  color: string;
}

export const PROJECT_STATUS_DETAILS: Record<ProjectStatus, ProjectStatusInfo> = {
  HIGHLY_ACTIVE: {
    label: 'Muy Activo',
    isHealthy: true,
    color: 'emerald'
  },
  ACTIVE: {
    label: 'Activo y Estable',
    isHealthy: true,
    color: 'emerald'
  },
  MAINTENANCE: {
    label: 'En Mantenimiento',
    isHealthy: true,
    color: 'amber'
  },
  DISCONTINUED: {
    label: 'Discontinuado',
    isHealthy: false,
    color: 'rose'
  }
};

export type InstallMethod =
  | 'SESSION_INSTALLER'
  | 'SHIZUKU'
  | 'ROOT'
  | 'PRIVILEGED_EXT'
  | 'MANUAL_INTENT'
  | 'ACCRESCENT_DAEMON';

export interface InstallMethodInfo {
  label: string;
  requiresRoot: boolean;
}

export const INSTALL_METHOD_DETAILS: Record<InstallMethod, InstallMethodInfo> = {
  SESSION_INSTALLER: {
    label: 'Session Installer (Android 12+ sin confirmación)',
    requiresRoot: false
  },
  SHIZUKU: {
    label: 'Shizuku (Sin Root vía ADB/Wireless)',
    requiresRoot: false
  },
  ROOT: {
    label: 'Root (Magisk / KernelSU / APatch)',
    requiresRoot: true
  },
  PRIVILEGED_EXT: {
    label: 'Privileged Extension (Sistema / ROM)',
    requiresRoot: false
  },
  MANUAL_INTENT: {
    label: 'PackageInstaller Estándar (Prompt manual)',
    requiresRoot: false
  },
  ACCRESCENT_DAEMON: {
    label: 'Accrescent Secure Daemon',
    requiresRoot: false
  }
};

export interface StoreFeatures {
  backgroundAutoUpdates: boolean;
  unattendedRootlessUpdates: boolean;
  deltaUpdates: boolean;
  splitApkSupport: boolean;
  rollbackSupport: boolean;
  categoryBrowsing: boolean;
  exportImportList: boolean;
  torOrbotProxy: boolean;
  multiMirrorSupport: boolean;
  donationLinks: boolean;
  installedAppsManager: boolean;
  appTaggingFiltering: boolean;
  trackerScanningExodus: boolean;
  antiFeaturesWarning: boolean;
  repoAddViaQr: boolean;
}

export interface TechStackInfo {
  primaryLanguage: string;
  uiArchitecture: string;
  architecturePattern: string;
  database: string;
  networkLibrary: string;
  minSdk: number;
  targetSdk: number;
  apkPayloadSizeMb: number;
}

export interface PerformanceMetrics {
  ramUsageIdleMb: number;
  ramUsageIndexingMb: number;
  coldStartTimeMs: number;
  indexSyncSpeedSec: number;
  batteryEfficiencyScore: number;
  indexV2Support: boolean;
  overallPerformanceScore: number;
}

export interface AppStoreInfo {
  id: string;
  name: string;
  tagline: string;
  category: StoreCategory;
  githubUrl: string;
  websiteUrl: string;
  license: string;
  githubStars: string;
  latestVersion: string;
  latestReleaseDate: string;
  recentChangelog: string;
  projectStatus: ProjectStatus;
  easeOfUseScore: number;
  easeOfUseNotes: string;
  securityScore: number;
  securitySummary: string;
  installMethods: InstallMethod[];
  reproducibleBuilds: boolean;
  googleAccountRequirement: string;
  telemetry: string;
  repoEcosystemScore: number;
  defaultRepos: string[];
  customRepoSupport: boolean;
  gitReleasesDirectSupport: boolean;
  features: StoreFeatures;
  techStack: TechStackInfo;
  performance: PerformanceMetrics;
  keyDifferentiator: string;
  bestForUseCase: string;
  pros: string[];
  cons: string[];
}

export function getAndroidVersionName(apiLevel: number): string {
  switch (apiLevel) {
    case 14: return '4.0 (ICS)';
    case 21: return '5.0 (Lollipop)';
    case 24: return '7.0 (Nougat)';
    case 26: return '8.0 (Oreo)';
    case 28: return '9.0 (Pie)';
    case 29: return '10';
    case 30: return '11';
    case 31: return '12';
    case 33: return '13';
    case 34: return '14';
    case 35: return '15';
    default: return `API ${apiLevel}`;
  }
}

// -------------------------------------------------------------
// APP CATALOG & STORE TYPES
// -------------------------------------------------------------

export type AppCatalogCategory =
  | 'STORES'
  | 'MULTIMEDIA'
  | 'PRIVACY'
  | 'PRODUCTIVITY'
  | 'COMMUNICATION'
  | 'GAMING'
  | 'TOOLS'
  | 'CUSTOMIZATION'
  | 'FINANCE';

export type AppStackType = 
  | 'ANDROID_NATIVE' 
  | 'FLUTTER' 
  | 'REACT_NATIVE' 
  | 'CAPACITOR_PWA' 
  | 'WEB_PWA';

export type CatalogOwnershipFilter = 'ALL' | 'MY_APPS' | 'COMMUNITY';

export interface StackInfo {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  compilerCommand: string;
  buildTimeAvg: string;
}

export const STACK_DETAILS: Record<AppStackType, StackInfo> = {
  ANDROID_NATIVE: {
    label: 'Android Nativo (Kotlin/Java)',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-700/60',
    compilerCommand: './gradlew assembleRelease',
    buildTimeAvg: '2m 15s'
  },
  FLUTTER: {
    label: 'Flutter (Dart Engine)',
    badgeBg: 'bg-sky-950/80',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-700/60',
    compilerCommand: 'flutter build apk --release',
    buildTimeAvg: '3m 40s'
  },
  REACT_NATIVE: {
    label: 'React Native / Expo',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-700/60',
    compilerCommand: 'npx react-native build-android --mode=release',
    buildTimeAvg: '4m 10s'
  },
  CAPACITOR_PWA: {
    label: 'Capacitor / Ionic Web',
    badgeBg: 'bg-indigo-950/80',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-700/60',
    compilerCommand: 'npx cap sync android && ./gradlew assembleRelease',
    buildTimeAvg: '2m 50s'
  },
  WEB_PWA: {
    label: 'PWA Web-to-APK (TWA/Bubblewrap)',
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-700/60',
    compilerCommand: 'npx @bubblewrap/cli build',
    buildTimeAvg: '1m 45s'
  }
};

export interface DeveloperInfo {
  name: string;
  website?: string;
  github?: string;
  verified: boolean;
}

export interface AppCatalogItem {
  id: string;
  name: string;
  packageName: string;
  category: AppCatalogCategory;
  tagline: string;
  description: string;
  iconBg: string;
  iconGradient: string;
  iconSymbol: string; // Lucide icon name or emoji
  bannerGradient: string;
  screenshots: string[];
  rating: number;
  reviewCount: string;
  downloads: string;
  apkSizeMb: number;
  version: string;
  minAndroid: string;
  targetSdk: number;
  license: string;
  githubUrl: string;
  githubStars: string;
  isFree: boolean;
  price: string;
  developer: DeveloperInfo;
  permissions: string[];
  trackersCount: number;
  isStore: boolean;
  storeRefId?: string;
  canCompileWithCi: boolean;
  defaultBranch: string;
  gradleTask: string;
  recentReleaseDate: string;
  changelogSummary: string;
  badgeTag?: string;
  isFeatured?: boolean;
  isEditorChoice?: boolean;
  supportedArchs?: ('arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'universal')[];
  securityAuditStatus?: 'VERIFIED_CLEAN' | 'REPRODUCIBLE_AUDITED' | 'ZERO_TRACKERS' | 'COMMUNITY_SIGNED';
  healthScore?: number;
  healthGrade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  // FOSS Ingestion, Ownership & Multi-Stack Properties
  isUserApp?: boolean;
  stackType?: AppStackType;
  directApkDownloadUrl?: string;
  compiledArtifactSha256?: string;
  sha256Checksum?: string;
  sourceZipName?: string;
  emulationTestStatus?: 'PASSED' | 'FAILED' | 'PENDING' | 'SKIPPED';
  emulationLogs?: string[];
  historicalVersions?: string[];
  cloudBuildAvailable?: boolean;
  isScraped?: boolean;
  // Extended CI/CD, Physical Hardware & Crawler Audit Properties
  buildNodeEnvironment?: string;
  ciCdVerifiedDownloadUrl?: string;
  gdriveBackupDownloadUrl?: string;
  gdriveFileId?: string;
  ciCdDownloadStatus?: 'VERIFIED_IMMORTAL' | 'ACTIVE_MIRROR' | 'LOCAL_VAULT_SYNCED';
  androidPhysicalInstallStatus?: 'INSTALLED_VERIFIED' | 'PENDING_DEPLOY' | 'COMPATIBLE_QUEUED' | 'UPDATABLE' | 'ENLACE_ADB_DISPONIBLE';
  androidInstalledPackageName?: string;
  crawlerDepthMode?: 'MODERADO' | 'INTENSO';
  crawlerScreenCount?: number;
  crawlerScreens?: AppCrawlerScreenAudit[];
}

export interface AppCrawlerScreenAudit {
  screenId: string;
  screenName: string;
  activityPath: string;
  category: 'WELCOME_AUTH' | 'MAIN_DASHBOARD' | 'EXPLORER_VIEW' | 'PLAYER_VIEWER' | 'SETTINGS_CONFIG' | 'SEARCH_FILTER' | 'MODAL_DRAWER' | 'NETWORK_SYNC';
  capturedTimestamp: string;
  resolution: string;
  uiHierarchyNodesCount: number;
  crawlerDepth: 'MODERADO' | 'INTENSO';
  evidenceUrl: string;
  thumbnailUrl?: string;
  statusBadge: 'VERIFICADO_ESTABLE' | 'OPTIMIZADO' | 'REVISADO';
  detectedElements?: string[];
}

// -------------------------------------------------------------
// GITHUB ACTIONS CLOUD COMPILER TYPES
// -------------------------------------------------------------

export type BuildStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export interface BuildLogEntry {
  timestamp: string;
  step: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
}

export interface KeystoreEntry {
  id: string;
  name: string;
  alias: string;
  algorithm: 'RSA 4096-bit' | 'ECDSA P-256' | 'Ed25519';
  validUntil: string;
  sha256Fingerprint: string;
  sha1Fingerprint: string;
  isGlobalDefault: boolean;
  assignedAppIds: string[];
  createdDate: string;
  schemeV4Supported: boolean;
}

export interface ClonedAppRepo {
  appId: string;
  appName: string;
  packageName: string;
  repoUrl: string;
  branch: string;
  commitHash: string;
  clonedAt: string;
  lastSyncedAt: string;
  localPath: string;
  sizeMb: number;
  filesCount: number;
  syncStatus: 'synced' | 'pending' | 'syncing';
  uncommittedChangesCount: number;
  networkPreference: 'WIFI_ONLY' | 'CELLULAR_AND_WIFI';
  isFork?: boolean;
  forkOwner?: string;
  collaborators?: Array<{
    name: string;
    role: 'OWNER' | 'MAINTAINER' | 'CONTRIBUTOR';
    avatarLetter: string;
  }>;
}

export interface GitHubBuildRun {
  id: string;
  appId: string;
  appName: string;
  packageName: string;
  repoUrl: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  versionTag: string;
  status: BuildStatus;
  progress: number;
  currentStep: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  apkDownloadUrl?: string;
  apkSizeMb?: number;
  sha256Checksum?: string;
  logs: BuildLogEntry[];
  runner: string;
  architecture: string;
  isCustomSubmission?: boolean;
  signingKeyId?: string;
  signingKeyName?: string;
  signingKeyAlias?: string;
  signingKeyFingerprint?: string;
  signingAlgorithm?: string;
  schemeV4?: boolean;
  isRealCloudBuild?: boolean;
  telegramDeliveryStatus?: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  telegramRecipientChatId?: string;
  otaManifestPublished?: boolean;
  githubRunUrl?: string;
  buildEngine?: 'KAGGLE_CLOUD' | 'GITHUB_ACTIONS' | 'THINKPAD_SDK' | 'AUTO';
  buildNodeName?: string;
  domainDownloadUrl?: string;
  kaggleKernelUrl?: string;
}

// -------------------------------------------------------------
// DEVICE TELEMETRY & SETTINGS
// -------------------------------------------------------------

export interface DeviceTelemetry {
  model: string;
  brand: string;
  androidVersion: string;
  apiLevel: number;
  storageTotalGb: number;
  storageUsedGb: number;
  ramTotalGb: number;
  ramUsedGb: number;
  cpuCores: number;
  shizukuRunning: boolean;
  playProtectEnabled: boolean;
  unknownSourcesEnabled: boolean;
  connectionSpeedKbps: number;
}

export type StoreUiMode = 'ciber_store' | 'play_store' | 'app_store' | 'matrix_pro' | 'dev_workspace' | 'admin_catalog_matrix' | 'connected_devices' | 'android_ecosystem';

// -------------------------------------------------------------
// CIBER DEV WORKSPACE (OBSIDIAN + JIRA + SLACK + CHANGELOG SYNC)
// -------------------------------------------------------------

export type DevWorkspaceTab = 'NOTEBOOK' | 'KANBAN' | 'SLACK' | 'VISION_ROADMAP' | 'CHANGELOG_SYNC';

export interface NotebookDocument {
  id: string;
  title: string;
  folder: 'Arquitectura' | 'Roadmap 2026' | 'ADR (Decisiones)' | 'Seguridad & FOSS' | 'Sprints & Specs';
  content: string;
  tags: string[];
  lastModified: string;
  author: string;
  isPinned?: boolean;
  linkedModules?: string[];
  linkedTasks?: string[];
}

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskType = 'FEATURE' | 'ARCHITECTURE' | 'BUG' | 'SECURITY' | 'OPTIMIZATION';

export interface JiraDevTask {
  id: string;
  key: string; // e.g. CIBER-101
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  assigneeAvatar: string;
  storyPoints: number;
  sprint: string;
  tags: string[];
  linkedChangelogVersion?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SlackDevChannel {
  id: string;
  name: string;
  topic: string;
  description: string;
  unreadCount: number;
  isPrivate?: boolean;
  memberCount: number;
}

export interface DevMessageReaction {
  emoji: string;
  count: number;
  userReacted?: boolean;
}

export interface SlackDevMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar: string;
  senderRole: 'Lead Architect' | 'Core Dev' | 'Security Auditor' | 'AI Copilot' | 'CI/CD Bot';
  content: string;
  timestamp: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  reactions: DevMessageReaction[];
  threadRepliesCount: number;
  isBot?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarLetter: string;
  avatarBg: string;
  playPoints: number;
  playPointsTier: 'Bronce' | 'Plata' | 'Oro' | 'Platino';
  githubPat: string;
  githubUsername: string;
  customRepos: string[];
  wishlist: string[];
  installedAppIds: string[];
  telegramChatId?: string;
  telegramBotToken?: string;
  autoSendApkToTelegram?: boolean;
  forkedApps?: Record<string, ClonedAppRepo>;
}

export interface OtaReleaseItem {
  appId: string;
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  releaseDate: string;
  sha256Checksum: string;
  downloadUrl: string;
  fileSizeBytes: number;
  fileSizeMb: number;
  releaseNotes: string;
  minSdk: number;
  targetSdk: number;
  signatureScheme: string;
}

export interface OtaUpdateManifest {
  storeVersion: string;
  lastUpdated: string;
  channel: 'stable' | 'beta' | 'nightly';
  releases: Record<string, OtaReleaseItem>;
}

export interface DeveloperAppSubmission {
  name: string;
  packageName: string;
  category: AppCatalogCategory;
  tagline: string;
  description: string;
  version: string;
  license: string;
  priceType: 'FREE_FOSS' | 'DONATION' | 'COMMERCIAL';
  githubUrl: string;
  branch: string;
  gradleTask: string;
  developerName: string;
  minAndroid: string;
}

// -------------------------------------------------------------
// SYSTEM CHANGELOG & ARCHITECTURE LEDGER TYPES
// -------------------------------------------------------------

export interface ChangelogPhase {
  phaseNumber: number;
  name: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  keyDeliverables: string[];
}

export interface ImplementedFeatureItem {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'WORKING' | 'VERIFIED' | 'BETA';
  module: string;
  verifiedDate: string;
}

export interface PendingRoadmapItem {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'FUTURE';
  targetIteration: string;
  description: string;
  technicalRequirements: string[];
}

export interface SystemChangelogEntry {
  iterationNumber: number;
  title: string;
  promptSummary: string;
  requestDate: string;
  author: string;
  executiveSummary: string;
  architecturePhases: ChangelogPhase[];
  implementedFeatures: ImplementedFeatureItem[];
  pendingRoadmap: PendingRoadmapItem[];
  architecturalImpact: string;
  modulesAffected: string[];
}

// -------------------------------------------------------------
// COMMUNITY PROPOSALS & SUGGESTION HUB TYPES
// -------------------------------------------------------------

export type ProposalCategory =
  | 'PLAY_STORE_PARITY'
  | 'CLOUD_CI_COMPILER'
  | 'SECURITY_SHIZUKU'
  | 'REPOSITORIES_SYNC'
  | 'UI_UX_RESPONSIVE'
  | 'PERFORMANCE_BATTERY'
  | 'COMMUNITY_EXTENSIONS';

export type ProposalStatus =
  | 'PROPOSED'
  | 'UNDER_AI_ANALYSIS'
  | 'PLANNED_NEXT'
  | 'IMPLEMENTED'
  | 'ARCHIVED';

export interface AiProposalAnalysis {
  technicalFeasibilityScore: number; // 1-100
  architecturalImpact: string;
  recommendedPhase: string;
  estimatedComplexity: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA_ESTRUCTURAL';
  agentNotes: string;
  requiredComponents: string[];
}

export interface SystemProposal {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  userEmail: string;
  category: ProposalCategory;
  priorityVotes: number;
  userHasVoted: boolean;
  status: ProposalStatus;
  createdAt: string;
  tags: string[];
  aiAnalysis: AiProposalAnalysis;
}

// -------------------------------------------------------------
// MODULAR DOCUMENTATION & ARCHITECTURAL BLUEPRINTS TYPES
// -------------------------------------------------------------

export type SystemBlueprintLayer =
  | 'FRONTEND_UI'
  | 'CLOUD_CI_PIPELINE'
  | 'SECURITY_INSTALLER'
  | 'DATA_STORE'
  | 'TELEMETRY_ENGINE';

export interface ModuleDocumentation {
  id: string;
  name: string;
  layer: SystemBlueprintLayer;
  shortDescription: string;
  detailedArchitecture: string;
  inputOutputFlows: string[];
  securityAndPermissions: string;
  telemetryAndPerformance: string;
  futureEnhancements: string[];
  keyComponents: string[];
  codeLocation: string;
}

// -------------------------------------------------------------
// APP REVIEWS & RATINGS (PLAY STORE PARITY)
// -------------------------------------------------------------

export interface UserAppReview {
  id: string;
  appId: string;
  author: string;
  avatarLetter: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpfulCount: number;
  deviceInfo: string;
  versionReviewed: string;
}

export type UIThemePalette =
  | 'dark_titanium'
  | 'light_frosted'
  | 'oled_pure_black'
  | 'cyber_violet'
  | 'cupertino_glass'
  | 'amber_terminal'
  | 'solarized_forest'
  | 'midnight_navy';

export type UIVisualDensity = 'COMPACT' | 'BALANCED' | 'SPACIOUS';
export type UICornerRadius = 'SHARP' | 'BALANCED' | 'ROUNDED_PILL' | 'CUPERTINO_GLASS';

export interface ThemeProfile {
  id: UIThemePalette;
  name: string;
  category: 'DARK' | 'LIGHT' | 'OLED' | 'VIBRANT' | 'RETRO';
  tagline: string;
  bgCanvas: string;
  surfaceCard: string;
  surfaceCardSecondary: string;
  borderSubtle: string;
  borderAccent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentHover: string;
  accentGlow: string;
  badgeBg: string;
  badgeText: string;
  previewColors: string[];
}

export interface DesignSystemSettings {
  palette: UIThemePalette;
  density: UIVisualDensity;
  radius: UICornerRadius;
  enableBlurEffects: boolean;
  enableGlowEffects: boolean;
  enableSmoothTransitions: boolean;
  enableSystemSync?: boolean;
  fontScalingPercent: number;

  // Elementor-Style Live Layout & Dimension Controls
  containerMaxWidth: 'fluid' | '1200px' | '1440px' | '1600px' | '1920px' | 'custom';
  customMaxWidthPx: number;
  contentPaddingPx: number;
  cardGridColumns: 'auto' | 1 | 2 | 3 | 4 | 5 | 6;
  cardImageHeight: 'compact' | 'standard' | 'large' | 'banner';
  imageObjectFit: 'cover' | 'contain';
  imageCornerRadiusPx: number;
  baseFontSizePx: number;
  letterSpacingMode: 'tight' | 'normal' | 'wide';
  lineHeightRatio: number;
  uiScaleFactor: number;
  customHeaderHeightPx: number;
}

export type FunctionalityPreset =
  | 'FULL_POWER_DEV'
  | 'PURIST_FOSS'
  | 'CASUAL_APP_STORE'
  | 'SECURITY_AUDITOR'
  | 'ULTRA_BATTERY_SAVER'
  | 'CUSTOM';

export interface FeatureFlagsConfig {
  enableGitHubCompiler: boolean;
  enableKeystoreVault: boolean;
  enableBuildsHub: boolean;
  enableLocalRepoCloning: boolean;
  enableShizukuInstaller: boolean;
  enableSecurityAudit: boolean;
  enableCustomRepoManager: boolean;
  enableDeviceDiagnostics: boolean;
  enableDeltaPatching: boolean;
  enableRepoIndexSync: boolean;
  enableWorkspaceCollab: boolean;
  enableCommunityProposals: boolean;
  enableChangelogLedger: boolean;
  enableArchitectureDocs: boolean;
  enableCommandPalette: boolean;
  enableReviewsAndRatings: boolean;
}

export interface FunctionalityProfile {
  id: FunctionalityPreset;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  badgeColor: string;
  recommendedFor: string;
  features: FeatureFlagsConfig;
}

// -------------------------------------------------------------
// AREA 1: BUILD ENGINE & DECOMPILER TYPES
// -------------------------------------------------------------
export interface DexClassMethod {
  name: string;
  signature: string;
  accessFlags: string[];
  bytecodesCount: number;
  smaliCode: string;
}

export interface DexClassItem {
  className: string;
  packageName: string;
  accessFlags: string[];
  superClass: string;
  interfaces: string[];
  methods: DexClassMethod[];
  fields: string[];
  smaliSource: string;
}

export interface GitDiffFileChange {
  filePath: string;
  status: 'MODIFIED' | 'ADDED' | 'DELETED';
  additions: number;
  deletions: number;
  diffHunks: string[];
}

export interface GitPatchItem {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  targetRepo: string;
  status: 'DRAFT' | 'APPLIED' | 'EXPORTED';
  description: string;
  files: GitDiffFileChange[];
}

// -------------------------------------------------------------
// AREA 2: SECURITY & RUNTIME SANDBOX TYPES
// -------------------------------------------------------------
export interface RuntimeSandboxPermission {
  permissionName: string;
  protectionLevel: 'NORMAL' | 'DANGEROUS' | 'SIGNATURE' | 'PRIVILEGED';
  riskScore: number; // 0-100
  runtimeStatus: 'GRANTED' | 'DENIED' | 'PROMPTED_ON_USE' | 'REVOKED';
  backgroundAccess: boolean;
  purposeDescription: string;
  observedCallCount: number;
  lastAccessedTimestamp?: string;
}

export interface AntiTamperingAuditResult {
  packageName: string;
  versionName: string;
  installedSha256: string;
  upstreamIndexSha256: string;
  isHashMatch: boolean;
  signatureCertIssuer: string;
  signatureCertValidUntil: string;
  isCertificateRevoked: boolean;
  crlCheckStatus: 'VERIFIED_CLEAN' | 'REVOKED' | 'CHECK_PENDING';
  tamperRiskScore: number; // 0 - 100
  warnings: string[];
}

// -------------------------------------------------------------
// AREA 3: P2P MESH & NEARBY TRANSFER TYPES
// -------------------------------------------------------------
export interface NearbyPeerDevice {
  id: string;
  deviceName: string;
  deviceType: 'ANDROID_PHONE' | 'ANDROID_TABLET' | 'DESKTOP_LINUX' | 'WEB_PEER';
  ipAddress: string;
  rssiSignalStrength: number; // -30 (excelente) a -90 (débil)
  isPaired: boolean;
  activeTransferSpeedKbps?: number;
  sharedAppsCount: number;
  status: 'DISCOVERED' | 'PAIRING' | 'CONNECTED' | 'TRANSFERRING' | 'DISCONNECTED';
}

export interface NearbyTransferSession {
  sessionId: string;
  peerId: string;
  peerName: string;
  direction: 'SEND' | 'RECEIVE';
  appId: string;
  appName: string;
  packageId: string;
  apkSizeMb: number;
  progressPercent: number;
  transferSpeedMbps: number;
  status: 'PENDING_APPROVAL' | 'TRANSFERRING' | 'VERIFYING_HASH' | 'COMPLETED' | 'CANCELLED';
  sha256VerificationHash: string;
  startedAt: string;
}

// -------------------------------------------------------------
// AREA 5: ARCHITECTURE GRAPH & AUDIT TRAIL
// -------------------------------------------------------------
export interface ArchitectureNode {
  id: string;
  label: string;
  category: 'FRONTEND' | 'CI_CD' | 'SECURITY' | 'P2P_MESH' | 'STORAGE' | 'KERNEL';
  status: 'PRODUCTION' | 'BETA' | 'IN_SPRINT';
  connections: string[];
  metrics: {
    latencyMs: number;
    testCoverage: number;
    linesOfCode: number;
  };
}

export interface SettingsAuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  category: 'DESIGN' | 'FEATURE_FLAG' | 'KEYSTORE' | 'WORKSPACE';
  changeSummary: string;
  previousValue: string;
  newValue: string;
}

// -------------------------------------------------------------
// AREA 6: FAILOVER, CIRCUIT BREAKER, DEEP TELEMETRY & DEBUG LOGGING
// -------------------------------------------------------------
export type FailoverSubsystemId =
  | 'FDROID_INDEX_SYNC'
  | 'GITHUB_ACTIONS_CI'
  | 'SHIZUKU_IPC_DAEMON'
  | 'APK_SIGNING_VAULT'
  | 'DELTA_PATCH_ENGINE'
  | 'P2P_WEBRTC_MESH'
  | 'LOCAL_STORAGE_CACHE'
  | 'REPOSITORIES_RESOLVER'
  | 'SECURITY_SCANNER_EXODUS'
  | 'WEBAUTHN_HSM_SIGNER'
  | 'AUTH_SESSION_GATEWAY';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type SubsystemHealthStatus =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'FAILED'
  | 'RECOVERING'
  | 'FALLBACK_ACTIVE';

export interface FallbackRouteItem {
  level: number;
  name: string;
  description: string;
  isAvailable: boolean;
  latencyMs: number;
  endpointUrl?: string;
}

export interface ErrorRootCauseAnalysis {
  errorCode: string;
  detectedError: string;
  reason: string;
  whyItHappened: string;
  stackTraceSnippet?: string;
  timestamp: string;
  recommendedResolution: string;
  preventiveActionTaken: string;
}

export interface SubsystemHealthRecord {
  id: FailoverSubsystemId;
  name: string;
  description: string;
  category: 'NETWORK' | 'COMPILER' | 'IPC' | 'SECURITY' | 'STORAGE' | 'P2P';
  status: SubsystemHealthStatus;
  circuitState: CircuitBreakerState;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  uptimePercent: number;
  averageLatencyMs: number;
  lastLatencyMs: number;
  lastHealthCheck: string;
  lastErrorRootCause?: ErrorRootCauseAnalysis;
  fallbackReroutesCount: number;
  currentActiveFallback: string;
  fallbackChain: FallbackRouteItem[];
  antiLoopGuard: {
    maxRetries: number;
    currentRetryCount: number;
    backoffIntervalMs: number;
    loopPreventedCount: number;
    lastCircuitTripTimestamp?: string;
  };
}

export type TelemetryLogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export type TelemetryEventType =
  | 'SUBSYSTEM_INIT'
  | 'REQUEST_DISPATCH'
  | 'REQUEST_SUCCESS'
  | 'CIRCUIT_TRIP'
  | 'FAILOVER_TRIGGERED'
  | 'FALLBACK_SUCCESS'
  | 'LOOP_BLOCKED'
  | 'SELF_HEAL_PROBE'
  | 'MANUAL_INTERVENTION'
  | 'CHAOS_INJECTION';

export interface DeepTelemetryLogEntry {
  id: string;
  timestamp: string;
  traceId: string;
  spanId: string;
  subsystem: FailoverSubsystemId | 'KERNEL' | 'UI_RENDERER' | 'NETWORK_GATEWAY' | 'STORAGE_ENGINE';
  level: TelemetryLogLevel;
  eventType: TelemetryEventType;
  message: string;
  contextPayload?: Record<string, any>;
  rootCauseAnalysis?: ErrorRootCauseAnalysis;
  latencyMs?: number;
  failoverRouteUsed?: string;
}

export interface FailoverIncidentReport {
  id: string;
  subsystemId: FailoverSubsystemId;
  subsystemName: string;
  startTime: string;
  resolvedTime?: string;
  durationSeconds: number;
  errorCode: string;
  rootCause: string;
  whyItHappened: string;
  fallbackRouteTriggered: string;
  antiLoopGuardPrevented: boolean;
  recoveryVerified: boolean;
}

// -------------------------------------------------------------
// CROSS-DEVICE SYNC & FLEET MANAGEMENT (PLAY / APP STORE STYLE)
// -------------------------------------------------------------

export type DeviceType = 'PHONE' | 'TABLET' | 'DESKTOP' | 'TV' | 'WEARABLE';

export interface RemoteInstallQueueItem {
  appId: string;
  appName: string;
  packageName: string;
  requestedAt: string;
  status: 'QUEUED' | 'DOWNLOADING' | 'INSTALLED' | 'FAILED';
  progressPercent: number;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  model: string;
  deviceType: DeviceType;
  osVersion: string;
  batteryPercent: number;
  isCharging: boolean;
  storageAvailableGb: number;
  storageTotalGb: number;
  isCurrentDevice: boolean;
  isOnline: boolean;
  lastSyncedAt: string;
  installedAppIds: string[];
  pendingRemoteInstalls: RemoteInstallQueueItem[];
}

export interface CrossDeviceSyncPreferences {
  syncInstalledApps: boolean;
  syncWishlist: boolean;
  syncCustomRepos: boolean;
  syncThemesAndConfig: boolean;
  syncPlayPoints: boolean;
}

export interface CrossDeviceSyncState {
  lastSyncTimestamp: string;
  syncToken: string;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  syncedItemsCount: number;
  activeFleet: ConnectedDevice[];
  preferences: CrossDeviceSyncPreferences;
}

// -------------------------------------------------------------
// SOCIAL NETWORK, FRIENDS & INTERNAL CHAT
// -------------------------------------------------------------

export interface FriendUser {
  id: string;
  civerId: string;
  name: string;
  email: string;
  avatarLetter: string;
  avatarBg: string;
  roleBadge: string;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  customStatusMessage: string;
  mutualAppsCount: number;
  publicSharedApps: string[];
  isFriend: boolean;
  isPendingRequest?: boolean;
}

export interface SharedAppEmbed {
  appId: string;
  appName: string;
  packageName: string;
  iconSymbol: string;
  iconBg: string;
  version: string;
  rating: number;
  apkSizeMb: number;
  recommendationNote?: string;
}

export interface FileAttachmentEmbed {
  name: string;
  sizeMb: number;
  type: string;
  sha256: string;
  downloadUrl?: string;
}

export interface CodeSnippetEmbed {
  language: string;
  title: string;
  code: string;
}

export interface ChatMessage {
  id: string;
  channelId?: string;
  recipientUserId?: string; // If direct message
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  timestamp: string;
  content: string;
  sharedApp?: SharedAppEmbed;
  fileAttachment?: FileAttachmentEmbed;
  codeSnippet?: CodeSnippetEmbed;
  reactions: { emoji: string; count: number; userReacted?: boolean }[];
  isPinned?: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  unreadCount: number;
  topic: string;
  membersCount: number;
}

// -------------------------------------------------------------
// REAL-TIME COLLABORATIVE APP STUDIO & GIT SYSTEM
// -------------------------------------------------------------

export interface CollabUserCursor {
  userId: string;
  userName: string;
  userAvatar: string;
  color: string;
  activeFile: string;
  line: number;
  column: number;
  lastActive: string;
}

export interface CollabProjectFile {
  path: string;
  content: string;
  language: string;
  lastEditedBy: string;
  lastEditedAt: string;
}

export interface CollabCollaborator {
  userId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'EDITOR' | 'REVIEWER';
  avatarLetter: string;
  avatarBg: string;
  isOnline: boolean;
  cursorColor: string;
  currentFile?: string;
  cursorLine?: number;
}

export interface GitDiffItem {
  file: string;
  additions: number;
  deletions: number;
  patch: string;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  authorName: string;
  authorEmail: string;
  timestamp: string;
  branch: string;
  filesChanged: string[];
  diffs: GitDiffItem[];
  isSignedGpg: boolean;
  gpgKeyId?: string;
}

export interface GitMergeConflict {
  file: string;
  baseCode: string;
  currentCode: string;
  incomingCode: string;
  resolvedCode?: string;
}

export interface CollabAppProject {
  id: string;
  name: string;
  description: string;
  packageName: string;
  version: string;
  activeBranch: string;
  branches: string[];
  collaborators: CollabCollaborator[];
  files: CollabProjectFile[];
  activeFileIndex: number;
  commits: GitCommit[];
  stagedFiles: string[];
  hasUncommittedChanges: boolean;
  previewUrl?: string;
  previewTitle?: string;
}

// -------------------------------------------------------------
// FAULT TELEMETRY & INDEXEDDB PREVENTIVE DATABASE TYPES
// -------------------------------------------------------------

export type FaultCategory = 'CONNECTION_ERROR' | 'COMPILATION_ERROR' | 'UI_FREEZE';

export type FaultSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface FaultTelemetryRecord {
  id: string;
  timestamp: string;
  timestampMs: number;
  category: FaultCategory;
  subsystem: string;
  errorCode: string;
  title: string;
  description: string;
  severity: FaultSeverity;
  source: 'AUTOMATIC_HOOK' | 'CHAOS_TRIGGER' | 'PERFORMANCE_OBSERVER' | 'MANUAL_SIMULATION' | 'NETWORK_INTERCEPTOR';
  diagnostics: {
    durationMs?: number;
    urlOrTarget?: string;
    httpStatus?: number;
    stackTraceSnippet?: string;
    memoryUsageMb?: number;
    threadState?: 'BLOCKED' | 'WAITING' | 'RUNNABLE' | 'TIMED_OUT';
    fpsDrop?: number;
    failedTaskName?: string;
  };
  preventiveAnalysis: {
    rootCauseCategory: string;
    whyItHappened: string;
    suggestedMitigation: string;
    preventiveActionTaken: string;
    automatedRuleApplied: string;
    recurrenceRiskScore: number;
  };
  resolved: boolean;
  resolvedAt?: string;
  autoHealed: boolean;
}

export interface FaultPreventionSummary {
  totalFaults: number;
  connectionErrorsCount: number;
  compilationErrorsCount: number;
  uiFreezesCount: number;
  criticalCount: number;
  autoHealedCount: number;
  avgUiFreezeDurationMs: number;
  predictedRiskScore: number;
  activeRecommendations: string[];
  indexedDbSizeKb: number;
  lastSyncedAt: string;
}

// -------------------------------------------------------------
// CLOUD MOBILE TESTING & SCREEN CAPTURE TYPES (AGENT SUITE)
// -------------------------------------------------------------

export type CloudTestType = 
  | 'SMOKE' 
  | 'FULL' 
  | 'MONKEY_CHAOS' 
  | 'SCREENSHOT_ONLY' 
  | 'UI_AUTOMATOR';

export type CloudTestSessionStatus = 
  | 'QUEUED' 
  | 'BOOTING_AVD' 
  | 'INSTALLING_APK' 
  | 'RUNNING_TESTS' 
  | 'CAPTURING_SCREENS' 
  | 'ANALYZING_VISION' 
  | 'COMPLETED' 
  | 'FAILED';

export type AndroidDeviceFrameType = 
  | 'PIXEL_8_PRO' 
  | 'GALAXY_S24' 
  | 'SAMSUNG_A06_REAL'
  | 'TABLET_10';

export type TestExecutionTarget = 
  | 'KVM_CLOUD_RUNNER' 
  | 'THINKPAD_SAMSUNG_USB' 
  | 'HONOR_X8_MESH';

export interface PhysicalDeviceTelemetry {
  serial: string;
  model: string;
  brand: string;
  androidRelease: string;
  sdkLevel: number;
  batteryPercent: number;
  isCharging: boolean;
  batteryHealth: string;
  batteryVoltageMv: number;
  screenResolution: string;
  foregroundApp: string;
  connectionMode: 'USB' | 'WIFI_TCPIP' | 'TAILSCALE_MESH';
  ipAddress?: string;
  lastPingMs: number;
  isAuthorized: boolean;
  cpuArchitecture: string;
  ramFreeMb: number;
}

export interface UiAutomatorNode {
  id: string;
  text: string;
  resourceId: string;
  className: string;
  packageName: string;
  contentDesc: string;
  clickable: boolean;
  bounds: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface MobileCapturedScreen {
  id: string;
  label: string; // ej: "01. Splash / Arranque", "02. Pantalla Principal", "03. Interacción / Menú", "04. Modo Horizontal"
  stage: 'LAUNCH' | 'MAIN' | 'INTERACTION' | 'LANDSCAPE' | 'CHAOS';
  timestamp: string;
  dataUrl: string; // Base64 o URL directa
  width: number;
  height: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  uiElementsDetected: number;
  clickableNodesCount: number;
  anrDetected: boolean;
  contrastScore: number; // 0-100%
  agentVisionNotes: string;
  boundingBoxes?: Array<{
    id: string;
    text?: string;
    bounds: [number, number, number, number]; // [x1, y1, x2, y2]
    clickable: boolean;
    className: string;
  }>;
}

export interface AgentCloudTestVerdict {
  passed: boolean;
  healthScore: number; // 0-100%
  executionDurationSeconds: number;
  testsPassed: number;
  testsTotal: number;
  crashesCount: number;
  anrCount: number;
  peakRamMb: number;
  avgCpuPercent: number;
  findings: Array<{
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    description: string;
    suggestedFix?: string;
  }>;
  agentSummaryComment: string;
}

export interface CloudMobileTestSession {
  id: string;
  appId: string;
  appName: string;
  packageName: string;
  stackType: AppStackType;
  testType: CloudTestType;
  apiLevel: number;
  status: CloudTestSessionStatus;
  progressPercent: number;
  currentStepMessage: string;
  startedAt: string;
  completedAt?: string;
  githubRunId?: string;
  githubRunUrl?: string;
  executionTarget?: TestExecutionTarget;
  deviceTelemetry?: PhysicalDeviceTelemetry;
  capturedScreens: MobileCapturedScreen[];
  telemetryLogs: Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'ADB' | 'AGENT';
    message: string;
  }>;
  verdict?: AgentCloudTestVerdict;
  telegramDispatchStatus?: 'PENDING' | 'SENT' | 'FAILED';
  telegramSentCount?: number;
}
