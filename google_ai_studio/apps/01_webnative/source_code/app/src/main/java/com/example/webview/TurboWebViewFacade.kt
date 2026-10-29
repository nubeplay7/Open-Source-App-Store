package com.example.webview

import android.content.Context
import android.webkit.WebView
import com.example.core.interfaces.ITurboWebViewEngine

object TurboWebViewFacade : ITurboWebViewEngine {
    override fun setupWebView(context: Context, webView: WebView) {}
    override fun navigateTo(webView: WebView?, url: String) {
        webView?.loadUrl(url)
    }
    override fun injectJavascript(webView: WebView?, script: String, callback: ((String?) -> Unit)?) {
        webView?.evaluateJavascript(script) { callback?.invoke(it) }
    }
    override fun clearBrowserCache(context: Context, webView: WebView?) {
        webView?.clearCache(true)
    }
    override fun captureDomSnapshot(webView: WebView?, callback: (String) -> Unit) {
        callback("")
    }
    override fun isAdBlockingEnabled(): Boolean = true
}
