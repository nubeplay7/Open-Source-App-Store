package com.example.core

import android.content.Context
import android.os.Bundle
import android.os.Parcel
import android.util.Base64
import android.webkit.CookieManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

data class CloneCheckpoint(
    val appId: Long,
    val packageName: String,
    val appName: String,
    val timestamp: Long,
    val currentUrl: String?,
    val currentTitle: String?,
    val serializedBundleBase64: String?,
    val cookies: String?,
    val snapshotSizeBytes: Long,
    val reason: String = "AUTO_PERIODIC"
)

/**
 * DualSpaceCheckpointManager
 * Periodically serializes the complete state of running cloned containers to disk.
 * If the host Android OS kills the process due to Low Memory or Doze mode,
 * this checkpoint enables instantaneous, seamless state recovery without progress loss.
 */
object DualSpaceCheckpointManager {

    private const val TAG = "DualSpaceCheckpoint"
    private const val CHECKPOINTS_DIR = "checkpoints"

    private var periodicJob: Job? = null

    private val _lastCheckpointTimestampFlow = MutableStateFlow<Map<Long, Long>>(emptyMap())
    val lastCheckpointTimestampFlow: StateFlow<Map<Long, Long>> = _lastCheckpointTimestampFlow.asStateFlow()

    private val _checkpointsListFlow = MutableStateFlow<List<CloneCheckpoint>>(emptyList())
    val checkpointsListFlow: StateFlow<List<CloneCheckpoint>> = _checkpointsListFlow.asStateFlow()

    private fun getCheckpointDir(context: Context): File {
        val dir = File(context.filesDir, CHECKPOINTS_DIR)
        if (!dir.exists()) dir.mkdirs()
        return dir
    }

    private fun getCheckpointFile(context: Context, appId: Long): File {
        return File(getCheckpointDir(context), "ckpt_${appId}.json")
    }

    /**
     * Serializes a live ActiveAppSession to persistent disk storage.
     */
    fun saveSessionCheckpoint(
        context: Context,
        session: ActiveAppSession,
        reason: String = "AUTO_PERIODIC"
    ): CloneCheckpoint? {
        return try {
            val webView = session.webView
            val bundle = Bundle()
            webView?.saveState(bundle) ?: bundle.putAll(session.savedBundle)

            // Convert Bundle to Base64
            val bundleBase64 = bundleToBase64(bundle)

            // Extract session cookies for the current URL
            val targetUrl = webView?.url ?: session.currentUrl
            val cookies = if (!targetUrl.isNullOrBlank()) {
                try {
                    CookieManager.getInstance().getCookie(targetUrl)
                } catch (_: Exception) {
                    null
                }
            } else null

            val json = JSONObject().apply {
                put("appId", session.appId)
                put("packageName", session.app.packageName)
                put("appName", session.app.appName)
                put("timestamp", System.currentTimeMillis())
                put("currentUrl", targetUrl)
                put("currentTitle", webView?.title ?: session.currentTitle)
                put("bundleBase64", bundleBase64 ?: "")
                put("cookies", cookies ?: "")
                put("reason", reason)
            }

            val jsonString = json.toString()
            val file = getCheckpointFile(context, session.appId)
            FileOutputStream(file).use { it.write(jsonString.toByteArray(Charsets.UTF_8)) }

            val checkpoint = CloneCheckpoint(
                appId = session.appId,
                packageName = session.app.packageName,
                appName = session.app.appName,
                timestamp = System.currentTimeMillis(),
                currentUrl = targetUrl,
                currentTitle = webView?.title ?: session.currentTitle,
                serializedBundleBase64 = bundleBase64,
                cookies = cookies,
                snapshotSizeBytes = file.length(),
                reason = reason
            )

            val updatedMap = _lastCheckpointTimestampFlow.value.toMutableMap()
            updatedMap[session.appId] = checkpoint.timestamp
            _lastCheckpointTimestampFlow.value = updatedMap

            refreshCheckpointsList(context)
            checkpoint
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Loads the serialized checkpoint from disk for a given cloned app.
     */
    fun loadSessionCheckpoint(context: Context, appId: Long): CloneCheckpoint? {
        val file = getCheckpointFile(context, appId)
        if (!file.exists()) return null
        return try {
            val jsonString = file.readText(Charsets.UTF_8)
            val json = JSONObject(jsonString)
            CloneCheckpoint(
                appId = json.optLong("appId"),
                packageName = json.optString("packageName"),
                appName = json.optString("appName"),
                timestamp = json.optLong("timestamp"),
                currentUrl = json.optString("currentUrl").takeIf { it.isNotEmpty() },
                currentTitle = json.optString("currentTitle").takeIf { it.isNotEmpty() },
                serializedBundleBase64 = json.optString("bundleBase64").takeIf { it.isNotEmpty() },
                cookies = json.optString("cookies").takeIf { it.isNotEmpty() },
                snapshotSizeBytes = file.length(),
                reason = json.optString("reason", "LOADED")
            )
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Restores a checkpoint state into a newly re-created or re-attached WebView session.
     */
    fun restoreCheckpointIntoSession(
        context: Context,
        checkpoint: CloneCheckpoint,
        session: ActiveAppSession
    ): Boolean {
        return try {
            // Restore cookies
            if (!checkpoint.currentUrl.isNullOrBlank() && !checkpoint.cookies.isNullOrBlank()) {
                CookieManager.getInstance().setCookie(checkpoint.currentUrl, checkpoint.cookies)
                CookieManager.getInstance().flush()
            }

            // Restore Bundle history if available
            if (!checkpoint.serializedBundleBase64.isNullOrBlank()) {
                val bundle = base64ToBundle(checkpoint.serializedBundleBase64)
                if (bundle != null) {
                    session.webView?.restoreState(bundle)
                    session.savedBundle.putAll(bundle)
                }
            }

            // Fallback load URL if restoreState didn't load
            if (session.webView?.url.isNullOrBlank() && !checkpoint.currentUrl.isNullOrBlank()) {
                session.webView?.loadUrl(checkpoint.currentUrl)
            }

            session.currentUrl = checkpoint.currentUrl
            session.currentTitle = checkpoint.currentTitle
            true
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Periodically serializes all running sessions every 30 seconds.
     */
    fun startPeriodicCheckpointLoop(context: Context, scope: CoroutineScope, intervalMs: Long = 30_000L) {
        if (periodicJob?.isActive == true) return
        periodicJob = scope.launch(Dispatchers.IO) {
            while (isActive) {
                delay(intervalMs)
                try {
                    val activeSessions = DualSpaceSessionVault.getAllSessions()
                    for (session in activeSessions) {
                        saveSessionCheckpoint(context, session, reason = "AUTO_PERIODIC_RECOVERY")
                    }
                } catch (_: Exception) {}
            }
        }
    }

    fun stopPeriodicCheckpointLoop() {
        periodicJob?.cancel()
        periodicJob = null
    }

    fun deleteCheckpoint(context: Context, appId: Long) {
        val file = getCheckpointFile(context, appId)
        if (file.exists()) file.delete()
        refreshCheckpointsList(context)
    }

    fun refreshCheckpointsList(context: Context) {
        val dir = getCheckpointDir(context)
        val files = dir.listFiles { _, name -> name.startsWith("ckpt_") && name.endsWith(".json") } ?: emptyArray()
        val list = files.mapNotNull { file ->
            try {
                val json = JSONObject(file.readText(Charsets.UTF_8))
                CloneCheckpoint(
                    appId = json.optLong("appId"),
                    packageName = json.optString("packageName"),
                    appName = json.optString("appName"),
                    timestamp = json.optLong("timestamp"),
                    currentUrl = json.optString("currentUrl").takeIf { it.isNotEmpty() },
                    currentTitle = json.optString("currentTitle").takeIf { it.isNotEmpty() },
                    serializedBundleBase64 = json.optString("bundleBase64").takeIf { it.isNotEmpty() },
                    cookies = json.optString("cookies").takeIf { it.isNotEmpty() },
                    snapshotSizeBytes = file.length(),
                    reason = json.optString("reason", "SAVED")
                )
            } catch (_: Exception) {
                null
            }
        }.sortedByDescending { it.timestamp }

        _checkpointsListFlow.value = list
    }

    private fun bundleToBase64(bundle: Bundle): String? {
        val parcel = Parcel.obtain()
        return try {
            bundle.writeToParcel(parcel, 0)
            val bytes = parcel.marshall()
            Base64.encodeToString(bytes, Base64.NO_WRAP)
        } catch (_: Exception) {
            null
        } finally {
            parcel.recycle()
        }
    }

    private fun base64ToBundle(base64: String): Bundle? {
        val parcel = Parcel.obtain()
        return try {
            val bytes = Base64.decode(base64, Base64.NO_WRAP)
            parcel.unmarshall(bytes, 0, bytes.size)
            parcel.setDataPosition(0)
            val bundle = Bundle()
            bundle.readFromParcel(parcel)
            bundle
        } catch (_: Exception) {
            null
        } finally {
            parcel.recycle()
        }
    }
}
