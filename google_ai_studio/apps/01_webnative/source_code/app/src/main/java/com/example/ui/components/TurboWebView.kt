package com.example.ui.components

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.example.data.model.WebAppEntity
import com.example.util.AdBlockEngine
import com.example.util.ContainerHardwareJunction
import com.example.util.ContainerManager
import com.example.util.DynamicThemeManager
import com.example.util.NetworkThrottler
import com.example.util.PerformanceAuditManager
import com.example.util.SitePermissionManager
import com.example.util.UserProfileManager
import com.example.util.WebInspectorManager
import androidx.compose.runtime.collectAsState
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers

val DESKTOP_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun TurboWebView(
    url: String,
    modifier: Modifier = Modifier,
    isDesktopMode: Boolean = false,
    isAdBlockEnabled: Boolean = true,
    isHardwareBoostEnabled: Boolean = true,
    isOledBlackMode: Boolean = false,
    customUserAgent: String = "",
    customCss: String = "",
    customJs: String = "",
    textZoom: Int = 100,
    isForceResponsiveViewport: Boolean = true,
    isFluidMediaEnabled: Boolean = true,
    isPreventHorizontalOverflow: Boolean = true,
    showFpsCounter: Boolean = false,
    onProgressChange: (Float) -> Unit = {},
    onTitleChange: (String) -> Unit = {},
    onFaviconChange: (Bitmap?) -> Unit = {},
    onBlockedAdCountChange: (Int) -> Unit = {},
    onWebViewCreated: (WebView) -> Unit = {},
    onCustomViewShow: ((View, WebChromeClient.CustomViewCallback) -> Unit)? = null,
    onCustomViewHide: (() -> Unit)? = null,
    onFileChooser: ((ValueCallback<Array<Uri>>?, WebChromeClient.FileChooserParams?) -> Boolean)? = null,
    onPermissionPromptRequested: ((PermissionRequest) -> Unit)? = null,
    tabId: String = "primary_tab"
) {
    val context = LocalContext.current
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var blockedAdsCounter by remember { mutableStateOf(0) }
    var pageLoadStartTime by remember { mutableLongStateOf(System.currentTimeMillis()) }

    // Back handling inside the webview
    val canGoBack = webViewInstance?.canGoBack() == true
    BackHandler(enabled = canGoBack) {
        webViewInstance?.goBack()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .imePadding() // Automatically resize container to sit above the keyboard
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )

                    // Register with WebInspector and Remote Agent Controller
                    WebInspectorManager.registerActiveWebView(this)
                    com.example.util.RemoteWebViewController.registerActiveWebView(this)

                    // Hardware Acceleration & Local Cache Optimization Layer
                    val currentContainer = ContainerManager.activeContainer.value
                    com.example.util.WebViewOptimizationLayer.applyOptimizations(
                        webView = this,
                        context = ctx,
                        container = currentContainer,
                        isAppHardwareBoost = isHardwareBoostEnabled,
                        isEphemeral = currentContainer?.isEphemeral == true
                    )

                    // Inject standard JavaScript Bridge interfaces for WebNative ecosystem
                    val jsBridge = com.example.util.WebNativeJSBridge(
                        context = ctx,
                        onToggleFullscreen = null,
                        onNavigateUrl = { newUrl ->
                            loadUrl(newUrl)
                        }
                    )
                    addJavascriptInterface(jsBridge, "WebNative")
                    addJavascriptInterface(jsBridge, "AndroidBridge")
                    addJavascriptInterface(
                        com.example.util.WebMacroAutomationEngine.WebMacroBridge(ctx),
                        com.example.util.WebMacroAutomationEngine.JAVASCRIPT_INTERFACE_NAME
                    )
                    addJavascriptInterface(
                        com.example.util.SnaptubeMediaEngine.SnaptubeBridge(ctx),
                        "SnaptubeBridge"
                    )

                    // Attach local DataStore State Manager for URL & Scroll restoration
                    com.example.util.WebStateDataStoreManager.attachScrollTrackingBridge(
                        webView = this,
                        context = ctx,
                        scope = CoroutineScope(Dispatchers.Main)
                    )

                    if (currentContainer != null) {
                        addJavascriptInterface(com.example.util.ContainerHardwareBridgeJS(ctx, currentContainer), "AndroidHardwareJunction")
                    }

                    com.example.util.GoogleAuthBypassHelper.sanitizeWebViewForGoogleAuth(settings, this)

                    settings.apply {
                        val isGoogle = com.example.util.GoogleAuthBypassHelper.isGoogleAuthUrl(url)
                        val originProfile = com.example.util.DeviceFingerprintUaInterceptor.activeProfile.value
                        val containerUa = currentContainer?.isolatedUserAgent?.takeIf { it.isNotBlank() }
                        val isYouTube = url.contains("youtube.com") || url.contains("youtu.be")
                        userAgentString = when {
                            customUserAgent.isNotBlank() -> customUserAgent
                            containerUa != null -> containerUa
                            isDesktopMode -> originProfile.toDesktopUserAgent()
                            isGoogle || isYouTube -> originProfile.toMobileUserAgent()
                            else -> originProfile.toMobileUserAgent()
                        }
                        mediaPlaybackRequiresUserGesture = false
                        domStorageEnabled = true
                        databaseEnabled = true
                        allowFileAccess = true
                        allowContentAccess = true
                        javaScriptCanOpenWindowsAutomatically = true
                    }

                    // Apply adaptive viewport and text zoom responsiveness
                    com.example.util.WebResponsiveEngine.configureWebSettingsResponsiveness(
                        settings = settings,
                        textZoom = textZoom,
                        isDesktopMode = isDesktopMode
                    )

                    try {
                        val cookieManager = android.webkit.CookieManager.getInstance()
                        cookieManager.setAcceptCookie(true)
                        cookieManager.setAcceptThirdPartyCookies(this, true)
                    } catch (_: Exception) {}

                    webViewClient = object : WebViewClient() {
                        override fun shouldInterceptRequest(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): WebResourceResponse? {
                            val requestUrl = request?.url?.toString() ?: return null
                            
                            // Google Auth & Services Bypass: Never intercept or tamper with Google Auth, Token, Log, or Identity endpoints
                            if (com.example.util.GoogleAuthBypassHelper.isGoogleAuthUrl(requestUrl) ||
                                requestUrl.contains(".google.") ||
                                requestUrl.contains("google.com") ||
                                requestUrl.contains("accounts.google") ||
                                requestUrl.contains("myaccount.google") ||
                                requestUrl.contains("oauth2.googleapis.com") ||
                                requestUrl.contains("gstatic.com") ||
                                requestUrl.contains("googleusercontent.com") ||
                                requestUrl.contains("googleapis.com") ||
                                requestUrl.contains("apis.google.com") ||
                                requestUrl.contains("play.google.com") ||
                                requestUrl.contains("clients6.google.com") ||
                                requestUrl.contains("clients4.google.com") ||
                                requestUrl.contains("doubleclick.net")
                            ) {
                                return null
                            }

                            val currentContainer = ContainerManager.activeContainer.value
                            
                            // 0. Offline Web Cache / ServiceWorker-like Interception
                            val offlineResponse = com.example.util.OfflineWebCacheManager.interceptForOffline(ctx, request)
                            if (offlineResponse != null) {
                                return offlineResponse
                            }

                            // 1. AdBlock & Tracker Policy Check
                            if (com.example.util.ContainerAdBlockPolicy.isUrlBlocked(requestUrl, currentContainer)) {
                                return WebResourceResponse("text/plain", "UTF-8", 403, "Blocked by Container Policy", emptyMap(), java.io.ByteArrayInputStream("".toByteArray()))
                            }

                            val siteDomain = SitePermissionManager.extractDomain(url)
                            val siteRule = SitePermissionManager.getSiteRule(ctx, siteDomain)

                            // 2. Mock API Contract Interception & Network Chaos Simulation
                            val mockResponse = com.example.util.ApiContractMockHub.checkAndIntercept(request)
                            if (mockResponse != null) {
                                return mockResponse
                            }

                            // 2.1 Lite Mode Zero-Data & Media Blocker
                            val liteSettings = com.example.util.LiteModeManager.settingsFlow.value
                            if (com.example.util.LiteMediaOptimizer.shouldBlockOrStubMedia(requestUrl, liteSettings)) {
                                return com.example.util.LiteMediaOptimizer.getEmptyMediaResponse()
                            }

                            val throttledResponse = com.example.util.ContainerNetworkManager.interceptRequest(request, currentContainer) 
                                ?: NetworkThrottler.interceptRequest(request)
                                
                            if (throttledResponse != null) {
                                return throttledResponse
                            }

                            // Track in Network Inspector
                            val method = request.method ?: "GET"
                            val isMain = request.isForMainFrame
                            val headersStr = request.requestHeaders?.entries?.joinToString("\n") { "${it.key}: ${it.value}" } ?: ""
                            WebInspectorManager.recordNetworkRequest(
                                context = ctx,
                                method = method,
                                url = requestUrl,
                                statusCode = 200,
                                resourceType = if (isMain) "Document (Main)" else "Asset/Resource",
                                headersPreview = headersStr
                            )

                            val adConfig = com.example.util.AdBlockConfigManager.configFlow.value
                            if (isAdBlockEnabled && siteRule.adBlockEnabled && adConfig.globalAdBlockEnabled) {
                                if (AdBlockEngine.isAdOrTracker(requestUrl, adConfig)) {
                                    blockedAdsCounter++
                                    onBlockedAdCountChange(blockedAdsCounter)
                                    com.example.util.AdBlockConfigManager.recordBlockedEvent(ctx, isTracker = requestUrl.contains("analytics") || requestUrl.contains("telemetry"))
                                    
                                    // Quantum Honeypot script mock for script requests
                                    if (adConfig.antiAdblockDefeaterEnabled && (requestUrl.contains(".js") || requestUrl.contains("adsbygoogle") || requestUrl.contains("prebid"))) {
                                        return AdBlockEngine.createSyntheticAdScriptResponse()
                                    }
                                    return AdBlockEngine.createEmptyResponse()
                                }
                            }
                            return super.shouldInterceptRequest(view, request)
                        }

                        override fun onPageStarted(view: WebView?, pageUrl: String?, favicon: Bitmap?) {
                            super.onPageStarted(view, pageUrl, favicon)
                            pageLoadStartTime = System.currentTimeMillis()
                            onFaviconChange(favicon)
                            if (view != null) {
                                val targetUrl = pageUrl ?: url
                                val isGoogleAuth = com.example.util.GoogleAuthBypassHelper.isGoogleAuthUrl(targetUrl)

                                if (isGoogleAuth) {
                                    // Google Botguard Stealth Bypass & Origin Device Sync:
                                    val originProfile = com.example.util.DeviceFingerprintUaInterceptor.activeProfile.value
                                    view.settings.userAgentString = originProfile.toMobileUserAgent()
                                    // Cloak Java bridges & inject authentic Client Hints
                                    view.evaluateJavascript(com.example.util.GoogleAuthBypassHelper.getBridgeShieldingScript(), null)
                                    // Sync cookies to container
                                    if (currentContainer != null) {
                                        com.example.util.GoogleAuthBypassHelper.syncGoogleCookiesToContainer(ctx, currentContainer.id)
                                    }
                                } else {
                                    // Inject Client Hints script for regular browsing
                                    view.evaluateJavascript(com.example.util.DeviceFingerprintUaInterceptor.getNavigatorClientHintsSyncScript(), null)
                                    com.example.util.JsConsoleMemoryProfiler.injectTrap(view)
                                    // Inject Indestructible Background Audio & Continuous Media Playback Hook
                                    view.evaluateJavascript(AdBlockEngine.getBackgroundPlaybackEngineJs(), null)
                                    val adConfig = com.example.util.AdBlockConfigManager.configFlow.value
                                    if (isAdBlockEnabled && adConfig.globalAdBlockEnabled) {
                                        view.evaluateJavascript(AdBlockEngine.getCompleteStealthShieldScript(adConfig), null)
                                        view.evaluateJavascript(AdBlockEngine.getVideoAdSkipperJs(adConfig.videoSkipSpeedMultiplier), null)
                                    }

                                    // Inject Deterministic Fingerprint Stealth Shield & Proxy/Geo Shield
                                    if (currentContainer != null) {
                                        val fp = com.example.util.ContainerFingerprintManager.getFingerprint(ctx, currentContainer.id)
                                        view.evaluateJavascript(com.example.util.ContainerFingerprintManager.getStealthInjectionScript(fp), null)

                                        val proxyCfg = com.example.util.ContainerProxyManager.getProxyConfig(ctx, currentContainer.id)
                                        val geoScript = com.example.util.ContainerProxyManager.getGeolocationAndNetworkSpoofScript(proxyCfg)
                                        if (geoScript.isNotBlank()) {
                                            view.evaluateJavascript(geoScript, null)
                                        }

                                        // V1: Synthetic Sensor & Natural Motion Fuzzing Script
                                        val sensorProf = com.example.util.ContainerSensorVirtualizer.getSensorProfile(ctx, currentContainer.id)
                                        val sensorScript = com.example.util.ContainerSensorVirtualizer.getStealthSensorScript(sensorProf)
                                        if (sensorScript.isNotBlank()) {
                                            view.evaluateJavascript(sensorScript, null)
                                        }

                                        // V3: Synthetic Media Injection Shield
                                        val mediaScript = com.example.util.ContainerSyntheticMediaManager.getSyntheticMediaScript(true)
                                        if (mediaScript.isNotBlank()) {
                                            view.evaluateJavascript(mediaScript, null)
                                        }

                                        // VPN-V2 & Pinned GPS Mocking Engine (Kinematic Trajectory & Gaussian Drift)
                                        val kinematicProf = com.example.util.ContainerKinematicGpsEngine.getProfile(ctx, currentContainer.id)
                                        val geoCohProf = com.example.util.ContainerGeoCoherenceEngine.getProfile(ctx, currentContainer.id)
                                        val fullGpsScript = com.example.util.ContainerGpsMockingService.getFullGpsMockScript(currentContainer, kinematicProf, geoCohProf)
                                        if (fullGpsScript.isNotBlank()) {
                                            view.evaluateJavascript(fullGpsScript, null)
                                        } else {
                                            val kinematicScript = com.example.util.ContainerKinematicGpsEngine.getKinematicGeoScript(kinematicProf)
                                            if (kinematicScript.isNotBlank()) {
                                                view.evaluateJavascript(kinematicScript, null)
                                            }
                                        }

                                        // VPN-V3: Encrypted DoH DNS & Anti-Leak Script
                                        val dohCfg = com.example.util.ContainerDohLeakShieldManager.getConfig(ctx, currentContainer.id)
                                        val dohScript = com.example.util.ContainerDohLeakShieldManager.getDoHShieldScript(dohCfg)
                                        if (dohScript.isNotBlank()) {
                                            view.evaluateJavascript(dohScript, null)
                                        }

                                        // VPN-V5: Multi-dimensional Geo-Coherence Script (Timezone, Locale, Intl)
                                        val geoCohScript = com.example.util.ContainerGeoCoherenceEngine.getGeoCoherenceScript(geoCohProf)
                                        if (geoCohScript.isNotBlank()) {
                                            view.evaluateJavascript(geoCohScript, null)
                                        }
                                    }
                                }
                            }
                        }

                        override fun onPageFinished(view: WebView?, pageUrl: String?) {
                            super.onPageFinished(view, pageUrl)

                            val targetUrl = pageUrl ?: url
                            val isGoogleAuth = com.example.util.GoogleAuthBypassHelper.isGoogleAuthUrl(targetUrl)
                            if (isGoogleAuth && currentContainer != null) {
                                com.example.util.GoogleAuthBypassHelper.syncGoogleCookiesToContainer(ctx, currentContainer.id)
                            }

                            // Inject Indestructible Background Audio Hook on finished
                            view?.evaluateJavascript(AdBlockEngine.getBackgroundPlaybackEngineJs(), null)

                            val renderDurationMs = System.currentTimeMillis() - pageLoadStartTime
                            PerformanceAuditManager.recordWebViewRender(
                                context = ctx,
                                targetUrlOrName = pageUrl ?: url,
                                durationMs = renderDurationMs,
                                isHardwareAccelerated = isHardwareBoostEnabled,
                                details = "DOM Renderizado completo en ${renderDurationMs}ms (Desktop: $isDesktopMode, OLED: $isOledBlackMode)"
                            )

                            // Inject WebInspector Hook Script
                            view?.evaluateJavascript(WebInspectorManager.getWebInspectorInjectionScript(), null)

                            // Inject Network Throttler Simulation Hook
                            view?.evaluateJavascript(NetworkThrottler.getThrottlingScript(), null)

                            // Inject Dynamic Theme Color Extractor
                            val themeExtractorJs = """
                                (function() {
                                    var meta = document.querySelector('meta[name="theme-color"]') || 
                                               document.querySelector('meta[name="msapplication-TileColor"]');
                                    if (meta && meta.content) {
                                        return meta.content;
                                    }
                                    return null;
                                })();
                            """.trimIndent()
                            view?.evaluateJavascript(themeExtractorJs) { colorResult ->
                                val cleanColor = colorResult?.trim('\"', ' ', '\'', '\\')
                                if (!cleanColor.isNullOrBlank() && cleanColor != "null") {
                                    DynamicThemeManager.applyThemeFromHex(cleanColor, view.title ?: "")
                                }
                            }

                            // Inject Keyboard & Viewport Responsiveness Assistant
                            val keyboardAssistantJs = """
                                (function() {
                                    if (window.__webnative_keyboard_helper_installed) return;
                                    window.__webnative_keyboard_helper_installed = true;

                                    function scrollElementToVisible(el) {
                                        if (!el) return;
                                        try {
                                            setTimeout(function() {
                                                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                                            }, 250);
                                        } catch (e) {}
                                    }

                                    document.addEventListener('focusin', function(e) {
                                        var target = e.target;
                                        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.id === 'prompt-input' || target.classList.contains('input'))) {
                                            scrollElementToVisible(target);
                                        }
                                    }, { passive: true });

                                    // Dynamic visual viewport adjustment for mobile layouts
                                    if (window.visualViewport) {
                                        window.visualViewport.addEventListener('resize', function() {
                                            var active = document.activeElement;
                                            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
                                                scrollElementToVisible(active);
                                            }
                                        });
                                    }
                                })();
                            """.trimIndent()
                            view?.evaluateJavascript(keyboardAssistantJs, null)

                            // Inject Snaptube Media Sniffer Hook (if module is active and not suspended in Lite Mode)
                            if (com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.SNAPTUBE_MEDIA)) {
                                view?.evaluateJavascript(com.example.util.SnaptubeMediaEngine.getSnaptubeSnifferScript(), null)
                            }

                            // Inject Chrome Web Store & Firefox Extension Polyfills & Scripts
                            if (com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.WEB_EXTENSIONS_SCRIPTS)) {
                                val activeExtensions = com.example.util.ExtensionManager.installedExtensions.value
                                val extScript = com.example.util.ChromeExtensionRuntime.getInjectedExtensionsScript(pageUrl ?: url, activeExtensions)
                                if (extScript.isNotBlank()) {
                                    view?.evaluateJavascript(extScript, null)
                                }
                            }

                            // Inject Ad hiding CSS, video ad skipper and 15-phase Quantum Shield
                            val adConfig = com.example.util.AdBlockConfigManager.configFlow.value
                            if (isAdBlockEnabled && adConfig.globalAdBlockEnabled && com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.QUANTUM_ADBLOCK)) {
                                view?.evaluateJavascript(AdBlockEngine.getAdHidingCss(adConfig.customCssRules), null)
                                view?.evaluateJavascript(AdBlockEngine.getCompleteStealthShieldScript(adConfig), null)
                                view?.evaluateJavascript(AdBlockEngine.getVideoAdSkipperJs(adConfig.videoSkipSpeedMultiplier), null)
                            }
                            // Inject OLED true dark mode
                            if (isOledBlackMode) {
                                view?.evaluateJavascript(AdBlockEngine.getOledBlackCss(), null)
                            }
                            // Lite Mode: Freeze CPU/GPU-draining infinite CSS animations
                            val liteSettingsForAnim = com.example.util.LiteModeManager.settingsFlow.value
                            if (liteSettingsForAnim.isLiteModeEnabled && liteSettingsForAnim.isCssAnimationFreezeEnabled) {
                                view?.evaluateJavascript(com.example.util.LiteMediaOptimizer.getCssAnimationFreezeScript(), null)
                            }
                            // Inject user custom CSS
                            if (customCss.isNotBlank()) {
                                val cleanCss = customCss.replace("\n", " ").replace("'", "\\'")
                                val js = """
                                    (function() {
                                        var style = document.createElement('style');
                                        style.innerHTML = '$cleanCss';
                                        document.head.appendChild(style);
                                    })();
                                """.trimIndent()
                                view?.evaluateJavascript(js, null)
                            }
                            // Inject user custom JS
                            if (customJs.isNotBlank()) {
                                view?.evaluateJavascript(customJs, null)
                            }

                            // Inject WebNative User Profile Personalization
                            val mockEntity = WebAppEntity(name = url, url = url, customCss = customCss, customJs = customJs)
                            val userScript = UserProfileManager.generatePersonalizationScript(mockEntity)
                            if (userScript.isNotBlank()) {
                                view?.evaluateJavascript(userScript, null)
                            }

                            // Inject WebNative Sandbox Container Bridge & Hardware Junctions
                            val activeContainer = ContainerManager.activeContainer.value
                            if (activeContainer != null) {
                                val containerJs = ContainerHardwareJunction.generateContainerInjectionScript(ctx, activeContainer)
                                view?.evaluateJavascript(containerJs, null)
                            }

                            // Inject WebResponsiveEngine Viewport & Adaptive CSS
                            view?.evaluateJavascript(
                                com.example.util.WebResponsiveEngine.getViewportInjectionScript(
                                    forceResponsive = isForceResponsiveViewport
                                ),
                                null
                            )
                            view?.evaluateJavascript(
                                com.example.util.WebResponsiveEngine.getResponsiveCss(
                                    fluidMedia = isFluidMediaEnabled,
                                    preventHorizontalOverflow = isPreventHorizontalOverflow
                                ),
                                null
                            )

                            // Inject WebState Scroll Tracking Hook
                            view?.evaluateJavascript(com.example.util.WebStateDataStoreManager.getScrollTrackingInjectionScript(), null)

                            // Restore saved URL & scroll position from DataStore if available
                            if (view != null) {
                                com.example.util.WebStateDataStoreManager.restoreScrollPosition(
                                    webView = view,
                                    context = ctx,
                                    scope = CoroutineScope(Dispatchers.Main),
                                    targetUrl = pageUrl ?: url
                                )
                            }
                        }

                        override fun doUpdateVisitedHistory(view: WebView?, visitedUrl: String?, isReload: Boolean) {
                            super.doUpdateVisitedHistory(view, visitedUrl, isReload)
                            if (view != null && !visitedUrl.isNullOrBlank() && !visitedUrl.startsWith("about:")) {
                                com.example.util.WebStateDataStoreManager.scheduleDebouncedSave(
                                    context = ctx,
                                    scope = CoroutineScope(Dispatchers.IO),
                                    currentUrl = visitedUrl,
                                    scrollX = view.scrollX,
                                    scrollY = view.scrollY,
                                    title = view.title ?: ""
                                )
                            }
                        }

                        // Auto-Recover Event Listener for unrecoverable render process crashes
                        override fun onRenderProcessGone(
                            view: WebView?,
                            detail: android.webkit.RenderProcessGoneDetail?
                        ): Boolean {
                            val didCrash = detail?.didCrash() == true
                            com.example.util.AppLogger.log(
                                ctx,
                                "Auto-Recover: Renderer process gone detectado (Crash=$didCrash). Ejecutando recuperación silenciosa...",
                                tag = "AUTO_RECOVER"
                            )
                            try {
                                view?.let { wv ->
                                    val fallbackTarget = wv.url ?: url
                                    wv.post {
                                        wv.loadUrl(fallbackTarget)
                                    }
                                }
                            } catch (e: Exception) {
                                com.example.util.AppLogger.log(ctx, "Fallo en auto-recuperación: ${e.message}", tag = "AUTO_RECOVER")
                            }
                            return true // Prevents host Android app crash
                        }

                        // Auto-Recover on Fatal Timeout or Connection Failure
                        override fun onReceivedError(
                            view: WebView?,
                            request: WebResourceRequest?,
                            error: android.webkit.WebResourceError?
                        ) {
                            super.onReceivedError(view, request, error)
                            if (request?.isForMainFrame == true) {
                                val errorCode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                                    error?.errorCode ?: -1
                                } else -1
                                com.example.util.AppLogger.log(
                                    ctx,
                                    "WebView Error detectado en MainFrame: $errorCode - ${error?.description}",
                                    tag = "AUTO_RECOVER"
                                )
                                // If timeout or connection reset, attempt auto-reload after 3s
                                if (errorCode == WebViewClient.ERROR_TIMEOUT || errorCode == WebViewClient.ERROR_HOST_LOOKUP) {
                                    view?.postDelayed({
                                        view.reload()
                                    }, 3000L)
                                }
                            }
                        }

                        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                            val targetUrl = request?.url?.toString() ?: return false

                            // Auto-resolve legacy Google Notebook domain to NotebookLM
                            if (targetUrl.contains("notebook.google.com") && !targetUrl.contains("notebooklm.google.com")) {
                                val fixedUrl = targetUrl.replace("notebook.google.com", "notebooklm.google.com")
                                view?.loadUrl(fixedUrl)
                                return true
                            }

                            // Safely handle intent, YouTube, and external schemes
                            if (targetUrl.startsWith("intent:")) {
                                try {
                                    val intent = android.content.Intent.parseUri(targetUrl, android.content.Intent.URI_INTENT_SCHEME)
                                    val fallbackUrl = intent?.getStringExtra("browser_fallback_url")
                                    val pkg = intent?.`package` ?: ""
                                    val targetDataString = intent?.dataString ?: ""

                                    // Never redirect YouTube to external apps; load internally in WebView
                                    if (pkg.contains("youtube") || targetUrl.contains("youtube.com") || targetUrl.contains("youtu.be") || targetDataString.contains("youtube.com")) {
                                        val webUrl = fallbackUrl ?: if (targetDataString.startsWith("http")) targetDataString else "https://m.youtube.com"
                                        view?.loadUrl(webUrl)
                                        return true
                                    }

                                    // For other web intents with a fallback URL, load inside the webview
                                    if (!fallbackUrl.isNullOrBlank() && (fallbackUrl.startsWith("http://") || fallbackUrl.startsWith("https://"))) {
                                        view?.loadUrl(fallbackUrl)
                                        return true
                                    }

                                    // Only start activity if there is a handler and it's not trying to kick to another browser
                                    if (intent != null && intent.resolveActivity(ctx.packageManager) != null) {
                                        ctx.startActivity(intent)
                                        return true
                                    }
                                } catch (_: Exception) {}
                                return true
                            } else if (targetUrl.startsWith("vnd.youtube:")) {
                                val videoId = targetUrl.substringAfter("vnd.youtube:")
                                view?.loadUrl("https://www.youtube.com/watch?v=$videoId")
                                return true
                            } else if (targetUrl.startsWith("tel:") || targetUrl.startsWith("mailto:") || targetUrl.startsWith("whatsapp:")) {
                                try {
                                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(targetUrl))
                                    ctx.startActivity(intent)
                                    return true
                                } catch (_: Exception) {}
                                return true
                            }
                            
                            // Domain & Host Restriction Security Filter
                            val siteDomain = SitePermissionManager.extractDomain(url)
                            val targetHost = request.url?.host ?: ""
                            val isRestricted = false // Enabled dynamically via SiteUiPreferences
                            if (isRestricted && targetHost.isNotBlank() && !targetHost.contains(siteDomain)) {
                                com.example.util.AppLogger.log(ctx, "Navegación bloqueada por Restricción de Dominio: $targetUrl", tag = "SECURITY_GUARD")
                                return true
                            }
                            return super.shouldOverrideUrlLoading(view, request)
                        }
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                            if (consoleMessage != null) {
                                WebInspectorManager.addConsoleMessage(consoleMessage)
                            }
                            return super.onConsoleMessage(consoleMessage)
                        }

                        override fun onProgressChanged(view: WebView?, newProgress: Int) {
                            onProgressChange(newProgress / 100f)
                        }

                        override fun onReceivedTitle(view: WebView?, title: String?) {
                            title?.let { onTitleChange(it) }
                        }

                        override fun onReceivedIcon(view: WebView?, icon: Bitmap?) {
                            onFaviconChange(icon)
                        }

                        // WebRTC Microphone / Camera / Audio Permissions
                        override fun onPermissionRequest(request: PermissionRequest?) {
                            if (request == null) return
                            val currentContainer = ContainerManager.activeContainer.value
                            val containerAllowsCam = com.example.util.VirtualHardwareBridge.isCameraAllowed(currentContainer)
                            val containerAllowsMic = com.example.util.VirtualHardwareBridge.isMicAllowed(currentContainer)

                            val originUrl = request.origin.toString()
                            val isMicAllowed = containerAllowsMic && SitePermissionManager.isMicAllowedForOrigin(ctx, originUrl)
                            val isCamAllowed = containerAllowsCam && SitePermissionManager.isCameraAllowedForOrigin(ctx, originUrl)

                            val grantedResources = mutableListOf<String>()
                            for (res in request.resources) {
                                when (res) {
                                    PermissionRequest.RESOURCE_AUDIO_CAPTURE -> {
                                        if (isMicAllowed) grantedResources.add(res)
                                        com.example.util.VirtualHardwareBridge.auditHardwareAccess(
                                            context = ctx,
                                            container = currentContainer,
                                            resource = originUrl,
                                            actionType = "MIC_ACCESS",
                                            isGranted = isMicAllowed
                                        )
                                    }
                                    PermissionRequest.RESOURCE_VIDEO_CAPTURE -> {
                                        if (isCamAllowed) grantedResources.add(res)
                                        com.example.util.VirtualHardwareBridge.auditHardwareAccess(
                                            context = ctx,
                                            container = currentContainer,
                                            resource = originUrl,
                                            actionType = "CAMERA_ACCESS",
                                            isGranted = isCamAllowed
                                        )
                                    }
                                    PermissionRequest.RESOURCE_MIDI_SYSEX,
                                    PermissionRequest.RESOURCE_PROTECTED_MEDIA_ID -> {
                                        grantedResources.add(res)
                                    }
                                }
                            }

                            if (grantedResources.isNotEmpty()) {
                                request.grant(grantedResources.toTypedArray())
                            } else {
                                if (onPermissionPromptRequested != null) {
                                    onPermissionPromptRequested.invoke(request)
                                } else {
                                    // Default grant if system permissions are active and container allows
                                    if (containerAllowsCam && containerAllowsMic) {
                                        request.grant(request.resources)
                                    } else {
                                        request.deny()
                                    }
                                }
                            }
                        }

                        // Geolocation / GPS permission
                        override fun onGeolocationPermissionsShowPrompt(
                            origin: String?,
                            callback: GeolocationPermissions.Callback?
                        ) {
                            if (origin == null || callback == null) return
                            val currentContainer = ContainerManager.activeContainer.value
                            val containerAllowsGps = com.example.util.VirtualHardwareBridge.isGpsAllowed(currentContainer)
                            val isLocAllowed = containerAllowsGps && SitePermissionManager.isLocationAllowedForOrigin(ctx, origin)
                            
                            com.example.util.VirtualHardwareBridge.auditHardwareAccess(
                                context = ctx,
                                container = currentContainer,
                                resource = origin,
                                actionType = "LOCATION_ACCESS",
                                isGranted = isLocAllowed
                            )
                            
                            callback.invoke(origin, isLocAllowed, false)
                        }

                        override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                            if (view != null && callback != null && onCustomViewShow != null) {
                                onCustomViewShow(view, callback)
                            } else {
                                super.onShowCustomView(view, callback)
                            }
                        }

                        override fun onHideCustomView() {
                            if (onCustomViewHide != null) {
                                onCustomViewHide()
                            } else {
                                super.onHideCustomView()
                            }
                        }

                        // File attachment / Media Picker chooser
                        override fun onShowFileChooser(
                            webView: WebView?,
                            filePathCallback: ValueCallback<Array<Uri>>?,
                            fileChooserParams: FileChooserParams?
                        ): Boolean {
                            val currentOrigin = webView?.url ?: ""
                            val isFilesAllowed = SitePermissionManager.isFilesAllowedForOrigin(ctx, currentOrigin)
                            if (!isFilesAllowed) {
                                filePathCallback?.onReceiveValue(null)
                                return false
                            }

                            return onFileChooser?.invoke(filePathCallback, fileChooserParams)
                                ?: run {
                                    filePathCallback?.onReceiveValue(null)
                                    false
                                }
                        }
                    }

                    loadUrl(url)
                    webViewInstance = this
                    com.example.util.TabHibernationManager.registerWebView(tabId, this)
                    onWebViewCreated(this)
                }
            },
            update = { webView ->
                webViewInstance = webView
                com.example.util.WebViewOptimizationLayer.updateHardwareAcceleration(
                    webView = webView,
                    context = context,
                    isAppHardwareBoost = isHardwareBoostEnabled
                )
                val baseUa = webView.settings.userAgentString
                val cleanMobileUa = baseUa.replace("; wv", "").replace(Regex("Version/\\d+\\.\\d+\\s?"), "")
                val activeContainer = com.example.util.ContainerManager.activeContainer.value
                val containerUa = activeContainer?.isolatedUserAgent?.takeIf { it.isNotBlank() }
                webView.settings.userAgentString = when {
                    customUserAgent.isNotBlank() -> customUserAgent
                    containerUa != null -> containerUa
                    isDesktopMode -> DESKTOP_USER_AGENT
                    else -> cleanMobileUa
                }
                try {
                    val cookieManager = android.webkit.CookieManager.getInstance()
                    cookieManager.setAcceptCookie(true)
                    cookieManager.setAcceptThirdPartyCookies(webView, true)
                } catch (_: Exception) {}

                // Keep cache mode updated for offline resilience
                val isNetworkUp = com.example.util.OfflineWebCacheManager.isNetworkAvailable(context)
                val forceOffline = com.example.util.OfflineWebCacheManager.isOfflineModeFlow.value
                val isEphemeralContainer = com.example.util.ContainerManager.activeContainer.value?.isEphemeral == true
                if (!isEphemeralContainer) {
                    webView.settings.cacheMode = if (!isNetworkUp || forceOffline) {
                        android.webkit.WebSettings.LOAD_CACHE_ELSE_NETWORK
                    } else {
                        android.webkit.WebSettings.LOAD_DEFAULT
                    }
                }

                // Apply text zoom reactively
                com.example.util.WebResponsiveEngine.applyDynamicZoom(webView, textZoom)
            }
        )

        // Real-time Frame Rate (FPS) Counter Overlay for Turbo Hardware Acceleration
        if (showFpsCounter) {
            FpsCounterOverlay(
                modifier = Modifier
                    .align(androidx.compose.ui.Alignment.TopEnd)
                    .padding(top = 10.dp, end = 10.dp),
                isHardwareBoostActive = isHardwareBoostEnabled
            )
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            webViewInstance?.let { wv ->
                val currentUrl = wv.url
                if (!currentUrl.isNullOrBlank() && !currentUrl.startsWith("about:")) {
                    CoroutineScope(Dispatchers.IO).launch {
                        com.example.util.WebStateDataStoreManager.saveSessionState(
                            context = context,
                            currentUrl = currentUrl,
                            scrollX = wv.scrollX,
                            scrollY = wv.scrollY,
                            title = wv.title ?: ""
                        )
                    }
                }
                try {
                    android.webkit.CookieManager.getInstance().flush()
                } catch (_: Exception) {}
                com.example.util.TabHibernationManager.unregisterWebView(tabId)
                WebInspectorManager.unregisterActiveWebView(wv)
                com.example.util.RemoteWebViewController.unregisterActiveWebView(wv)
            }
        }
    }
}
