package com.example.automation

import android.content.Context
import android.webkit.WebView
import com.example.core.interfaces.IAutomationEngine
import com.example.data.local.AppDatabase
import com.example.data.model.WebMacroEntity
import com.example.data.model.WebMacroStep
import com.example.util.AutoClickTarget
import com.example.util.AutoClickerEngine
import com.example.util.WebMacroAutomationEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import org.json.JSONArray

/**
 * Domain Facade for Automation, Web Macros, and Clicker engines.
 */
object AutomationEngineFacade : IAutomationEngine {

    private val automationScope = CoroutineScope(Dispatchers.IO)

    override val isRecording: StateFlow<Boolean>
        get() = WebMacroAutomationEngine.isRecording

    override val isPlaying: StateFlow<Boolean>
        get() = WebMacroAutomationEngine.isPlaying

    override val recordedSteps: StateFlow<List<WebMacroStep>>
        get() = WebMacroAutomationEngine.recordedSteps

    override fun startRecording(context: Context, webView: WebView?) {
        if (webView != null) {
            WebMacroAutomationEngine.startRecording(webView, context)
        }
    }

    override fun stopRecording(
        context: Context,
        webView: WebView?,
        macroName: String,
        onSaved: ((Long) -> Unit)?
    ) {
        val steps = WebMacroAutomationEngine.stopRecording(context)
        if (steps.isNotEmpty()) {
            automationScope.launch {
                val db = AppDatabase.getDatabase(context)
                val jsonArr = JSONArray()
                steps.forEach { jsonArr.put(it.toJson()) }

                val newMacro = WebMacroEntity(
                    title = macroName.ifBlank { "Macro Automatizada #${System.currentTimeMillis() % 10000}" },
                    targetDomain = "*",
                    targetUrlPattern = webView?.url ?: "*",
                    stepsJson = jsonArr.toString(),
                    repeatCount = 1,
                    createdAt = System.currentTimeMillis()
                )
                val newId = db.webMacroDao().insertMacro(newMacro)
                onSaved?.invoke(newId)
            }
        }
    }

    override fun playMacro(context: Context, webView: WebView?, macro: WebMacroEntity, iterations: Int) {
        if (webView != null) {
            WebMacroAutomationEngine.executeMacro(
                webView = webView,
                context = context,
                macro = macro,
                overrideRepeatCount = iterations
            )
        }
    }

    override fun stopPlayback(context: Context, webView: WebView?) {
        WebMacroAutomationEngine.stopPlayback()
    }

    override fun triggerAutoClick(x: Float, y: Float, durationMs: Long) {
        AutoClickerEngine.addClickTarget(
            AutoClickTarget(
                id = (System.currentTimeMillis() % 10000).toInt(),
                xPercent = x.coerceIn(0f, 1f),
                yPercent = y.coerceIn(0f, 1f),
                delayBeforeMs = 100L,
                holdDurationMs = durationMs
            )
        )
    }
}
