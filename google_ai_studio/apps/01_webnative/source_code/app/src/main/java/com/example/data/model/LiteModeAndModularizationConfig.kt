package com.example.data.model

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

/**
 * Unique IDs representing each decoupled architectural module in WebNative.
 */
enum class AppModuleId(
    val key: String,
    val title: String,
    val shortDesc: String,
    val detailedDesc: String,
    val memoryFootprint: ModuleMemoryFootprint,
    val defaultEnabledInBalancedLite: Boolean,
    val defaultEnabledInUltraLite: Boolean
) {
    SANDBOX_ISOLATION(
        key = "sandbox_isolation",
        title = "Sandbox & Perfiles Aislados",
        shortDesc = "Cookies, almacenamiento y sesiones independientes",
        detailedDesc = "Aísla cookies, IndexedDB, WebSQL y localStorage por contenedor. Esencial para multitarea y cuentas múltiples.",
        memoryFootprint = ModuleMemoryFootprint.MEDIUM,
        defaultEnabledInBalancedLite = true,
        defaultEnabledInUltraLite = true
    ),
    SNAPTUBE_MEDIA(
        key = "snaptube_media",
        title = "Snaptube & Extractor Multimedia",
        shortDesc = "Detección de audio/video y bóveda de descargas",
        detailedDesc = "Monitoreo en tiempo real de flujos de video/audio, sniffing de peticiones .mp4/.mp3 y descargas en segundo plano.",
        memoryFootprint = ModuleMemoryFootprint.HIGH,
        defaultEnabledInBalancedLite = false,
        defaultEnabledInUltraLite = false
    ),
    AUTOMATION_BOT_CLUSTER(
        key = "automation_bot_cluster",
        title = "Cluster de Bots & Automatización",
        shortDesc = "Ejecución concurrente de bots JavaScript e IAs",
        detailedDesc = "Hilos concurrentes, disparadores de teclado virtual, recolección automatizada y monitores de tareas.",
        memoryFootprint = ModuleMemoryFootprint.HEAVY,
        defaultEnabledInBalancedLite = false,
        defaultEnabledInUltraLite = false
    ),
    QUANTUM_ADBLOCK(
        key = "quantum_adblock",
        title = "Bloqueador Cuántico de Anuncios",
        shortDesc = "Filtrado DNS y bloqueo de rastreadores",
        detailedDesc = "15 fases de filtrado cosmético y de red, acelerando la navegación y reduciendo uso de datos móviles.",
        memoryFootprint = ModuleMemoryFootprint.LOW,
        defaultEnabledInBalancedLite = false,
        defaultEnabledInUltraLite = false
    ),
    THERMAL_HARDWARE_SENTINEL(
        key = "thermal_hardware_sentinel",
        title = "Centinela Térmico & Diagnósticos",
        shortDesc = "Monitoreo de CPU, calor y mapas térmicos",
        detailedDesc = "Hilos de muestreo cada 2s para detectar sobrecalentamiento del CPU/Batería y overlays de visualización.",
        memoryFootprint = ModuleMemoryFootprint.MEDIUM,
        defaultEnabledInBalancedLite = false,
        defaultEnabledInUltraLite = false
    ),
    OTA_CI_CD_ENGINE(
        key = "ota_ci_cd_engine",
        title = "Motor OTA & CI/CD Poller",
        shortDesc = "Actualizaciones automáticas vía GitHub Actions",
        detailedDesc = "Consultas continuas a la API de GitHub, descarga de APKs compilados y despacho de actualizaciones remotas.",
        memoryFootprint = ModuleMemoryFootprint.LOW,
        defaultEnabledInBalancedLite = false,
        defaultEnabledInUltraLite = false
    ),
    SHEETS_CLOUD_SYNC(
        key = "sheets_cloud_sync",
        title = "Sincronizador Cloud Google Sheets",
        shortDesc = "Respaldo y restauración remota de webapps",
        detailedDesc = "Conexión a hojas de cálculo de Google para sincronizar catálogos de aplicaciones web de forma remota.",
        memoryFootprint = ModuleMemoryFootprint.LOW,
        defaultEnabledInBalancedLite = false,
        defaultEnabledInUltraLite = false
    ),
    WEB_EXTENSIONS_SCRIPTS(
        key = "web_extensions_scripts",
        title = "Motor de Extensiones & UserScripts",
        shortDesc = "Inyección de scripts, Tampermonkey y CSS",
        detailedDesc = "Inyección de scripts dinámicos, modificación del DOM y soporte para personalización web en tiempo de ejecución.",
        memoryFootprint = ModuleMemoryFootprint.MEDIUM,
        defaultEnabledInBalancedLite = false,
        defaultEnabledInUltraLite = false
    );

    fun getIcon(): ImageVector = when (this) {
        SANDBOX_ISOLATION -> Icons.Default.Shield
        SNAPTUBE_MEDIA -> Icons.Default.VideoLibrary
        AUTOMATION_BOT_CLUSTER -> Icons.Default.SmartToy
        QUANTUM_ADBLOCK -> Icons.Default.Security
        THERMAL_HARDWARE_SENTINEL -> Icons.Default.Thermostat
        OTA_CI_CD_ENGINE -> Icons.Default.SystemUpdate
        SHEETS_CLOUD_SYNC -> Icons.Default.CloudSync
        WEB_EXTENSIONS_SCRIPTS -> Icons.Default.Extension
    }
}

/**
 * Memory footprint indicator for a module.
 */
enum class ModuleMemoryFootprint(val label: String, val levelColorHex: Long) {
    LOW("Bajo (< 15 MB)", 0xFF4CAF50),
    MEDIUM("Medio (15 - 45 MB)", 0xFFFFB300),
    HIGH("Alto (45 - 90 MB)", 0xFFFF7043),
    HEAVY("Pesado (> 90 MB)", 0xFFF44336)
}

/**
 * Lite Mode Operating Profiles.
 */
enum class LiteModeLevel(
    val title: String,
    val subtitle: String,
    val description: String
) {
    STANDARD_PRO(
        title = "Modo Pro (Máxima Potencia)",
        subtitle = "Todos los módulos y motores activos",
        description = "Rendimiento sin restricciones con todos los subsistemas, bots, sniffing multimedia y diagnósticos habilitados."
    ),
    BALANCED_LITE(
        title = "Lite Balanceado (Recomendado)",
        subtitle = "Ahorro moderado de RAM y batería",
        description = "Suspende bots en segundo plano, extracción pesada de medios y diagnósticos visuales. Mantiene webapps y sandboxes rápidos y fluidos."
    ),
    ULTRA_LITE(
        title = "Ultra Lite (Anti-Cierres Inesperados)",
        subtitle = "Ahorro extremo de memoria (< 200MB)",
        description = "Ideal para prevenir cierres repentinos por saturación de RAM (OOM). Desactiva overlays, poller en segundo plano y extensiones complejas."
    ),
    CUSTOM_MODULAR(
        title = "Modular Personalizado",
        subtitle = "Configuración granular a tu gusto",
        description = "Activa o desactiva de manera independiente cada módulo para crear tu propio entorno optimizado a medida."
    )
}

/**
 * Comprehensive configuration state for the Lite Mode and Module Registry.
 */
data class LiteModeSettings(
    val isLiteModeEnabled: Boolean = true,
    val level: LiteModeLevel = LiteModeLevel.BALANCED_LITE,
    val customModuleOverrides: Map<String, Boolean> = emptyMap(),
    val isAutoLowRamGuardianEnabled: Boolean = true,
    val isAggressiveTrimMemoryEnabled: Boolean = true,
    val disableOverlaysInLiteMode: Boolean = true,
    val disableBackgroundBotsInLiteMode: Boolean = true,
    val disableSnaptubeSnifferInLiteMode: Boolean = true,
    val disableContinuousOtaInLiteMode: Boolean = true,
    val disableAnimationsInLiteMode: Boolean = false,
    // --- NUEVAS CAPACIDADES DE OPTIMIZACIÓN LITE ---
    val isTabHibernationEnabled: Boolean = true,
    val hibernationInactivitySeconds: Long = 180L, // 3 minutos
    val isDataSaverMediaBlockEnabled: Boolean = true, // En Ultra Lite bloquea imágenes pesadas y anima-play
    val isCssAnimationFreezeEnabled: Boolean = true, // Pausa animaciones infinitas para reducir consumo de GPU
    val isAdaptiveTaskThrottlingEnabled: Boolean = true, // Ajusta intervalos de tareas en segundo plano en lugar de apagarlas
    val isAutoDiskCacheBudgetEnabled: Boolean = true, // Presupuesto dinámico de disco y purga selectiva
    val isAdaptivePowerPolicyEnabled: Boolean = true // Gobernador de energía que relaja WakeLocks y pantalla encendida
) {
    /**
     * Checks whether a specific module is active taking into account Lite Mode state,
     * the current profile level, and any manual custom overrides.
     */
    fun isModuleActive(module: AppModuleId): Boolean {
        // If user explicitly configured an override for this module, honor it
        if (customModuleOverrides.containsKey(module.key)) {
            return customModuleOverrides[module.key] == true
        }

        if (!isLiteModeEnabled || level == LiteModeLevel.STANDARD_PRO) {
            return true
        }

        // Profile based
        return when (level) {
            LiteModeLevel.STANDARD_PRO -> true
            LiteModeLevel.BALANCED_LITE -> module.defaultEnabledInBalancedLite
            LiteModeLevel.ULTRA_LITE -> module.defaultEnabledInUltraLite
            LiteModeLevel.CUSTOM_MODULAR -> module.defaultEnabledInBalancedLite
        }
    }
}
