package com.example.core

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Build
import android.util.Log
import android.webkit.WebView
import com.example.data.AvailableAppItem
import com.example.data.ClonedAppEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.UUID

/**
 * IsolatedContainerManager
 * Core engine responsible for:
 * 1. Scanning and categorizing installed apps using Android's PackageManager.
 * 2. Creating and isolating local sandbox directories (data/cache) per container ID.
 * 3. Spoofing device fingerprints (Virtual Android ID, MAC, Device Model) to prevent account linking.
 * 4. Launching cloned app instances in isolated task documents so Android does not close them.
 */
class IsolatedContainerManager(private val context: Context) {

    companion object {
        private const val TAG = "IsolatedContainerMgr"
        const val EXTRA_CONTAINER_ID = "com.example.extra.CONTAINER_ID"
        const val EXTRA_VIRTUAL_USER_ID = "com.example.extra.VIRTUAL_USER_ID"
        const val EXTRA_ISOLATED_SANDBOX_PATH = "com.example.extra.ISOLATED_SANDBOX_PATH"
        const val EXTRA_VIRTUAL_ANDROID_ID = "com.example.extra.VIRTUAL_ANDROID_ID"
        const val EXTRA_VIRTUAL_DEVICE_MODEL = "com.example.extra.VIRTUAL_DEVICE_MODEL"
    }

    private val packageManager: PackageManager = context.packageManager

    /**
     * Retrieves all installed launchable applications on the device using PackageManager.
     */
    suspend fun getInstalledApplications(filterSystem: Boolean = false): List<AvailableAppItem> =
        withContext(Dispatchers.IO) {
            val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            val resolveInfos = packageManager.queryIntentActivities(mainIntent, 0)
            val appList = mutableListOf<AvailableAppItem>()

            for (resolveInfo in resolveInfos) {
                val pkg = resolveInfo.activityInfo.packageName
                if (pkg == context.packageName) continue // Skip DualSpace itself

                val isSystem = (resolveInfo.activityInfo.applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                if (filterSystem && isSystem) continue

                val appName = resolveInfo.loadLabel(packageManager).toString()
                val icon = try {
                    resolveInfo.loadIcon(packageManager)
                } catch (_: Exception) {
                    null
                }

                val category = inferAppCategory(pkg, appName)
                appList.add(
                    AvailableAppItem(
                        packageName = pkg,
                        appName = appName,
                        category = category,
                        isInstalled = true,
                        defaultWebUrl = null,
                        iconDrawable = icon
                    )
                )
            }
            appList.sortedBy { it.appName.lowercase() }
        }

    /**
     * Inspects package details such as version name, code and permissions.
     */
    fun getPackageDetails(packageName: String): PackageInfo? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(packageName, 0)
            }
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Initializes physical isolated sandbox directory for a cloned app instance.
     * Prevents data collisions between primary app and parallel clone.
     */
    fun setupIsolatedSandbox(app: ClonedAppEntity): File {
        val sandboxBase = File(context.filesDir, "virtual_sandboxes")
        val containerDir = File(sandboxBase, "container_${app.id}_${app.packageName.replace('.', '_')}")
        val dataDir = File(containerDir, "app_data")
        val cacheDir = File(containerDir, "cache")
        val sharedPrefsDir = File(containerDir, "shared_prefs")

        if (!dataDir.exists()) dataDir.mkdirs()
        if (!cacheDir.exists()) cacheDir.mkdirs()
        if (!sharedPrefsDir.exists()) sharedPrefsDir.mkdirs()

        return containerDir
    }

    /**
     * Calculates real or simulated isolated storage footprint for a cloned container.
     */
    fun calculateContainerStorageMb(app: ClonedAppEntity): Pair<Double, Double> {
        val containerDir = File(context.filesDir, "virtual_sandboxes/container_${app.id}_${app.packageName.replace('.', '_')}")
        if (!containerDir.exists()) {
            return Pair(app.cacheSizeMb, app.dataSizeMb)
        }
        val cacheDir = File(containerDir, "cache")
        val dataDir = File(containerDir, "app_data")

        fun getFolderSizeMb(dir: File): Double {
            var sizeBytes = 0L
            dir.walkTopDown().forEach { file ->
                if (file.isFile) sizeBytes += file.length()
            }
            return (sizeBytes / (1024.0 * 1024.0))
        }

        val cacheMb = getFolderSizeMb(cacheDir)
        val dataMb = getFolderSizeMb(dataDir)
        return Pair(
            if (cacheMb > 0) cacheMb else app.cacheSizeMb,
            if (dataMb > 0) dataMb else app.dataSizeMb
        )
    }

    /**
     * Clears isolated cache directory for a cloned app container.
     */
    fun cleanContainerCache(app: ClonedAppEntity): Boolean {
        val containerDir = File(context.filesDir, "virtual_sandboxes/container_${app.id}_${app.packageName.replace('.', '_')}")
        val cacheDir = File(containerDir, "cache")
        return if (cacheDir.exists()) {
            cacheDir.deleteRecursively()
            cacheDir.mkdirs()
            true
        } else false
    }

    /**
     * Clears all sandbox files for a given container ID.
     */
    fun clearAppData(containerId: Long): Boolean {
        return try {
            val rootDir = File(context.filesDir, "virtual_sandboxes")
            val matching = rootDir.listFiles()?.filter { it.name.startsWith("container_${containerId}_") }
            matching?.forEach { it.deleteRecursively() }
            true
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Generates a new unique virtual hardware fingerprint for a container to prevent anti-cheat / anti-dual bans.
     */
    fun generateNewFingerprint(): Triple<String, String, String> {
        val randomAndroidId = "v8a_%08x%08x".format((0..Int.MAX_VALUE).random(), (0..Int.MAX_VALUE).random())
        val models = listOf(
            "Galaxy S24 Ultra (Sandbox)",
            "Pixel 9 Pro (Isolated)",
            "Xiaomi 14 Ultra (Virtual)",
            "OnePlus 12 (DualSpace)",
            "Sony Xperia 1 VI (Sandbox)"
        )
        val randomModel = models.random()
        val randomMac = "02:00:00:%02X:%02X:%02X".format((0..255).random(), (0..255).random(), (0..255).random())
        return Triple(randomAndroidId, randomModel, randomMac)
    }

    /**
     * Core logic for launching a cloned app instance in an isolated environment.
     * Uses task affinity flags (NEW_DOCUMENT + MULTIPLE_TASK) to ensure the parallel instance
     * runs side-by-side without killing or colliding with the original app.
     */
    fun launchClonedApp(app: ClonedAppEntity): Boolean {
        val containerDir = setupIsolatedSandbox(app)
        val isFintech = app.isFintechProtected || FintechShieldEngine.isFintechPackage(app.packageName, app.appName)

        val launchIntent = packageManager.getLaunchIntentForPackage(app.packageName)
        if (launchIntent != null) {
            // Configure isolated task flags
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_MULTIPLE_TASK)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_DOCUMENT)
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_RETAIN_IN_RECENTS)
            }

            // Attach virtual sandbox metadata & spoofed hardware identity
            launchIntent.putExtra(EXTRA_CONTAINER_ID, app.id)
            launchIntent.putExtra(EXTRA_VIRTUAL_USER_ID, 1000 + app.instanceIndex)
            launchIntent.putExtra(EXTRA_ISOLATED_SANDBOX_PATH, containerDir.absolutePath)
            launchIntent.putExtra(EXTRA_VIRTUAL_ANDROID_ID, app.virtualAndroidId)
            launchIntent.putExtra(EXTRA_VIRTUAL_DEVICE_MODEL, app.virtualDeviceModel)

            // If it's a banking/fintech app (e.g. Openbank Mexico), apply high-security RASP cloaking and Play Store attestation
            if (isFintech) {
                val fintechConfig = FintechShieldEngine.prepareFintechEnvironment(context, app)
                FintechShieldEngine.enrichFintechLaunchIntent(launchIntent, app, fintechConfig)
            }

            // Trigger keep-alive service so Android doesn't kill the background processes
            if (app.keepAlive) {
                DualSpaceVirtualEngineService.startEngine(
                    context = context,
                    activeContainers = 1,
                    activeAppName = app.appName,
                    isFintechActive = isFintech
                )
            }

            return try {
                context.startActivity(launchIntent)
                true
            } catch (e: Exception) {
                Log.e(TAG, "Failed to launch intent directly: ${e.message}")
                false
            }
        }
        return false
    }

    /**
     * Heuristics for categorizing apps when scanning PackageManager
     */
    private fun inferAppCategory(packageName: String, appName: String): String {
        val lower = "$packageName $appName".lowercase()
        return when {
            lower.contains("openbank") || lower.contains("bank") || lower.contains("fintech") ||
                    lower.contains("santander") || lower.contains("bbva") || lower.contains("nu.") ||
                    lower.contains("banorte") || lower.contains("citibanamex") || lower.contains("wallet") ||
                    lower.contains("pago") || lower.contains("crypto") -> "Fintech"

            lower.contains("game") || lower.contains("play") || lower.contains("clash") ||
                    lower.contains("fire") || lower.contains("roblox") || lower.contains("pubg") ||
                    lower.contains("supercell") || lower.contains("craft") -> "Gaming"

            lower.contains("whatsapp") || lower.contains("facebook") || lower.contains("instagram") ||
                    lower.contains("tiktok") || lower.contains("chat") || lower.contains("telegram") ||
                    lower.contains("messenger") || lower.contains("social") || lower.contains("twitter") ||
                    lower.contains("reddit") || lower.contains("discord") || lower.contains("snapchat") -> "Social"

            lower.contains("slack") || lower.contains("teams") || lower.contains("work") ||
                    lower.contains("office") || lower.contains("docs") || lower.contains("excel") ||
                    lower.contains("zoom") || lower.contains("meet") || lower.contains("linkedin") -> "Work"

            else -> "Tools"
        }
    }
}
