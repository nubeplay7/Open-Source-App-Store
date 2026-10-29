package com.example.ui.components

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView

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

    // Manejo nativo del botón atrás en navegación interna
    val canGoBack = webViewInstance?.canGoBack() == true
    BackHandler(enabled = canGoBack) {
        webViewInstance?.goBack()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .imePadding()
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )

                    // Configuración de aceleración por hardware
                    if (isHardwareBoostEnabled) {
                        setLayerType(View.LAYER_TYPE_HARDWARE, null)
                    }

                    // Habilitar cookies
                    try {
                        val cookieManager = CookieManager.getInstance()
                        cookieManager.setAcceptCookie(true)
                        cookieManager.setAcceptThirdPartyCookies(this, true)
                    } catch (_: Exception) {}

                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        databaseEnabled = true
                        allowFileAccess = true
                        useWideViewPort = true
                        loadWithOverviewMode = true
                        setSupportZoom(true)
                        builtInZoomControls = true
                        displayZoomControls = false
                        this.textZoom = textZoom
                        mediaPlaybackRequiresUserGesture = false
                        cacheMode = WebSettings.LOAD_DEFAULT

                        userAgentString = when {
                            customUserAgent.isNotBlank() -> customUserAgent
                            isDesktopMode -> DESKTOP_USER_AGENT
                            else -> userAgentString.replace("; wv", "").replace(Regex("Version/\\d+\\.\\d+\\s?"), "")
                        }
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onProgressChanged(view: WebView?, newProgress: Int) {
                            super.onProgressChanged(view, newProgress)
                            onProgressChange(newProgress / 100f)
                        }

                        override fun onReceivedTitle(view: WebView?, title: String?) {
                            super.onReceivedTitle(view, title)
                            if (!title.isNullOrBlank()) {
                                onTitleChange(title)
                            }
                        }

                        override fun onReceivedIcon(view: WebView?, icon: Bitmap?) {
                            super.onReceivedIcon(view, icon)
                            onFaviconChange(icon)
                        }

                        override fun onPermissionRequest(request: PermissionRequest?) {
                            if (request != null && onPermissionPromptRequested != null) {
                                onPermissionPromptRequested(request)
                            } else {
                                super.onPermissionRequest(request)
                            }
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

                        override fun onShowFileChooser(
                            webView: WebView?,
                            filePathCallback: ValueCallback<Array<Uri>>?,
                            fileChooserParams: FileChooserParams?
                        ): Boolean {
                            return onFileChooser?.invoke(filePathCallback, fileChooserParams)
                                ?: run {
                                    filePathCallback?.onReceiveValue(null)
                                    false
                                }
                        }
                    }

                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): Boolean {
                            val targetUri = request?.url ?: return false
                            val scheme = targetUri.scheme ?: return false
                            if (scheme == "http" || scheme == "https") {
                                return false
                            }
                            try {
                                val intent = Intent(Intent.ACTION_VIEW, targetUri)
                                ctx.startActivity(intent)
                                return true
                            } catch (_: Exception) {
                                return false
                            }
                        }

                        override fun onPageStarted(view: WebView?, pageUrl: String?, favicon: Bitmap?) {
                            super.onPageStarted(view, pageUrl, favicon)
                            onFaviconChange(favicon)
                        }

                        override fun onPageFinished(view: WebView?, pageUrl: String?) {
                            super.onPageFinished(view, pageUrl)
                            if (view != null) {
                                onTitleChange(view.title ?: "")
                                onProgressChange(1.0f)

                                if (isOledBlackMode) {
                                    val darkJs = "document.documentElement.style.backgroundColor='#000000';document.body.style.backgroundColor='#000000';"
                                    view.evaluateJavascript(darkJs, null)
                                }

                                if (customCss.isNotBlank()) {
                                    val cssBase64 = android.util.Base64.encodeToString(
                                        customCss.toByteArray(),
                                        android.util.Base64.NO_WRAP
                                    )
                                    val injectCssJs = """
                                        (function() {
                                            var parent = document.head || document.documentElement;
                                            var style = document.createElement('style');
                                            style.type = 'text/css';
                                            style.innerHTML = atob('$cssBase64');
                                            parent.appendChild(style);
                                        })();
                                    """.trimIndent()
                                    view.evaluateJavascript(injectCssJs, null)
                                }

                                if (customJs.isNotBlank()) {
                                    view.evaluateJavascript(customJs, null)
                                }
                            }
                        }
                    }

                    loadUrl(url)
                    webViewInstance = this
                    onWebViewCreated(this)
                }
            },
            update = { webView ->
                webViewInstance = webView
                if (webView.settings.textZoom != textZoom) {
                    webView.settings.textZoom = textZoom
                }
                val currentTargetUa = when {
                    customUserAgent.isNotBlank() -> customUserAgent
                    isDesktopMode -> DESKTOP_USER_AGENT
                    else -> webView.settings.userAgentString.replace("; wv", "").replace(Regex("Version/\\d+\\.\\d+\\s?"), "")
                }
                if (webView.settings.userAgentString != currentTargetUa) {
                    webView.settings.userAgentString = currentTargetUa
                }
            }
        )

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
                try {
                    CookieManager.getInstance().flush()
                } catch (_: Exception) {}
                try {
                    wv.stopLoading()
                    wv.destroy()
                } catch (_: Exception) {}
            }
        }
    }
}
