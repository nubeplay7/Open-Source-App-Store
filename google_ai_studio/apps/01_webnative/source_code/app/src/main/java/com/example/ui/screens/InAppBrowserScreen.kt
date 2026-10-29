package com.example.ui.screens
import kotlinx.coroutines.launch
import androidx.compose.runtime.rememberCoroutineScope
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import android.view.ViewGroup
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.graphics.Brush
import androidx.compose.material.icons.filled.Palette
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.VerticalAlignBottom
import androidx.compose.material.icons.filled.VerticalAlignTop
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.Apps
import androidx.compose.material.icons.filled.VpnKey
import androidx.compose.material.icons.filled.Sync
import com.example.ui.components.WebPullToRefreshLayout
import com.example.ui.components.BookmarksQuickAccessDialog
import com.example.ui.components.InternalMediaPlayerDialog
import com.example.ui.components.UnifiedAdBlockControlCenterDialog
import com.example.ui.components.SandboxAppsManagerDialog
import com.example.ui.components.sandbox.SandboxPasswordManagerDialog
import com.example.util.ContainerManager
import com.example.util.SessionKeepAliveEngine
import com.example.util.SandboxCredentialsManager
import com.example.util.SandboxSessionStatus
import com.example.util.MediaDownloadAllowedDomainsManager
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.model.WebAppEntity
import com.example.ui.components.AppUiCustomizationCard
import com.example.ui.components.TurboWebView
import com.example.ui.components.UrlNavigationOmnibar
import com.example.ui.components.WebInspectorCard
import com.example.ui.components.AutoClickerFloatingController
import com.example.ui.components.AutoClickerTargetMarkersOverlay
import com.example.ui.components.WebMacroRecordingOverlay
import com.example.util.AutoClickerEngine
import com.example.util.AutoClickerMode
import com.example.ui.dialogs.SitePermissionsDialog
import com.example.ui.dialogs.SiteUiCustomizationDialog
import com.example.ui.dialogs.AdvancedAppPinningDialog
import com.example.ui.dialogs.TurboCacheManagementDialog
import com.example.ui.dialogs.WebMacroAutomationDialog
import com.example.ui.dialogs.WebMacroDialogTab
import com.example.ui.dialogs.VisualBlueprintStudioDialog
import com.example.ui.dialogs.FeatureRegistryHubDialog
import com.example.ui.dialogs.AdminModularizationDialog
import com.example.util.TurboCacheManager
import androidx.compose.material.icons.filled.Speed
import com.example.ui.theme.AmberEnergy
import com.example.ui.theme.CoralError
import com.example.ui.theme.DeepPurpleContainer
import com.example.ui.theme.DeepPurpleOnPrimary
import com.example.ui.theme.ElegantCard
import com.example.ui.theme.ElegantCardBorder
import com.example.ui.theme.ElegantSurface
import com.example.ui.theme.LavenderPrimary
import com.example.ui.theme.MintSpeed
import com.example.ui.theme.RoseAccent
import com.example.ui.theme.VividCyan
import com.example.ui.theme.TextGrayLight
import com.example.ui.theme.TextWhite
import com.example.util.AppearanceSettingsManager
import com.example.util.ChatCopyInjector
import com.example.util.ShortcutManagerService
import com.example.util.SitePermissionManager
import com.example.util.SiteUiPreferencesDataStoreManager
import com.example.util.TurboPowerManager
import com.example.util.WebShortcutHelper

enum class DockDisplayMode {
    EXPANDED,
    MINI_PILL,
    PURE_IMMERSION
}

@Composable
fun InAppBrowserScreen(
    app: WebAppEntity?,
    instantUrl: String?,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val activity = context as? Activity

    val defaultUrl = remember { AppearanceSettingsManager.getDefaultHomeUrl(context) }
    val targetUrl = app?.url ?: instantUrl ?: defaultUrl
    val appName = app?.name ?: "WebNative Pro"

    // Resolve saved resume URL from DataStore unless auto-refresh is explicitly configured
    var activeResumeUrl by remember(targetUrl) { mutableStateOf(targetUrl) }
    LaunchedEffect(targetUrl) {
        val prefs = SiteUiPreferencesDataStoreManager.getSiteUiPreferences(context, targetUrl)
        if (!prefs.shouldAutoRefresh) {
            val savedState = com.example.util.WebStateDataStoreManager.getSessionState(context, targetUrl)
            if (savedState != null && savedState.url.isNotBlank() && savedState.url.startsWith("http")) {
                activeResumeUrl = savedState.url
            }
        }
    }

    val isDebugModeActive by AppearanceSettingsManager.debugModeFlow.collectAsStateWithLifecycle(
        initialValue = AppearanceSettingsManager.isDebugModeEnabled(context)
    )
    val isFloatingDockConfigured = remember { AppearanceSettingsManager.isShowFloatingDockEnabled(context) }
    val isFpsOverlayConfigured = remember { AppearanceSettingsManager.isShowFpsOverlayEnabled(context) }
    val isDevInspectorConfigured = remember { AppearanceSettingsManager.isShowDevInspectorEnabled(context) }
    val isBlockedAdsBadgeConfigured = remember { AppearanceSettingsManager.isShowBlockedAdsBadgeEnabled(context) }

    // Reactive Site UI Preferences for this specific domain (persisted in DataStore)
    val siteUiPreferences by SiteUiPreferencesDataStoreManager.getSiteUiPreferencesFlow(
        context,
        targetUrl
    ).collectAsStateWithLifecycle(initialValue = null)

    // Reactive Floating Button Visibility (controlled by Volume Keys combo and UI settings)
    val appearanceSettings by AppearanceSettingsManager.settingsFlow.collectAsStateWithLifecycle()
    val isFloatingButtonVisible by AppearanceSettingsManager.floatingButtonVisibilityFlow.collectAsStateWithLifecycle(
        initialValue = AppearanceSettingsManager.isFloatingButtonVisible(context)
    )

    // Reactive Hardware Acceleration preference
    val isHardwareAccelGlobal by AppearanceSettingsManager.hardwareAccelerationFlow.collectAsStateWithLifecycle(
        initialValue = AppearanceSettingsManager.isHardwareAccelerationEnabled(context)
    )

    val liteModeSettings by com.example.util.LiteModeManager.settingsFlow.collectAsStateWithLifecycle()

    val coroutineScope = rememberCoroutineScope()

    var currentProgress by remember { mutableFloatStateOf(0f) }
    var currentTitle by remember { mutableStateOf(appName) }
    var isDesktopMode by remember { mutableStateOf(app?.isDesktopMode ?: false) }
    var isAdBlockEnabled by remember { mutableStateOf(app?.isAdBlockEnabled ?: true) }
    var isOledBlackMode by remember { mutableStateOf(app?.isOledBlackMode ?: false) }
    var isKeepAwakeActive by remember { mutableStateOf(true) }
    var isImmersiveFullscreen by remember { 
        mutableStateOf(AppearanceSettingsManager.isGlobalImmersiveFullscreenEnabled(context) || (app?.isFullscreen == true)) 
    }
    var isTouchLockActive by remember { mutableStateOf(false) }
    var blockedAdsCount by remember { mutableIntStateOf(0) }

    // Synchronize per-site preferences from DataStore reactively
    LaunchedEffect(siteUiPreferences) {
        siteUiPreferences?.let { prefs ->
            isDesktopMode = prefs.isDesktopMode
            isAdBlockEnabled = prefs.isAdBlockEnabled
            isOledBlackMode = prefs.isOledBlack
        }
    }

    // Start in PURE_IMMERSION by default unless user enabled Floating Dock in settings or is in Debug Mode
    val initialDockMode = if (isFloatingDockConfigured || isDebugModeActive) DockDisplayMode.MINI_PILL else DockDisplayMode.PURE_IMMERSION
    var dockMode by remember { mutableStateOf(initialDockMode) }
    var showSitePermissionsDialog by remember { mutableStateOf(false) }
    var showSiteCustomizationDialog by remember { mutableStateOf(false) }
    var showWebInspectorDialog by remember { mutableStateOf(false) }
    var showUiSettingsDialog by remember { mutableStateOf(false) }
    var showAdvancedPinningDialog by remember { mutableStateOf(false) }
    var showTurboCacheDialog by remember { mutableStateOf(false) }
    var showSiteConfigScreen by remember { mutableStateOf(false) }
    var showWebMacroDialog by remember { mutableStateOf(false) }
    var showVisualBlueprintStudioDialog by remember { mutableStateOf(false) }
    var showFeatureRegistryDialog by remember { mutableStateOf(false) }
    var showAdBlockSettingsDialog by remember { mutableStateOf(false) }
    var showExtensionStoreDialog by remember { mutableStateOf(false) }
    var showSnaptubeDialog by remember { mutableStateOf(false) }
    var showBookmarksDialog by remember { mutableStateOf(false) }
    var showMediaPlayerDialog by remember { mutableStateOf(false) }
    var showUnifiedAdBlockControlCenter by remember { mutableStateOf(false) }
    var showSandboxAppsManager by remember { mutableStateOf(false) }
    var showAdminModularizationDialog by remember { mutableStateOf(false) }
    var showPasswordManagerDialog by remember { mutableStateOf(false) }
    var isPullRefreshing by remember { mutableStateOf(false) }
    var isOmnibarExpanded by remember { mutableStateOf(false) }

    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var customVideoView by remember { mutableStateOf<View?>(null) }
    var customViewCallback by remember { mutableStateOf<WebChromeClient.CustomViewCallback?>(null) }

    val activeContainer by ContainerManager.activeContainer.collectAsState()
    val activeContainerId = activeContainer?.id ?: "container_personal"
    val keepAliveStatuses by SessionKeepAliveEngine.statuses.collectAsState()
    val currentContainerKeepAlive = keepAliveStatuses[activeContainerId]
    val credentialsMap by SandboxCredentialsManager.credentialsFlow.collectAsState()
    val activeCredential = credentialsMap[activeContainerId]

    val isSignedOutDetected = currentContainerKeepAlive?.isSignedOutDetected == true ||
        activeCredential?.sessionStatus == SandboxSessionStatus.EXPIRED ||
        (webViewInstance?.url?.contains("ServiceLogin") == true) ||
        (webViewInstance?.url?.contains("signin/identifier") == true)

    val executeAutoLogin: () -> Unit = {
        val cred = activeCredential ?: SandboxCredentialsManager.loadCredentials(context)[activeContainerId]
        if (cred != null && cred.passwordDecrypted.isNotBlank()) {
            val script = SandboxCredentialsManager.buildAutoLoginScript(cred.emailOrUser, cred.passwordDecrypted)
            webViewInstance?.evaluateJavascript(script, null)
            Toast.makeText(context, "⚡ Inyectando credenciales y autenticando...", Toast.LENGTH_SHORT).show()
        } else {
            showPasswordManagerDialog = true
            Toast.makeText(context, "Añade la contraseña de esta cuenta para activar Auto-Login", Toast.LENGTH_LONG).show()
        }
    }

    LaunchedEffect(Unit) {
        com.example.util.ExtensionManager.initialize(context)
    }

    val detectedMedia by com.example.util.SnaptubeMediaEngine.detectedMediaFlow.collectAsState()

    // Dock positioning configuration
    var dockPosition by remember { mutableStateOf(AppearanceSettingsManager.getDockPosition(context)) }

    // File Chooser Attachment Bridge
    var filePathCallbackRef by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
    val fileChooserLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val uris = if (result.resultCode == Activity.RESULT_OK) {
            val intentData = result.data
            if (intentData?.clipData != null) {
                val clipData = intentData.clipData!!
                val uriList = ArrayList<Uri>()
                for (i in 0 until clipData.itemCount) {
                    uriList.add(clipData.getItemAt(i).uri)
                }
                uriList.toTypedArray()
            } else if (intentData?.data != null) {
                arrayOf(intentData.data!!)
            } else {
                null
            }
        } else {
            null
        }
        filePathCallbackRef?.onReceiveValue(uris)
        filePathCallbackRef = null
    }

    // System Permissions Launcher for WebRTC / Mic / Cam
    var pendingPermissionRequest by remember { mutableStateOf<PermissionRequest?>(null) }
    val systemPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        pendingPermissionRequest?.let { req ->
            req.grant(req.resources)
            pendingPermissionRequest = null
        }
    }

    // Immersive Fullscreen Controller for Web Container
    DisposableEffect(isImmersiveFullscreen) {
        if (activity != null) {
            val window = activity.window
            val insetsController = WindowCompat.getInsetsController(window, window.decorView)
            if (isImmersiveFullscreen) {
                insetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                insetsController.hide(WindowInsetsCompat.Type.systemBars())
            } else {
                insetsController.show(WindowInsetsCompat.Type.systemBars())
            }
        }
        onDispose {
            if (activity != null && activity !is com.example.StandaloneAppActivity) {
                val window = activity.window
                val insetsController = WindowCompat.getInsetsController(window, window.decorView)
                insetsController.show(WindowInsetsCompat.Type.systemBars())
            }
        }
    }

    // Keep screen on & activate Immortal Multitasking Lock while web is active
    DisposableEffect(siteUiPreferences?.preventCloseOnMultitask) {
        val preventClose = siteUiPreferences?.preventCloseOnMultitask ?: true
        if (activity != null) {
            TurboPowerManager.setKeepScreenOn(activity, true)
            if (preventClose) {
                TurboPowerManager.acquireWakeLock(context, "WebNative:Player:$appName")
                try {
                    com.example.util.ImmortalKeepAliveService.startImmortalLock(context, appName, targetUrl)
                } catch (_: Exception) {}
            }
        }
        onDispose {
            if (activity != null) {
                TurboPowerManager.setKeepScreenOn(activity, false)
                TurboPowerManager.releaseWakeLock()
                try {
                    com.example.util.ImmortalKeepAliveService.stopImmortalLock(context)
                } catch (_: Exception) {}
            }
        }
    }

    // Auto-inject copy buttons when webview completes loading if enabled
    LaunchedEffect(currentProgress) {
        if (currentProgress >= 1f && webViewInstance != null && AppearanceSettingsManager.isAutoInjectCopyEnabled(context)) {
            webViewInstance?.let { wv ->
                ChatCopyInjector.injectCopyButtons(wv)
            }
        }
    }

    // Seamless Session State (Scroll & Form Drafts) restoration without page reload on app resume
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        webViewInstance?.let { wv ->
            val currentWvUrl = wv.url ?: activeResumeUrl
            if (currentWvUrl.isNotBlank() && !currentWvUrl.startsWith("about:") && !currentWvUrl.startsWith("data:")) {
                com.example.util.WebStateDataStoreManager.restoreSessionStateWithoutReload(
                    webView = wv,
                    context = context,
                    scope = coroutineScope,
                    targetUrl = currentWvUrl
                )
            }
        }
    }

    // Debounced session save on pause and cookie flush
    LifecycleEventEffect(Lifecycle.Event.ON_PAUSE) {
        try {
            android.webkit.CookieManager.getInstance().flush()
        } catch (_: Exception) {}
        webViewInstance?.let { wv ->
            val currentWvUrl = wv.url ?: activeResumeUrl
            if (currentWvUrl.isNotBlank() && !currentWvUrl.startsWith("about:") && !currentWvUrl.startsWith("data:")) {
                com.example.util.WebStateDataStoreManager.scheduleDebouncedSave(
                    context = context,
                    scope = coroutineScope,
                    currentUrl = currentWvUrl,
                    scrollX = wv.scrollX,
                    scrollY = wv.scrollY,
                    title = wv.title ?: ""
                )
            }
        }
    }

    // Handle back navigation
    BackHandler {
        if (showWebInspectorDialog) {
            showWebInspectorDialog = false
        } else if (showSitePermissionsDialog) {
            showSitePermissionsDialog = false
        } else if (showSiteCustomizationDialog) {
            showSiteCustomizationDialog = false
        } else if (customVideoView != null) {
            customViewCallback?.onCustomViewHidden()
            customVideoView = null
        } else if (dockMode == DockDisplayMode.EXPANDED) {
            dockMode = DockDisplayMode.MINI_PILL
        } else if (webViewInstance?.canGoBack() == true) {
            webViewInstance?.goBack()
        } else {
            onClose()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(if (isOledBlackMode) Color.Black else ElegantSurface)
    ) {
        val globalCss = remember { com.example.util.RemoteConfigEngine.getGlobalCustomCss(context) }
        val globalJs = remember { com.example.util.RemoteConfigEngine.getGlobalCustomJs(context) }
        val combinedCss = remember(app?.customCss, globalCss) {
            listOfNotNull(app?.customCss?.takeIf { it.isNotBlank() }, globalCss.takeIf { it.isNotBlank() }).joinToString("\n")
        }
        val combinedJs = remember(app?.customJs, globalJs) {
            listOfNotNull(app?.customJs?.takeIf { it.isNotBlank() }, globalJs.takeIf { it.isNotBlank() }).joinToString("\n")
        }

        val customUa = remember(siteUiPreferences?.customUserAgent, app?.userAgent) {
            siteUiPreferences?.customUserAgent?.takeIf { it.isNotBlank() } ?: (app?.userAgent ?: "")
        }

        // Fullscreen Turbo WebView with Pull-to-Refresh
        WebPullToRefreshLayout(
            enabled = (siteUiPreferences?.shouldAutoRefresh != false),
            isRefreshing = isPullRefreshing,
            onRefresh = {
                isPullRefreshing = true
                webViewInstance?.reload()
                coroutineScope.launch {
                    kotlinx.coroutines.delay(1200)
                    isPullRefreshing = false
                }
            },
            modifier = Modifier.fillMaxSize()
        ) {
            TurboWebView(
                url = activeResumeUrl,
                modifier = Modifier.fillMaxSize(),
                isDesktopMode = isDesktopMode,
                isAdBlockEnabled = isAdBlockEnabled,
                isHardwareBoostEnabled = siteUiPreferences?.isHardwareAccelerated ?: (app?.isHardwareBoostEnabled ?: isHardwareAccelGlobal),
                isOledBlackMode = isOledBlackMode,
                customUserAgent = customUa,
                textZoom = siteUiPreferences?.textZoom ?: 100,
                isForceResponsiveViewport = siteUiPreferences?.forceResponsiveViewport ?: true,
                isFluidMediaEnabled = siteUiPreferences?.fluidMediaEnabled ?: true,
                isPreventHorizontalOverflow = siteUiPreferences?.preventHorizontalOverflow ?: true,
                showFpsCounter = ((siteUiPreferences?.showFpsCounter == true || isFpsOverlayConfigured) && isDebugModeActive),
                customCss = combinedCss,
                customJs = combinedJs,
                onProgressChange = { 
                    currentProgress = it
                    if (it >= 0.9f && isPullRefreshing) {
                        isPullRefreshing = false
                    }
                },
                onTitleChange = { currentTitle = it },
                onBlockedAdCountChange = { blockedAdsCount = it },
                onWebViewCreated = { webViewInstance = it },
                onCustomViewShow = { view, callback ->
                    customVideoView = view
                    customViewCallback = callback
                },
                onCustomViewHide = {
                    customVideoView = null
                    customViewCallback = null
                },
                onFileChooser = { callback, params ->
                    filePathCallbackRef?.onReceiveValue(null)
                    filePathCallbackRef = callback
                    val intent = params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                        type = "*/*"
                        addCategory(Intent.CATEGORY_OPENABLE)
                        putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    }
                    try {
                        fileChooserLauncher.launch(intent)
                        true
                    } catch (e: Exception) {
                        filePathCallbackRef?.onReceiveValue(null)
                        filePathCallbackRef = null
                        false
                    }
                },
                onPermissionPromptRequested = { request ->
                    pendingPermissionRequest = request
                    systemPermissionLauncher.launch(SitePermissionManager.REQUIRED_SYSTEM_PERMISSIONS)
                }
            )

            val areOverlaysAllowed = (!liteModeSettings.isLiteModeEnabled || !liteModeSettings.disableOverlaysInLiteMode)

            if (areOverlaysAllowed && com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.AUTOMATION_BOT_CLUSTER)) {
                // AutoClicker On-Screen Interactive Target Markers & Swipes Overlay
                AutoClickerTargetMarkersOverlay(
                    modifier = Modifier.fillMaxSize()
                )

                // Real-Time Visual Anchor Debug Overlay (Bounding boxes, confidence scores)
                com.example.ui.components.AutomationVisualAnchorDebugOverlay(
                    webView = webViewInstance,
                    modifier = Modifier.fillMaxSize()
                )

                // Real-Time Event Logger Overlay (Timestamps, success/failure, anchor targets)
                com.example.ui.components.AutomationEventLoggerOverlay(
                    modifier = Modifier.fillMaxSize()
                )
            }
        }

        // -------------------------------------------------------------
        // Touch Lock Fullscreen Defensive Shield
        // Consumes all touch events to protect background and foreground playback
        // -------------------------------------------------------------
        if (isTouchLockActive) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.05f))
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onTap = {
                                Toast.makeText(context, "🔒 Pantalla bloqueada. Mantén presionado el botón superior para desbloquear.", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
            ) {
                // Floating Unlock Badge
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = Color(0xEE1A1A2E),
                    shadowElevation = 8.dp,
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .statusBarsPadding()
                        .padding(top = 16.dp)
                        .border(1.5.dp, CoralError, RoundedCornerShape(24.dp))
                        .pointerInput(Unit) {
                            detectTapGestures(
                                onLongPress = {
                                    isTouchLockActive = false
                                    Toast.makeText(context, "🔓 Táctil desbloqueado", Toast.LENGTH_SHORT).show()
                                },
                                onDoubleTap = {
                                    isTouchLockActive = false
                                    Toast.makeText(context, "🔓 Táctil desbloqueado", Toast.LENGTH_SHORT).show()
                                },
                                onTap = {
                                    Toast.makeText(context, "Mantén presionado para desbloquear", Toast.LENGTH_SHORT).show()
                                }
                            )
                        }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "Desbloquear pantalla",
                            tint = CoralError,
                            modifier = Modifier.size(20.dp)
                        )
                        Column {
                            Text(
                                text = "🔒 Táctil Bloqueado (Touch Lock)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextWhite
                            )
                            Text(
                                text = "Mantén presionado aquí para desbloquear",
                                fontSize = 10.sp,
                                color = TextGrayLight
                            )
                        }
                    }
                }
            }
        }

        // Loading Progress Indicator (respects per-site UI preference)
        if (currentProgress < 1f && (siteUiPreferences?.showProgressBar != false)) {
            LinearProgressIndicator(
                progress = { currentProgress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(3.dp)
                    .align(Alignment.TopCenter)
                    .statusBarsPadding(),
                color = LavenderPrimary,
                trackColor = Color.Transparent
            )
        }

        val areFloatingOverlaysAllowed = (!liteModeSettings.isLiteModeEnabled || !liteModeSettings.disableOverlaysInLiteMode)

        if (areFloatingOverlaysAllowed && com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.AUTOMATION_BOT_CLUSTER)) {
            // Web Macro Recording & Playback Overlay (Interactive HUD)
            WebMacroRecordingOverlay(
                webView = webViewInstance,
                onOpenSaveDialog = { showWebMacroDialog = true },
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .statusBarsPadding()
            )

            // Floating AutoClicker HUD Controller (True Developers Studio replica)
            AutoClickerFloatingController(
                webView = webViewInstance,
                modifier = Modifier.fillMaxSize()
            )
        }

        // Custom Fullscreen Video Container Overlay
        if (customVideoView != null) {
            AndroidView(
                factory = { _ ->
                    FrameLayout(context).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        addView(customVideoView)
                    }
                },
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black)
            )
        }

        // Alignment logic based on dockPosition preference (defaults to BottomEnd for optimal block visibility)
        val dockBoxAlignment = when (dockPosition) {
            AppearanceSettingsManager.DOCK_POS_TOP_RIGHT -> Alignment.TopEnd
            AppearanceSettingsManager.DOCK_POS_BOTTOM_CENTER -> Alignment.BottomCenter
            else -> Alignment.BottomEnd
        }

        // -------------------------------------------------------------
        // FLOATING CONTROLS & ERGONOMIC HUD SYSTEM
        // (Can be toggled via Hardware Volume Combo or UI Settings)
        // -------------------------------------------------------------
        if (isFloatingButtonVisible) {
            // -------------------------------------------------------------
            // 1. PURE IMMERSION TRIGGER (Ultra-subtle, non-obtrusive Glassmorphism gem)
            // -------------------------------------------------------------
            if (dockMode == DockDisplayMode.PURE_IMMERSION) {
                Box(
                    modifier = Modifier
                        .align(dockBoxAlignment)
                        .navigationBarsPadding()
                        .imePadding()
                        .padding(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    listOf(
                                        DeepPurpleContainer.copy(alpha = 0.90f),
                                        Color(0xFF0F0D18).copy(alpha = 0.95f)
                                    )
                                )
                            )
                            .border(
                                1.5.dp,
                                Brush.linearGradient(
                                    listOf(
                                        LavenderPrimary.copy(alpha = 0.7f),
                                        MintSpeed.copy(alpha = 0.3f)
                                    )
                                ),
                                CircleShape
                            )
                            .clickable { dockMode = DockDisplayMode.EXPANDED }
                            .padding(8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Tune,
                            contentDescription = "Abrir Panel de Control",
                            tint = LavenderPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // -------------------------------------------------------------
            // 2. MINI PILL MODE: Sleek compact floating toolbar
            // -------------------------------------------------------------
            if (dockMode == DockDisplayMode.MINI_PILL) {
                Box(
                    modifier = Modifier
                        .align(dockBoxAlignment)
                        .statusBarsPadding()
                        .navigationBarsPadding()
                        .imePadding()
                        .padding(horizontal = 14.dp, vertical = 10.dp)
                ) {
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(32.dp))
                            .border(
                                1.dp,
                                Brush.horizontalGradient(
                                    listOf(LavenderPrimary.copy(alpha = 0.6f), MintSpeed.copy(alpha = 0.4f))
                                ),
                                RoundedCornerShape(32.dp)
                            ),
                        color = Color(0xF0141120),
                        tonalElevation = 8.dp
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            IconButton(
                                onClick = { webViewInstance?.goBack() },
                                enabled = webViewInstance?.canGoBack() == true,
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    Icons.AutoMirrored.Filled.ArrowBack,
                                    contentDescription = "Atrás",
                                    tint = if (webViewInstance?.canGoBack() == true) TextWhite else TextGrayLight.copy(alpha = 0.3f),
                                    modifier = Modifier.size(17.dp)
                                )
                            }

                            // App/Title label & Click to Open Control Panel
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(LavenderPrimary.copy(alpha = 0.18f))
                                    .clickable { dockMode = DockDisplayMode.EXPANDED }
                                    .padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Bolt, contentDescription = null, tint = LavenderPrimary, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = currentTitle.take(12) + if (currentTitle.length > 12) "…" else "",
                                    color = TextWhite,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 12.sp,
                                    maxLines = 1
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(Icons.Default.ExpandLess, contentDescription = null, tint = LavenderPrimary, modifier = Modifier.size(14.dp))
                            }

                            // Session Status Indicator & Auto-Login Quick Trigger
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSignedOutDetected) CoralError.copy(alpha = 0.22f) else MintSpeed.copy(alpha = 0.16f),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSignedOutDetected) CoralError.copy(alpha = 0.8f) else MintSpeed.copy(alpha = 0.5f)
                                ),
                                modifier = Modifier.clickable {
                                    if (isSignedOutDetected) executeAutoLogin() else showPasswordManagerDialog = true
                                }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(7.dp)
                                            .clip(CircleShape)
                                            .background(if (isSignedOutDetected) CoralError else MintSpeed)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = if (isSignedOutDetected) "Sesión Cerrada" else "Activa",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSignedOutDetected) CoralError else MintSpeed
                                    )
                                    if (isSignedOutDetected) {
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "⚡ Entrar",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Color(0xFFFFD700)
                                        )
                                    }
                                }
                            }

                            // Quick Touch Lock Action
                            IconButton(
                                onClick = {
                                    isTouchLockActive = true
                                    dockMode = DockDisplayMode.PURE_IMMERSION
                                    Toast.makeText(context, "🔒 Modo Bloqueo Táctil activado", Toast.LENGTH_SHORT).show()
                                },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(Icons.Default.Lock, contentDescription = "Bloqueo Táctil", tint = CoralError, modifier = Modifier.size(17.dp))
                            }

                            // Immersion Button
                            IconButton(
                                onClick = { dockMode = DockDisplayMode.PURE_IMMERSION },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(Icons.Default.Fullscreen, contentDescription = "Pantalla Completa", tint = MintSpeed, modifier = Modifier.size(17.dp))
                            }
                        }
                    }
                }
            }

            // -------------------------------------------------------------
            // 3. EXPANDED FULL CONTROLS MODAL: World-Class Material 3 Control Hub
            // -------------------------------------------------------------
            // Backdrop Scrim (Click outside to dismiss)
            AnimatedVisibility(
                visible = dockMode == DockDisplayMode.EXPANDED,
                enter = fadeIn(),
                exit = fadeOut(),
                modifier = Modifier.fillMaxSize()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.60f))
                        .clickable { dockMode = DockDisplayMode.PURE_IMMERSION }
                )
            }

            // Slide-up Sheet
            AnimatedVisibility(
                visible = dockMode == DockDisplayMode.EXPANDED,
                enter = fadeIn() + slideInVertically(initialOffsetY = { it }),
                exit = fadeOut() + slideOutVertically(targetOffsetY = { it }),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .navigationBarsPadding()
                    .imePadding()
                    .fillMaxWidth()
                    .widthIn(max = 540.dp)
            ) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 520.dp)
                        .padding(horizontal = 8.dp)
                        .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                        .border(
                            1.dp,
                            Brush.verticalGradient(
                                listOf(
                                    LavenderPrimary.copy(alpha = 0.6f),
                                    MintSpeed.copy(alpha = 0.2f),
                                    Color.Transparent
                                )
                            ),
                            RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
                        ),
                    color = Color(0xFD13101D),
                    tonalElevation = 16.dp
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Drag Handle Pill
                        Box(
                            modifier = Modifier
                                .width(38.dp)
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(TextGrayLight.copy(alpha = 0.35f))
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Header: WebApp Title, Host, Security & Close Button
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                modifier = Modifier.weight(1f),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(MintSpeed.copy(alpha = 0.15f))
                                        .border(1.dp, MintSpeed.copy(alpha = 0.5f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Default.Lock,
                                        contentDescription = "Conexión Segura",
                                        tint = MintSpeed,
                                        modifier = Modifier.size(15.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = currentTitle,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = TextWhite,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    val displayHost = remember(targetUrl) {
                                        try {
                                            android.net.Uri.parse(targetUrl).host ?: targetUrl
                                        } catch (e: Exception) {
                                            targetUrl
                                        }
                                    }
                                    Text(
                                        text = displayHost,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = LavenderPrimary,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }

                            // Top Quick Actions
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                // Share URL
                                IconButton(
                                    onClick = {
                                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                            type = "text/plain"
                                            putExtra(Intent.EXTRA_TEXT, webViewInstance?.url ?: targetUrl)
                                            putExtra(Intent.EXTRA_SUBJECT, currentTitle)
                                        }
                                        context.startActivity(Intent.createChooser(shareIntent, "Compartir Sitio"))
                                    },
                                    modifier = Modifier.size(34.dp)
                                ) {
                                    Icon(Icons.Default.Share, contentDescription = "Compartir", tint = TextGrayLight, modifier = Modifier.size(17.dp))
                                }

                                // Close / Dismiss Modal
                                IconButton(
                                    onClick = { dockMode = DockDisplayMode.PURE_IMMERSION },
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(DeepPurpleContainer.copy(alpha = 0.8f))
                                ) {
                                    Icon(Icons.Default.Close, contentDescription = "Cerrar Panel", tint = TextWhite, modifier = Modifier.size(18.dp))
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Session Status & Background Keep-Alive Card
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSignedOutDetected) Color(0x33FF4444) else Color(0x2210B981)
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (isSignedOutDetected) CoralError.copy(alpha = 0.7f) else MintSpeed.copy(alpha = 0.5f)
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 10.dp, vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                    Box(
                                        modifier = Modifier
                                            .size(9.dp)
                                            .clip(CircleShape)
                                            .background(if (isSignedOutDetected) CoralError else MintSpeed)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(
                                            text = if (isSignedOutDetected) "🔴 Sesión Cerrada (Saliste de tu cuenta)" else "🟢 Sesión Activa (Refresco Permanente)",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isSignedOutDetected) CoralError else MintSpeed
                                        )
                                        Text(
                                            text = if (isSignedOutDetected) "Toca 'Auto-Login' para reingresar automáticamente" else "Protección contra desconexiones activa 24/7",
                                            fontSize = 9.sp,
                                            color = TextGrayLight
                                        )
                                    }
                                }

                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                                    if (isSignedOutDetected) {
                                        Button(
                                            onClick = executeAutoLogin,
                                            colors = ButtonDefaults.buttonColors(containerColor = CoralError),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.height(28.dp)
                                        ) {
                                            Text("⚡ Auto-Login", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                                        }
                                    } else {
                                        IconButton(
                                            onClick = {
                                                coroutineScope.launch {
                                                    SessionKeepAliveEngine.performGlobalSessionRefresh(context)
                                                    Toast.makeText(context, "🔄 Verificando y refrescando sesión...", Toast.LENGTH_SHORT).show()
                                                }
                                            },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(Icons.Default.Sync, contentDescription = "Refrescar Sesión", tint = MintSpeed, modifier = Modifier.size(16.dp))
                                        }
                                    }

                                    IconButton(
                                        onClick = { showPasswordManagerDialog = true },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.VpnKey, contentDescription = "Gestor de Contraseñas", tint = LavenderPrimary, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Primary Navigation Row (Back, Forward, Reload, Search/Omnibar, Pin, Exit)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(DeepPurpleContainer.copy(alpha = 0.85f))
                                .border(1.dp, LavenderPrimary.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                                .padding(horizontal = 8.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(
                                onClick = { webViewInstance?.goBack() },
                                enabled = webViewInstance?.canGoBack() == true,
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(
                                    Icons.AutoMirrored.Filled.ArrowBack,
                                    contentDescription = "Atrás",
                                    tint = if (webViewInstance?.canGoBack() == true) TextWhite else TextGrayLight.copy(alpha = 0.3f),
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            IconButton(
                                onClick = { webViewInstance?.goForward() },
                                enabled = webViewInstance?.canGoForward() == true,
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(
                                    Icons.AutoMirrored.Filled.ArrowForward,
                                    contentDescription = "Adelante",
                                    tint = if (webViewInstance?.canGoForward() == true) TextWhite else TextGrayLight.copy(alpha = 0.3f),
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            IconButton(
                                onClick = {
                                    try {
                                        android.webkit.CookieManager.getInstance().flush()
                                    } catch (_: Exception) {}
                                    val currentWvUrl = webViewInstance?.url
                                    if (currentWvUrl.isNullOrBlank() || currentWvUrl.contains("support.google.com") || currentWvUrl.contains("accounts.google.com/b/") || currentWvUrl.contains("error")) {
                                        webViewInstance?.loadUrl(targetUrl)
                                    } else {
                                        webViewInstance?.reload()
                                    }
                                },
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(Icons.Default.Refresh, contentDescription = "Recargar", tint = LavenderPrimary, modifier = Modifier.size(20.dp))
                            }

                            IconButton(
                                onClick = { isOmnibarExpanded = !isOmnibarExpanded },
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(
                                    Icons.Default.Search,
                                    contentDescription = "Buscar o Cambiar URL",
                                    tint = if (isOmnibarExpanded) MintSpeed else TextGrayLight,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            IconButton(
                                onClick = { showAdvancedPinningDialog = true },
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(Icons.Default.PushPin, contentDescription = "Fijar al Inicio", tint = AmberEnergy, modifier = Modifier.size(20.dp))
                            }

                            IconButton(
                                onClick = onClose,
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(Icons.Default.Close, contentDescription = "Salir de App", tint = CoralError, modifier = Modifier.size(20.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // SCROLLABLE TOOLS & OPTIONS CONTAINER
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f, fill = false)
                                .verticalScroll(rememberScrollState()),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {

                        // Collapsible Omnibar for URL input & search
                        AnimatedVisibility(
                            visible = isOmnibarExpanded,
                            enter = fadeIn() + slideInVertically(),
                            exit = fadeOut() + slideOutVertically(),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(top = 10.dp)) {
                                UrlNavigationOmnibar(
                                    currentUrl = webViewInstance?.url ?: targetUrl,
                                    pageTitle = currentTitle,
                                    onNavigate = { newUrl ->
                                        webViewInstance?.loadUrl(newUrl)
                                        isOmnibarExpanded = false
                                    },
                                    onPinShortcut = {
                                        showAdvancedPinningDialog = true
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Quick Mode Chips (AdBlock, Desktop, OLED, Awake, Touch Lock, Fullscreen)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            // AdBlock Chip (visible only if module active)
                            if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.QUANTUM_ADBLOCK)) {
                                FloatingHudActionCard(
                                    icon = Icons.Default.Security,
                                    label = if (blockedAdsCount > 0) "$blockedAdsCount Ads" else "AdBlock",
                                    isActive = isAdBlockEnabled,
                                    activeColor = MintSpeed,
                                    modifier = Modifier.weight(1f),
                                    onClick = {
                                        val newAdBlock = !isAdBlockEnabled
                                        isAdBlockEnabled = newAdBlock
                                        coroutineScope.launch {
                                            val currentPrefs = siteUiPreferences ?: SiteUiPreferencesDataStoreManager.getSiteUiPreferences(context, targetUrl)
                                            SiteUiPreferencesDataStoreManager.saveSiteUiPreferences(
                                                context,
                                                currentPrefs.copy(isAdBlockEnabled = newAdBlock)
                                            )
                                            val currentRule = SitePermissionManager.getSiteRule(context, SitePermissionManager.extractDomain(targetUrl))
                                            SitePermissionManager.saveSiteRule(context, currentRule.copy(adBlockEnabled = newAdBlock))
                                        }
                                        webViewInstance?.reload()
                                    }
                                )
                            }

                            // Desktop Mode Chip
                            FloatingHudActionCard(
                                icon = Icons.Default.Computer,
                                label = if (isDesktopMode) "PC" else "Móvil",
                                isActive = isDesktopMode,
                                activeColor = LavenderPrimary,
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    val newDesktop = !isDesktopMode
                                    isDesktopMode = newDesktop
                                    coroutineScope.launch {
                                        val currentPrefs = siteUiPreferences ?: SiteUiPreferencesDataStoreManager.getSiteUiPreferences(context, targetUrl)
                                        SiteUiPreferencesDataStoreManager.saveSiteUiPreferences(
                                            context,
                                            currentPrefs.copy(isDesktopMode = newDesktop)
                                        )
                                    }
                                    webViewInstance?.reload()
                                }
                            )

                            // OLED Black Mode Chip
                            FloatingHudActionCard(
                                icon = Icons.Default.DarkMode,
                                label = "OLED",
                                isActive = isOledBlackMode,
                                activeColor = AmberEnergy,
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    val newOled = !isOledBlackMode
                                    isOledBlackMode = newOled
                                    coroutineScope.launch {
                                        val currentPrefs = siteUiPreferences ?: SiteUiPreferencesDataStoreManager.getSiteUiPreferences(context, targetUrl)
                                        SiteUiPreferencesDataStoreManager.saveSiteUiPreferences(
                                            context,
                                            currentPrefs.copy(isOledBlack = newOled)
                                        )
                                    }
                                    webViewInstance?.reload()
                                }
                            )

                            // Keep Awake Mode Chip
                            FloatingHudActionCard(
                                icon = Icons.Default.Bolt,
                                label = "Awake",
                                isActive = isKeepAwakeActive,
                                activeColor = RoseAccent,
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    isKeepAwakeActive = !isKeepAwakeActive
                                    if (activity != null) {
                                        TurboPowerManager.setKeepScreenOn(activity, isKeepAwakeActive)
                                    }
                                }
                            )

                            // Touch Lock Mode Chip
                            FloatingHudActionCard(
                                icon = Icons.Default.Lock,
                                label = "Bloq. Touch",
                                isActive = isTouchLockActive,
                                activeColor = CoralError,
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    isTouchLockActive = true
                                    dockMode = DockDisplayMode.PURE_IMMERSION
                                    Toast.makeText(context, "🔒 Bloqueo Táctil activado. Pantalla protegida contra toques.", Toast.LENGTH_LONG).show()
                                }
                            )

                            // Immersive Fullscreen Chip
                            FloatingHudActionCard(
                                icon = Icons.Default.Fullscreen,
                                label = "Inmersión",
                                isActive = isImmersiveFullscreen,
                                activeColor = Color(0xFF00E5FF),
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    isImmersiveFullscreen = !isImmersiveFullscreen
                                }
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Advanced Tools & Features Section (Clean 2-Column Grid)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Column 1
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Panel de Administración y Rendimiento (Siempre accesible para control de consumo)
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(DeepPurpleContainer.copy(alpha = 0.85f))
                                        .border(1.dp, MintSpeed.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                                        .clickable { showAdminModularizationDialog = true }
                                        .padding(horizontal = 10.dp, vertical = 9.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Tune, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Panel Administración", fontSize = 11.5.sp, color = MintSpeed, fontWeight = FontWeight.Bold)
                                }

                                // Gestor de Sandboxes y Apps (Siempre visible o activo para gestionar sandboxes)
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.SANDBOX_ISOLATION)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, LavenderPrimary.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                            .clickable { showSandboxAppsManager = true }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.Apps, contentDescription = null, tint = LavenderPrimary, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Gestor Sandboxes & Apps", fontSize = 11.5.sp, color = LavenderPrimary, fontWeight = FontWeight.Bold)
                                    }
                                }

                                // Site UI & Customization Tool
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                        .border(1.dp, LavenderPrimary.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                        .clickable { showSiteCustomizationDialog = true }
                                        .padding(horizontal = 10.dp, vertical = 9.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Palette, contentDescription = null, tint = LavenderPrimary, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Ajustes Visuales & UI", fontSize = 11.5.sp, color = TextWhite, fontWeight = FontWeight.SemiBold)
                                }

                                // Turbo Cache & Storage Management
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                        .border(1.dp, MintSpeed.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                        .clickable { showTurboCacheDialog = true }
                                        .padding(horizontal = 10.dp, vertical = 9.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Speed, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Caché Turbo & Datos", fontSize = 11.5.sp, color = TextWhite, fontWeight = FontWeight.SemiBold)
                                }

                                // Web Cartographer Studio
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.AUTOMATION_BOT_CLUSTER)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, Color(0xFF00E5FF).copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                            .clickable { showVisualBlueprintStudioDialog = true }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.Place, contentDescription = null, tint = Color(0xFF00E5FF), modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Cartógrafo Web", fontSize = 11.5.sp, color = TextWhite, fontWeight = FontWeight.SemiBold)
                                    }
                                }

                                // Quantum AdBlock 15-Phases Studio Launcher
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.QUANTUM_ADBLOCK)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, MintSpeed.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                            .clickable { showAdBlockSettingsDialog = true }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.Security, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("AdBlock Cuántico (15 Fases)", fontSize = 11.5.sp, color = MintSpeed, fontWeight = FontWeight.Bold)
                                    }
                                }

                                // Tienda de Extensiones Chrome / Firefox Store
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.WEB_EXTENSIONS_SCRIPTS)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, VividCyan.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                            .clickable { showExtensionStoreDialog = true }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.Extension, contentDescription = null, tint = VividCyan, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Tienda Extensiones Chrome", fontSize = 11.5.sp, color = VividCyan, fontWeight = FontWeight.Bold)
                                    }
                                }

                                // Marcadores y Accesos Rápidos
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                        .border(1.dp, AmberEnergy.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                        .clickable { showBookmarksDialog = true }
                                        .padding(horizontal = 10.dp, vertical = 9.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Bookmark, contentDescription = null, tint = AmberEnergy, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Marcadores Rápidos", fontSize = 11.5.sp, color = AmberEnergy, fontWeight = FontWeight.Bold)
                                }

                                // Centro de Control AdBlock Quantum Unificado
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.QUANTUM_ADBLOCK)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, MintSpeed.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                            .clickable { showUnifiedAdBlockControlCenter = true }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.Security, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Control AdBlock Quantum", fontSize = 11.5.sp, color = MintSpeed, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }

                            // Column 2
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Site Permissions Manager
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                        .border(1.dp, AmberEnergy.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                        .clickable { showSitePermissionsDialog = true }
                                        .padding(horizontal = 10.dp, vertical = 9.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Security, contentDescription = null, tint = AmberEnergy, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Permisos del Sitio", fontSize = 11.5.sp, color = TextWhite, fontWeight = FontWeight.SemiBold)
                                }

                                // Web Macros & Automation Hub
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.AUTOMATION_BOT_CLUSTER)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, RoseAccent.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                            .clickable { showWebMacroDialog = true }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.SmartToy, contentDescription = null, tint = RoseAccent, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Macros & Automatización", fontSize = 11.5.sp, color = TextWhite, fontWeight = FontWeight.SemiBold)
                                    }
                                }

                                // Auto Clicker Flotante (True Developers Studio replica)
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.AUTOMATION_BOT_CLUSTER)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, MintSpeed.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                            .clickable {
                                                webViewInstance?.let { wv ->
                                                    AutoClickerEngine.showController(wv, AutoClickerMode.MULTI_TARGET)
                                                    Toast.makeText(context, "Auto Clicker activado", Toast.LENGTH_SHORT).show()
                                                }
                                            }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.TouchApp, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Auto Clicker Flotante", fontSize = 11.5.sp, color = TextWhite, fontWeight = FontWeight.SemiBold)
                                    }
                                }

                                // Dev Inspector / Extractor
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.THERMAL_HARDWARE_SENTINEL)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, Color(0xFFB388FF).copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                            .clickable {
                                                webViewInstance?.let { wv ->
                                                    ChatCopyInjector.extractFullText(wv) { text ->
                                                        if (text.isNotBlank()) {
                                                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                                            val clip = ClipData.newPlainText("Texto Completo", text)
                                                            clipboard.setPrimaryClip(clip)
                                                            Toast.makeText(context, "📋 Texto copiado al portapapeles", Toast.LENGTH_SHORT).show()
                                                        } else {
                                                            Toast.makeText(context, "No se encontró texto para copiar", Toast.LENGTH_SHORT).show()
                                                        }
                                                    }
                                                }
                                            }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.TextFields, contentDescription = null, tint = Color(0xFFB388FF), modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Copiar Todo el Texto", fontSize = 11.5.sp, color = TextWhite, fontWeight = FontWeight.SemiBold)
                                    }
                                }

                                // Snaptube Media Extractor Hub
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.SNAPTUBE_MEDIA)) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, Color(0xFFFF5722).copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                            .padding(horizontal = 10.dp, vertical = 8.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clickable {
                                                    val currentMedia = detectedMedia
                                                    if (currentMedia != null) {
                                                        showSnaptubeDialog = true
                                                    } else {
                                                        Toast.makeText(context, "Reproduce un video o audio para extraer el enlace con Snaptube", Toast.LENGTH_SHORT).show()
                                                    }
                                                },
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(Icons.Default.Download, contentDescription = null, tint = Color(0xFFFF5722), modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(8.dp))
                                            val media = detectedMedia
                                            Text(
                                                if (media != null) "Snaptube (${media.formats.size} HD)" else "Snaptube Extractor",
                                                fontSize = 11.5.sp,
                                                color = Color(0xFFFF9800),
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.weight(1f)
                                            )
                                            Text(
                                                "Abrir",
                                                fontSize = 10.5.sp,
                                                color = MintSpeed,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                "Botón Flotante de Descarga",
                                                fontSize = 10.5.sp,
                                                color = Color(0xFF94A3B8)
                                            )
                                            Switch(
                                                checked = appearanceSettings.isSnaptubeDownloadButtonVisible,
                                                onCheckedChange = { isChecked: Boolean ->
                                                    com.example.util.AppearanceSettingsManager.setSnaptubeDownloadButtonVisible(context, isChecked)
                                                    Toast.makeText(
                                                        context,
                                                        if (isChecked) "Botón Snaptube visible" else "Botón Snaptube ocultado",
                                                        Toast.LENGTH_SHORT
                                                    ).show()
                                                },
                                                modifier = Modifier.scale(0.75f)
                                            )
                                        }
                                    }
                                }

                                // Reproductor Multimedia Local
                                if (liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.SNAPTUBE_MEDIA)) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DeepPurpleContainer.copy(alpha = 0.7f))
                                            .border(1.dp, Color(0xFF38BDF8).copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                            .clickable { showMediaPlayerDialog = true }
                                            .padding(horizontal = 10.dp, vertical = 9.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.PlayCircle, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Reproductor Local", fontSize = 11.5.sp, color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Fast Zoom & Scroll Bar
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF1B1729))
                                .padding(horizontal = 10.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text("Zoom:", fontSize = 11.sp, color = TextGrayLight, fontWeight = FontWeight.SemiBold)
                                IconButton(
                                    onClick = { webViewInstance?.zoomOut() },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(Icons.Default.ZoomOut, contentDescription = "Menos Zoom", tint = TextWhite, modifier = Modifier.size(16.dp))
                                }
                                IconButton(
                                    onClick = { webViewInstance?.zoomIn() },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(Icons.Default.ZoomIn, contentDescription = "Más Zoom", tint = TextWhite, modifier = Modifier.size(16.dp))
                                }
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text("Scroll:", fontSize = 11.sp, color = TextGrayLight, fontWeight = FontWeight.SemiBold)
                                IconButton(
                                    onClick = { webViewInstance?.let { ChatCopyInjector.scrollTo(it, toTop = true) } },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(Icons.Default.VerticalAlignTop, contentDescription = "Inicio", tint = MintSpeed, modifier = Modifier.size(16.dp))
                                }
                                IconButton(
                                    onClick = { webViewInstance?.let { ChatCopyInjector.scrollTo(it, toTop = false) } },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(Icons.Default.VerticalAlignBottom, contentDescription = "Final", tint = AmberEnergy, modifier = Modifier.size(16.dp))
                                }
                            }

                            // Hide Trigger Action
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(AmberEnergy.copy(alpha = 0.15f))
                                    .border(1.dp, AmberEnergy.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                                    .clickable {
                                        AppearanceSettingsManager.setFloatingButtonVisible(context, false)
                                        dockMode = DockDisplayMode.PURE_IMMERSION
                                        Toast.makeText(context, "🙈 Botón flotante oculto. Restáuralo en Ajustes UI o usando teclas de volumen.", Toast.LENGTH_LONG).show()
                                    }
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.VisibilityOff, contentDescription = null, tint = AmberEnergy, modifier = Modifier.size(12.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Ocultar Botón", fontSize = 10.sp, color = AmberEnergy, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    } // End Scrollable Tools Column
                }
            }
        } // End AnimatedVisibility
    } // End if (isFloatingButtonVisible)

        // Site UI & Preferences Customizer Dialog (DataStore Persisted)
        if (showSiteCustomizationDialog) {
            SiteUiCustomizationDialog(
                currentUrl = webViewInstance?.url ?: targetUrl,
                appName = appName,
                onDismiss = { showSiteCustomizationDialog = false },
                onPreferencesSaved = {
                    webViewInstance?.reload()
                }
            )
        }

        // Site Permissions Customizer Dialog
        if (showSitePermissionsDialog) {
            SitePermissionsDialog(
                currentUrl = webViewInstance?.url ?: targetUrl,
                onDismiss = { showSitePermissionsDialog = false },
                onReloadRequested = {
                    webViewInstance?.reload()
                }
            )
        }

        // UI Customization Settings Modal (Elements Visibility & Debug Mode)
        if (showUiSettingsDialog) {
            Dialog(
                onDismissRequest = { showUiSettingsDialog = false },
                properties = DialogProperties(usePlatformDefaultWidth = false)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.8f))
                        .padding(14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .navigationBarsPadding()
                            .imePadding()
                    ) {
                        AppUiCustomizationCard()
                    }
                }
            }
        }

        // Advanced App Pinning & Immortality Studio Dialog
        if (showAdvancedPinningDialog) {
            AdvancedAppPinningDialog(
                initialUrl = webViewInstance?.url ?: targetUrl,
                initialTitle = currentTitle,
                onDismiss = { showAdvancedPinningDialog = false },
                onLaunchNow = { entity ->
                    webViewInstance?.loadUrl(entity.url)
                }
            )
        }

        // Turbo Cache & Storage Management Dialog
        if (showTurboCacheDialog) {
            TurboCacheManagementDialog(
                onDismiss = { showTurboCacheDialog = false },
                webView = webViewInstance
            )
        }

        // Full Active Site Configuration Screen Overlay
        if (showSiteConfigScreen) {
            Dialog(
                onDismissRequest = { showSiteConfigScreen = false },
                properties = DialogProperties(usePlatformDefaultWidth = false)
            ) {
                SiteConfigScreen(
                    currentUrl = webViewInstance?.url ?: targetUrl,
                    currentTitle = currentTitle,
                    existingApp = app,
                    onBack = { showSiteConfigScreen = false },
                    onApplySettings = { result ->
                        isDesktopMode = result.entity.isDesktopMode
                        isAdBlockEnabled = result.entity.isAdBlockEnabled
                        isOledBlackMode = result.entity.isOledBlackMode
                        if (result.autoRefreshOnOpen) {
                            webViewInstance?.reload()
                        }
                    }
                )
            }
        }

        // Web Macro Automation & Action Recording Dialog
        if (showWebMacroDialog) {
            WebMacroAutomationDialog(
                targetUrl = webViewInstance?.url ?: targetUrl,
                webView = webViewInstance,
                onDismiss = { showWebMacroDialog = false },
                onStartRecordingFromDialog = {
                    // Recording started, HUD is visible
                }
            )
        }

        // Web Cartographer & Visual Crop Studio Dialog
        if (showVisualBlueprintStudioDialog) {
            VisualBlueprintStudioDialog(
                webView = webViewInstance,
                onDismiss = { showVisualBlueprintStudioDialog = false },
                onInjectVisualStepToMacro = { _: String, _: String, _: Float ->
                    showVisualBlueprintStudioDialog = false
                    showWebMacroDialog = true
                }
            )
        }

        // Centralized Feature Registry Hub Dialog
        if (showFeatureRegistryDialog) {
            FeatureRegistryHubDialog(
                onDismiss = { showFeatureRegistryDialog = false },
                onOpenCartographerStudio = {
                    showVisualBlueprintStudioDialog = true
                }
            )
        }

        // Quantum AdBlock 15-Phases Settings Dialog
        if (showAdBlockSettingsDialog) {
            com.example.ui.dialogs.AdBlockSettingsDialog(
                onDismissRequest = { showAdBlockSettingsDialog = false }
            )
        }

        // Chrome Web Store & Firefox Extension Store Dialog
        if (showExtensionStoreDialog) {
            com.example.ui.dialogs.ExtensionStoreDialog(
                onDismissRequest = { showExtensionStoreDialog = false },
                onOpenUrlInBrowser = { targetUrl ->
                    showExtensionStoreDialog = false
                    webViewInstance?.loadUrl(targetUrl)
                }
            )
        }

        // Snaptube Media Downloader Dialog
        val currentSniffedMedia = detectedMedia
        if (showSnaptubeDialog && currentSniffedMedia != null) {
            com.example.ui.dialogs.SnaptubeMediaDialog(
                media = currentSniffedMedia,
                onDismissRequest = { showSnaptubeDialog = false }
            )
        }

        // Marcadores y Accesos Rápidos Dialog
        if (showBookmarksDialog) {
            BookmarksQuickAccessDialog(
                currentUrl = webViewInstance?.url ?: targetUrl,
                currentTitle = currentTitle,
                onNavigateUrl = { bookmarkUrl ->
                    showBookmarksDialog = false
                    webViewInstance?.loadUrl(bookmarkUrl)
                },
                onDismiss = { showBookmarksDialog = false }
            )
        }

        // Reproductor Multimedia Local Dialog
        if (showMediaPlayerDialog) {
            InternalMediaPlayerDialog(
                onDismiss = { showMediaPlayerDialog = false }
            )
        }

        // Centro de Control AdBlock Quantum Unificado Dialog
        if (showUnifiedAdBlockControlCenter) {
            UnifiedAdBlockControlCenterDialog(
                currentUrl = webViewInstance?.url ?: targetUrl,
                onDismiss = { showUnifiedAdBlockControlCenter = false }
            )
        }

        // Gestor de Sandboxes y Aplicaciones Web Dialog
        if (showSandboxAppsManager) {
            SandboxAppsManagerDialog(
                currentUrl = webViewInstance?.url ?: targetUrl,
                currentTitle = currentTitle,
                onLaunchApp = { targetAppUrl, _ ->
                    showSandboxAppsManager = false
                    webViewInstance?.loadUrl(targetAppUrl)
                },
                onDismiss = { showSandboxAppsManager = false }
            )
        }

        // Panel de Administración y Rendimiento Modular Dialog
        if (showAdminModularizationDialog) {
            AdminModularizationDialog(
                onDismissRequest = { showAdminModularizationDialog = false }
            )
        }

        // Gestor de Contraseñas y Automatización Auto-Login Dialog
        if (showPasswordManagerDialog) {
            SandboxPasswordManagerDialog(
                onDismiss = { showPasswordManagerDialog = false },
                onLaunchAutoLogin = { _, email, pass ->
                    val script = SandboxCredentialsManager.buildAutoLoginScript(email, pass)
                    webViewInstance?.evaluateJavascript(script, null)
                    showPasswordManagerDialog = false
                    Toast.makeText(context, "⚡ Inyectando credenciales...", Toast.LENGTH_SHORT).show()
                }
            )
        }

        // Snaptube Floating Quick Action Pill when media is detected & allowed
        val currentSiteUrl = webViewInstance?.url ?: targetUrl
        val isDomainAllowedForDownload = remember(currentSiteUrl) {
            MediaDownloadAllowedDomainsManager.shouldShowDownloadButton(currentSiteUrl)
        }
        val isSnaptubeButtonVisible = appearanceSettings.isSnaptubeDownloadButtonVisible
        val isSnaptubeModuleActive = com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.SNAPTUBE_MEDIA)
        var isSessionDismissed by remember(currentSiteUrl, currentSniffedMedia?.mediaId) { mutableStateOf(false) }

        if (currentSniffedMedia != null && isDomainAllowedForDownload && isSnaptubeButtonVisible && isSnaptubeModuleActive && !isSessionDismissed) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(end = 16.dp, bottom = 80.dp),
                contentAlignment = Alignment.BottomEnd
            ) {
                Surface(
                    color = Color(0xFFFF5722),
                    contentColor = Color.White,
                    shape = RoundedCornerShape(22.dp),
                    shadowElevation = 6.dp,
                    modifier = Modifier.height(44.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(start = 12.dp, end = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            modifier = Modifier
                                .clickable { showSnaptubeDialog = true }
                                .padding(vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Download,
                                contentDescription = "Descargar con Snaptube",
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "Descargar HD (${currentSniffedMedia.formats.size})",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        IconButton(
                            onClick = { isSessionDismissed = true },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Ocultar botón",
                                tint = Color.White.copy(alpha = 0.85f),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }

        // Real-Time CPU Resource Heatmap Diagnostic Overlay
        com.example.ui.components.CpuHeatmapDiagnosticOverlay()

        // Persistent Automation ActionPoint BottomSheet Editor
        com.example.ui.components.AutomationActionPointBottomSheet(currentWebView = webViewInstance)
    }
}

@Composable
fun FloatingHudActionCard(
    icon: ImageVector,
    label: String,
    isActive: Boolean,
    activeColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(52.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(
                if (isActive) activeColor.copy(alpha = 0.16f)
                else DeepPurpleContainer.copy(alpha = 0.8f)
            )
            .border(
                1.dp,
                if (isActive) activeColor.copy(alpha = 0.7f)
                else LavenderPrimary.copy(alpha = 0.15f),
                RoundedCornerShape(12.dp)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 4.dp, vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(contentAlignment = Alignment.TopEnd) {
                Icon(
                    imageVector = icon,
                    contentDescription = label,
                    tint = if (isActive) activeColor else TextGrayLight,
                    modifier = Modifier.size(19.dp)
                )
                if (isActive) {
                    Box(
                        modifier = Modifier
                            .offset(x = 4.dp, y = (-2).dp)
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(activeColor)
                    )
                }
            }
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = label,
                fontSize = 9.5.sp,
                fontWeight = if (isActive) FontWeight.ExtraBold else FontWeight.Medium,
                color = if (isActive) activeColor else TextGrayLight,
                maxLines = 1,
                softWrap = false
            )
        }
    }
}

@Composable
fun SpeedDockActionItem(
    icon: ImageVector,
    label: String,
    isActive: Boolean,
    activeColor: Color,
    onClick: () -> Unit
) {
    FloatingHudActionCard(
        icon = icon,
        label = label,
        isActive = isActive,
        activeColor = activeColor,
        onClick = onClick
    )
}

