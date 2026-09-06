package com.example.model

enum class StoreCategory(val label: String, val badgeColorHex: Long) {
  ALL("Todas las categorías", 0xFF6750A4),
  PLAY_STORE_CLIENT("Cliente de Google Play", 0xFF00897B),
  FDROID_CLIENT("Cliente F-Droid / FOSS", 0xFF1E88E5),
  DIRECT_GIT_TRACKER("Actualizador Directo Git/Releases", 0xFFD81B60),
  HARDENED_SECURITY("Tienda de Alta Seguridad Criptográfica", 0xFF5E35B1),
  ALL_IN_ONE_MANAGER("Gestor Integral de Paquetes & Auditor", 0xFFE53935)
}

enum class ProjectStatus(val label: String, val isHealthy: Boolean) {
  HIGHLY_ACTIVE("Muy Activo (Actualizaciones Frecuentes)", true),
  ACTIVE("Activo y Estable", true),
  MAINTENANCE("En Mantenimiento", true),
  DISCONTINUED("Discontinuado / Fork Recomendado", false)
}

enum class GoogleAccountRequirement(val label: String, val iconDesc: String) {
  NONE_REQUIRED("No requiere ninguna cuenta", "Totalmente anónimo"),
  OPTIONAL_ANONYMOUS_TOKEN("Cuenta Google Opcional (Modo Anónimo disponible)", "Token dispenser"),
  OPTIONAL_OAUTH("Opcional para compras previas", "OAuth seguro"),
  NOT_APPLICABLE("No aplicable (Ecosistema FOSS)", "100% libre de Google")
}

enum class InstallMethod(val label: String, val requiresRoot: Boolean) {
  SESSION_INSTALLER("Session Installer (Android 12+ sin confirmación)", false),
  SHIZUKU("Shizuku (Sin Root vía ADB/Wireless)", false),
  ROOT("Root (Magisk / KernelSU / APatch)", true),
  PRIVILEGED_EXT("Privileged Extension (Sistema / ROM)", false),
  MANUAL_INTENT("PackageInstaller Estándar (Prompt manual)", false),
  ACCRESCENT_DAEMON("Accrescent Secure Daemon", false)
}

data class StoreFeatures(
  val backgroundAutoUpdates: Boolean,
  val unattendedRootlessUpdates: Boolean,
  val deltaUpdates: Boolean,
  val splitApkSupport: Boolean,
  val rollbackSupport: Boolean,
  val categoryBrowsing: Boolean,
  val exportImportList: Boolean,
  val torOrbotProxy: Boolean,
  val multiMirrorSupport: Boolean,
  val donationLinks: Boolean,
  val installedAppsManager: Boolean,
  val appTaggingFiltering: Boolean,
  val trackerScanningExodus: Boolean,
  val antiFeaturesWarning: Boolean,
  val repoAddViaQr: Boolean
)

data class TechStackInfo(
  val primaryLanguage: String,
  val uiArchitecture: String,
  val architecturePattern: String,
  val database: String,
  val networkLibrary: String,
  val minSdk: Int,
  val targetSdk: Int,
  val apkPayloadSizeMb: Float
)

data class PerformanceMetrics(
  val ramUsageIdleMb: Int,
  val ramUsageIndexingMb: Int,
  val coldStartTimeMs: Int,
  val indexSyncSpeedSec: Float,
  val batteryEfficiencyScore: Float, // 1-10
  val indexV2Support: Boolean,
  val overallPerformanceScore: Float // 1-10
)

data class AppStoreInfo(
  val id: String,
  val name: String,
  val tagline: String,
  val category: StoreCategory,
  val githubUrl: String,
  val websiteUrl: String,
  val license: String,
  val githubStars: String,
  val latestVersion: String,
  val latestReleaseDate: String,
  val recentChangelog: String,
  val projectStatus: ProjectStatus,
  val easeOfUseScore: Float, // 1-10
  val easeOfUseNotes: String,
  val securityScore: Float, // 1-10
  val securitySummary: String,
  val installMethods: List<InstallMethod>,
  val reproducibleBuilds: Boolean,
  val googleAccountRequirement: GoogleAccountRequirement,
  val telemetry: String,
  val repoEcosystemScore: Float, // 1-10
  val defaultRepos: List<String>,
  val customRepoSupport: Boolean,
  val gitReleasesDirectSupport: Boolean,
  val features: StoreFeatures,
  val techStack: TechStackInfo,
  val performance: PerformanceMetrics,
  val keyDifferentiator: String,
  val bestForUseCase: String,
  val pros: List<String>,
  val cons: List<String>
)
