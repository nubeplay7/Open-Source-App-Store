package com.example.core

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView
import com.example.data.ClonedAppEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.ConcurrentHashMap

/**
 * Data holder representing an active, live running session in the DualSpace virtual container.
 * Retains DOM tree, JS context, cookies, scroll position, and navigation history in memory,
 * preventing unexpected termination or progress reset when switching between apps.
 */
data class ActiveAppSession(
    val appId: Long,
    val app: ClonedAppEntity,
    var webView: WebView? = null,
    val savedBundle: Bundle = Bundle(),
    var currentUrl: String? = null,
    var currentTitle: String? = null,
    var isBackgrounded: Boolean = false,
    var lastActiveTimestamp: Long = System.currentTimeMillis()
)

/**
 * DualSpaceSessionVault
 * High-performance container pool that keeps active cloned apps alive in RAM.
 * Ensures seamless multitasking: switching between applications retains 100% of user progress,
 * form inputs, authentication cookies, and page navigation history.
 * Integrates directly with CheckpointManager for persistence across process restarts,
 * and ResourceManager for anti-kill CPU/RAM throttling.
 */
object DualSpaceSessionVault {

    private val activeSessionsMap = ConcurrentHashMap<Long, ActiveAppSession>()

    private val _runningSessionsFlow = MutableStateFlow<List<ActiveAppSession>>(emptyList())
    val runningSessionsFlow: StateFlow<List<ActiveAppSession>> = _runningSessionsFlow.asStateFlow()

    private const val DEFAULT_DESKTOP_UA =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    /**
     * Retrieves an existing active session or provisions a new one.
     * Detaches any previous parent view to allow safe reattachment in Compose AndroidView.
     * If recovering from a process death, automatically restores the last saved disk checkpoint!
     */
    @SuppressLint("SetJavaScriptEnabled")
    fun getOrCreateSession(context: Context, app: ClonedAppEntity): ActiveAppSession {
        val existing = activeSessionsMap[app.id]
        if (existing?.webView != null) {
            // Detach from previous layout parent if needed
            val parent = existing.webView?.parent as? ViewGroup
            parent?.removeView(existing.webView)

            existing.webView?.onResume()
            existing.isBackgrounded = false
            existing.lastActiveTimestamp = System.currentTimeMillis()

            // Restore full CPU priority
            DualSpaceResourceManager.applyForegroundBoost(context, existing)

            updateFlow()
            return existing
        }

        // Create new isolated WebView instance
        val webView = WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false
                cacheMode = WebSettings.LOAD_DEFAULT
                allowFileAccess = false
                allowContentAccess = false

                if (app.packageName.contains("whatsapp")) {
                    userAgentString = DEFAULT_DESKTOP_UA
                    useWideViewPort = true
                    loadWithOverviewMode = true
                }
            }

            // Ensure cookies persist across switches
            CookieManager.getInstance().setAcceptCookie(true)
            CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
        }

        val session = ActiveAppSession(
            appId = app.id,
            app = app,
            webView = webView,
            currentUrl = app.webUrl,
            currentTitle = app.appName,
            isBackgrounded = false,
            lastActiveTimestamp = System.currentTimeMillis()
        )

        // Attempt recovery from checkpoint if process was previously killed
        val checkpoint = DualSpaceCheckpointManager.loadSessionCheckpoint(context, app.id)
        if (checkpoint != null) {
            DualSpaceCheckpointManager.restoreCheckpointIntoSession(context, checkpoint, session)
        } else {
            val targetUrl = app.webUrl ?: "https://www.google.com"
            webView.loadUrl(targetUrl)
        }

        activeSessionsMap[app.id] = session
        DualSpaceResourceManager.refreshMetrics(context)
        updateFlow()
        return session
    }

    /**
     * Minimizes a session to background when switching apps,
     * saving state without destroying memory or DOM progress.
     * Serializes a checkpoint to disk and applies CPU throttling to prevent OS kills.
     */
    fun minimizeSession(context: Context, appId: Long) {
        val session = activeSessionsMap[appId] ?: return
        session.isBackgrounded = true
        session.lastActiveTimestamp = System.currentTimeMillis()

        session.webView?.let { wv ->
            // Save state snapshot
            wv.saveState(session.savedBundle)
            session.currentUrl = wv.url
            session.currentTitle = wv.title

            // Detach from view hierarchy so it can be re-bound cleanly later
            val parent = wv.parent as? ViewGroup
            parent?.removeView(wv)
        }

        // 1. Serialize checkpoint to disk for crash recovery
        DualSpaceCheckpointManager.saveSessionCheckpoint(context, session, reason = "APP_BACKGROUND_SWITCH")

        // 2. Apply resource management & CPU throttling
        DualSpaceResourceManager.applyBackgroundThrottling(context, session)

        // 3. Persist cookies to flash storage
        try {
            CookieManager.getInstance().flush()
        } catch (_: Exception) {}

        updateFlow()
    }

    /**
     * Backwards compatible minimizeSession call.
     */
    fun minimizeSession(appId: Long) {
        val session = activeSessionsMap[appId] ?: return
        session.isBackgrounded = true
        session.lastActiveTimestamp = System.currentTimeMillis()

        session.webView?.let { wv ->
            wv.saveState(session.savedBundle)
            session.currentUrl = wv.url
            session.currentTitle = wv.title
            val parent = wv.parent as? ViewGroup
            parent?.removeView(wv)
        }

        try {
            CookieManager.getInstance().flush()
        } catch (_: Exception) {}

        updateFlow()
    }

    /**
     * Explicitly terminates and destroys a session if requested by the user.
     */
    fun closeSession(context: Context, appId: Long) {
        val session = activeSessionsMap.remove(appId)
        session?.webView?.let { wv ->
            try {
                val parent = wv.parent as? ViewGroup
                parent?.removeView(wv)
                wv.stopLoading()
                wv.clearHistory()
                wv.destroy()
            } catch (_: Exception) {}
        }
        session?.webView = null
        DualSpaceCheckpointManager.deleteCheckpoint(context, appId)
        DualSpaceResourceManager.refreshMetrics(context)
        updateFlow()
    }

    fun closeSession(appId: Long) {
        val session = activeSessionsMap.remove(appId)
        session?.webView?.let { wv ->
            try {
                val parent = wv.parent as? ViewGroup
                parent?.removeView(wv)
                wv.stopLoading()
                wv.clearHistory()
                wv.destroy()
            } catch (_: Exception) {}
        }
        session?.webView = null
        updateFlow()
    }

    /**
     * Closes all active sessions.
     */
    fun closeAllSessions() {
        activeSessionsMap.keys.toList().forEach { closeSession(it) }
    }

    fun getSession(appId: Long): ActiveAppSession? = activeSessionsMap[appId]

    fun getAllSessions(): List<ActiveAppSession> = activeSessionsMap.values.toList()

    fun getActiveSessionCount(): Int = activeSessionsMap.size

    private fun updateFlow() {
        _runningSessionsFlow.value = activeSessionsMap.values.toList().sortedByDescending { it.lastActiveTimestamp }
    }
}
