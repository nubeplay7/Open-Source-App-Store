package com.example.core.interfaces

import android.content.Context
import android.webkit.WebView

/**
 * Contract for the Accelerated TurboWebView runtime, bidirectional JS Bridge,
 * and web state optimization layer.
 */
interface ITurboWebViewEngine {
    fun setupWebView(context: Context, webView: WebView)
    fun navigateTo(webView: WebView?, url: String)
    fun injectJavascript(webView: WebView?, script: String, callback: ((String?) -> Unit)? = null)
    fun clearBrowserCache(context: Context, webView: WebView?)
    fun captureDomSnapshot(webView: WebView?, callback: (String) -> Unit)
    fun isAdBlockingEnabled(): Boolean
}
