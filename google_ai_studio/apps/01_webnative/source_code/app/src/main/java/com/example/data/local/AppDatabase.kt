package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.model.BookmarkEntity
import com.example.data.model.BrowserHistoryEntity
import com.example.data.model.ContainerAuditLogEntity
import com.example.data.model.ContainerProfileEntity
import com.example.data.model.ContainerSnapshotEntity
import com.example.data.model.DevelopmentActivityEntity
import com.example.data.model.GrowthPlanEntity
import com.example.data.model.NetworkTrafficEntity
import com.example.data.model.PerformanceAuditEntity
import com.example.data.model.SiteBlueprintEntity
import com.example.data.model.SiteCapabilityEntity
import com.example.data.model.SiteElementNodeEntity
import com.example.data.model.UserSessionEntity
import com.example.data.model.VisualMacroAssetEntity
import com.example.data.model.VpnProfileEntity
import com.example.data.model.WebAppEntity
import com.example.data.model.WebMacroEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        WebAppEntity::class,
        DevelopmentActivityEntity::class,
        PerformanceAuditEntity::class,
        NetworkTrafficEntity::class,
        UserSessionEntity::class,
        ContainerProfileEntity::class,
        ContainerAuditLogEntity::class,
        ContainerSnapshotEntity::class,
        WebMacroEntity::class,
        SiteBlueprintEntity::class,
        SiteElementNodeEntity::class,
        VisualMacroAssetEntity::class,
        SiteCapabilityEntity::class,
        BookmarkEntity::class,
        BrowserHistoryEntity::class,
        GrowthPlanEntity::class,
        VpnProfileEntity::class
    ],
    version = 17,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun webAppDao(): WebAppDao
    abstract fun bookmarkDao(): BookmarkDao
    abstract fun browserHistoryDao(): BrowserHistoryDao
    abstract fun developmentActivityDao(): DevelopmentActivityDao
    abstract fun performanceAuditDao(): PerformanceAuditDao
    abstract fun networkTrafficDao(): NetworkTrafficDao
    abstract fun userSessionDao(): UserSessionDao
    abstract fun containerProfileDao(): ContainerProfileDao
    abstract fun containerAuditLogDao(): ContainerAuditLogDao
    abstract fun containerSnapshotDao(): ContainerSnapshotDao
    abstract fun webMacroDao(): WebMacroDao
    abstract fun siteBlueprintDao(): SiteBlueprintDao
    abstract fun siteCapabilityDao(): SiteCapabilityDao
    abstract fun growthPlanDao(): GrowthPlanDao
    abstract fun vpnProfileDao(): VpnProfileDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        val DEFAULT_PRELOADED_APPS = listOf(
            WebAppEntity(
                name = "Bene Cloud",
                url = "https://bene.civer.cloud/",
                iconType = "EMOJI",
                iconValue = "🌟",
                accentColor = 0xFFD0BCFF,
                category = "Cloud & Empresa",
                isFullscreen = true,
                isHardwareBoostEnabled = true,
                isAdBlockEnabled = true,
                isBatterySaverBypassEnabled = true,
                customCss = "/* Bene Cloud Enterprise UI Tweaks */ header { backdrop-filter: blur(12px); }"
            ),
            WebAppEntity(
                name = "Manager Cloud",
                url = "https://manager.civer.cloud/",
                iconType = "EMOJI",
                iconValue = "📊",
                accentColor = 0xFFA6EECA,
                category = "Cloud & Empresa",
                isFullscreen = true,
                isHardwareBoostEnabled = true,
                isAdBlockEnabled = true,
                isBatterySaverBypassEnabled = true,
                customCss = "/* Manager Cloud Dashboard Styling */ .sidebar { font-family: sans-serif; }"
            ),
            WebAppEntity(
                name = "ControlDroid Cloud",
                url = "https://controldroid.civer.cloud/",
                iconType = "EMOJI",
                iconValue = "🤖",
                accentColor = 0xFFFFD999,
                category = "Cloud & Empresa",
                isFullscreen = true,
                isHardwareBoostEnabled = true,
                isAdBlockEnabled = true,
                isBatterySaverBypassEnabled = true,
                isDesktopMode = true,
                customCss = "/* Low-latency WebRTC Canvas */ canvas { image-rendering: pixelated; }"
            ),
            WebAppEntity(
                name = "Civer Cloud Portal",
                url = "https://civer.pro/",
                iconType = "EMOJI",
                iconValue = "⚡",
                accentColor = 0xFF80D8FF,
                category = "Cloud & Empresa",
                isFullscreen = true,
                isHardwareBoostEnabled = true,
                isAdBlockEnabled = true,
                isBatterySaverBypassEnabled = true
            ),
            WebAppEntity(
                name = "Civer IDE Web",
                url = "https://civer.cloud/",
                iconType = "EMOJI",
                iconValue = "💻",
                accentColor = 0xFF7D2AE8,
                category = "Desarrollo",
                isFullscreen = true,
                isHardwareBoostEnabled = true,
                isAdBlockEnabled = true,
                isBatterySaverBypassEnabled = true,
                isDesktopMode = true
            ),
            WebAppEntity(
                name = "GitHub Repositories",
                url = "https://github.com/PabloArboledai",
                iconType = "EMOJI",
                iconValue = "🐙",
                accentColor = 0xFFEADDFF,
                category = "Desarrollo",
                isFullscreen = true,
                isHardwareBoostEnabled = true,
                isAdBlockEnabled = false,
                isBatterySaverBypassEnabled = true
            ),
            WebAppEntity(
                name = "Telegram Web Bot Console",
                url = "https://web.telegram.org/a/",
                iconType = "EMOJI",
                iconValue = "✈️",
                accentColor = 0xFF2AABEE,
                category = "Comunicación",
                isFullscreen = true,
                isHardwareBoostEnabled = true,
                isAdBlockEnabled = true,
                isBatterySaverBypassEnabled = true
            ),
            WebAppEntity(
                name = "YouTube Ultra Media",
                url = "https://m.youtube.com",
                iconType = "EMOJI",
                iconValue = "▶️",
                accentColor = 0xFFFF0000,
                category = "Entretenimiento",
                isFullscreen = true,
                isHardwareBoostEnabled = true,
                isAdBlockEnabled = true,
                isBatterySaverBypassEnabled = true
            )
        )

        fun getDatabase(context: Context, scope: CoroutineScope? = null): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "webnative_database"
                )
                .addCallback(DatabaseCallback(scope))
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope?
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                val targetScope = scope ?: CoroutineScope(Dispatchers.IO)
                INSTANCE?.let { database ->
                    targetScope.launch(Dispatchers.IO) {
                        populateInitialApps(database.webAppDao())
                        populateInitialActivities(database.developmentActivityDao())
                        populateInitialContainers(database.containerProfileDao())
                        populateInitialBookmarks(database.bookmarkDao())
                    }
                }
            }

            suspend fun populateInitialBookmarks(dao: BookmarkDao) {
                val initialBookmarks = listOf(
                    BookmarkEntity(
                        title = "Google AI Studio",
                        url = "https://aistudio.google.com",
                        category = "Desarrollo & IA",
                        isPinned = true,
                        customNotes = "Plataforma de prototipado rápido con modelos Gemini"
                    ),
                    BookmarkEntity(
                        title = "YouTube",
                        url = "https://m.youtube.com",
                        category = "Multimedia",
                        isPinned = true,
                        customNotes = "Reproducción continua sin anuncios y descarga multimedia"
                    ),
                    BookmarkEntity(
                        title = "GitHub",
                        url = "https://github.com",
                        category = "Desarrollo",
                        isPinned = false,
                        customNotes = "Repositorios y flujos CI/CD"
                    ),
                    BookmarkEntity(
                        title = "TikTok",
                        url = "https://www.tiktok.com",
                        category = "Multimedia",
                        isPinned = false,
                        customNotes = "Video streaming"
                    )
                )
                dao.insertAll(initialBookmarks)
            }

            suspend fun populateInitialContainers(dao: ContainerProfileDao) {
                val initialContainers = listOf(
                    ContainerProfileEntity(
                        id = "container_main",
                        name = "Mi Sandbox Principal",
                        description = "Contenedor independiente con aislamiento de sesiones, cookies y almacenamiento dedicado.",
                        iconEmoji = "🛡️",
                        colorHex = 0xFF8B5CF6,
                        containerType = "PERSONAL",
                        storageDirName = "containers/sandbox_main",
                        associatedGoogleEmail = null,
                        associatedGoogleName = null,
                        isHardwareDirectJunctionEnabled = true,
                        isCameraJunctionAllowed = true,
                        isMicJunctionAllowed = true,
                        isGpsJunctionAllowed = true,
                        isGpuHardwareBoostAllowed = true,
                        isSensorsAllowed = true,
                        isAdBlockIsolated = true,
                        isActive = true,
                        isEphemeral = false
                    )
                )
                dao.insertAll(initialContainers)
            }

            suspend fun populateInitialApps(dao: WebAppDao) {
                for (app in DEFAULT_PRELOADED_APPS) {
                    dao.insertWebApp(app)
                }
            }

            suspend fun populateInitialActivities(dao: DevelopmentActivityDao) {
                val baseline = listOf(
                    DevelopmentActivityEntity(
                        activityId = "act-001",
                        timestamp = 1724700000000L,
                        dateString = "2026-08-25 14:30",
                        title = "Estabilización de Compilador & Compose BOM",
                        description = "Se resolvió el bug de empaquetado invisible fijando compatibilidad JVM 11 y plugins Compose.",
                        category = "CORE_ENGINE",
                        agentTag = "CoreArchitect",
                        affectedFiles = "app/build.gradle.kts, libs.versions.toml",
                        rollbackInstruction = "Verificar que jvmTarget = 11 y compose compiler version estén alineados con Kotlin 2.0.21."
                    ),
                    DevelopmentActivityEntity(
                        activityId = "act-002",
                        timestamp = 1724720000000L,
                        dateString = "2026-08-26 10:15",
                        title = "Implementación del Motor de Actualización OTA",
                        description = "Soporte para descarga autónoma e instalación nativa via FileProvider de paquetes APK generados por GitHub.",
                        category = "CICD",
                        agentTag = "OTASpecialist",
                        affectedFiles = "OtaUpdateManager.kt, AndroidManifest.xml, file_paths.xml",
                        rollbackInstruction = "Comprobar que FileProvider authority coincida con applicationId.fileprovider."
                    ),
                    DevelopmentActivityEntity(
                        activityId = "act-003",
                        timestamp = 1724740000000L,
                        dateString = "2026-08-26 16:30",
                        title = "Diagnóstico ADB & SystemProperties Reflexión",
                        description = "Lectura de sys.usb.config y persist.sys.adb.config en tiempo real para verificar el estado de depuración USB.",
                        category = "ADB_HARDWARE",
                        agentTag = "DiagnosticsAgent",
                        affectedFiles = "DeveloperDiagnosticsCard.kt, ADBManager.kt",
                        rollbackInstruction = "Usar fallback a 'getprop' en caso de que SystemProperties lance SecurityException."
                    ),
                    DevelopmentActivityEntity(
                        activityId = "act-004",
                        timestamp = 1724760000000L,
                        dateString = "2026-08-26 22:45",
                        title = "Protocolo AGENTS.md & Sistema de Observabilidad",
                        description = "Creación de AGENTS.md para memoria de agentes y AppLogger en disco para trazabilidad en tiempo real.",
                        category = "CICD",
                        agentTag = "ProtocolAgent",
                        affectedFiles = "AGENTS.md, AppLogger.kt, SystemLogsCard.kt",
                        rollbackInstruction = "Conservar AGENTS.md en la raíz del proyecto para inyección automática en el contexto."
                    )
                )
                dao.insertAll(baseline)
            }
        }
    }
}
