package com.example.diagnostics

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.StatFs
import com.example.core.interfaces.IDiagnosticsEngine
import com.example.util.AppLogger
import com.example.util.ContainerManager
import com.example.util.FullSystemForensicExtractor
import com.example.util.MasterSystemDiagnosticsEngine
import com.example.util.NativeAppCloneManager
import com.example.util.SystemDiagnosticSummary
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Domain Facade for System Diagnostics, QA, and Forensics.
 */
object DiagnosticsEngineFacade : IDiagnosticsEngine {

    override suspend fun generateCompleteDiagnostics(context: Context): SystemDiagnosticSummary = withContext(Dispatchers.IO) {
        val appContext = context.applicationContext
        val actManager = appContext.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager?.getMemoryInfo(memInfo)

        val totalRamMb = memInfo.totalMem / (1024 * 1024)
        val availRamMb = memInfo.availMem / (1024 * 1024)
        val usedRamMb = totalRamMb - availRamMb
        val ramPercent = if (totalRamMb > 0) ((usedRamMb.toDouble() / totalRamMb) * 100).toInt() else 0

        var freeStorageMb = 0L
        var totalStorageMb = 0L
        try {
            val stat = StatFs(Environment.getDataDirectory().path)
            val blockSize = stat.blockSizeLong
            freeStorageMb = (stat.availableBlocksLong * blockSize) / (1024 * 1024)
            totalStorageMb = (stat.blockCountLong * blockSize) / (1024 * 1024)
        } catch (_: Exception) {}

        val batteryLvl = getBatteryLevel(appContext)
        val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

        SystemDiagnosticSummary(
            timestamp = timestamp,
            deviceModel = "${Build.MANUFACTURER} ${Build.MODEL}",
            androidVersion = "Android ${Build.VERSION.RELEASE}",
            sdkInt = Build.VERSION.SDK_INT,
            cpuCores = Runtime.getRuntime().availableProcessors(),
            ramTotalMb = totalRamMb,
            ramAvailableMb = availRamMb,
            ramUsagePercent = ramPercent,
            internalStorageFreeMb = freeStorageMb,
            internalStorageTotalMb = totalStorageMb,
            appDirSizeBytes = appContext.filesDir.length(),
            isRooted = false,
            isVpnActive = false,
            isBatteryOptimizedBypassed = true,
            batteryLevel = batteryLvl,
            activeContainersCount = ContainerManager.allContainers.value.size,
            totalCookiesCount = 0,
            clonedSnapshotsCount = NativeAppCloneManager.clonedSnapshots.value.size,
            totalLogLines = AppLogger.getLogLineCount(appContext),
            logSizeBytes = AppLogger.getLogSizeBytes(appContext)
        )
    }

    override suspend fun generateDiagnosticsJson(context: Context): JSONObject {
        return MasterSystemDiagnosticsEngine.generateJsonDiagnosticDump(context)
    }

    override suspend fun generateForensicZipBundle(context: Context): File? = withContext(Dispatchers.IO) {
        FullSystemForensicExtractor.createMegaForensicBundle(context)
    }

    override fun getBatteryLevel(context: Context): Int {
        return try {
            val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            val batteryStatus = context.registerReceiver(null, filter)
            val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
            if (level >= 0 && scale > 0) ((level.toFloat() / scale.toFloat()) * 100).toInt() else 100
        } catch (_: Exception) {
            100
        }
    }

    override fun getAvailableRamMb(context: Context): Long {
        val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager?.getMemoryInfo(memInfo)
        return memInfo.availMem / (1024 * 1024)
    }
}
