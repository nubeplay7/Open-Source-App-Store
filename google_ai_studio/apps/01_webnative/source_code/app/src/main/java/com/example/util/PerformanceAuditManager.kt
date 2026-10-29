package com.example.util

import android.app.ActivityManager
import android.content.Context
import android.os.SystemClock
import com.example.data.local.AppDatabase
import com.example.data.model.ActivityCategory
import com.example.data.model.PerformanceAuditEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object PerformanceAuditManager {

    private val appProcessStartTime = SystemClock.uptimeMillis()
    private val scope = CoroutineScope(Dispatchers.IO)
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

    /**
     * Records the application startup time (Cold or Warm)
     */
    fun recordAppStartup(context: Context, isColdStart: Boolean = true) {
        val startupDurationMs = SystemClock.uptimeMillis() - appProcessStartTime
        val now = System.currentTimeMillis()
        val memMb = getUsedMemoryMb(context)

        val rating = when {
            startupDurationMs < 400 -> "OPTIMAL"
            startupDurationMs < 900 -> "GOOD"
            startupDurationMs < 1800 -> "AVERAGE"
            else -> "NEEDS_OPTIMIZATION"
        }

        val entity = PerformanceAuditEntity(
            timestamp = now,
            dateString = dateFormat.format(Date(now)),
            eventType = if (isColdStart) "COLD_START" else "WARM_START",
            targetUrlOrName = "WebNative Engine",
            durationMs = startupDurationMs,
            memoryUsageMb = memMb,
            hardwareAccelerated = true,
            details = "Inicio de la app en ${startupDurationMs}ms con ${String.format(Locale.US, "%.1f", memMb)}MB RAM en uso",
            rating = rating
        )

        scope.launch {
            try {
                AppDatabase.getDatabase(context).performanceAuditDao().insert(entity)
                AppLogger.log(
                    context,
                    "Startup Benchmark: ${if (isColdStart) "Cold" else "Warm"} start ${startupDurationMs}ms (RAM: ${String.format(Locale.US, "%.1f", memMb)}MB)",
                    tag = "PERF_AUDIT"
                )
            } catch (e: Exception) {
                AppLogger.log(context, "Error guardando startup audit: ${e.message}", tag = "PERF_AUDIT")
            }
        }
    }

    /**
     * Records the WebView render and navigation latency
     */
    fun recordWebViewRender(
        context: Context,
        targetUrlOrName: String,
        durationMs: Long,
        isHardwareAccelerated: Boolean,
        details: String = ""
    ) {
        val now = System.currentTimeMillis()
        val memMb = getUsedMemoryMb(context)

        val rating = when {
            durationMs < 350 -> "OPTIMAL"
            durationMs < 800 -> "GOOD"
            durationMs < 1600 -> "AVERAGE"
            else -> "NEEDS_OPTIMIZATION"
        }

        val entity = PerformanceAuditEntity(
            timestamp = now,
            dateString = dateFormat.format(Date(now)),
            eventType = "WEBVIEW_RENDER",
            targetUrlOrName = targetUrlOrName,
            durationMs = durationMs,
            memoryUsageMb = memMb,
            hardwareAccelerated = isHardwareAccelerated,
            details = if (details.isNotBlank()) details else "Renderizado completado en ${durationMs}ms (GPU Boost: $isHardwareAccelerated)",
            rating = rating
        )

        scope.launch {
            try {
                AppDatabase.getDatabase(context).performanceAuditDao().insert(entity)
                AppLogger.log(
                    context,
                    "Render Benchmark: '$targetUrlOrName' en ${durationMs}ms [GPU: $isHardwareAccelerated, RAM: ${String.format(Locale.US, "%.1f", memMb)}MB]",
                    tag = "PERF_AUDIT"
                )

                if (durationMs > 2500) {
                    DevelopmentActivityLogManager.logActivity(
                        context = context,
                        title = "Alerta de Latencia de Render: $targetUrlOrName",
                        description = "El sitio tardó ${durationMs}ms en renderizar completamente. Sugerencia: verificar scripts pesados o activar AdBlock.",
                        category = ActivityCategory.CORE_ENGINE,
                        agentTag = "PerformanceAudit",
                        affectedFiles = listOf("TurboWebView.kt"),
                        rollbackInstruction = "Asegurar que hardware acceleration esté activa y limpiar cache DOM."
                    )
                }
            } catch (e: Exception) {
                AppLogger.log(context, "Error guardando webview render audit: ${e.message}", tag = "PERF_AUDIT")
            }
        }
    }

    fun getAuditsFlow(context: Context): Flow<List<PerformanceAuditEntity>> {
        return AppDatabase.getDatabase(context).performanceAuditDao().getRecentAudits(50)
    }

    fun clearAllAudits(context: Context, onDone: (() -> Unit)? = null) {
        scope.launch {
            try {
                AppDatabase.getDatabase(context).performanceAuditDao().deleteAll()
                AppLogger.log(context, "Historial de métricas de rendimiento limpiado", tag = "PERF_AUDIT")
                onDone?.invoke()
            } catch (e: Exception) {
                AppLogger.log(context, "Error limpiando audits: ${e.message}", tag = "PERF_AUDIT")
            }
        }
    }

    private fun getUsedMemoryMb(context: Context): Double {
        return try {
            val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
            val memInfo = ActivityManager.MemoryInfo()
            actManager?.getMemoryInfo(memInfo)
            val usedBytes = memInfo.totalMem - memInfo.availMem
            usedBytes / (1024.0 * 1024.0)
        } catch (e: Exception) {
            val runtime = Runtime.getRuntime()
            (runtime.totalMemory() - runtime.freeMemory()) / (1024.0 * 1024.0)
        }
    }
}
