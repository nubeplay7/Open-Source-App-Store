package com.example.core.interfaces

import android.content.Context
import android.webkit.WebView
import com.example.data.model.WebMacroEntity
import com.example.data.model.WebMacroStep
import kotlinx.coroutines.flow.StateFlow

/**
 * Contract for Web Macros, AutoClicker cluster, and Computer Vision anchors.
 */
interface IAutomationEngine {
    val isRecording: StateFlow<Boolean>
    val isPlaying: StateFlow<Boolean>
    val recordedSteps: StateFlow<List<WebMacroStep>>

    fun startRecording(context: Context, webView: WebView?)
    fun stopRecording(context: Context, webView: WebView?, macroName: String, onSaved: ((Long) -> Unit)? = null)
    fun playMacro(context: Context, webView: WebView?, macro: WebMacroEntity, iterations: Int = 1)
    fun stopPlayback(context: Context, webView: WebView?)
    fun triggerAutoClick(x: Float, y: Float, durationMs: Long = 50L)
}
