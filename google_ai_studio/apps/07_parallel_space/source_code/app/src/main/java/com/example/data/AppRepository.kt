package com.example.data

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

data class AvailableAppItem(
    val packageName: String,
    val appName: String,
    val category: String,
    val isInstalled: Boolean,
    val defaultWebUrl: String? = null,
    val iconDrawable: Drawable? = null
)

class AppRepository(
    private val context: Context,
    private val dao: ClonedAppDao
) {
    val allClonedApps: Flow<List<ClonedAppEntity>> = dao.getAllClonedApps()

    fun getAppsByCategory(category: String): Flow<List<ClonedAppEntity>> = dao.getAppsByCategory(category)

    fun getPrivateApps(): Flow<List<ClonedAppEntity>> = dao.getPrivateApps()

    suspend fun insertApp(app: ClonedAppEntity): Long = dao.insertApp(app)

    suspend fun updateApp(app: ClonedAppEntity) = dao.updateApp(app)

    suspend fun deleteApp(app: ClonedAppEntity) = dao.deleteApp(app)

    suspend fun deleteAppById(id: Long) = dao.deleteAppById(id)

    suspend fun recordLaunch(id: Long) = dao.recordLaunch(id, System.currentTimeMillis())

    suspend fun clearCache(id: Long) = dao.clearCache(id)

    suspend fun clearAllCache() = dao.clearAllCache()

    suspend fun setLock(id: Long, isLocked: Boolean) = dao.setLock(id, isLocked)

    // Popular Preset Apps that users frequently clone in Parallel Space & Multi Accounts
    val popularPresets: List<AvailableAppItem> = listOf(
        AvailableAppItem("com.whatsapp", "WhatsApp", "Social", false, "https://web.whatsapp.com"),
        AvailableAppItem("com.instagram.android", "Instagram", "Social", false, "https://www.instagram.com"),
        AvailableAppItem("com.facebook.katana", "Facebook", "Social", false, "https://m.facebook.com"),
        AvailableAppItem("com.facebook.orca", "Messenger", "Social", false, "https://www.messenger.com"),
        AvailableAppItem("org.telegram.messenger", "Telegram", "Social", false, "https://web.telegram.org"),
        AvailableAppItem("com.zhiliaoapp.musically", "TikTok", "Social", false, "https://www.tiktok.com"),
        AvailableAppItem("com.twitter.android", "X (Twitter)", "Social", false, "https://x.com"),
        AvailableAppItem("com.discord", "Discord", "Social", false, "https://discord.com/app"),
        AvailableAppItem("com.reddit.frontpage", "Reddit", "Social", false, "https://www.reddit.com"),
        AvailableAppItem("com.snapchat.android", "Snapchat", "Social", false, "https://web.snapchat.com"),
        AvailableAppItem("com.google.android.youtube", "YouTube", "Social", false, "https://m.youtube.com"),
        AvailableAppItem("com.supercell.clashofclans", "Clash of Clans", "Gaming", false, null),
        AvailableAppItem("com.dts.freefireth", "Free Fire", "Gaming", false, null),
        AvailableAppItem("com.roblox.client", "Roblox", "Gaming", false, null),
        AvailableAppItem("com.supercell.brawlstars", "Brawl Stars", "Gaming", false, null),
        AvailableAppItem("com.tencent.ig", "PUBG Mobile", "Gaming", false, null),
        AvailableAppItem("com.slack", "Slack", "Work", false, "https://slack.com"),
        AvailableAppItem("com.linkedin.android", "LinkedIn", "Work", false, "https://www.linkedin.com"),
        AvailableAppItem("com.microsoft.teams", "Microsoft Teams", "Work", false, "https://teams.microsoft.com"),
        AvailableAppItem("us.zoom.videomeetings", "Zoom", "Work", false, null),
        // Banking & Fintech Shield Presets
        AvailableAppItem("mx.openbank.modelbank", "Openbank México", "Fintech", false, "https://www.openbank.mx"),
        AvailableAppItem("com.santander.app", "Santander Móvil", "Fintech", false, "https://www.santander.com.mx"),
        AvailableAppItem("com.bbva.bbvacontigo", "BBVA México", "Fintech", false, "https://www.bbva.mx"),
        AvailableAppItem("com.nu.production", "Nu México", "Fintech", false, "https://nu.com.mx"),
        AvailableAppItem("com.banorte.movil", "Banorte Móvil", "Fintech", false, "https://www.banorte.com")
    )

    // Scan installed applications from device
    suspend fun getInstalledDeviceApps(): List<AvailableAppItem> = withContext(Dispatchers.IO) {
        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        val resolveInfos = pm.queryIntentActivities(intent, 0)
        val result = mutableListOf<AvailableAppItem>()

        for (resolveInfo in resolveInfos) {
            val pkg = resolveInfo.activityInfo.packageName
            if (pkg == context.packageName) continue // skip self

            val appName = resolveInfo.loadLabel(pm).toString()
            val appIcon = resolveInfo.loadIcon(pm)
            val isSystem = (resolveInfo.activityInfo.applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0

            // Categorize by heuristics
            val lower = (pkg + " " + appName).lowercase()
            val category = when {
                lower.contains("openbank") || lower.contains("bank") || lower.contains("fintech") ||
                        lower.contains("santander") || lower.contains("bbva") || lower.contains("nu.") ||
                        lower.contains("banorte") || lower.contains("citibanamex") || lower.contains("wallet") ||
                        lower.contains("crypto") || lower.contains("binance") || lower.contains("pago") -> "Fintech"
                lower.contains("game") || lower.contains("play") -> "Gaming"
                lower.contains("chat") || lower.contains("social") || lower.contains("messag") -> "Social"
                lower.contains("work") || lower.contains("office") || lower.contains("doc") -> "Work"
                else -> "Tools"
            }

            result.add(
                AvailableAppItem(
                    packageName = pkg,
                    appName = appName,
                    category = category,
                    isInstalled = true,
                    defaultWebUrl = null,
                    iconDrawable = appIcon
                )
            )
        }
        result.sortedBy { it.appName.lowercase() }
    }
}
