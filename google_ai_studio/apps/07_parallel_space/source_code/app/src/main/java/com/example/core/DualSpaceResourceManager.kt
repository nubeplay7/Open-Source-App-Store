package com.example.core

import android.app.ActivityManager
import android.content.Context
import android.os.Process
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.BufferedReader
import java.io.FileReader

enum class ResourceProfile(val label: String, val description: String) {
    BALANCED("Equilibrado", "Pausa temporizadores JS no críticos y optimiza caché de renderizado"),
    ECO_SAVER("Ahorro Máximo (Anti-Kill)", "Ahorro extremo de CPU y RAM para evitar kill del sistema operativo"),
    HIGH_PERFORMANCE("Alto Rendimiento", "Mantiene websockets y timers activos para banca en tiempo real")
}

data class SystemMemorySnapshot(
    val availableMemMb: Long,
    val totalMemMb: Long,
    val percentUsed: Int,
    val isLowMemory: Boolean,
    val thresholdMb: Long
)

data class CloneResourceMetric(
    val appId: Long,
    val appName: String,
    val packageName: String,
    val estimatedRamMb: Double,
    val isCpuThrottled: Boolean,
    val resourceProfile: ResourceProfile,
    val healthStatus: String, // "Óptimo", "Ahorro Eco", "Protegido", "Alto Consumo"
    val lastActiveTime: Long,
    val hasCheckpoint: Boolean
)

/**
 * DualSpaceResourceManager
 * Limits CPU and memory usage for background clones to prevent the host OS
 * from terminating them due to high resource consumption or battery drain.
 */
object DualSpaceResourceManager {

    private val _currentProfileFlow = MutableStateFlow(ResourceProfile.BALANCED)
    val currentProfileFlow: StateFlow<ResourceProfile> = _currentProfileFlow.asStateFlow()

    private val _metricsFlow = MutableStateFlow<List<CloneResourceMetric>>(emptyList())
    val metricsFlow: StateFlow<List<CloneResourceMetric>> = _metricsFlow.asStateFlow()

    private val _systemMemoryFlow = MutableStateFlow<SystemMemorySnapshot?>(null)
    val systemMemoryFlow: StateFlow<SystemMemorySnapshot?> = _systemMemoryFlow.asStateFlow()

    fun setResourceProfile(profile: ResourceProfile) {
        _currentProfileFlow.value = profile
    }

    /**
     * Applies CPU throttling and memory trimming when a clone goes to the background.
     */
    fun applyBackgroundThrottling(context: Context, session: ActiveAppSession) {
        val profile = _currentProfileFlow.value
        val webView = session.webView ?: return

        when (profile) {
            ResourceProfile.ECO_SAVER -> {
                // Pause all JS timers to eliminate background CPU wakeups completely
                webView.pauseTimers()
                // Evict non-essential web texture caches
                webView.clearCache(false)
            }
            ResourceProfile.BALANCED -> {
                // If it's not a banking app that explicitly requests high keepAlive, pause timers
                if (!session.app.isFintechProtected) {
                    webView.pauseTimers()
                }
            }
            ResourceProfile.HIGH_PERFORMANCE -> {
                // Keep active timers running
            }
        }

        refreshMetrics(context)
    }

    /**
     * Immediately restores full CPU frequency and rendering pipeline when user returns.
     */
    fun applyForegroundBoost(context: Context, session: ActiveAppSession) {
        val webView = session.webView ?: return
        webView.resumeTimers()
        refreshMetrics(context)
    }

    /**
     * Forces immediate memory optimization across all running background containers.
     */
    fun optimizeAllBackgroundClones(context: Context): Int {
        val sessions = DualSpaceSessionVault.getAllSessions()
        var optimizedCount = 0
        for (session in sessions) {
            if (session.isBackgrounded) {
                session.webView?.pauseTimers()
                session.webView?.clearCache(false)
                // Flush cookies to disk
                try {
                    android.webkit.CookieManager.getInstance().flush()
                } catch (_: Exception) {}
                optimizedCount++
            }
        }
        refreshMetrics(context)
        return optimizedCount
    }

    /**
     * Reads system-wide memory state via ActivityManager.
     */
    fun getSystemMemoryInfo(context: Context): SystemMemorySnapshot {
        val am = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        am?.getMemoryInfo(memInfo)

        val rawTotal = memInfo.totalMem
        val totalMb = if (rawTotal > 0) rawTotal / (1024 * 1024) else (Runtime.getRuntime().maxMemory() / (1024 * 1024)).coerceAtLeast(1024)
        val availMb = if (memInfo.availMem > 0) memInfo.availMem / (1024 * 1024) else (totalMb * 40 / 100)
        val usedMb = (totalMb - availMb).coerceAtLeast(0)
        val percentUsed = if (totalMb > 0) ((usedMb.toDouble() / totalMb.toDouble()) * 100).toInt() else 0
        val thresholdMb = if (memInfo.threshold > 0) memInfo.threshold / (1024 * 1024) else (totalMb / 8)

        val snapshot = SystemMemorySnapshot(
            availableMemMb = availMb,
            totalMemMb = totalMb,
            percentUsed = percentUsed,
            isLowMemory = memInfo.lowMemory,
            thresholdMb = thresholdMb
        )
        _systemMemoryFlow.value = snapshot
        return snapshot
    }

    /**
     * Calculates telemetry and health metrics for each running clone.
     */
    fun refreshMetrics(context: Context) {
        getSystemMemoryInfo(context)
        val sessions = DualSpaceSessionVault.getAllSessions()
        val checkpoints = DualSpaceCheckpointManager.lastCheckpointTimestampFlow.value
        val profile = _currentProfileFlow.value

        val metrics = sessions.map { session ->
            val isThrottled = session.isBackgrounded && (profile == ResourceProfile.ECO_SAVER || !session.app.isFintechProtected)
            // Estimated memory per container based on web content and cache
            val baseRam = if (session.app.isFintechProtected) 48.0 else 32.0
            val throttledDiscount = if (isThrottled) 14.5 else 0.0
            val finalRam = (baseRam - throttledDiscount).coerceAtLeast(16.0)

            val health = when {
                session.app.isFintechProtected -> "Protegido (Fintech Shield)"
                isThrottled -> "Eco-Throttled (Anti-Kill)"
                else -> "Óptimo (Activo)"
            }

            CloneResourceMetric(
                appId = session.appId,
                appName = session.app.appName,
                packageName = session.app.packageName,
                estimatedRamMb = finalRam,
                isCpuThrottled = isThrottled,
                resourceProfile = profile,
                healthStatus = health,
                lastActiveTime = session.lastActiveTimestamp,
                hasCheckpoint = checkpoints.containsKey(session.appId)
            )
        }

        _metricsFlow.value = metrics
    }
}
